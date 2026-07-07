/**
 * Block-level keyboard behavior and gutter controls for the Notion-style editor.
 */

export function attachBlockBehavior(contentEl, { onPersist }) {
  wrapBlocks(contentEl)

  contentEl.addEventListener('click', (event) => {
    const checkbox = event.target.closest('.todo-checkbox')
    if (checkbox) {
      event.preventDefault()
      event.stopPropagation()
      const todo = checkbox.closest('[data-block="todo"]')
      if (todo) {
        toggleTodo(todo)
        onPersist()
      }
      return
    }

    const todo = event.target.closest('[data-block="todo"]')
    if (!todo || todo.querySelector('.todo-checkbox')) return

    const text = todo.textContent
    if (text.startsWith('☐')) {
      todo.textContent = '☑' + text.slice(1)
      todo.classList.add('is-checked')
      onPersist()
    } else if (text.startsWith('☑')) {
      todo.textContent = '☐' + text.slice(1)
      todo.classList.remove('is-checked')
      onPersist()
    }
  })

  contentEl.addEventListener('keydown', (event) => {
    const checkbox = event.target.closest('.todo-checkbox')
    if (checkbox && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      const todo = checkbox.closest('[data-block="todo"]')
      if (todo) {
        toggleTodo(todo)
        onPersist()
      }
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      const slashOpen = document.querySelector('.slash-menu:not(.hidden)')
      if (slashOpen) return

      event.preventDefault()
      const block = getCurrentBlock()
      if (!block) return

      const outer = block.closest('.block-outer')
      const newBlock = block.dataset.block === 'todo' ? createTodoBlock() : createTextBlock()
      if (outer) {
        outer.after(newBlock)
      } else {
        block.after(newBlock)
        wrapBlocks(contentEl)
      }
      focusBlock(newBlock)
      onPersist()
      return
    }

    if (event.key === 'Backspace') {
      const block = getCurrentBlock()
      if (!block) return

      const text = getBlockText(block)
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      if (!isAtBlockStart(block, range)) return
      if (text.length > 0) return

      event.preventDefault()
      const outer = block.closest('.block-outer') ?? block
      const prev = outer.previousElementSibling
      outer.remove()
      if (prev) focusBlockEnd(prev)
      onPersist()
    }
  })

  contentEl.addEventListener('click', (event) => {
    const addBtn = event.target.closest('[data-action="block-add"]')
    const handle = event.target.closest('[data-action="block-handle"]')
    if (!addBtn && !handle) return

    event.preventDefault()
    event.stopPropagation()

    const outer = event.target.closest('.block-outer')
    if (!outer) return

    if (addBtn) {
      const currentBlock = outer.querySelector('.block-content > .editor-block')
      const newBlock = currentBlock?.dataset.block === 'todo' ? createTodoBlock() : createTextBlock()
      outer.after(newBlock)
      wrapBlocks(contentEl)
      focusBlock(newBlock.querySelector('.editor-block') ?? newBlock)
      onPersist()
      return
    }

    if (handle) {
      showBlockMenu(handle, outer, contentEl, onPersist)
    }
  })
}

function showBlockMenu(anchor, outer, contentEl, onPersist) {
  document.querySelector('.block-context-menu')?.remove()

  const menu = document.createElement('div')
  menu.className = 'block-context-menu'
  menu.innerHTML = `
    <button type="button" data-block-action="up">↑ Move up</button>
    <button type="button" data-block-action="down">↓ Move down</button>
    <button type="button" data-block-action="delete" class="is-danger">Delete block</button>
  `

  const rect = anchor.getBoundingClientRect()
  menu.style.top = `${rect.bottom + 4}px`
  menu.style.left = `${rect.left}px`
  document.body.appendChild(menu)

  const close = () => menu.remove()

  menu.querySelector('[data-block-action="up"]')?.addEventListener('click', () => {
    const prev = outer.previousElementSibling
    if (prev) {
      contentEl.insertBefore(outer, prev)
      onPersist()
    }
    close()
  })

  menu.querySelector('[data-block-action="down"]')?.addEventListener('click', () => {
    const next = outer.nextElementSibling
    if (next) {
      contentEl.insertBefore(next, outer)
      onPersist()
    }
    close()
  })

  menu.querySelector('[data-block-action="delete"]')?.addEventListener('click', () => {
    outer.remove()
    if (!contentEl.querySelector('.block-outer')) {
      contentEl.appendChild(createTextBlock())
      wrapBlocks(contentEl)
    }
    onPersist()
    close()
  })

  setTimeout(() => {
    document.addEventListener('click', close, { once: true })
  }, 0)
}

export function wrapBlocks(contentEl) {
  const blocks = [...contentEl.children].filter(
    (el) => el.classList.contains('editor-block') && !el.closest('.block-outer')
  )

  blocks.forEach((block) => {
    const outer = document.createElement('div')
    outer.className = 'block-outer'
    outer.innerHTML = `
      <div class="block-gutter" contenteditable="false">
        <button type="button" class="block-btn block-btn-add" data-action="block-add" aria-label="Add block">+</button>
        <button type="button" class="block-btn block-btn-handle" data-action="block-handle" aria-label="Drag handle">⠿</button>
      </div>
      <div class="block-content"></div>
    `
    const content = outer.querySelector('.block-content')
    block.before(outer)
    content.appendChild(block)
  })
}

export function createTextBlock() {
  const outer = document.createElement('div')
  outer.className = 'block-outer'
  outer.innerHTML = `
    <div class="block-gutter" contenteditable="false">
      <button type="button" class="block-btn block-btn-add" data-action="block-add" aria-label="Add block">+</button>
      <button type="button" class="block-btn block-btn-handle" data-action="block-handle" aria-label="Drag handle">⠿</button>
    </div>
    <div class="block-content">
      <p class="editor-block" data-block="text" contenteditable="true"><br></p>
    </div>
  `
  return outer
}

export function createTodoBlock() {
  const outer = document.createElement('div')
  outer.className = 'block-outer'
  outer.innerHTML = `
    <div class="block-gutter" contenteditable="false">
      <button type="button" class="block-btn block-btn-add" data-action="block-add" aria-label="Add block">+</button>
      <button type="button" class="block-btn block-btn-handle" data-action="block-handle" aria-label="Drag handle">⠿</button>
    </div>
    <div class="block-content">
      <div class="editor-block editor-todo" data-block="todo" contenteditable="false">
        <span class="todo-checkbox" contenteditable="false" role="checkbox" aria-checked="false" aria-label="Mark complete" tabindex="0"></span>
        <span class="todo-text" contenteditable="true"></span>
      </div>
    </div>
  `
  return outer
}

function toggleTodo(todo) {
  const checked = !todo.classList.contains('is-checked')
  todo.classList.toggle('is-checked', checked)
  const checkbox = todo.querySelector('.todo-checkbox')
  if (checkbox) {
    checkbox.classList.toggle('is-checked', checked)
    checkbox.setAttribute('aria-checked', String(checked))
    checkbox.setAttribute('aria-label', checked ? 'Mark incomplete' : 'Mark complete')
  }
}

function getCurrentBlock() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return null

  let node = selection.anchorNode
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement
  return node?.closest?.('.editor-block') ?? null
}

function getBlockText(block) {
  const todoText = block.querySelector('.todo-text')
  if (todoText) return todoText.innerText.replace(/\n/g, '').trim()
  return block.innerText.replace(/\n/g, '').trim()
}

function isAtBlockStart(block, range) {
  const test = range.cloneRange()
  test.selectNodeContents(block)
  test.setEnd(range.startContainer, range.startOffset)
  return test.toString().length === 0
}

function focusBlock(block) {
  const editable = block.querySelector?.('[contenteditable="true"]') ?? block
  const range = document.createRange()
  range.selectNodeContents(editable)
  range.collapse(true)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  editable.focus?.()
}

function focusBlockEnd(block) {
  const editable = block.querySelector?.('[contenteditable="true"]') ?? block
  const range = document.createRange()
  range.selectNodeContents(editable)
  range.collapse(false)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  editable.focus?.()
}

export function serializeBlocks(contentEl) {
  const lines = []

  contentEl.querySelectorAll('.block-outer').forEach((outer) => {
    const block = outer.querySelector('.block-content > .editor-block')
    if (!block) return

    const type = block.dataset.block
    const text = block.innerText.trim()
    if (!text && type !== 'todo') return

    switch (type) {
      case 'h1':
        lines.push(`# ${text}`)
        break
      case 'h2':
        lines.push(`## ${text}`)
        break
      case 'h3':
        lines.push(`### ${text}`)
        break
      case 'quote':
        lines.push(`> ${text}`)
        break
      case 'todo': {
        const textEl = block.querySelector('.todo-text')
        if (textEl) {
          const taskText = textEl.innerText.trim()
          const mark = block.classList.contains('is-checked') ? '☑' : '☐'
          lines.push(taskText ? `${mark} ${taskText}` : `${mark} `)
        } else {
          lines.push(text)
        }
        break
      }
      case 'bullet': {
        const items = [...block.querySelectorAll('li')].map((li) => li.innerText.trim()).filter(Boolean)
        items.forEach((item) => lines.push(`• ${item}`))
        break
      }
      case 'number': {
        const items = [...block.querySelectorAll('li')].map((li) => li.innerText.trim()).filter(Boolean)
        items.forEach((item, i) => lines.push(`${i + 1}. ${item}`))
        break
      }
      case 'code':
        lines.push('```')
        lines.push(text)
        lines.push('```')
        break
      case 'divider':
        lines.push('---')
        break
      case 'callout':
        lines.push(`! ${text}`)
        break
      case 'toggle':
        lines.push(`> ${text}`)
        break
      case 'calendar':
        lines.push('[calendar]')
        break
      default:
        lines.push(text)
    }
  })

  if (!lines.length) {
    contentEl.querySelectorAll(':scope > .editor-block').forEach((block) => {
      const text = block.innerText.trim()
      if (text) lines.push(text)
    })
  }

  return lines.join('\n')
}
