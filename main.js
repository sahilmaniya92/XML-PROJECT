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
import {
  subscribe,
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
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200)
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
    onSearch: setSearchQuery,
    onToggleFavorite: toggleFavorite,
    onDeletePage: (id) => {
      deletePage(id)
      showToast('Page moved to trash')
    },
    onOpenCalendarPlus: openCalendarPlus,
    onOpenHome: openHome,
  })

  if (state.activeView === 'calendar') {
    document.getElementById('topbar').style.display = 'none'
    renderCalendarPlus(document.getElementById('editor'), {
      onBack: closeCalendarPlus,
      onPrevMonth: calendarPrevMonth,
      onNextMonth: calendarNextMonth,
      onSelectDate: calendarSelectDate,
      onAddEvent: (payload) => {
        calendarAddEvent(payload)
        showToast('Event added')
      },
      onDeleteEvent: (id) => {
        calendarDeleteEvent(id)
        showToast('Event removed')
      },
    })
  } else {
    renderTopbar(document.getElementById('topbar'), {
      activePage,
      activeView: state.activeView,
      onToggleSidebar: toggleSidebar,
      onToggleMobileSidebar: toggleMobileSidebar,
      onToggleCodeFusion: toggleCodeFusion,
      onToggleFavorite: () => {
        toggleFavorite(activePage.id)
        showToast(activePage.favorite ? 'Removed from favorites' : 'Added to favorites')
      },
      onSave: () => showToast('All changes saved'),
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

  app.querySelector('[data-action="close-mobile-sidebar"]')?.addEventListener('click', closeMobileSidebar)
}

subscribe(renderApp)
renderApp()
