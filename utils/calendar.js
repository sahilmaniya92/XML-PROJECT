const DEFAULT_EVENTS = [
  {
    id: 'evt-1',
    title: 'Phase 3 Presentation',
    date: formatDateKey(new Date()),
    color: '#7c3aed',
  },
  {
    id: 'evt-2',
    title: 'Team Meeting',
    date: formatDateKey(addDays(new Date(), 2)),
    color: '#2563eb',
  },
  {
    id: 'evt-3',
    title: 'Submit Project Report',
    date: formatDateKey(addDays(new Date(), 5)),
    color: '#dc2626',
  },
]

let calendarEvents = structuredClone(DEFAULT_EVENTS)
let calendarMonth = new Date().getMonth()
let calendarYear = new Date().getFullYear()
let selectedDateKey = formatDateKey(new Date())

export function getCalendarState() {
  return {
    calendarEvents,
    calendarMonth,
    calendarYear,
    selectedDateKey,
  }
}

export function setCalendarMonthYear(month, year) {
  calendarMonth = month
  calendarYear = year
}

export function goToPrevMonth() {
  if (calendarMonth === 0) {
    calendarMonth = 11
    calendarYear -= 1
  } else {
    calendarMonth -= 1
  }
}

export function goToNextMonth() {
  if (calendarMonth === 11) {
    calendarMonth = 0
    calendarYear += 1
  } else {
    calendarMonth += 1
  }
}

export function setSelectedDate(dateKey) {
  selectedDateKey = dateKey
}

export function getEventsForDate(dateKey) {
  return calendarEvents.filter((event) => event.date === dateKey)
}

export function addCalendarEvent({ title, date, color = '#7c3aed' }) {
  const event = {
    id: `evt-${Date.now()}`,
    title: title.trim() || 'Untitled event',
    date,
    color,
  }
  calendarEvents = [...calendarEvents, event]
  return event
}

export function deleteCalendarEvent(id) {
  calendarEvents = calendarEvents.filter((event) => event.id !== id)
}

export function loadCalendarEvents(events) {
  if (events === null) {
    calendarEvents = structuredClone(DEFAULT_EVENTS)
    return
  }
  if (Array.isArray(events) && events.length) {
    calendarEvents = structuredClone(events)
  }
}

export function loadCalendarState({ events, month, year, selectedDateKey: dateKey }) {
  if (Array.isArray(events)) calendarEvents = structuredClone(events)
  if (typeof month === 'number') calendarMonth = month
  if (typeof year === 'number') calendarYear = year
  if (dateKey) selectedDateKey = dateKey
}

export function formatDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getMonthGrid(month, year) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    cells.push({ day, dateKey: formatDateKey(date), outside: true })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({ day, dateKey: formatDateKey(date), outside: false })
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - startWeekday - daysInMonth + 1
    const date = new Date(year, month + 1, nextDay)
    cells.push({ day: nextDay, dateKey: formatDateKey(date), outside: true })
  }

  return cells
}

function addDays(date, amount) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}
