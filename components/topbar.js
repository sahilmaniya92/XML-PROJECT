import { formatRelativeTime, getPageAncestors } from '../utils/state.js'

/**
 * Renders the Notion-style top navigation bar with nested breadcrumbs.
 */
export function renderTopbar(container, {
  activePage,
  activeView,
  syncStatus,
  demoMode,
  onToggleSidebar,
  onToggleMobileSidebar,
  onToggleCodeFusion,
  onToggleFavorite,
  onNavigatePage,
  onCreateSubPage,
  onSave,
  onShare,
  onOpenAuth,
  onOpenHome,
  onDuplicatePage,
  onDeletePage,
  onOpenTrash,
  onOpenCalendarPlus,
  onCopyContent,
  onRemoveCover,
  onNewPage,
  onShowShortcuts,
}) {
  const isHome = activeView === 'home'
  const ancestors = !isHome && activePage ? getPageAncestors(activePage.id) : []

  const breadcrumbHtml = isHome
    ? `<span class="topbar-crumb topbar-crumb-active">Home</span>`
    : ancestors
        .map((page, i) => {
          const isLast = i === ancestors.length - 1
          return `
            ${i > 0 ? '<span class="topbar-separator">/</span>' : ''}
            <button type="button" class="topbar-crumb ${isLast ? 'topbar-crumb-active' : 'topbar-crumb-link'}" data-crumb-id="${page.id}" ${isLast ? 'disabled' : ''}>
              <span class="topbar-crumb-icon">${page.icon}</span>
              ${escapeHtml(page.title)}
            </button>
          `
        })
        .join('')

  const syncBadge =
    syncStatus === 'syncing'
      ? '<span class="topbar-sync syncing">●</span>'
      : syncStatus === 'synced'
        ? '<span class="topbar-sync synced">●</span>'
        : syncStatus === 'error'
          ? '<span class="topbar-sync error">●</span>'
          : ''

  const syncLabel =
    syncStatus === 'syncing'
      ? 'Syncing…'
      : syncStatus === 'synced'
        ? 'Synced'
        : syncStatus === 'error'
          ? 'Sync error'
          : user
            ? 'Cloud'
            : 'Local'

  container.innerHTML = `
    <div class="topbar">
      <div class="topbar-left">
        <button type="button" class="icon-btn md:hidden" data-action="mobile-menu" aria-label="Open sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <button type="button" class="icon-btn hidden md:inline-flex" data-action="toggle-sidebar" aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
        </button>

        <nav class="topbar-breadcrumb" aria-label="Breadcrumb">
          <button type="button" class="topbar-crumb topbar-crumb-link" data-action="home-crumb">TaskScape</button>
          ${!isHome ? '<span class="topbar-separator">/</span>' : ''}
          ${breadcrumbHtml}
        </nav>
      </div>

      <div class="topbar-right">
        ${syncBadge}
        ${demoMode ? '<span class="topbar-demo-badge">Demo</span>' : ''}
        ${
          !isHome && activePage
            ? `
          <span class="topbar-meta hidden sm:inline">Edited ${formatRelativeTime(activePage.updatedAt)}</span>
          <button type="button" class="icon-btn hidden sm:inline-flex" data-action="favorite">${activePage.favorite ? '★' : '☆'}</button>
          <button type="button" class="topbar-btn hidden sm:inline-flex" data-action="subpage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 5v14M5 12h14"/></svg>
            Sub-page
          </button>`
            : ''
        }
        <button type="button" class="codefusion-trigger" data-action="codefusion">
          <span class="codefusion-trigger-icon">
            <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/></svg>
          </span>
          <span class="hidden sm:inline">CodeFusion</span>
        </button>
        <button type="button" class="topbar-btn topbar-btn-ghost hidden sm:inline-flex" data-action="save">Done</button>
      </div>
    </div>
  `

  container.querySelector('[data-action="mobile-menu"]')?.addEventListener('click', onToggleMobileSidebar)
  container.querySelector('[data-action="toggle-sidebar"]')?.addEventListener('click', onToggleSidebar)
  container.querySelector('[data-action="codefusion"]')?.addEventListener('click', onToggleCodeFusion)
  container.querySelector('[data-action="save"]')?.addEventListener('click', onSave)
  container.querySelector('[data-action="favorite"]')?.addEventListener('click', onToggleFavorite)
  container.querySelector('[data-action="subpage"]')?.addEventListener('click', () => onCreateSubPage(activePage.id))
  container.querySelector('[data-action="home-crumb"]')?.addEventListener('click', () => onNavigatePage('home'))

  container.querySelectorAll('[data-crumb-id]').forEach((btn) => {
    if (!btn.disabled) {
      btn.addEventListener('click', () => onNavigatePage(btn.dataset.crumbId))
    }
  })
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
