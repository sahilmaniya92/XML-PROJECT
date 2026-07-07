import './styles/styles.css'
import { renderSidebar } from './components/sidebar.js'
import { renderTopbar } from './components/topbar.js'
import { renderEditor } from './components/editor.js'
import { renderHome } from './components/home.js'
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
  TASK_LIST_TEMPLATE,
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
  resetToLocalDefaults,
} from './utils/state.js'
import {
  signIn,
  signUp,
  signOut,
  onAuthStateChange,
  formatAuthError,
} from './utils/supabaseSync.js'
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
  }
}

function renderModals(state, activePage) {
  const roots = getModalRoots()

  renderAuthModal(roots.auth, {
    open: state.authModalOpen,
    user: state.user,
    configured: isSupabaseConfigured,
    onClose: closeAuthModal,
    onSignIn: async (email, password) => {
      const { error } = await signIn(email, password)
      if (error) throw new Error(formatAuthError(error))
      closeAuthModal()
      showToast('Signed in — syncing your workspace')
    },
    onSignUp: async (email, password) => {
      const { error } = await signUp(email, password)
      if (error) throw new Error(formatAuthError(error))
      showToast('Account created! You can sign in now.')
    },
    onSignOut: async () => {
      await signOut()
      closeAuthModal()
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
    onSelectPage: (id) => {
      closeCalendarPlus()
      setActivePage(id)
    },
    onNewPage: (withCodeFusion) => {
      closeCalendarPlus()
      createPage()
      if (withCodeFusion) {
        toggleCodeFusion()
        showToast('New page created — CodeFusion is ready')
      } else {
        showToast('New page created')
      }
    },
    onNewTaskList: () => {
      closeCalendarPlus()
      createPage(TASK_LIST_TEMPLATE)
      showToast('Task list created')
    },
    onSearch: setSearchQuery,
    onToggleFavorite: toggleFavorite,
    onDeletePage: (id) => {
      deletePage(id)
      showToast('Page moved to trash')
    },
    onOpenCalendarPlus: openCalendarPlus,
    onOpenHome: openHome,
    onOpenAuth: openAuthModal,
    onOpenTemplates: openTemplatesModal,
    onOpenTrash: openTrashModal,
    onOpenInbox: openInboxModal,
    onTogglePrivateSection: togglePrivateSection,
  })

  if (state.activeView === 'calendar') {
    document.getElementById('topbar').style.display = 'none'
    renderCalendarPlus(document.getElementById('editor'), {
      onBack: closeCalendarPlus,
      onPrevMonth: calendarPrevMonth,
      onNextMonth: calendarNextMonth,
      onSelectDate: calendarSelectDate,
      onAddEvent: openEventModal,
      onDeleteEvent: (id) => {
        calendarDeleteEvent(id)
        showToast('Event removed')
      },
    })
  } else {
    renderTopbar(document.getElementById('topbar'), {
      activePage,
      activeView: state.activeView,
      syncStatus: state.syncStatus,
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
      onOpenAuth: openAuthModal,
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

    if (state.activeView === 'home') {
      renderHome(document.getElementById('editor'), {
        onSelectPage: setActivePage,
        onNewPage: (withAi) => {
          createPage()
          if (withAi) toggleCodeFusion()
        },
        onOpenCalendarPlus: openCalendarPlus,
      })
    } else {
      renderEditor(document.getElementById('editor'), {
        activePage,
        onUpdatePage: (updates, options) => updateActivePage(updates, options),
        onOpenCodeFusion: toggleCodeFusion,
        onToggleFavorite: () => toggleFavorite(activePage.id),
      })
    }
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

// Supabase auth listener
onAuthStateChange(async (event, session) => {
  const nextUser = session?.user ?? null
  setUser(nextUser)

  if (event === 'SIGNED_IN' && nextUser) {
    try {
      await loadFromSupabase(nextUser.id)
    } catch {
      showToast('Could not load cloud data — using local copy')
    }
  }

  if (event === 'SIGNED_OUT') {
    resetToLocalDefaults()
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
