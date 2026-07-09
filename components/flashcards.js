import { formatCourseLabel } from '../utils/courses.js'

/**
 * Epic 7 — Flashcard list + spaced-repetition review (simple UI).
 */
export function renderFlashcards(container, {
  flashcards,
  dueCount,
  activeCourse,
  courses,
  onBack,
  onSetCourse,
  onGenerateFromNote,
  onStartReview,
  onReview,
  onDeleteCard,
}) {
  const courseCards = flashcards.filter(
    (c) => activeCourse === 'All' || c.course === activeCourse
  )

  container.innerHTML = `
    <div class="flashcards-shell">
      <div class="flashcards-inner">
        <header class="flashcards-header">
          <button type="button" class="flashcards-back" data-action="back">← Back</button>
          <div>
            <h1 class="flashcards-title">Flashcards</h1>
            <p class="flashcards-subtitle">Study from your notes with spaced repetition</p>
          </div>
        </header>

        <div class="flashcards-toolbar">
          <label class="flashcards-filter">
            Course
            <select data-action="set-course">
              <option value="All" ${activeCourse === 'All' ? 'selected' : ''}>All courses</option>
              ${courses
                .map(
                  (c) =>
                    `<option value="${escapeAttr(c)}" ${activeCourse === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
                )
                .join('')}
            </select>
          </label>
          <button type="button" class="topbar-btn" data-action="generate">Generate from open note</button>
          <button type="button" class="topbar-btn topbar-btn-primary" data-action="review" ${dueCount ? '' : 'disabled'}>
            Review due (${dueCount})
          </button>
        </div>

        <div id="flashcard-review" class="flashcard-review hidden"></div>

        <section class="flashcards-list-section">
          <h2>All cards (${courseCards.length})</h2>
          ${
            courseCards.length
              ? `<div class="flashcards-list">
              ${courseCards
                .map(
                  (card) => `
                <article class="flashcard-item">
                  <div class="flashcard-item-head">
                    <span class="flashcard-course">${escapeHtml(formatCourseLabel(card.course))}</span>
                    <button type="button" class="sidebar-mini-btn sidebar-mini-btn-danger" data-delete-id="${card.id}">×</button>
                  </div>
                  <p class="flashcard-front"><strong>Q:</strong> ${escapeHtml(card.front)}</p>
                  <p class="flashcard-back"><strong>A:</strong> ${escapeHtml(card.back)}</p>
                </article>
              `
                )
                .join('')}
            </div>`
              : '<p class="flashcards-empty">No flashcards yet. Open a lecture note and click “Generate from open note”.</p>'
          }
        </section>
      </div>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)
  container.querySelector('[data-action="set-course"]')?.addEventListener('change', (e) => {
    onSetCourse(e.target.value)
  })
  container.querySelector('[data-action="generate"]')?.addEventListener('click', onGenerateFromNote)
  container.querySelector('[data-action="review"]')?.addEventListener('click', () => {
    startReviewSession(container, { flashcards, activeCourse, onReview })
  })
  container.querySelectorAll('[data-delete-id]').forEach((btn) => {
    btn.addEventListener('click', () => onDeleteCard(btn.dataset.deleteId))
  })
}

function startReviewSession(container, { flashcards, activeCourse, onReview }) {
  const due = flashcards.filter(
    (c) =>
      (activeCourse === 'All' || c.course === activeCourse) &&
      (c.nextReview ?? 0) <= Date.now()
  )
  if (!due.length) return

  let index = 0
  let flipped = false
  const reviewEl = container.querySelector('#flashcard-review')
  reviewEl.classList.remove('hidden')

  const renderCard = () => {
    const card = due[index]
    flipped = false
    reviewEl.innerHTML = `
      <div class="flashcard-review-card">
        <p class="flashcard-review-progress">${index + 1} / ${due.length}</p>
        <button type="button" class="flashcard-flip" data-action="flip">
          <span class="flashcard-review-label">${flipped ? 'Answer' : 'Question'}</span>
          <span class="flashcard-review-text">${escapeHtml(flipped ? card.back : card.front)}</span>
          <span class="flashcard-review-hint">${flipped ? '' : 'Click to reveal answer'}</span>
        </button>
        <div class="flashcard-review-actions ${flipped ? '' : 'hidden'}">
          <button type="button" class="topbar-btn topbar-btn-danger" data-quality="1">Again</button>
          <button type="button" class="topbar-btn" data-quality="3">Good</button>
          <button type="button" class="topbar-btn topbar-btn-primary" data-quality="5">Easy</button>
        </div>
      </div>
    `

    reviewEl.querySelector('[data-action="flip"]')?.addEventListener('click', () => {
      flipped = true
      renderCard()
    })

    reviewEl.querySelectorAll('[data-quality]').forEach((btn) => {
      btn.addEventListener('click', () => {
        onReview(card.id, Number(btn.dataset.quality))
        index += 1
        if (index >= due.length) {
          reviewEl.innerHTML = '<p class="flashcards-done">Review complete for today.</p>'
          setTimeout(() => reviewEl.classList.add('hidden'), 1500)
        } else {
          renderCard()
        }
      })
    })
  }

  renderCard()
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", '&#39;')
}
