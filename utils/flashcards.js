/**
 * Epic 7 — simple flashcard helpers (no external AI API).
 * Generates cards from note headings/bullets; SM-2-style scheduling.
 */

const DAY_MS = 24 * 60 * 60 * 1000

export function createFlashcard({ front, back, course = 'General', pageId = null }) {
  const now = Date.now()
  return {
    id: `card-${now}-${Math.random().toString(36).slice(2, 7)}`,
    front,
    back,
    course,
    pageId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: now,
    createdAt: now,
    updatedAt: now,
  }
}

/** Turn note text into flashcards using simple rules (headings + bullets). */
export function generateCardsFromNote(content, { course, pageId }) {
  if (!content?.trim()) return []

  const cards = []
  const lines = content.split('\n').map((line) => line.trim())

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (!line) continue

    if (line.startsWith('## ') || line.startsWith('### ')) {
      const front = line.replace(/^#+\s*/, '')
      const next = lines.slice(i + 1).find((l) => l && !l.startsWith('#'))
      const back = next?.replace(/^[•☐☑]\s*/, '') || `Review: ${front}`
      cards.push(createFlashcard({ front, back, course, pageId }))
      continue
    }

    if (line.startsWith('• ') || line.startsWith('☐ ') || line.startsWith('☑ ')) {
      const topic = line.replace(/^[•☐☑]\s*/, '')
      if (topic.length > 2) {
        cards.push(
          createFlashcard({
            front: `Explain: ${topic}`,
            back: topic,
            course,
            pageId,
          })
        )
      }
    }
  }

  return cards
}

export function isCardDue(card, now = Date.now()) {
  return (card.nextReview ?? 0) <= now
}

/** Simplified SM-2: quality 1 = again, 3 = good, 5 = easy */
export function reviewCard(card, quality) {
  const now = Date.now()
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 3
    else interval = Math.round(interval * easeFactor)

    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )
    if (quality === 5) interval = Math.round(interval * 1.3)
  }

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview: now + interval * DAY_MS,
    updatedAt: now,
  }
}
