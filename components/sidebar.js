import { getFilteredPages, getState } from '../utils/state.js'

/**
 * Renders the Notion-style left sidebar.
 */
export function renderSidebar(container, {
  onSelectPage,
  onNewPage,
  onSearch,
  onToggleFavorite,
  onDeletePage,
  onOpenCalendarPlus,
  onOpenHome,
  onOpenAuth,
  onOpenTemplates,
  onOpenTrash,
  onOpenInbox,
}) {
  const { activePageId, searchQuery, activeView, user } = getState()
  const pages = getFilteredPages()
  const favorites = pages.filter((page) => page.favorite)
  const privatePages = pages.filter((page) => !page.favorite)

  const renderPageButton = (page) => `
    <div class="sidebar-page-row">
      <button
        type="button"
        class="sidebar-item ${page.id === activePageId && activeView === 'page' ? 'sidebar-item-active' : ''}"
        data-page-id="${page.id}"
        aria-label="Open ${page.title}"
      >
        <span class="sidebar-page-icon">${page.icon}</span>
        <span class="sidebar-page-title">${escapeHtml(page.title)}</span>
      </button>
      <div class="sidebar-page-actions">
        <button
          type="button"
          class="sidebar-mini-btn"
          data-favorite-id="${page.id}"
          aria-label="${page.favorite ? 'Remove from favorites' : 'Add to favorites'}"
          title="${page.favorite ? 'Unfavorite' : 'Favorite'}"
        >${page.favorite ? '★' : '☆'}</button>
        <button
          type="button"
          class="sidebar-mini-btn sidebar-mini-btn-danger"
          data-delete-id="${page.id}"
          aria-label="Delete page"
          title="Delete"
        >×</button>
      </div>
    </div>
  `

  const renderSection = (title, items, collapsible = false) => {
    if (!items.length && !searchQuery) return ''
    return `
      <div class="sidebar-section ${collapsible ? 'sidebar-section-collapsible' : ''}">
        <p class="sidebar-section-title">${title}</p>
        <div class="sidebar-section-items">${items.map(renderPageButton).join('')}</div>
      </div>
    `
  }

  container.innerHTML = `
    <div class="sidebar-inner">
      <div class="sidebar-workspace">
        <button type="button" class="sidebar-workspace-btn" aria-label="Workspace menu">
          <span class="workspace-icon">T</span>
          <span class="sidebar-workspace-name">TaskScape</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-chevron">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

      <div class="sidebar-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-search-icon">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
        </svg>
        <input
          type="search"
          class="sidebar-search"
          placeholder="Search"
          value="${escapeHtml(searchQuery)}"
          aria-label="Search pages"
        />
      </div>

      <div class="sidebar-quick-links">
        <button type="button" class="sidebar-item ${activeView === 'home' ? 'sidebar-item-active' : ''}" data-action="home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z"/></svg>
          <span>Home</span>
        </button>
        <button type="button" class="sidebar-item" data-action="inbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
          <span>Inbox</span>
        </button>
        <button type="button" class="sidebar-item ${activeView === 'calendar' ? 'sidebar-item-active' : ''}" data-action="calendar-plus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span>Calendar Plus</span>
        </button>
      </div>

      <div class="sidebar-scroll">
        ${searchQuery ? renderSection('Search results', pages) : `${renderSection('Favorites', favorites)}${renderSection('Private', privatePages, true)}`}
        ${pages.length === 0 ? '<p class="sidebar-empty">No pages found</p>' : ''}
      </div>

      <div class="sidebar-footer">
        <button type="button" class="sidebar-auth-btn" data-action="auth">
          <span class="sidebar-auth-avatar">${user ? user.email?.[0]?.toUpperCase() ?? 'U' : '👤'}</span>
          <span class="sidebar-auth-label">${user ? 'Account' : 'Sign in'}</span>
        </button>
        <button type="button" class="sidebar-new-page" data-action="new-page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M12 5v14M5 12h14"/></svg>
          <span>New page</span>
        </button>
        <button type="button" class="sidebar-footer-link" data-action="templates">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
          <span>Templates</span>
        </button>
        <button type="button" class="sidebar-footer-link" data-action="trash">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          <span>Trash</span>
        </button>
      </div>
    </div>
  `

  container.querySelector('.sidebar-search')?.addEventListener('input', (event) => {
    onSearch(event.target.value)
  })

  container.querySelectorAll('[data-page-id]').forEach((button) => {
    button.addEventListener('click', () => onSelectPage(button.dataset.pageId))
  })

  container.querySelectorAll('[data-favorite-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onToggleFavorite(button.dataset.favoriteId)
    })
  })

  container.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation()
      onDeletePage(button.dataset.deleteId)
    })
  })

  container.querySelector('[data-action="calendar-plus"]')?.addEventListener('click', onOpenCalendarPlus)
  container.querySelector('[data-action="home"]')?.addEventListener('click', onOpenHome)
  container.querySelector('[data-action="inbox"]')?.addEventListener('click', onOpenInbox)
  container.querySelector('[data-action="templates"]')?.addEventListener('click', onOpenTemplates)
  container.querySelector('[data-action="trash"]')?.addEventListener('click', onOpenTrash)
  container.querySelector('[data-action="auth"]')?.addEventListener('click', onOpenAuth)

  container.querySelectorAll('[data-action="new-page"]').forEach((button) => {
    button.addEventListener('click', () => onNewPage(false))
  })
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
