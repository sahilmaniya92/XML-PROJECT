import './styles/styles.css'
import { renderSidebar } from './components/sidebar.js'
import { renderTopbar } from './components/topbar.js'
import { renderEditor } from './components/editor.js'
import { renderDashboard } from './components/dashboard.js'
import { renderProfile } from './components/profile.js'
import { renderAssignments } from './components/assignments.js'
import { renderPlanner } from './components/studyPlanner.js'
import { renderExamMode } from './components/examMode.js'
import { renderAi } from './components/ai.js'
import { renderAnalytics } from './components/analytics.js'
import { renderFlashcards } from './components/flashcards.js'
import { renderCalendarPlus } from './components/calendar.js'
import { renderAuthModal } from './components/auth.js'
import { renderEventModal, renderTrashModal } from './components/modal.js'
import {
  subscribe,
  getState,
  getActivePage,
  getTrashedPages,
  setActivePage,
  openHome,
  setSearchQuery,
  toggleSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
  createPage,
  updateActivePage,
  deletePage,
  restorePage,
  permanentDeletePage,
  toggleFavorite,
  openCalendarPlus,
  closeCalendarPlus,
  calendarPrevMonth,
  calendarNextMonth,
  calendarSelectDate,
  calendarAddEvent,
  calendarDeleteEvent,
  openAuthModal,
  closeAuthModal,
  openTrashModal,
  closeTrashModal,
  openEventModal,
  closeEventModal,
  setUser,
  loadFromSupabase,
  signOutUser,
  isSigningOut,
  checkDatabaseConnection,
  forceCloudSync,
  openDbSetupModal,
  closeDbSetupModal,
  openFlashcards,
  setActiveCourse,
  getDueFlashcards,
  generateFlashcardsFromPage,
  reviewFlashcard,
  deleteFlashcard,
  openProfile,
  openAssignments,
  openStudyPlanner,
  openExamMode,
  openAi,
  openAnalytics,
  saveProfile,
  parseAndImportSyllabus,
  addAssignment,
  moveAssignment,
  deleteAssignment,
  generateStudyPlan,
  activateExamMode,
  logStudyMinutes,
} from './utils/state.js'
import { COURSES } from './utils/courses.js'
import {
  signIn,
  signUp,
  signInWithGoogle,
  onAuthStateChange,
  formatAuthError,
  formatDatabaseError,
  getSession,
} from './utils/supabaseSync.js'
import { renderDbSetupModal } from './components/dbSetup.js'
import { isSupabaseConfigured } from './utils/supabase.js'

let toastTimer

function showToast(message) {
  let toast = document.getElementById('app-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'app-toast'
    toast.className = 'app-toast'
    document.body.appendChild(toast)
  }
  toast.textContent = message
  toast.classList.add('is-visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200)
}

const FULLSCREEN_VIEWS = new Set([
  'home', 'calendar', 'flashcards', 'assignments', 'planner',
  'ai', 'exam', 'analytics', 'profile',
])

function renderWorkspaceView(state, activePage) {
  const root = document.getElementById('editor')
  const views = {
    home: () => renderDashboard(root, {
      profile: state.profile,
      assignments: state.assignments,
      pages: state.pages,
      calendarEvents: state.calendarEvents,
      flashcards: state.flashcards,
      studyLog: state.studyLog,
      onSelectPage: setActivePage,
      onOpenAssignments: openAssignments,
      onOpenFlashcards: openFlashcards,
      onOpenProfile: openProfile,
    }),
    profile: () => renderProfile(root, {
      profile: state.profile,
      user: state.user,
      onBack: openHome,
      onSave: (data) => { saveProfile(data); showToast('Profile saved') },
      onUploadSyllabus: (text) => {
        const n = parseAndImportSyllabus(text)
        showToast(n ? `Imported ${n} dates` : 'No dates found in text')
      },
      onGoogleSignIn: async () => {
        try { await signInWithGoogle() } catch (e) { showToast(e.message) }
      },
    }),
    assignments: () => renderAssignments(root, {
      assignments: state.assignments,
      onBack: openHome,
      onAdd: (data) => { addAssignment(data); showToast('Added') },
      onMove: moveAssignment,
      onDelete: (id) => { deleteAssignment(id); showToast('Removed') },
    }),
    planner: () => renderPlanner(root, {
      studyPlan: state.studyPlan,
      onBack: openHome,
      onGenerate: () => { generateStudyPlan(); showToast('Plan generated') },
    }),
    exam: () => renderExamMode(root, {
      activePage,
      flashcards: state.flashcards,
      onBack: openHome,
      onActivate: () => {
        const n = activateExamMode()
        showToast(n ? `${n} flashcards ready` : 'Open a note with ## headings first')
        openFlashcards()
      },
    }),
    ai: () => renderAi(root, { onBack: openHome }),
    analytics: () => renderAnalytics(root, {
      studyLog: state.studyLog,
      assignments: state.assignments,
      pages: state.pages,
      onBack: openHome,
      onLogStudy: () => { logStudyMinutes(30); showToast('Logged 30 min') },
    }),
    flashcards: () => renderFlashcards(root, {
      flashcards: state.flashcards,
      dueCount: getDueFlashcards(state.activeCourse).length,
      activeCourse: state.activeCourse,
      courses: COURSES,
      onBack: openHome,
      onSetCourse: setActiveCourse,
      onGenerateFromNote: () => {
        const count = generateFlashcardsFromPage(getActivePage().id)
        showToast(count ? `Created ${count} cards` : 'Add ## or • to your note')
      },
      onStartReview: () => {},
      onReview: (id, q) => reviewFlashcard(id, q),
      onDeleteCard: (id) => { deleteFlashcard(id); showToast('Removed') },
    }),
    calendar: () => renderCalendarPlus(root, {
      onBack: closeCalendarPlus,
      onPrevMonth: calendarPrevMonth,
      onNextMonth: calendarNextMonth,
      onSelectDate: calendarSelectDate,
      onAddEvent: openEventModal,
      onDeleteEvent: (id) => { calendarDeleteEvent(id); showToast('Event removed') },
    }),
  }
  views[state.activeView]?.()
}

function renderModals(state, activePage) {
  let modalRoot = document.getElementById('modal-root')
  if (!modalRoot) {
    modalRoot = document.createElement('div')
    modalRoot.id = 'modal-root'
    modalRoot.innerHTML = `
      <div id="auth-modal-root"></div>
      <div id="trash-modal-root"></div>
      <div id="event-modal-root"></div>
      <div id="db-setup-modal-root"></div>
    `
    document.body.appendChild(modalRoot)
  }

  renderAuthModal(document.getElementById('auth-modal-root'), {
    open: state.authModalOpen,
    user: state.user,
    configured: isSupabaseConfigured,
    dbStatus: state.dbStatus,
    syncStatus: state.syncStatus,
    onClose: closeAuthModal,
    onOpenDbSetup: openDbSetupModal,
    onForceSync: async () => {
      const ok = await forceCloudSync()
      showToast(ok ? 'Synced' : state.syncError ?? 'Sync failed')
    },
    onSignIn: async (email, password) => {
      const { data, error } = await signIn(email, password)
      if (error) throw new Error(formatAuthError(error))
      setUser(data.session.user)
      closeAuthModal()
      showToast('Signed in')
      syncAfterLogin(data.session.user.id)
    },
    onSignUp: async (email, password) => {
      const { data, error } = await signUp(email, password)
      if (error) throw new Error(formatAuthError(error))
      if (data.session?.user) {
        setUser(data.session.user)
        closeAuthModal()
        syncAfterLogin(data.session.user.id)
      } else {
        showToast('Account created — now sign in')
      }
    },
    onSignOut: async () => { await signOutUser(); showToast('Signed out') },
  })

  renderTrashModal(document.getElementById('trash-modal-root'), {
    open: state.trashModalOpen,
    trashedPages: getTrashedPages(),
    onClose: closeTrashModal,
    onRestore: (id) => { restorePage(id); showToast('Restored') },
    onPermanentDelete: (id) => { permanentDeletePage(id); showToast('Deleted') },
  })

  renderEventModal(document.getElementById('event-modal-root'), {
    open: state.eventModalOpen,
    dateKey: state.selectedDateKey,
    onClose: closeEventModal,
    onSubmit: (payload) => { calendarAddEvent(payload); showToast('Event added') },
  })

  renderDbSetupModal(document.getElementById('db-setup-modal-root'), {
    open: state.dbSetupModalOpen,
    dbStatus: state.dbStatus,
    onClose: closeDbSetupModal,
    onTestConnection: async () => {
      const result = await checkDatabaseConnection()
      showToast(result.ok ? 'Connected' : result.message ?? 'Failed')
    },
  })
}

function renderApp() {
  const state = getState()
  const activePage = getActivePage()
  const app = document.getElementById('app')

  app.innerHTML = `
    <div class="app-shell ${state.sidebarOpen ? '' : 'sidebar-collapsed'}">
      <div class="mobile-backdrop ${state.mobileSidebarOpen ? 'is-open' : ''}" data-action="close-mobile"></div>
      <aside id="sidebar" class="app-sidebar ${state.mobileSidebarOpen ? 'mobile-open' : ''}"></aside>
      <div class="app-main">
        <header id="topbar"></header>
        <main id="editor" class="app-editor"></main>
      </div>
    </div>
  `

  renderSidebar(document.getElementById('sidebar'), {
    onSelectPage: setActivePage,
    onNewPage: () => { createPage(); showToast('New note') },
    onSearch: setSearchQuery,
    onOpenCalendarPlus: openCalendarPlus,
    onOpenHome: openHome,
    onOpenAuth: openAuthModal,
    onOpenFlashcards: openFlashcards,
    onOpenAssignments: openAssignments,
    onOpenPlanner: openStudyPlanner,
    onOpenExam: openExamMode,
    onOpenAi: openAi,
    onOpenAnalytics: openAnalytics,
    onOpenProfile: openProfile,
    onSignOut: async () => { await signOutUser(); showToast('Signed out') },
  })

  const topbar = document.getElementById('topbar')
  if (FULLSCREEN_VIEWS.has(state.activeView)) {
    topbar.style.display = 'none'
    renderWorkspaceView(state, activePage)
  } else if (state.activeView === 'page') {
    topbar.style.display = ''
    renderTopbar(topbar, {
      activePage,
      user: state.user,
      onToggleSidebar: toggleSidebar,
      onToggleMobileSidebar: toggleMobileSidebar,
      onToggleFavorite: () => toggleFavorite(activePage.id),
      onOpenAuth: openAuthModal,
      onOpenHome: openHome,
      onDeletePage: () => { deletePage(activePage.id); showToast('Moved to trash') },
      onOpenTrash: openTrashModal,
    })
    renderEditor(document.getElementById('editor'), {
      activePage,
      onUpdatePage: updateActivePage,
      onToggleFavorite: () => toggleFavorite(activePage.id),
    })
  } else {
    topbar.style.display = 'none'
    openHome()
  }

  renderModals(state, activePage)
  app.querySelector('[data-action="close-mobile"]')?.addEventListener('click', closeMobileSidebar)
}

subscribe(renderApp)
renderApp()

async function syncAfterLogin(userId) {
  try {
    await checkDatabaseConnection()
    await loadFromSupabase(userId)
    showToast('Workspace synced')
  } catch (err) {
    showToast(formatDatabaseError(err) || 'Sync failed')
  }
}

async function initSupabase() {
  if (!isSupabaseConfigured) return
  await checkDatabaseConnection()
  const session = await getSession()
  if (session?.user) {
    setUser(session.user)
    syncAfterLogin(session.user.id)
  }
}

initSupabase()

onAuthStateChange((event, session) => {
  if (isSigningOut() && event !== 'SIGNED_OUT') return
  if (event === 'SIGNED_OUT') {
    setUser(null)
    closeAuthModal()
    return
  }
  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user)
    syncAfterLogin(session.user.id)
  }
})

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault()
    createPage()
    showToast('New note')
  }
  if (e.key === 'Escape') {
    closeAuthModal()
    closeTrashModal()
    closeEventModal()
    closeDbSetupModal()
  }
})
