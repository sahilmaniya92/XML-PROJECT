import { escapeHtml } from '../utils/shared.js'

/** Simple top bar for note view */
export function renderTopbar(container, {
  activePage,
  user,
  onToggleSidebar,
  onToggleMobileSidebar,
  onToggleFavorite,
  onOpenAuth,
  onOpenHome,
  onDeletePage,
  onOpenTrash,
}) {
  const title = activePage?.title ?? 'Untitled'
  const icon = activePage?.icon ?? '📄'

  container.innerHTML = `
    <div class="topbar topbar-simple">
      <div class="topbar-left">
        <button type="button" class="icon-btn" data-action="mobile-menu" aria-label="Menu">☰</button>
        <button type="button" class="icon-btn hidden-mobile" data-action="toggle-sidebar" aria-label="Sidebar">▤</button>
        <nav class="topbar-breadcrumb">
          <button type="button" class="topbar-crumb-btn" data-action="go-home">Student Workspace</button>
          <span>/</span>
          <span>${icon}</span>
          <span class="topbar-title">${escapeHtml(title)}</span>
        </nav>
      </div>
      <div class="topbar-right">
        <button type="button" class="topbar-btn" data-action="favorite">${activePage.favorite ? '★' : '☆'}</button>
        <button type="button" class="topbar-btn" data-action="trash">Trash</button>
        <button type="button" class="topbar-btn topbar-btn-danger" data-action="delete">Delete</button>
        <button type="button" class="topbar-btn topbar-btn-primary" data-action="auth">${user ? 'Account' : 'Sign in'}</button>
      </div>
    </div>
  `

  container.querySelector('[data-action="mobile-menu"]')?.addEventListener('click', onToggleMobileSidebar)
  container.querySelector('[data-action="toggle-sidebar"]')?.addEventListener('click', onToggleSidebar)
  container.querySelector('[data-action="favorite"]')?.addEventListener('click', onToggleFavorite)
  container.querySelector('[data-action="go-home"]')?.addEventListener('click', onOpenHome)
  container.querySelector('[data-action="delete"]')?.addEventListener('click', onDeletePage)
  container.querySelector('[data-action="trash"]')?.addEventListener('click', onOpenTrash)
  container.querySelector('[data-action="auth"]')?.addEventListener('click', onOpenAuth)
}
