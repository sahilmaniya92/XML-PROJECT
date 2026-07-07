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
  toggleFavorite,
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

  app.querySelector('[data-action="close-mobile-sidebar"]')?.addEventListener('click', closeMobileSidebar)
}

subscribe(renderApp)
initApp().then(renderApp)
