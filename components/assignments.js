import { escapeHtml, formatDate } from '../utils/shared.js'
import { COURSES } from '../utils/courses.js'

const COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

export function renderAssignments(container, { assignments, onBack, onAdd, onMove, onDelete }) {
  container.innerHTML = `
    <div class="ws-view">
      <header class="ws-hero ws-hero-compact">
        <button type="button" class="ws-back" data-action="back">← Dashboard</button>
        <div>
          <h1 class="ws-title">Assignments</h1>
          <p class="ws-lead">User story: <strong>Track progress</strong> — move cards across the Kanban board as you work.</p>
        </div>
      </header>

      <form class="ws-panel ws-add-form" id="add-assignment-form">
        <h2 class="ws-panel-title">Add assignment</h2>
        <div class="ws-add-grid">
          <label class="ws-field">
            <span>Title</span>
            <input type="text" name="title" required placeholder="e.g. Midterm essay" />
          </label>
          <label class="ws-field">
            <span>Course</span>
            <select name="course">
              ${COURSES.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
            </select>
          </label>
          <label class="ws-field">
            <span>Due date</span>
            <input type="date" name="due" required />
          </label>
          <button type="submit" class="ws-btn ws-btn-primary ws-add-submit">Add to board</button>
        </div>
      </form>

      <div class="ws-kanban">
        ${COLUMNS.map((col) => {
          const cards = assignments.filter((a) => a.status === col.id)
          return `
          <div class="ws-kanban-col" data-column="${col.id}">
            <div class="ws-kanban-head">
              <span>${col.label}</span>
              <span class="ws-count">${cards.length}</span>
            </div>
            <div class="ws-kanban-cards">
              ${cards.map((a) => kanbanCard(a)).join('') || '<p class="ws-kanban-empty">Drag work here using the buttons below each card</p>'}
            </div>
          </div>`
        }).join('')}
      </div>
    </div>
  `

  const dueInput = container.querySelector('[name="due"]')
  if (dueInput) {
    dueInput.value = defaultDueDate()
  }

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)

  container.querySelector('#add-assignment-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.target
    const title = form.title.value.trim()
    const course = form.course.value
    const dueDate = new Date(form.due.value).getTime()
    if (!title) return
    onAdd({ title, course, dueDate, status: 'todo', priority: 'normal' })
    form.title.value = ''
  })

  container.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => onMove(btn.dataset.id, btn.dataset.status))
  })
  container.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => onDelete(btn.dataset.delete))
  })
}

function defaultDueDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function kanbanCard(a) {
  const urgent = a.dueDate && a.dueDate - Date.now() < 2 * 86400000 && a.status !== 'done'
  const done = a.status === 'done'
  return `
    <article class="ws-kanban-card ${urgent ? 'is-urgent' : ''} ${done ? 'is-done' : ''}">
      <div class="ws-kanban-card-top">
        <strong>${escapeHtml(a.title)}</strong>
        <button type="button" class="ws-icon-btn" data-delete="${a.id}" title="Delete">×</button>
      </div>
      <span class="ws-tag">${escapeHtml(a.course?.split(' — ')[0] || 'General')}</span>
      <span class="ws-muted">Due ${formatDate(a.dueDate)}</span>
      <div class="ws-kanban-actions">
        ${a.status !== 'todo' ? `<button type="button" data-id="${a.id}" data-status="todo">← To do</button>` : ''}
        ${a.status !== 'progress' ? `<button type="button" data-id="${a.id}" data-status="progress">In progress</button>` : ''}
        ${a.status !== 'done' ? `<button type="button" data-id="${a.id}" data-status="done">Mark done</button>` : ''}
      </div>
    </article>`
}
