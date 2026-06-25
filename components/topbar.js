import { formatRelativeTime } from '../utils/state.js'

/**
 * Renders the Notion-style top navigation bar.
 */
export function renderTopbar(container, {
  activePage,
  activeView,
  onToggleSidebar,
  onToggleMobileSidebar,
  onToggleCodeFusion,
  onToggleFavorite,
  onSave,
}) {
  const isHome = activeView === 'home'
  const title = isHome ? 'Home' : activePage?.title ?? 'Untitled'
  const icon = isHome ? '🏠' : activePage?.icon ?? '📄'

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
          <span class="topbar-crumb">TaskScape</span>
          <span class="topbar-separator">/</span>
          <span class="topbar-crumb-icon">${icon}</span>
          <span class="topbar-crumb topbar-crumb-active">${escapeHtml(title)}</span>
        </nav>
      </div>

      <div class="topbar-right">
        ${
          !isHome
            ? `
        <span class="topbar-meta hidden sm:inline">Edited ${formatRelativeTime(activePage.updatedAt)}</span>
        <button type="button" class="icon-btn hidden sm:inline-flex" data-action="favorite" aria-label="Toggle favorite">
          ${activePage.favorite ? '★' : '☆'}
        </button>
        <button type="button" class="topbar-btn hidden sm:inline-flex" aria-label="Share page">
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

        <button type="button" class="icon-btn" aria-label="More options">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>
    </div>
  `

  container.querySelector('[data-action="mobile-menu"]')?.addEventListener('click', onToggleMobileSidebar)
  container.querySelector('[data-action="toggle-sidebar"]')?.addEventListener('click', onToggleSidebar)
  container.querySelector('[data-action="codefusion"]')?.addEventListener('click', onToggleCodeFusion)
  container.querySelector('[data-action="save"]')?.addEventListener('click', onSave)
  container.querySelector('[data-action="favorite"]')?.addEventListener('click', onToggleFavorite)
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
