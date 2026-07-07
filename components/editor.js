import { attachSlashMenu, renderCalendarMiniBlock } from '../utils/slashMenu.js'
import { attachBlockBehavior, wrapBlocks, serializeBlocks } from '../utils/blockEditor.js'
import { COVER_GRADIENTS, getCoverCss } from '../utils/covers.js'
import { COURSES } from '../utils/courses.js'

const PAGE_ICONS = ['📝', '📋', '✅', '📌', '🎯', '💡', '📚', '🗂️', '⭐', '🔥', '📄', '🚀', '📅', '🎨', '💼', '🔖']

const COVER_POSITIONS = ['center center', 'center top', 'center bottom', 'left center', 'right center']

/**
 * Renders the Notion-style page editor.
 */
export function renderEditor(container, { activePage, onUpdatePage, onOpenCodeFusion, onToggleFavorite }) {
  const coverCss = getCoverCss(activePage.cover)
  const hasCover = activePage.cover && activePage.cover !== 'none'
  const coverPosition = activePage.coverPosition ?? 'center center'

  container.innerHTML = `
    <div class="editor-shell">
      <div class="editor-cover-wrap ${hasCover ? '' : 'editor-cover-hidden'}">
        <div class="editor-cover" style="background: ${coverCss}; background-position: ${coverPosition}; background-size: cover;"></div>
        <button type="button" class="editor-cover-btn" data-action="change-cover">Change cover</button>
        <button type="button" class="editor-cover-btn editor-cover-btn-reposition" data-action="reposition-cover">Reposition</button>
      </div>

        <div class="editor-page ${hasCover ? '' : 'editor-page-no-cover'}">
        ${
          activePage.course
            ? `<p class="editor-story-hint">Linked to <strong>${escapeHtml(activePage.course)}</strong>${activePage.lecture ? ` · ${escapeHtml(activePage.lecture)}` : ''}</p>`
            : ''
        }
        <div class="editor-icon-row">
          <button type="button" class="editor-icon-btn" data-action="change-icon" aria-label="Change page icon">
            ${activePage.icon || '📄'}
          </button>
          <div class="editor-icon-picker hidden" id="icon-picker" role="listbox">
            ${PAGE_ICONS.map(
              (icon) =>
                `<button type="button" class="editor-icon-option" data-icon="${icon}" aria-label="Icon ${icon}">${icon}</button>`
            ).join('')}
          </div>
        </div>

        <h1
          id="page-title"
          class="editor-title"
          contenteditable="true"
          data-placeholder="Untitled"
          spellcheck="true"
          role="textbox"
          aria-label="Page title"
        >${escapeHtml(activePage.title === 'Untitled' ? '' : activePage.title)}</h1>

        <div class="editor-properties">
          <label class="editor-prop editor-prop-select">
            Course
            <select data-action="set-course" class="editor-select">
              ${COURSES.map(
                (c) =>
                  `<option value="${escapeAttr(c)}" ${activePage.course === c ? 'selected' : ''}>${escapeHtml(c)}</option>`
              ).join('')}
            </select>
          </label>
          <label class="editor-prop editor-prop-select">
            Lecture
            <input
              type="text"
              class="editor-input"
              data-action="set-lecture"
              placeholder="e.g. Week 3 — APIs"
              value="${escapeAttr(activePage.lecture ?? '')}"
            />
          </label>
          <button type="button" class="editor-prop" data-action="toggle-favorite">
            ${activePage.favorite ? '★' : '☆'} ${activePage.favorite ? 'Favorited' : 'Add to favorites'}
          </button>
          <span class="editor-prop-divider">·</span>
          <span class="editor-prop-muted">Press <kbd>/</kbd> for blocks</span>
        </div>

        <div class="editor-content-wrap">
          <div
            id="page-content"
            class="editor-content"
            contenteditable="true"
            spellcheck="true"
            role="textbox"
            aria-label="Page content"
            data-empty="${activePage.content ? 'false' : 'true'}"
          >${buildEditorHtml(activePage.content)}</div>

          <div id="slash-menu" class="slash-menu hidden" role="listbox" aria-label="Block commands"></div>
        </div>
      </div>

      <div class="editor-cover-picker hidden" id="cover-picker">
        <p class="editor-cover-picker-title">Choose a cover</p>
        <div class="editor-cover-picker-grid">
          ${COVER_GRADIENTS.map(
            (c) => `
            <button
              type="button"
              class="editor-cover-swatch ${activePage.cover === c.id ? 'is-active' : ''}"
              data-cover="${c.id}"
              style="background: ${c.css === 'none' ? '#f7f6f3' : c.css}"
              aria-label="Cover ${c.id}"
            >${c.id === 'none' ? 'None' : ''}</button>
          `
          ).join('')}
        </div>
      </div>
    </div>
  `

  const titleEl = container.querySelector('#page-title')
  const contentEl = container.querySelector('#page-content')
  const slashMenu = container.querySelector('#slash-menu')
  const iconPicker = container.querySelector('#icon-picker')
  const coverPicker = container.querySelector('#cover-picker')

  wrapBlocks(contentEl)
  hydrateCalendarBlocks(contentEl)

  const persist = () => {
    contentEl.dataset.empty = contentEl.innerText.trim() ? 'false' : 'true'
    onUpdatePage(
      {
        title: titleEl.textContent.trim() || 'Untitled',
        content: serializeBlocks(contentEl),
      },
      { silent: true }
    )
  }

  titleEl?.addEventListener('input', persist)
  contentEl?.addEventListener('input', persist)

  attachBlockBehavior(contentEl, { onPersist: persist })

  attachSlashMenu({
    contentEl,
    slashMenu,
    onPersist: persist,
    onOpenCodeFusion,
    onInsertCalendarBlock: (block) => renderCalendarMiniBlock(block),
    onWrapBlocks: () => wrapBlocks(contentEl),
  })

  container.querySelector('[data-action="change-icon"]')?.addEventListener('click', (e) => {
    e.stopPropagation()
    iconPicker?.classList.toggle('hidden')
    coverPicker?.classList.add('hidden')
  })

  iconPicker?.querySelectorAll('[data-icon]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onUpdatePage({ icon: btn.dataset.icon })
      iconPicker.classList.add('hidden')
    })
  })

  container.querySelector('[data-action="change-cover"]')?.addEventListener('click', (e) => {
    e.stopPropagation()
    coverPicker?.classList.toggle('hidden')
    iconPicker?.classList.add('hidden')
  })

  container.querySelector('[data-action="reposition-cover"]')?.addEventListener('click', (e) => {
    e.stopPropagation()
    const current = activePage.coverPosition ?? 'center center'
    const idx = COVER_POSITIONS.indexOf(current)
    const next = COVER_POSITIONS[(idx + 1) % COVER_POSITIONS.length]
    onUpdatePage({ coverPosition: next })
  })

  coverPicker?.querySelectorAll('[data-cover]').forEach((btn) => {
    btn.addEventListener('click', () => {
      onUpdatePage({ cover: btn.dataset.cover })
      coverPicker.classList.add('hidden')
    })
  })

  container.querySelector('[data-action="toggle-favorite"]')?.addEventListener('click', onToggleFavorite)

  container.querySelector('[data-action="set-course"]')?.addEventListener('change', (e) => {
    onUpdatePage({ course: e.target.value })
  })
  container.querySelector('[data-action="set-lecture"]')?.addEventListener('change', (e) => {
    onUpdatePage({ lecture: e.target.value.trim() })
  })
  container.querySelector('[data-action="set-lecture"]')?.addEventListener('blur', (e) => {
    onUpdatePage({ lecture: e.target.value.trim() })
  })

  document.addEventListener('click', () => {
    iconPicker?.classList.add('hidden')
    coverPicker?.classList.add('hidden')
  })
}

function hydrateCalendarBlocks(contentEl) {
  contentEl.querySelectorAll('[data-block="calendar"]').forEach((block) => {
    renderCalendarMiniBlock(block)
  })
}

function buildEditorHtml(content) {
  if (!content) {
    return '<p class="editor-block" data-block="text"><br></p>'
  }

  const blocks = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line === '---') {
      blocks.push('<hr class="editor-block editor-divider" data-block="divider" contenteditable="false" />')
      i += 1
      continue
    }
    if (line === '```') {
      const codeLines = []
      i += 1
      while (i < lines.length && lines[i] !== '```') {
        codeLines.push(lines[i])
        i += 1
      }
      blocks.push(
        `<pre class="editor-block editor-code" data-block="code" contenteditable="true">${escapeHtml(codeLines.join('\n'))}</pre>`
      )
      i += 1
      continue
    }
    if (line === '[calendar]') {
      blocks.push('<div class="editor-block editor-calendar-block" data-block="calendar" contenteditable="false"></div>')
      i += 1
      continue
    }
    if (line.startsWith('# ')) {
      blocks.push(`<h1 class="editor-block editor-h1" data-block="h1" contenteditable="true">${escapeHtml(line.slice(2))}</h1>`)
    } else if (line.startsWith('## ')) {
      blocks.push(`<h2 class="editor-block editor-h2" data-block="h2" contenteditable="true">${escapeHtml(line.slice(3))}</h2>`)
    } else if (line.startsWith('### ')) {
      blocks.push(`<h3 class="editor-block editor-h3" data-block="h3" contenteditable="true">${escapeHtml(line.slice(4))}</h3>`)
    } else if (line.startsWith('> ')) {
      blocks.push(`<blockquote class="editor-block editor-quote" data-block="quote" contenteditable="true">${escapeHtml(line.slice(2))}</blockquote>`)
    } else if (line.startsWith('! ')) {
      blocks.push(
        `<div class="editor-block editor-callout" data-block="callout" contenteditable="true"><span class="callout-icon" contenteditable="false">💡</span><span class="callout-text">${escapeHtml(line.slice(2))}</span></div>`
      )
    } else if (line.startsWith('☐') || line.startsWith('☑')) {
      const checked = line.startsWith('☑')
      const taskText = line.replace(/^[☐☑]\s*/, '')
      blocks.push(renderTodoBlock(taskText, checked))
    } else if (line.startsWith('• ')) {
      blocks.push(`<ul class="editor-block editor-bullet" data-block="bullet"><li contenteditable="true">${escapeHtml(line.slice(2))}</li></ul>`)
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push(`<ol class="editor-block editor-number" data-block="number"><li contenteditable="true">${escapeHtml(line.replace(/^\d+\.\s/, ''))}</li></ol>`)
    } else if (line.length > 0) {
      blocks.push(`<p class="editor-block" data-block="text" contenteditable="true">${escapeHtml(line)}</p>`)
    }
    i += 1
  }

  if (!blocks.length) {
    return '<p class="editor-block" data-block="text"><br></p>'
  }

  return blocks.join('')
}

function renderTodoBlock(text, checked = false) {
  const stateClass = checked ? 'is-checked' : ''
  const label = checked ? 'Mark incomplete' : 'Mark complete'
  return `<div class="editor-block editor-todo ${stateClass}" data-block="todo" contenteditable="false">
    <span class="todo-checkbox ${stateClass}" contenteditable="false" role="checkbox" aria-checked="${checked}" aria-label="${label}" tabindex="0"></span>
    <span class="todo-text" contenteditable="true">${escapeHtml(text)}</span>
  </div>`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function escapeAttr(value) {
  return escapeHtml(value ?? '').replaceAll("'", '&#39;')
}
