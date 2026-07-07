/**
 * Reusable modal helpers for interactive UI.
 */

export function renderEventModal(container, { open, dateKey, onClose, onSubmit }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  const dateLabel = new Date(dateKey + 'T12:00:00').toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal app-modal-sm" role="dialog" aria-label="Add event">
        <div class="app-modal-header">
          <h2>Add event</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <form id="event-form" class="app-modal-body">
          <p class="modal-subtitle">${dateLabel}</p>
          <label class="auth-label">
            Event title
            <input type="text" name="title" class="auth-input" required autofocus placeholder="Team meeting" />
          </label>
          <label class="auth-label">
            Color
            <select name="color" class="auth-input">
              <option value="#7c3aed">Purple</option>
              <option value="#2563eb">Blue</option>
              <option value="#059669">Green</option>
              <option value="#dc2626">Red</option>
              <option value="#d97706">Orange</option>
            </select>
          </label>
        </form>
        <div class="app-modal-footer">
          <button type="button" class="topbar-btn" data-action="close-modal">Cancel</button>
          <button type="submit" form="event-form" class="topbar-btn topbar-btn-primary">Add event</button>
        </div>
      </div>
    </div>
  `

  bindModalClose(container, onClose)

  container.querySelector('#event-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.target
    onSubmit({
      title: form.title.value.trim() || 'Untitled event',
      date: dateKey,
      color: form.color.value,
    })
    onClose()
  })
}

export function renderShareModal(container, { open, page, onClose }) {
  if (!open || !page) {
    container.innerHTML = ''
    return
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}?page=${page.id}`

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal app-modal-sm" role="dialog" aria-label="Share page">
        <div class="app-modal-header">
          <h2>Share page</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          <p class="modal-subtitle">${page.icon} ${escapeHtml(page.title)}</p>
          <label class="auth-label">
            Link
            <div class="share-link-row">
              <input type="text" class="auth-input" readonly value="${escapeHtml(shareUrl)}" id="share-url" />
              <button type="button" class="topbar-btn" data-action="copy-link">Copy</button>
            </div>
          </label>
          <p class="auth-hint">Anyone with this link can view the page title. Full sharing requires Supabase auth.</p>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="topbar-btn topbar-btn-primary" data-action="close-modal">Done</button>
        </div>
      </div>
    </div>
  `

  bindModalClose(container, onClose)

  container.querySelector('[data-action="copy-link"]')?.addEventListener('click', async () => {
    const input = container.querySelector('#share-url')
    try {
      await navigator.clipboard.writeText(input?.value ?? '')
      const btn = container.querySelector('[data-action="copy-link"]')
      if (btn) btn.textContent = 'Copied!'
      setTimeout(() => { if (btn) btn.textContent = 'Copy' }, 1500)
    } catch {
      input?.select()
    }
  })
}

export function renderShortcutsModal(container, { open, onClose }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal app-modal-sm" role="dialog" aria-label="Keyboard shortcuts">
        <div class="app-modal-header">
          <h2>Keyboard shortcuts</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          <ul class="shortcuts-list">
            <li><kbd>/</kbd> Open block menu</li>
            <li><kbd>Enter</kbd> New block</li>
            <li><kbd>Backspace</kbd> Delete empty block</li>
            <li><kbd>Ctrl</kbd>+<kbd>N</kbd> New page</li>
            <li><kbd>Ctrl</kbd>+<kbd>S</kbd> Save (toast)</li>
            <li><kbd>Esc</kbd> Close panels</li>
          </ul>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="topbar-btn topbar-btn-primary" data-action="close-modal">Got it</button>
        </div>
      </div>
    </div>
  `

  bindModalClose(container, onClose)
}

export function renderTemplatesModal(container, { open, onClose, onSelectTemplate }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  const templates = [
    { id: 'meeting', icon: '📋', title: 'Meeting notes', content: '## Meeting notes\n\n**Date:** \n**Attendees:** \n\n### Agenda\n• \n\n### Notes\n\n### Action items\n☐ ' },
    { id: 'tasks', icon: '✅', title: 'Task list', content: '## Tasks\n\n☐ Task 1\n☐ Task 2\n☐ Task 3' },
    { id: 'project', icon: '🚀', title: 'Project plan', content: '## Project overview\n\n### Goals\n• \n\n### Timeline\n• Phase 1\n• Phase 2\n\n### Resources\n' },
    { id: 'journal', icon: '📓', title: 'Daily journal', content: '## Today\n\n### Wins\n• \n\n### Challenges\n• \n\n### Tomorrow\n• ' },
  ]

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal" role="dialog" aria-label="Templates">
        <div class="app-modal-header">
          <h2>Choose a template</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          <div class="template-grid">
            ${templates
              .map(
                (t) => `
              <button type="button" class="template-card" data-template-id="${t.id}">
                <span class="template-icon">${t.icon}</span>
                <span class="template-title">${t.title}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `

  bindModalClose(container, onClose)

  const templateMap = Object.fromEntries(templates.map((t) => [t.id, t]))
  container.querySelectorAll('[data-template-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const template = templateMap[btn.dataset.templateId]
      if (template) onSelectTemplate(template)
      onClose()
    })
  })
}

export function renderTrashModal(container, { open, trashedPages, onClose, onRestore, onPermanentDelete }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal" role="dialog" aria-label="Trash">
        <div class="app-modal-header">
          <h2>Trash</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          ${
            trashedPages.length
              ? `<ul class="trash-list">
            ${trashedPages
              .map(
                (page) => `
              <li class="trash-item">
                <span>${page.icon} ${escapeHtml(page.title)}</span>
                <div class="trash-item-actions">
                  <button type="button" class="topbar-btn topbar-btn-ghost" data-restore="${page.id}">Restore</button>
                  <button type="button" class="topbar-btn topbar-btn-danger" data-delete="${page.id}">Delete forever</button>
                </div>
              </li>
            `
              )
              .join('')}
          </ul>`
              : '<p class="modal-empty">Trash is empty. Deleted pages appear here.</p>'
          }
        </div>
        <div class="app-modal-footer">
          <button type="button" class="topbar-btn" data-action="close-modal">Close</button>
        </div>
      </div>
    </div>
  `

  bindModalClose(container, onClose)

  container.querySelectorAll('[data-restore]').forEach((btn) => {
    btn.addEventListener('click', () => onRestore(btn.dataset.restore))
  })
  container.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => onPermanentDelete(btn.dataset.delete))
  })
}

export function renderInboxPanel(container, { open, pages, onClose, onSelectPage }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  const recent = [...pages].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5)

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal app-modal-sm" role="dialog" aria-label="Inbox">
        <div class="app-modal-header">
          <h2>Inbox</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          <p class="modal-subtitle">Recent activity in your workspace</p>
          <ul class="inbox-list">
            ${recent
              .map(
                (page) => `
              <li>
                <button type="button" class="inbox-item" data-page-id="${page.id}">
                  <span>${page.icon}</span>
                  <span class="inbox-item-text">
                    <strong>${escapeHtml(page.title)}</strong> was updated
                  </span>
                </button>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>
    </div>
  `

  bindModalClose(container, onClose)

  container.querySelectorAll('[data-page-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onSelectPage(btn.dataset.pageId)
      onClose()
    })
  })
}

function bindModalClose(container, onClose) {
  container.querySelector('.app-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) onClose()
  })
  container.querySelectorAll('[data-action="close-modal"]:not(.app-modal-backdrop)').forEach((btn) => {
    btn.addEventListener('click', onClose)
  })
  container.querySelector('.app-modal')?.addEventListener('click', (e) => e.stopPropagation())
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
