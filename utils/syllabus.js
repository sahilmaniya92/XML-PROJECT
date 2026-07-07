/** Epic 1 — basic syllabus date extraction (regex, not full NLP). */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function parseLooseDate(raw, year = new Date().getFullYear()) {
  const slash = raw.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/)
  if (slash) {
    const y = slash[3] ? (slash[3].length === 2 ? 2000 + Number(slash[3]) : Number(slash[3])) : year
    return new Date(y, Number(slash[1]) - 1, Number(slash[2])).getTime()
  }

  const named = raw.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/i)
  if (named) {
    const m = MONTHS[named[1].slice(0, 3).toLowerCase()]
    return new Date(year, m, Number(named[2])).getTime()
  }

  return null
}

export function parseSyllabus(text) {
  if (!text?.trim()) return []

  const events = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b)|(\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b)/gi

  for (const line of lines) {
    const matches = [...line.matchAll(datePattern)]
    if (!matches.length) continue

    const title = line.replace(datePattern, '').replace(/^[-–•*]\s*/, '').trim() || 'Syllabus item'
    for (const m of matches) {
      const ts = parseLooseDate(m[0])
      if (ts) {
        events.push({
          id: `syl-${ts}-${events.length}`,
          title: title.slice(0, 100),
          dateKey: new Date(ts).toISOString().slice(0, 10),
          source: 'syllabus',
        })
      }
    }
  }

  return events
}
