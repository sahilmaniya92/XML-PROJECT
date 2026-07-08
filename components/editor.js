import { COURSES } from '../utils/courses.js'
import { escapeHtml, escapeAttr } from '../utils/shared.js'

const ICONS = ['📝', '📋', '✅', '📚', '📄', '💡', '🔥']

/** Simple note editor — title, course, lecture, plain text area */
export function renderEditor(container, { activePage, onUpdatePage, onToggleFavorite }) {
  container.innerHTML = `
    <div class="editor-simple">
      ${
        activePage.course
          ? `<p class="editor-story-hint">Linked to <strong>${escapeHtml(activePage.course)}</strong>${activePage.lecture ? ` · ${escapeHtml(activePage.lecture)}` : ''}</p>`
          : ''
      }

      <div class="editor-toolbar">
        <label class="editor-toolbar-label">
          Icon
          <select data-field="icon" class="editor-select-sm">
            ${ICONS.map((icon) => `<option value="${icon}">${icon}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="editor-fav-btn" data-action="favorite">
          ${activePage.favorite ? '★ Favorited' : '☆ Favorite'}
        </button>
      </div>

      <input
        type="text"
        class="editor-title-input"
        data-field="title"
        placeholder="Note title"
        value="${escapeAttr(activePage.title === 'Untitled' ? '' : activePage.title)}"
      />

      <div class="editor-meta">
        <label>
          Course
          <select data-field="course" class="editor-select">
            ${COURSES.map(
              (c) =>
                `<option value="${escapeAttr(c)}" ${activePage.course === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
            ).join('')}
          </select>
        </label>
        <label>
          Lecture
          <input
            type="text"
            data-field="lecture"
            class="editor-input"
            placeholder="e.g. Week 3 — XML"
            value="${escapeAttr(activePage.lecture ?? '')}"
          />
        </label>
      </div>

      <textarea
        data-field="content"
        class="editor-textarea"
        placeholder="Type your notes here...

## Key concepts
• First point
• Second point

Use ## for headings and • for bullets."
      ></textarea>
      <p class="editor-hint">Flashcards and exam prep read ## headings and • bullets from this text.</p>
    </div>
  `

  const iconEl = container.querySelector('[data-field="icon"]')
  if (iconEl) iconEl.value = activePage.icon || '📄'

  const contentEl = container.querySelector('[data-field="content"]')
  if (contentEl) contentEl.value = activePage.content ?? ''

  const save = (updates) => onUpdatePage(updates, { silent: true })

  container.querySelector('[data-field="title"]')?.addEventListener('input', (e) => {
    save({ title: e.target.value.trim() || 'Untitled' })
  })

  container.querySelector('[data-field="content"]')?.addEventListener('input', (e) => {
    save({ content: e.target.value })
  })

  container.querySelector('[data-field="icon"]')?.addEventListener('change', (e) => {
    onUpdatePage({ icon: e.target.value })
  })

  container.querySelector('[data-field="course"]')?.addEventListener('change', (e) => {
    onUpdatePage({ course: e.target.value })
  })

  container.querySelector('[data-field="lecture"]')?.addEventListener('input', (e) => {
    save({ lecture: e.target.value.trim() })
  })

  container.querySelector('[data-action="favorite"]')?.addEventListener('click', onToggleFavorite)
}
