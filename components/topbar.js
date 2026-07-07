import { formatRelativeTime } from '../utils/state.js'
import { bindDropdown } from '../utils/dropdown.js'

/**
 * Renders the Notion-style top navigation bar.
 */
export function renderTopbar(container, {
  activePage,
  activeView,
  syncStatus,
  dbStatus,
  syncError,
  lastSyncedAt,
  user,
  onToggleSidebar,
  onToggleMobileSidebar,
  onToggleCodeFusion,
  onToggleFavorite,
  onSave,
  onShare,
  onOpenAuth,
  onOpenDbSetup,
  onForceSync,
  onShowSyncError,
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
  const title = isHome ? 'Home' : activePage?.title ?? 'Untitled'
  const icon = isHome ? '🏠' : activePage?.icon ?? '📄'

  const syncLabel =
    syncStatus === 'syncing'
      ? 'Syncing…'
      : syncStatus === 'synced'
        ? 'Synced'
        : syncStatus === 'error'
          ? 'Sync error'
          : dbStatus === 'missing_table'
            ? 'Setup DB'
            : dbStatus === 'connected' && user
              ? 'Cloud'
              : user
                ? 'Local'
                : 'Sign in'

  const syncTitle = syncError
    ? syncError
    : lastSyncedAt
      ? `Last saved to database: ${new Date(lastSyncedAt).toLocaleTimeString()}`
      : user
        ? user.email
        : dbStatus === 'missing_table'
          ? 'Database table missing — click for setup guide'
          : 'Sign in to sync with Supabase'

  container.innerHTML = `
    <div class="topbar">
      <div class="topbar-left">
        <button type="button" class="icon-btn md:hidden" data-action="mobile-menu" aria-label="Open sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <button type="button" class="icon-btn hidden md:inline-flex" data-action="toggle-sidebar" aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
          </svg>
        </button>

        <nav class="topbar-breadcrumb" aria-label="Breadcrumb">
          <button type="button" class="topbar-crumb topbar-crumb-btn" data-action="go-home">TaskScape</button>
          <span class="topbar-separator">/</span>
          <span class="topbar-crumb-icon">${icon}</span>
          <span class="topbar-crumb topbar-crumb-active">${escapeHtml(title)}</span>
        </nav>
      </div>

      <div class="topbar-right">
        <button
          type="button"
          class="sync-pill sync-pill-${syncStatus === 'error' || dbStatus === 'missing_table' ? 'error' : syncStatus}"
          data-action="sync-pill"
          title="${escapeHtml(syncTitle)}"
        >
          <span class="sync-dot"></span>
          ${syncLabel}
        </button>
        ${
          !isHome
            ? `
        <span class="topbar-meta hidden sm:inline">Edited ${formatRelativeTime(activePage.updatedAt)}</span>
        <button type="button" class="icon-btn hidden sm:inline-flex" data-action="favorite" aria-label="Toggle favorite">
          ${activePage.favorite ? '★' : '☆'}
        </button>
        <button type="button" class="topbar-btn hidden sm:inline-flex" data-action="share" aria-label="Share page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"/>
          </svg>
          Share
        </button>`
            : ''
        }

        <button type="button" class="codefusion-trigger" data-action="codefusion" aria-label="Open CodeFusion AI">
          <span class="codefusion-trigger-icon">
            <svg viewBox="0 0 24 24" fill="none" class="w-3.5 h-3.5">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="hidden sm:inline">CodeFusion</span>
        </button>

        <button type="button" class="topbar-btn topbar-btn-ghost hidden sm:inline-flex" data-action="save">Done</button>

        <div class="topbar-dropdown-wrap">
          <button type="button" class="icon-btn" data-dropdown-toggle aria-label="More options">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
          <div class="app-dropdown-menu app-dropdown-menu-right" data-dropdown-menu>
            ${!isHome ? `
            <button type="button" class="app-dropdown-item" data-dropdown-action="duplicate">📄 Duplicate page</button>
            <button type="button" class="app-dropdown-item" data-dropdown-action="copy-content">📋 Copy page content</button>
            <button type="button" class="app-dropdown-item" data-dropdown-action="remove-cover">🖼️ Remove cover</button>
            <button type="button" class="app-dropdown-item" data-dropdown-action="favorite-toggle">${activePage.favorite ? '☆ Unfavorite' : '★ Add to favorites'}</button>
            <div class="app-dropdown-divider"></div>
            <button type="button" class="app-dropdown-item app-dropdown-danger" data-dropdown-action="delete">🗑️ Move to trash</button>
            ` : `
            <button type="button" class="app-dropdown-item" data-dropdown-action="new-page">📄 New page</button>
            <button type="button" class="app-dropdown-item" data-dropdown-action="calendar">📅 Open calendar</button>
            `}
            <button type="button" class="app-dropdown-item" data-dropdown-action="trash">🗑️ Open trash</button>
            <button type="button" class="app-dropdown-item" data-dropdown-action="shortcuts">⌨️ Keyboard shortcuts</button>
          </div>
        </div>
      </div>
    </div>
  `

  container.querySelector('[data-action="mobile-menu"]')?.addEventListener('click', onToggleMobileSidebar)
  container.querySelector('[data-action="toggle-sidebar"]')?.addEventListener('click', onToggleSidebar)
  container.querySelector('[data-action="codefusion"]')?.addEventListener('click', onToggleCodeFusion)
  container.querySelector('[data-action="save"]')?.addEventListener('click', onSave)
  container.querySelector('[data-action="favorite"]')?.addEventListener('click', onToggleFavorite)
  container.querySelector('[data-action="share"]')?.addEventListener('click', onShare)
  container.querySelector('[data-action="sync-pill"]')?.addEventListener('click', () => {
    if (syncStatus === 'error' && syncError) {
      onShowSyncError?.(syncError)
    }
    if (dbStatus === 'missing_table' || dbStatus === 'permission') {
      onOpenDbSetup?.()
    } else if (user) {
      onForceSync?.()
    } else {
      onOpenAuth?.()
    }
  })
  container.querySelector('[data-action="go-home"]')?.addEventListener('click', onOpenHome)

  bindDropdown(container, {
    toggleSelector: '[data-dropdown-toggle]',
    menuSelector: '[data-dropdown-menu]',
    onSelect: (action) => {
      const actions = {
        duplicate: onDuplicatePage,
        'copy-content': onCopyContent,
        'remove-cover': onRemoveCover,
        'favorite-toggle': onToggleFavorite,
        delete: onDeletePage,
        'new-page': onNewPage,
        calendar: onOpenCalendarPlus,
        trash: onOpenTrash,
        shortcuts: onShowShortcuts,
      }
      actions[action]?.()
    },
  })
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
