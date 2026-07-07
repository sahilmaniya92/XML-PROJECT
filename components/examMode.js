import { escapeHtml } from '../utils/shared.js'
import { generateCardsFromNote } from '../utils/flashcards.js'

export function renderExamMode(container, { activePage, flashcards, onBack, onActivate }) {
  const page = activePage
  const previewCards = page ? generateCardsFromNote(page.content, { course: page.course, pageId: page.id }) : []
  const quizItems = buildQuiz(page?.content)

  container.innerHTML = `
    <div class="ws-view">
      <header class="ws-hero ws-hero-compact">
        <button type="button" class="ws-back" data-action="back">← Dashboard</button>
        <div class="ws-hero-row">
          <div>
            <h1 class="ws-title">Exam mode</h1>
            <p class="ws-lead">One-click prep: summary, flashcards, and a short quiz from your material.</p>
          </div>
          <button type="button" class="ws-btn ws-btn-primary" data-action="activate" ${page ? '' : 'disabled'}>
            Activate for "${escapeHtml(page?.title || 'open a note first')}"
          </button>
        </div>
      </header>

      <div class="ws-grid-3">
        <section class="ws-panel">
          <h2 class="ws-panel-title">Summary</h2>
          <p class="ws-exam-preview">${page ? escapeHtml(summarize(page.content)) : 'Open a lecture note first.'}</p>
        </section>
        <section class="ws-panel">
          <h2 class="ws-panel-title">Flashcards</h2>
          <p class="ws-muted">${previewCards.length} cards ready from current note</p>
          <ul class="ws-exam-list">${previewCards.slice(0, 3).map((c) => `<li>${escapeHtml(c.front)}</li>`).join('') || '<li>Add headings to your note</li>'}</ul>
        </section>
        <section class="ws-panel">
          <h2 class="ws-panel-title">Quick quiz</h2>
          <ul class="ws-exam-list">${quizItems.map((q) => `<li>${escapeHtml(q)}</li>`).join('') || '<li>No quiz items yet</li>'}</ul>
        </section>
      </div>

      <p class="ws-hint">Using note: <strong>${escapeHtml(page?.title || 'None selected')}</strong> · ${flashcards.length} total cards in deck</p>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)
  container.querySelector('[data-action="activate"]')?.addEventListener('click', onActivate)
}

function summarize(content) {
  if (!content) return ''
  const headings = content.split('\n').filter((l) => l.startsWith('##') || l.startsWith('###'))
  if (headings.length) return headings.map((h) => h.replace(/^#+\s*/, '')).join(' · ')
  return content.slice(0, 200)
}

function buildQuiz(content) {
  if (!content) return []
  return content
    .split('\n')
    .filter((l) => l.startsWith('• ') || l.startsWith('##'))
    .slice(0, 5)
    .map((l) => `What do you know about: ${l.replace(/^[•#]+\s*/, '')}?`)
}
