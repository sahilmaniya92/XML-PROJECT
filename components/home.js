import { getRecentPages, getState, formatRelativeTime, formatFullDate } from '../utils/state.js'

/**
 * Notion-style home dashboard.
 */
export function renderHome(container, { onSelectPage, onNewPage, onOpenCalendarPlus }) {
  const { pages } = getState()
  const recent = getRecentPages(8)
  const favorites = pages.filter((p) => p.favorite)
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  container.innerHTML = `
    <div class="home-shell">
      <div class="home-inner">
        <header class="home-header">
          <h1 class="home-greeting">${greeting}</h1>
          <p class="home-date">${formatFullDate(Date.now())}</p>
        </header>

        <section class="home-section">
          <div class="home-section-head">
            <h2>Recently visited</h2>
            <button type="button" class="home-link-btn" data-action="new-page">+ New page</button>
          </div>
          <div class="home-grid">
            ${recent
              .map(
                (page) => `
              <button type="button" class="home-card" data-page-id="${page.id}">
                <span class="home-card-cover home-card-cover-${page.cover ?? 'ocean'}"></span>
                <span class="home-card-body">
                  <span class="home-card-icon">${page.icon}</span>
                  <span class="home-card-title">${escapeHtml(page.title)}</span>
                  <span class="home-card-meta">Edited ${formatRelativeTime(page.updatedAt)}</span>
                </span>
              </button>
            `
              )
              .join('')}
          </div>
        </section>

        ${
          favorites.length
            ? `
        <section class="home-section">
          <h2 class="home-section-title">Favorites</h2>
          <div class="home-list">
            ${favorites
              .map(
                (page) => `
              <button type="button" class="home-list-item" data-page-id="${page.id}">
                <span class="home-list-icon">${page.icon}</span>
                <span class="home-list-title">${escapeHtml(page.title)}</span>
                <span class="home-list-meta">${formatRelativeTime(page.updatedAt)}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </section>`
            : ''
        }

        <section class="home-section">
          <h2 class="home-section-title">Quick actions</h2>
          <div class="home-actions">
            <button type="button" class="home-action" data-action="new-page">
              <span class="home-action-icon">📄</span>
              <span>New page</span>
            </button>
            <button type="button" class="home-action" data-action="new-page-ai">
              <span class="home-action-icon">✨</span>
              <span>New with CodeFusion</span>
            </button>
            <button type="button" class="home-action" data-action="calendar">
              <span class="home-action-icon">📅</span>
              <span>Open Calendar Plus</span>
            </button>
          </div>
        </section>

        <section class="home-section home-tips">
          <h2 class="home-section-title">Tips</h2>
          <ul class="home-tips-list">
            <li>Type <kbd>/</kbd> in any page to insert blocks</li>
            <li>Hover a block to reveal <strong>+</strong> and drag handles</li>
            <li>Press <kbd>Enter</kbd> for a new block, <kbd>Backspace</kbd> on empty to remove</li>
            <li>Click a to-do checkbox to mark it complete</li>
          </ul>
        </section>
      </div>
    </div>
  `

  container.querySelectorAll('[data-page-id]').forEach((btn) => {
    btn.addEventListener('click', () => onSelectPage(btn.dataset.pageId))
  })

  container.querySelectorAll('[data-action="new-page"]').forEach((btn) => {
    btn.addEventListener('click', () => onNewPage(false))
  })

  container.querySelector('[data-action="new-page-ai"]')?.addEventListener('click', () => onNewPage(true))
  container.querySelector('[data-action="calendar"]')?.addEventListener('click', onOpenCalendarPlus)
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
