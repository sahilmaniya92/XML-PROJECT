/** Epic 6 — rule-based weekly study schedule. */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function generateWeeklyPlan({ assignments = [], courses = [], hoursPerWeek = 10 }) {
  const pending = assignments
    .filter((a) => a.status !== 'done')
    .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0))

  const subjects = pending.length
    ? pending.map((a) => ({ label: a.title, course: a.course || 'Study', priority: a.priority }))
    : courses.map((c) => ({ label: `Review ${c}`, course: c, priority: 'normal' }))

  if (!subjects.length) {
    subjects.push({ label: 'General review', course: 'General', priority: 'normal' })
  }

  const sessions = []
  const slots = [9, 11, 14, 16, 18, 10, 15]
  const max = Math.min(hoursPerWeek, subjects.length * 2, 14)

  for (let i = 0; i < max; i += 1) {
    const subject = subjects[i % subjects.length]
    sessions.push({
      id: `plan-${Date.now()}-${i}`,
      day: DAYS[i % 7],
      startHour: slots[i % slots.length],
      durationMin: 90,
      title: subject.label,
      course: subject.course,
    })
  }

  return sessions
}
