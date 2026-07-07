import { escapeHtml, formatTime } from '../utils/shared.js'

export function renderPlanner(container, { studyPlan, onBack, onGenerate }) {
  const byDay = groupByDay(studyPlan)

  container.innerHTML = `
    <div class="ws-view">
      <header class="ws-hero ws-hero-compact">
        <button type="button" class="ws-back" data-action="back">← Dashboard</button>
        <div class="ws-hero-row">
          <div>
            <h1 class="ws-title">Study planner</h1>
            <p class="ws-lead">Weekly schedule built from your assignments and enrolled courses.</p>
          </div>
          <button type="button" class="ws-btn ws-btn-primary" data-action="generate">Generate week</button>
        </div>
      </header>

      <div class="ws-planner-grid">
        ${Object.keys(byDay).length
          ? Object.entries(byDay)
              .map(
                ([day, sessions]) => `
          <section class="ws-panel ws-planner-day">
            <h2 class="ws-planner-day-title">${day}</h2>
            ${sessions
              .map(
                (s) => `
              <div class="ws-planner-slot">
                <span class="ws-planner-time">${formatTime(s.startHour)}</span>
                <div>
                  <strong>${escapeHtml(s.title)}</strong>
                  <span class="ws-muted">${escapeHtml(s.course?.split(' — ')[0] || '')} · ${s.durationMin} min</span>
                </div>
              </div>`
              )
              .join('')}
          </section>`
              )
              .join('')
          : '<p class="ws-empty ws-panel">No plan yet. Click Generate week to build a schedule from your assignments.</p>'}
      </div>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)
  container.querySelector('[data-action="generate"]')?.addEventListener('click', onGenerate)
}

function groupByDay(sessions) {
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const map = {}
  for (const s of sessions) {
    if (!map[s.day]) map[s.day] = []
    map[s.day].push(s)
  }
  const sorted = {}
  for (const d of order) {
    if (map[d]) sorted[d] = map[d].sort((a, b) => a.startHour - b.startHour)
  }
  return sorted
}
