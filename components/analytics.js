import { escapeHtml, todayKey } from '../utils/shared.js'

export function renderAnalytics(container, { studyLog, assignments, pages, onBack, onLogStudy }) {
  const days = last7Days()
  const maxMins = Math.max(1, ...days.map((d) => studyLog[d] ?? 0))
  const done = assignments.filter((a) => a.status === 'done').length
  const total = assignments.length
  const noteCount = pages.filter((p) => !p.trashed).length

  container.innerHTML = `
    <div class="ws-view">
      <header class="ws-hero ws-hero-compact">
        <button type="button" class="ws-back" data-action="back">← Dashboard</button>
        <div class="ws-hero-row">
          <div>
            <h1 class="ws-title">Analytics</h1>
            <p class="ws-lead">Study hours and completion at a glance.</p>
          </div>
          <button type="button" class="ws-btn" data-action="log">+ Log 30 min study</button>
        </div>
      </header>

      <div class="ws-stat-row">
        <div class="ws-stat"><span class="ws-stat-val">${sumStudy(studyLog, days)}m</span><span class="ws-stat-lbl">This week</span></div>
        <div class="ws-stat"><span class="ws-stat-val">${done}/${total || '—'}</span><span class="ws-stat-lbl">Assignments done</span></div>
        <div class="ws-stat"><span class="ws-stat-val">${noteCount}</span><span class="ws-stat-lbl">Notes</span></div>
      </div>

      <section class="ws-panel">
        <h2 class="ws-panel-title">Study hours (last 7 days)</h2>
        <div class="ws-chart">
          ${days
            .map((d) => {
              const mins = studyLog[d] ?? 0
              const h = Math.round((mins / maxMins) * 100)
              const label = d === todayKey() ? 'Today' : new Date(d).toLocaleDateString(undefined, { weekday: 'short' })
              return `
            <div class="ws-chart-col">
              <div class="ws-chart-bar" style="height:${h}%"></div>
              <span class="ws-chart-lbl">${label}</span>
              <span class="ws-chart-val">${mins}m</span>
            </div>`
            })
            .join('')}
        </div>
      </section>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)
  container.querySelector('[data-action="log"]')?.addEventListener('click', onLogStudy)
}

function last7Days() {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function sumStudy(log, days) {
  return days.reduce((s, d) => s + (log[d] ?? 0), 0)
}
