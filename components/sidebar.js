import {
  getState,
  getRootPages,
  getChildPages,
  getUserDisplayName,
  getUserInitials,
} from '../utils/state.js'

/**
 * Renders the Notion-style left sidebar with nested page tree.
 */
export function renderSidebar(container, {
  onSelectPage,
  onNewPage,
  onNewSubPage,
  onSearch,
  onToggleFavorite,
  onDeletePage,
  onOpenCalendarPlus,
  onOpenHome,
  onToggleExpand,
  onSignOut,
}) {
  const { activePageId, searchQuery, activeView, expandedPageIds, user, demoMode, syncStatus } =
    getState()
  const allPages = getState().pages.filter((p) => !p.isDeleted)
  const favorites = allPages.filter((page) => page.favorite)

  const renderPageRow = (page, depth = 0) => {
    const children = getChildPages(page.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedPageIds.has(page.id) || searchQuery
    const isActive = page.id === activePageId && activeView === 'page'

    return `
      <div class="sidebar-tree-node" style="--depth: ${depth}">
        <div class="sidebar-page-row">
          ${
            hasChildren
              ? `<button type="button" class="sidebar-expand ${isExpanded ? 'is-expanded' : ''}" data-expand-id="${page.id}" aria-label="Toggle">${isExpanded ? '▾' : '▸'}</button>`
              : '<span class="sidebar-expand-spacer"></span>'
          }
          <button
            type="button"
            class="sidebar-item ${isActive ? 'sidebar-item-active' : ''}"
            data-page-id="${page.id}"
            style="padding-left: ${8 + depth * 14}px"
          >
            <span class="sidebar-page-icon">${page.icon}</span>
            <span class="sidebar-page-title">${escapeHtml(page.title)}</span>
          </button>
          <div class="sidebar-page-actions">
            <button type="button" class="sidebar-mini-btn" data-subpage-id="${page.id}" title="Add sub-page">+</button>
            <button type="button" class="sidebar-mini-btn" data-favorite-id="${page.id}" title="Favorite">${page.favorite ? '★' : '☆'}</button>
            <button type="button" class="sidebar-mini-btn sidebar-mini-btn-danger" data-delete-id="${page.id}" title="Delete">×</button>
          </div>
        </div>
        ${hasChildren && isExpanded ? `<div class="sidebar-tree-children">${children.map((c) => renderPageRow(c, depth + 1)).join('')}</div>` : ''}
      </div>
    `
  }

  const rootPages = searchQuery
    ? allPages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getRootPages()

  const treeHtml = searchQuery
    ? rootPages.map((p) => renderPageRow(p, 0)).join('')
    : rootPages.map((p) => renderPageRow(p, 0)).join('')

  const syncLabel =
    syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'synced' ? 'Synced' : syncStatus === 'error' ? 'Sync error' : ''

  container.innerHTML = `
    <div class="sidebar-inner">
      <div class="sidebar-workspace">
        <button type="button" class="sidebar-workspace-btn" aria-label="Workspace">
          <span class="workspace-icon">T</span>
          <span class="sidebar-workspace-name">${escapeHtml(getUserDisplayName())}'s Space</span>
          ${syncLabel ? `<span class="sidebar-sync-badge sync-${syncStatus}">${syncLabel}</span>` : ''}
        </button>
      </div>

      <div class="sidebar-search-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-search-icon">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/>
        </svg>
        <input type="search" class="sidebar-search" placeholder="Search" value="${escapeHtml(searchQuery)}" />
      </div>

      <div class="sidebar-quick-links">
        <button type="button" class="sidebar-item ${activeView === 'home' ? 'sidebar-item-active' : ''}" data-action="home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z"/></svg>
          <span>Home</span>
        </button>
        <button type="button" class="sidebar-item ${activeView === 'calendar' ? 'sidebar-item-active' : ''}" data-action="calendar-plus">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span>Calendar Plus</span>
        </button>
      </div>

      <div class="sidebar-scroll">
        ${favorites.length && !searchQuery ? `<div class="sidebar-section"><p class="sidebar-section-title">Favorites</p>${favorites.map((p) => renderPageRow(p, 0)).join('')}</div>` : ''}
        <div class="sidebar-section">
          <p class="sidebar-section-title">${searchQuery ? 'Search results' : 'Pages'}</p>
          <div class="sidebar-section-items">${treeHtml || '<p class="sidebar-empty">No pages yet</p>'}</div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button type="button" class="sidebar-new-page" data-action="new-page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-nav-icon"><path d="M12 5v14M5 12h14"/></svg>
          <span>New page</span>
        </button>
        <div class="sidebar-user">
          <span class="sidebar-user-avatar">${getUserInitials()}</span>
          <div class="sidebar-user-info">
            <span class="sidebar-user-name">${escapeHtml(getUserDisplayName())}</span>
            <span class="sidebar-user-mode">${demoMode ? 'Demo mode' : user ? 'Cloud sync' : 'Local'}</span>
          </div>
          <button type="button" class="sidebar-user-logout" data-action="logout" title="Sign out">⎋</button>
        </div>
      </div>
    </div>
  `

  container.querySelector('.sidebar-search')?.addEventListener('input', (e) => onSearch(e.target.value))

  container.querySelectorAll('[data-page-id]').forEach((btn) => {
    btn.addEventListener('click', () => onSelectPage(btn.dataset.pageId))
  })

  container.querySelectorAll('[data-expand-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onToggleExpand(btn.dataset.expandId)
    })
  })

  container.querySelectorAll('[data-subpage-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onNewSubPage(btn.dataset.subpageId)
    })
  })

  container.querySelectorAll('[data-favorite-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onToggleFavorite(btn.dataset.favoriteId)
    })
  })

  container.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onDeletePage(btn.dataset.deleteId)
    })
  })

  container.querySelector('[data-action="calendar-plus"]')?.addEventListener('click', onOpenCalendarPlus)
  container.querySelector('[data-action="home"]')?.addEventListener('click', onOpenHome)
  container.querySelector('[data-action="new-page"]')?.addEventListener('click', () => onNewPage(null))
  container.querySelector('[data-action="logout"]')?.addEventListener('click', onSignOut)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
