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
import {
  renderCodeFusion,
  getCodeFusionResponse,
} from './components/codefusion.js'
import { renderAuthModal } from './components/auth.js'
import {
  renderEventModal,
  renderShareModal,
  renderTemplatesModal,
  renderTrashModal,
  renderInboxPanel,
  renderShortcutsModal,
} from './components/modal.js'
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
  toggleCodeFusion,
  closeCodeFusion,
  createPage,
  updateActivePage,
  deletePage,
  restorePage,
  permanentDeletePage,
  duplicatePage,
  toggleFavorite,
  togglePrivateSection,
  addCodeFusionMessage,
  openCalendarPlus,
  closeCalendarPlus,
  calendarPrevMonth,
  calendarNextMonth,
  calendarSelectDate,
  calendarAddEvent,
  calendarDeleteEvent,
  openAuthModal,
  closeAuthModal,
  openShareModal,
  closeShareModal,
  openTemplatesModal,
  closeTemplatesModal,
  openTrashModal,
  closeTrashModal,
  openInboxModal,
  closeInboxModal,
  openEventModal,
  closeEventModal,
  openShortcutsModal,
  closeShortcutsModal,
  setUser,
  loadFromSupabase,
  signOutUser,
  isSigningOut,
  checkDatabaseConnection,
  forceCloudSync,
  openDbSetupModal,
  closeDbSetupModal,
  openFlashcards,
  closeFlashcards,
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
let workspaceSyncInProgress = null

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
  const editor = document.getElementById('editor')
  const roots = {
    home: () => renderDashboard(editor, {
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
    profile: () => renderProfile(editor, {
      profile: state.profile,
      user: state.user,
      onBack: openHome,
      onSave: (data) => { saveProfile(data); showToast('Profile saved') },
      onUploadSyllabus: (text) => {
        const n = parseAndImportSyllabus(text)
        showToast(n ? `Imported ${n} dates to calendar` : 'No dates found — try lines like "Mar 15 Exam"')
      },
      onGoogleSignIn: async () => {
        try {
          await signInWithGoogle()
        } catch (e) {
          showToast(e.message || 'Enable Google in Supabase Auth → Providers')
        }
      },
    }),
    assignments: () => renderAssignments(editor, {
      assignments: state.assignments,
      onBack: openHome,
      onAdd: (data) => { addAssignment(data); showToast('Assignment added') },
      onMove: (id, status) => moveAssignment(id, status),
      onDelete: (id) => { deleteAssignment(id); showToast('Removed') },
    }),
    planner: () => renderPlanner(editor, {
      studyPlan: state.studyPlan,
      onBack: openHome,
      onGenerate: () => { generateStudyPlan(); showToast('Weekly plan generated') },
    }),
    exam: () => renderExamMode(editor, {
      activePage,
      flashcards: state.flashcards,
      onBack: openHome,
      onActivate: () => {
        const n = activateExamMode()
        showToast(n ? `Exam mode: ${n} flashcards added` : 'Open a note with headings first')
        openFlashcards()
      },
    }),
    ai: () => renderAi(editor, { onBack: openHome }),
    analytics: () => renderAnalytics(editor, {
      studyLog: state.studyLog,
      assignments: state.assignments,
      pages: state.pages,
      onBack: openHome,
      onLogStudy: () => { logStudyMinutes(30); showToast('Logged 30 min study time') },
    }),
    flashcards: () => renderFlashcards(editor, {
      flashcards: state.flashcards,
      dueCount: getDueFlashcards(state.activeCourse).length,
      activeCourse: state.activeCourse,
      courses: COURSES,
      onBack: openHome,
      onSetCourse: setActiveCourse,
      onGenerateFromNote: () => {
        const page = getActivePage()
        const count = generateFlashcardsFromPage(page.id)
        showToast(count ? `Created ${count} flashcards` : 'Add ## headings or • bullets to your note')
      },
      onStartReview: () => {},
      onReview: (id, q) => reviewFlashcard(id, q),
      onDeleteCard: (id) => { deleteFlashcard(id); showToast('Removed') },
    }),
    calendar: () => renderCalendarPlus(editor, {
      onBack: closeCalendarPlus,
      onPrevMonth: calendarPrevMonth,
      onNextMonth: calendarNextMonth,
      onSelectDate: calendarSelectDate,
      onAddEvent: openEventModal,
      onDeleteEvent: (id) => { calendarDeleteEvent(id); showToast('Event removed') },
    }),
  }

  roots[state.activeView]?.()
}

function getModalRoots() {
  let modalRoot = document.getElementById('modal-root')
  if (!modalRoot) {
    modalRoot = document.createElement('div')
    modalRoot.id = 'modal-root'
    modalRoot.innerHTML = `
      <div id="auth-modal-root"></div>
      <div id="share-modal-root"></div>
      <div id="templates-modal-root"></div>
      <div id="trash-modal-root"></div>
      <div id="inbox-modal-root"></div>
      <div id="event-modal-root"></div>
      <div id="shortcuts-modal-root"></div>
      <div id="db-setup-modal-root"></div>
    `
    document.body.appendChild(modalRoot)
  }
  return {
    auth: document.getElementById('auth-modal-root'),
    share: document.getElementById('share-modal-root'),
    templates: document.getElementById('templates-modal-root'),
    trash: document.getElementById('trash-modal-root'),
    inbox: document.getElementById('inbox-modal-root'),
    event: document.getElementById('event-modal-root'),
    shortcuts: document.getElementById('shortcuts-modal-root'),
    dbSetup: document.getElementById('db-setup-modal-root'),
  }
}

function renderModals(state, activePage) {
  const roots = getModalRoots()

  renderAuthModal(roots.auth, {
    open: state.authModalOpen,
    user: state.user,
    configured: isSupabaseConfigured,
    dbStatus: state.dbStatus,
    syncStatus: state.syncStatus,
    onClose: closeAuthModal,
    onOpenDbSetup: openDbSetupModal,
    onForceSync: async () => {
      const ok = await forceCloudSync()
      showToast(ok ? 'Synced to database' : state.syncError ?? 'Sync failed')
    },
    onSignIn: async (email, password) => {
      const { data, error } = await signIn(email, password)
      if (error) throw new Error(formatAuthError(error))
      if (!data.session?.user) {
        throw new Error('Account created but no session — confirm email is OFF in Supabase, then sign in.')
      }
      setUser(data.session.user)
      closeAuthModal()
      showToast('Signed in — syncing your workspace')
      queueWorkspaceSync(data.session.user.id, 'Signed in')
    },
    onSignUp: async (email, password) => {
      const { data, error } = await signUp(email, password)
      if (error) throw new Error(formatAuthError(error))
      if (data.session?.user) {
        setUser(data.session.user)
        closeAuthModal()
        showToast('Account created — syncing your workspace')
        queueWorkspaceSync(data.session.user.id, 'Account ready')
      } else {
        showToast('Account created! Now click Sign in with the same email and password.')
      }
    },
    onSignOut: async () => {
      await signOutUser()
      showToast('Signed out')
    },
  })

  renderShareModal(roots.share, {
    open: state.shareModalOpen,
    page: activePage,
    onClose: closeShareModal,
  })

  renderTemplatesModal(roots.templates, {
    open: state.templatesModalOpen,
    onClose: closeTemplatesModal,
    onSelectTemplate: (template) => {
      createPage(template)
      showToast(`Created page from "${template.title}" template`)
    },
  })

  renderTrashModal(roots.trash, {
    open: state.trashModalOpen,
    trashedPages: getTrashedPages(),
    onClose: closeTrashModal,
    onRestore: (id) => {
      restorePage(id)
      showToast('Page restored')
    },
    onPermanentDelete: (id) => {
      permanentDeletePage(id)
      showToast('Page permanently deleted')
    },
  })

  renderInboxPanel(roots.inbox, {
    open: state.inboxModalOpen,
    pages: state.pages.filter((p) => !p.trashed),
    onClose: closeInboxModal,
    onSelectPage: (id) => {
      setActivePage(id)
      showToast('Opened from inbox')
    },
  })

  renderEventModal(roots.event, {
    open: state.eventModalOpen,
    dateKey: state.selectedDateKey,
    onClose: closeEventModal,
    onSubmit: (payload) => {
      calendarAddEvent(payload)
      showToast('Event added')
    },
  })

  renderShortcutsModal(roots.shortcuts, {
    open: state.shortcutsModalOpen,
    onClose: closeShortcutsModal,
  })

  renderDbSetupModal(roots.dbSetup, {
    open: state.dbSetupModalOpen,
    dbStatus: state.dbStatus,
    onClose: closeDbSetupModal,
    onTestConnection: async () => {
      const result = await checkDatabaseConnection()
      if (result.ok) {
        showToast('Database connected!')
        if (state.user) await forceCloudSync()
      } else {
        showToast(result.message ?? 'Connection failed')
      }
    },
  })
}

function renderApp() {
  const state = getState()
  const activePage = getActivePage()
  const app = document.getElementById('app')

  app.innerHTML = `
    <div class="app-shell ${state.sidebarOpen ? '' : 'sidebar-collapsed'}">
      <div
        class="mobile-backdrop ${state.mobileSidebarOpen ? 'is-open' : ''}"
        data-action="close-mobile-sidebar"
      ></div>

      <aside
        id="sidebar"
        class="app-sidebar ${state.mobileSidebarOpen ? 'mobile-open' : ''}"
      ></aside>

      <div class="app-main">
        <header id="topbar"></header>
        <main id="editor" class="app-editor"></main>
      </div>

      <div id="codefusion-root"></div>
    </div>
  `

  renderSidebar(document.getElementById('sidebar'), {
    onSelectPage: (id) => { setActivePage(id) },
    onNewPage: () => { createPage(); showToast('New note created') },
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
      activeView: state.activeView,
      syncStatus: state.syncStatus,
      dbStatus: state.dbStatus,
      syncError: state.syncError,
      lastSyncedAt: state.lastSyncedAt,
      user: state.user,
      onToggleSidebar: toggleSidebar,
      onToggleMobileSidebar: toggleMobileSidebar,
      onToggleCodeFusion: toggleCodeFusion,
      onToggleFavorite: () => {
        toggleFavorite(activePage.id)
        showToast(activePage.favorite ? 'Removed from favorites' : 'Added to favorites')
      },
      onSave: () => showToast('All changes saved'),
      onShare: openShareModal,
      onOpenAuth: () => {
        if (state.dbStatus === 'missing_table' || state.dbStatus === 'permission') {
          openDbSetupModal()
        } else {
          openAuthModal()
        }
      },
      onOpenDbSetup: openDbSetupModal,
      onForceSync: async () => {
        const ok = await forceCloudSync()
        showToast(ok ? 'Synced to database' : getState().syncError ?? 'Sync failed — click sync pill for details')
      },
      onShowSyncError: (msg) => showToast(msg),
      onOpenHome: openHome,
      onDuplicatePage: () => {
        duplicatePage(activePage.id)
        showToast('Page duplicated')
      },
      onDeletePage: () => {
        deletePage(activePage.id)
        showToast('Page moved to trash')
      },
      onOpenTrash: openTrashModal,
      onOpenCalendarPlus: openCalendarPlus,
      onCopyContent: async () => {
        try {
          await navigator.clipboard.writeText(activePage.content || '')
          showToast('Page content copied')
        } catch {
          showToast('Could not copy content')
        }
      },
      onRemoveCover: () => {
        updateActivePage({ cover: 'none' })
        showToast('Cover removed')
      },
      onNewPage: () => {
        createPage()
        showToast('New page created')
      },
      onShowShortcuts: openShortcutsModal,
    })
    renderEditor(document.getElementById('editor'), {
      activePage,
      onUpdatePage: (updates, options) => updateActivePage(updates, options),
      onOpenCodeFusion: toggleCodeFusion,
      onToggleFavorite: () => toggleFavorite(activePage.id),
    })
  } else {
    topbar.style.display = 'none'
    openHome()
  }

  renderCodeFusion(document.getElementById('codefusion-root'), {
    open: state.codefusionOpen,
    activePage,
    messages: state.codefusionMessages,
    onClose: closeCodeFusion,
    onAction: (action, prompt) => {
      addCodeFusionMessage('user', prompt)
      setTimeout(() => {
        addCodeFusionMessage('ai', getCodeFusionResponse(action, prompt))
      }, 450)
    },
  })

  renderModals(state, activePage)

  app.querySelector('[data-action="close-mobile-sidebar"]')?.addEventListener('click', closeMobileSidebar)
}

subscribe(renderApp)
renderApp()

function queueWorkspaceSync(userId, successPrefix = 'Workspace') {
  if (!userId || workspaceSyncInProgress === userId) return
  workspaceSyncInProgress = userId

  setTimeout(async () => {
    try {
      await checkDatabaseConnection()
      const result = await loadFromSupabase(userId)
      showToast(
        result === 'uploaded'
          ? `${successPrefix} — local data saved to cloud`
          : result === 'merged-local'
            ? `${successPrefix} — kept your latest local edits`
            : `${successPrefix} — loaded from database`
      )
    } catch (err) {
      const msg = formatDatabaseError(err) || err.message || 'Could not sync with database'
      showToast(msg.includes('does not exist') ? 'Create workspaces table first (click sync pill)' : msg)
      if (msg.includes('does not exist') || msg.includes('permission') || msg.includes('policy')) {
        openDbSetupModal()
      }
    } finally {
      if (workspaceSyncInProgress === userId) {
        workspaceSyncInProgress = null
      }
    }
  }, 0)
}

// Initialize Supabase session + database check
async function initSupabase() {
  if (!isSupabaseConfigured) return

  await checkDatabaseConnection()

  const session = await getSession()
  if (session?.user) {
    setUser(session.user)
    queueWorkspaceSync(session.user.id, 'Restored session')
  }
}

initSupabase()

// Supabase auth listener — never await here (causes sign-in deadlock)
onAuthStateChange((event, session) => {
  if (isSigningOut() && event !== 'SIGNED_OUT') return

  if (event === 'SIGNED_OUT') {
    setUser(null)
    closeAuthModal()
    setTimeout(() => {
      checkDatabaseConnection()
    }, 0)
    return
  }

  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user)
    queueWorkspaceSync(session.user.id, 'Signed in')
  }
})

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault()
    createPage()
    showToast('New page created')
  }
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    showToast('All changes saved')
  }
  if (e.key === 'Escape') {
    closeCodeFusion()
    closeAuthModal()
    closeShareModal()
    closeTemplatesModal()
    closeTrashModal()
    closeInboxModal()
    closeEventModal()
    closeShortcutsModal()
  }
})

// Deep link: ?page=page-id
const pageParam = new URLSearchParams(window.location.search).get('page')
if (pageParam) {
  const state = getState()
  if (state.pages.some((p) => p.id === pageParam && !p.trashed)) {
    setActivePage(pageParam)
  }
}
