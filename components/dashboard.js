import { escapeHtml, formatDate, todayKey } from '../utils/shared.js'

export function renderDashboard(container, {
  profile,
  assignments,
  pages,
  calendarEvents,
  flashcards,
  studyLog,
  onSelectPage,
  onOpenAssignments,
  onOpenFlashcards,
  onOpenProfile,
}) {
  const today = todayKey()
  const greeting = getGreeting()
  const name = profile.name?.trim() || 'there'

  const dueToday = assignments.filter((a) => {
    if (!a.dueDate || a.status === 'done') return false
    return new Date(a.dueDate).toISOString().slice(0, 10) === today
  })

  const dueSoon = assignments
    .filter((a) => a.status !== 'done' && a.dueDate)
    .sort((a, b) => a.dueDate - b.dueDate)
    .slice(0, 5)

  const todayEvents = calendarEvents.filter((e) => (e.date || e.dateKey) === today)
  const dueCards = flashcards.filter((c) => (c.nextReview ?? 0) <= Date.now()).length
  const todosDone = countTodos(pages, true)
  const todosTotal = countTodos(pages, false) + todosDone
  const studyMins = studyLog[today] ?? 0

  container.innerHTML = `
    <div class="ws-view">
      <header class="ws-hero">
        <div>
          <p class="ws-eyebrow">${escapeHtml(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}</p>
          <h1 class="ws-title">${greeting}, ${escapeHtml(name)}</h1>
          <p class="ws-lead">${profile.university ? escapeHtml(profile.university) + ' · ' : ''}Semester ${escapeHtml(profile.semester || '—')}</p>
          <p class="ws-lead ws-lead-sub">Here is what needs your attention today.</p>
        </div>
        <button type="button" class="ws-btn ws-btn-ghost" data-action="profile">Edit profile</button>
      </header>

      <div class="ws-stat-row">
        <div class="ws-stat"><span class="ws-stat-val">${dueToday.length}</span><span class="ws-stat-lbl">Due today</span></div>
        <div class="ws-stat"><span class="ws-stat-val">${dueCards}</span><span class="ws-stat-lbl">Cards to review</span></div>
        <div class="ws-stat"><span class="ws-stat-val">${todosDone}/${todosTotal || '—'}</span><span class="ws-stat-lbl">Tasks done</span></div>
        <div class="ws-stat"><span class="ws-stat-val">${studyMins}m</span><span class="ws-stat-lbl">Study time</span></div>
      </div>

      <div class="ws-grid-2">
        <section class="ws-panel">
          <div class="ws-panel-head">
            <h2>Today's schedule</h2>
          </div>
          <div class="ws-timeline">
            ${
              todayEvents.length || dueToday.length
                ? [
                    ...todayEvents.map(
                      (e) => `
              <div class="ws-timeline-item">
                <span class="ws-timeline-time">${escapeHtml(e.time || 'All day')}</span>
                <div class="ws-timeline-body">
                  <strong>${escapeHtml(e.title)}</strong>
                  <span class="ws-tag">Calendar</span>
                </div>
              </div>`
                    ),
                    ...dueToday.map(
                      (a) => `
              <div class="ws-timeline-item">
                <span class="ws-timeline-time">Due</span>
                <div class="ws-timeline-body">
                  <strong>${escapeHtml(a.title)}</strong>
                  <span class="ws-tag ws-tag-warn">${escapeHtml(a.course || 'Assignment')}</span>
                </div>
              </div>`
                    ),
                  ].join('')
                : '<p class="ws-empty">Nothing scheduled for today. Add assignments or calendar events.</p>'
            }
          </div>
        </section>

        <section class="ws-panel">
          <div class="ws-panel-head">
            <h2>Progress</h2>
            <button type="button" class="ws-link" data-action="assignments">View all</button>
          </div>
          <ul class="ws-progress-list">
            ${dueSoon.length ? dueSoon.map(progressRow).join('') : '<li class="ws-empty">No upcoming assignments</li>'}
          </ul>
          <div class="ws-progress-bar-wrap">
            <div class="ws-progress-bar" style="width: ${todosTotal ? Math.round((todosDone / todosTotal) * 100) : 0}%"></div>
          </div>
          <p class="ws-progress-caption">${todosTotal ? Math.round((todosDone / todosTotal) * 100) : 0}% of note tasks complete</p>
        </section>
      </div>

      <section class="ws-panel">
        <div class="ws-panel-head">
          <h2>Recent pages</h2>
        </div>
        <div class="ws-note-row">
          ${pages
            .filter((p) => !p.trashed)
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 4)
            .map(
              (p) => `
            <button type="button" class="ws-note-chip" data-page-id="${p.id}">
              <span class="ws-note-chip-title">${escapeHtml(p.title)}</span>
              <span class="ws-note-chip-meta">${escapeHtml(pageKindLabel(p))}</span>
            </button>`
            )
            .join('') || '<p class="ws-empty">No pages yet — use + Note in the sidebar</p>'}
        </div>
      </section>

      ${
        dueCards
          ? `<div class="ws-banner">
          <span>${dueCards} flashcard${dueCards > 1 ? 's' : ''} ready for review</span>
          <button type="button" class="ws-btn ws-btn-sm" data-action="flashcards">Review now</button>
        </div>`
          : ''
      }
    </div>
  `

  container.querySelectorAll('[data-page-id]').forEach((btn) => {
    btn.addEventListener('click', () => onSelectPage(btn.dataset.pageId))
  })
  container.querySelector('[data-action="assignments"]')?.addEventListener('click', onOpenAssignments)
  container.querySelector('[data-action="flashcards"]')?.addEventListener('click', onOpenFlashcards)
  container.querySelector('[data-action="profile"]')?.addEventListener('click', onOpenProfile)
}

function pageKindLabel(page) {
  const kind = page.kind ?? 'note'
  if (kind === 'todo') return 'Todo'
  if (kind === 'journal') return 'Journal'
  return page.course || 'Note'
}

function progressRow(a) {
  const pct = a.status === 'done' ? 100 : a.status === 'progress' ? 55 : 15
  return `
    <li class="ws-progress-item">
      <div class="ws-progress-top">
        <span>${escapeHtml(a.title)}</span>
        <span class="ws-muted">${formatDate(a.dueDate)}</span>
      </div>
      <div class="ws-progress-track"><div class="ws-progress-fill" style="width:${pct}%"></div></div>
    </li>`
}

function countTodos(pages, done) {
  let n = 0
  for (const p of pages) {
    if (p.trashed) continue
    const lines = (p.content || '').split('\n')
    for (const line of lines) {
      if (done && line.startsWith('☑')) n++
      if (!done && line.startsWith('☐')) n++
    }
  }
  return n
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
