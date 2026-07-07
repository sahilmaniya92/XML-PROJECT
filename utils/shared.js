export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;')
}

export function formatDate(ts) {
  if (!ts) return 'No date'
  return new Date(ts).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(hour) {
  const h = hour % 24
  const suffix = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 || 12
  return `${display}:00 ${suffix}`
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
