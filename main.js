import './styles/styles.css'
import { renderSidebar } from './components/sidebar.js'
import { renderTopbar } from './components/topbar.js'
import { renderEditor } from './components/editor.js'
import { renderHome } from './components/home.js'
import { renderAuth } from './components/auth.js'
import { renderCalendarPlus } from './components/calendar.js'
import { renderCodeFusion, getCodeFusionResponse } from './components/codefusion.js'
import {
  subscribe,
  initApp,
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
  createSubPage,
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
  signIn,
  signUp,
  signOut,
  enterDemoMode,
  togglePageExpanded,
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
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400)
}

function renderLoading(app) {
  app.innerHTML = `
    <div class="app-loading">
      <div class="app-loading-logo">T</div>
      <div class="app-loading-spinner"></div>
      <p>Loading TaskScape…</p>
    </div>
  `
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
  const app = document.getElementById('app')

  if (state.authLoading) {
    renderLoading(app)
    return
  }

  if (state.showAuth) {
    renderAuth(app, {
      authError: state.authError,
      authSuccess: state.authSuccess,
      authLoading: false,
      onLogin: async (email, password) => {
        const result = await signIn(email, password)
        if (result.ok) showToast('Welcome back!')
      },
      onSignup: async (email, password, fullName) => {
        const result = await signUp(email, password, fullName)
        if (result.ok && !result.needsConfirmation) showToast('Welcome to CodeFusion!')
      },
      onDemoMode: () => {
        enterDemoMode()
        showToast('Demo mode — data saved locally only')
      },
    })
    return
  }

  const activePage = getActivePage()

  app.innerHTML = `
    <div class="app-shell ${state.sidebarOpen ? '' : 'sidebar-collapsed'}">
      <div class="mobile-backdrop ${state.mobileSidebarOpen ? 'is-open' : ''}" data-action="close-mobile-sidebar"></div>
      <aside id="sidebar" class="app-sidebar ${state.mobileSidebarOpen ? 'mobile-open' : ''}"></aside>
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
    onNewPage: (parentId) => {
      closeCalendarPlus()
      createPage(parentId)
      showToast(parentId ? 'Sub-page created' : 'New page created')
    },
    onNewSubPage: (parentId) => {
      closeCalendarPlus()
      createSubPage(parentId)
      showToast('Sub-page created')
    },
    onSearch: setSearchQuery,
    onToggleFavorite: toggleFavorite,
    onDeletePage: (id) => {
      deletePage(id)
      showToast('Page deleted')
    },
    onOpenCalendarPlus: openCalendarPlus,
    onOpenHome: openHome,
    onToggleExpand: togglePageExpanded,
    onSignOut: async () => {
      await signOut()
      showToast('Signed out')
    },
  })

  if (state.activeView === 'calendar') {
    document.getElementById('topbar').style.display = 'none'
    renderCalendarPlus(document.getElementById('editor'), {
      onBack: closeCalendarPlus,
      onPrevMonth: calendarPrevMonth,
      onNextMonth: calendarNextMonth,
      onSelectDate: calendarSelectDate,
      onAddEvent: async (payload) => {
        await calendarAddEvent(payload)
        showToast('Event added')
      },
      onDeleteEvent: async (id) => {
        await calendarDeleteEvent(id)
        showToast('Event removed')
      },
    })
  } else {
    renderTopbar(document.getElementById('topbar'), {
      activePage,
      activeView: state.activeView,
      syncStatus: state.syncStatus,
      demoMode: state.demoMode,
      onToggleSidebar: toggleSidebar,
      onToggleMobileSidebar: toggleMobileSidebar,
      onToggleCodeFusion: toggleCodeFusion,
      onToggleFavorite: () => {
        toggleFavorite(activePage?.id)
        showToast('Favorite updated')
      },
      onNavigatePage: (target) => {
        if (target === 'home') openHome()
        else setActivePage(target)
      },
      onCreateSubPage: (parentId) => {
        createSubPage(parentId)
        showToast('Sub-page created')
      },
      onSave: () => showToast(state.demoMode ? 'Saved locally' : 'All changes saved to cloud'),
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
    } else if (activePage) {
      renderEditor(document.getElementById('editor'), {
        activePage,
        childCount: state.pages.filter((p) => p.parentId === activePage.id).length,
        onUpdatePage: (updates, options) => updateActivePage(updates, options),
        onOpenCodeFusion: toggleCodeFusion,
        onToggleFavorite: () => toggleFavorite(activePage.id),
        onCreateSubPage: () => {
          createSubPage(activePage.id)
          showToast('Sub-page created')
        },
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
initApp().then(renderApp)
