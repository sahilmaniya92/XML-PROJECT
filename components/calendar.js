import {
  getCalendarState,
  getEventsForDate,
  getMonthGrid,
  parseDateKey,
  formatDateKey,
} from '../utils/calendar.js'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706']

/**
 * Renders the Calendar Plus full view.
 */
export function renderCalendarPlus(container, { onBack, onPrevMonth, onNextMonth, onSelectDate, onAddEvent, onDeleteEvent }) {
  const { calendarMonth, calendarYear, selectedDateKey, calendarEvents } = getCalendarState()
  const monthLabel = new Date(calendarYear, calendarMonth, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })
  const cells = getMonthGrid(calendarMonth, calendarYear)
  const selectedEvents = getEventsForDate(selectedDateKey)
  const todayKey = formatDateKey(new Date())

  container.innerHTML = `
    <div class="calendar-plus-shell">
      <div class="calendar-plus-header">
        <div>
          <div class="calendar-plus-badge">📅 Calendar Plus</div>
          <h1 class="calendar-plus-title">${monthLabel}</h1>
          <p class="calendar-plus-subtitle">Plan tasks, deadlines, and project milestones in one place.</p>
        </div>
        <div class="calendar-plus-header-actions">
          <button type="button" class="topbar-btn" data-action="back">← Back to pages</button>
          <button type="button" class="topbar-btn topbar-btn-primary" data-action="add-event">+ Add event</button>
        </div>
      </div>

      <div class="calendar-plus-layout">
        <section class="calendar-plus-grid-card">
          <div class="calendar-plus-nav">
            <button type="button" class="icon-btn" data-action="prev-month" aria-label="Previous month">‹</button>
            <span class="calendar-plus-nav-label">${monthLabel}</span>
            <button type="button" class="icon-btn" data-action="next-month" aria-label="Next month">›</button>
          </div>

          <div class="calendar-weekdays">
            ${WEEKDAYS.map((day) => `<span>${day}</span>`).join('')}
          </div>

          <div class="calendar-grid">
            ${cells
              .map((cell) => {
                const events = getEventsForDate(cell.dateKey)
                const isSelected = cell.dateKey === selectedDateKey
                const isToday = cell.dateKey === todayKey
                return `
                  <button
                    type="button"
                    class="calendar-cell ${cell.outside ? 'calendar-cell-outside' : ''} ${isSelected ? 'calendar-cell-selected' : ''} ${isToday ? 'calendar-cell-today' : ''}"
                    data-date="${cell.dateKey}"
                  >
                    <span class="calendar-cell-day">${cell.day}</span>
                    <span class="calendar-cell-dots">
                      ${events
                        .slice(0, 3)
                        .map((event) => `<span class="calendar-dot" style="background:${event.color}"></span>`)
                        .join('')}
                    </span>
                  </button>
                `
              })
              .join('')}
          </div>
        </section>

        <aside class="calendar-plus-sidebar">
          <div class="calendar-plus-sidebar-card">
            <h2>${formatSelectedDate(selectedDateKey)}</h2>
            <p class="calendar-plus-count">${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'}</p>

            <div class="calendar-event-list">
              ${
                selectedEvents.length
                  ? selectedEvents
                      .map(
                        (event) => `
                          <div class="calendar-event-item">
                            <span class="calendar-event-dot" style="background:${event.color}"></span>
                            <span class="calendar-event-title">${escapeHtml(event.title)}</span>
                            <button type="button" class="calendar-event-delete" data-delete-event="${event.id}" aria-label="Delete event">×</button>
                          </div>
                        `
                      )
                      .join('')
                  : '<p class="calendar-empty">No events for this day. Click “Add event”.</p>'
              }
            </div>

            <button type="button" class="calendar-add-btn" data-action="add-event">+ Add event on this day</button>
          </div>

          <div class="calendar-plus-sidebar-card">
            <h3>Upcoming</h3>
            <div class="calendar-upcoming-list">
              ${calendarEvents
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map(
                  (event) => `
                    <button type="button" class="calendar-upcoming-item" data-date="${event.date}">
                      <span class="calendar-event-dot" style="background:${event.color}"></span>
                      <span class="min-w-0">
                        <span class="calendar-upcoming-title">${escapeHtml(event.title)}</span>
                        <span class="calendar-upcoming-date">${formatSelectedDate(event.date)}</span>
                      </span>
                    </button>
                  `
                )
                .join('')}
            </div>
          </div>
        </aside>
      </div>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)
  container.querySelectorAll('[data-action="prev-month"]').forEach((btn) => btn.addEventListener('click', onPrevMonth))
  container.querySelectorAll('[data-action="next-month"]').forEach((btn) => btn.addEventListener('click', onNextMonth))
  container.querySelectorAll('[data-action="add-event"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = prompt('Event title')
      if (title === null) return
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      onAddEvent({ title, date: selectedDateKey, color })
    })
  })

  container.querySelectorAll('[data-date]').forEach((button) => {
    button.addEventListener('click', () => onSelectDate(button.dataset.date))
  })

  container.querySelectorAll('[data-delete-event]').forEach((button) => {
    button.addEventListener('click', () => onDeleteEvent(button.dataset.deleteEvent))
  })
}

function formatSelectedDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
