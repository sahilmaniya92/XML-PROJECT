export const SLASH_GROUPS = [
  {
    label: 'Basic blocks',
    commands: [
      { icon: 'T', label: 'Text', hint: 'Plain text', block: 'text' },
      { icon: 'H1', label: 'Heading 1', hint: 'Large heading', block: 'h1' },
      { icon: 'H2', label: 'Heading 2', hint: 'Medium heading', block: 'h2' },
      { icon: 'H3', label: 'Heading 3', hint: 'Small heading', block: 'h3' },
      { icon: '•', label: 'Bulleted list', hint: 'Simple list', block: 'bullet' },
      { icon: '1.', label: 'Numbered list', hint: 'Numbered list', block: 'number' },
      { icon: '☐', label: 'To-do list', hint: 'Track tasks', block: 'todo' },
      { icon: '▸', label: 'Toggle list', hint: 'Collapsible section', block: 'toggle' },
      { icon: '❝', label: 'Quote', hint: 'Capture a quote', block: 'quote' },
      { icon: '—', label: 'Divider', hint: 'Visual separator', block: 'divider' },
      { icon: '💡', label: 'Callout', hint: 'Highlighted box', block: 'callout' },
    ],
  },
  {
    label: 'Media & embeds',
    commands: [
      { icon: '💻', label: 'Code', hint: 'Code snippet', block: 'code' },
      { icon: '📅', label: 'Calendar', hint: 'Calendar block', block: 'calendar' },
    ],
  },
  {
    label: 'AI',
    commands: [
      { icon: '✨', label: 'Ask CodeFusion', hint: 'AI writing help', block: 'codefusion' },
    ],
  },
]

export const SLASH_COMMANDS = SLASH_GROUPS.flatMap((g) => g.commands)

const BLOCK_HTML = {
  text: '<p class="editor-block" data-block="text" contenteditable="true"><br></p>',
  h1: '<h1 class="editor-block editor-h1" data-block="h1" contenteditable="true">Heading 1</h1>',
  h2: '<h2 class="editor-block editor-h2" data-block="h2" contenteditable="true">Heading 2</h2>',
  h3: '<h3 class="editor-block editor-h3" data-block="h3" contenteditable="true">Heading 3</h3>',
  bullet: '<ul class="editor-block editor-bullet" data-block="bullet"><li contenteditable="true">List item</li></ul>',
  number: '<ol class="editor-block editor-number" data-block="number"><li contenteditable="true">List item</li></ol>',
  todo: `<div class="editor-block editor-todo" data-block="todo" contenteditable="false">
    <span class="todo-checkbox" contenteditable="false" role="checkbox" aria-checked="false" aria-label="Mark complete" tabindex="0"></span>
    <span class="todo-text" contenteditable="true">To-do</span>
  </div>`,
  toggle:
    '<details class="editor-block editor-toggle" data-block="toggle"><summary contenteditable="true">Toggle heading</summary><div class="editor-toggle-body" contenteditable="true"><p><br></p></div></details>',
  quote: '<blockquote class="editor-block editor-quote" data-block="quote" contenteditable="true">Quote</blockquote>',
  code: '<pre class="editor-block editor-code" data-block="code" contenteditable="true">code</pre>',
  divider: '<hr class="editor-block editor-divider" data-block="divider" contenteditable="false" />',
  callout:
    '<div class="editor-block editor-callout" data-block="callout" contenteditable="true"><span class="callout-icon" contenteditable="false">💡</span><span class="callout-text">Callout text</span></div>',
  calendar: '<div class="editor-block editor-calendar-block" data-block="calendar" contenteditable="false"></div>',
}

/**
 * Attach slash command menu behavior to a contenteditable editor.
 */
export function attachSlashMenu({
  contentEl,
  slashMenu,
  onPersist,
  onOpenCodeFusion,
  onInsertCalendarBlock,
  onWrapBlocks,
}) {
  let activeIndex = 0
  let filteredCommands = [...SLASH_COMMANDS]
  let slashQuery = ''

  const hide = () => {
    slashMenu.classList.add('hidden')
    slashMenu.innerHTML = ''
    slashQuery = ''
    activeIndex = 0
  }

  const getSlashContext = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)
    if (!contentEl.contains(range.startContainer)) return null

    const node = range.startContainer
    const textNode = node.nodeType === Node.TEXT_NODE ? node : null
    if (!textNode) return null

    const textBefore = textNode.textContent.slice(0, range.startOffset)
    const match = textBefore.match(/(?:^|\s)\/([^\s]*)$/)
    if (!match) return null

    return {
      query: match[1].toLowerCase(),
      slashStart: range.startOffset - match[0].length + (match[0].startsWith(' ') ? 1 : 0),
      textNode,
      offset: range.startOffset,
    }
  }

  // fix: I used `offset` before defining - need to fix in write

  const positionMenu = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0).cloneRange()
    range.collapse(true)
    const rect = range.getBoundingClientRect()
    const wrapRect = contentEl.closest('.editor-content-wrap')?.getBoundingClientRect() ?? contentEl.getBoundingClientRect()

    const top = rect.bottom - wrapRect.top + 6
    const left = Math.max(0, rect.left - wrapRect.left)

    slashMenu.style.top = `${top}px`
    slashMenu.style.left = `${left}px`
  }

  const renderMenu = () => {
    filteredCommands = SLASH_COMMANDS.filter((cmd) => {
      const target = `${cmd.label} ${cmd.hint}`.toLowerCase()
      return target.includes(slashQuery)
    })

    if (!filteredCommands.length) {
      hide()
      return
    }

    if (activeIndex >= filteredCommands.length) activeIndex = 0

    let html = ''
    let cmdIndex = 0

    SLASH_GROUPS.forEach((group) => {
      const groupCmds = group.commands.filter((cmd) =>
        filteredCommands.some((f) => f.block === cmd.block)
      )
      if (!groupCmds.length) return

      html += `<p class="slash-group-label">${group.label}</p>`
      groupCmds.forEach((cmd) => {
        const index = filteredCommands.findIndex((f) => f.block === cmd.block)
        if (index === -1) return
        html += `
          <button
            type="button"
            class="slash-item ${index === activeIndex ? 'slash-item-active' : ''}"
            data-block="${cmd.block}"
            data-index="${index}"
          >
            <span class="slash-icon">${cmd.icon}</span>
            <span class="min-w-0">
              <span class="slash-label">${cmd.label}</span>
              <span class="slash-hint">${cmd.hint}</span>
            </span>
          </button>
        `
        cmdIndex += 1
      })
    })

    slashMenu.innerHTML = html
    slashMenu.classList.remove('hidden')
    positionMenu()

    slashMenu.querySelectorAll('.slash-item').forEach((item) => {
      item.addEventListener('mousedown', (event) => {
        event.preventDefault()
        activeIndex = Number(item.dataset.index)
        applySelection()
      })
    })
  }

  const removeSlashText = () => {
    const ctx = getSlashContext()
    if (!ctx) return false

    const { textNode, slashStart, offset } = ctx
    const full = textNode.textContent
    const selection = window.getSelection()

    textNode.textContent = full.slice(0, slashStart) + full.slice(offset)

    const range = document.createRange()
    range.setStart(textNode, slashStart)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    return true
  }

  const insertBlock = (blockType) => {
    const html = BLOCK_HTML[blockType]
    if (!html) return

    removeSlashText()

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const block = getCurrentBlockEl(range)
    range.deleteContents()

    const template = document.createElement('template')
    template.innerHTML = html
    const newBlock = template.content.firstElementChild

    if (blockType === 'calendar' && onInsertCalendarBlock) {
      onInsertCalendarBlock(newBlock)
    }

    if (block?.closest('.block-outer')) {
      const outer = block.closest('.block-outer')
      const content = outer.querySelector('.block-content')
      content.innerHTML = ''
      content.appendChild(newBlock)
    } else if (block) {
      block.replaceWith(newBlock)
    } else {
      range.insertNode(newBlock)
    }

    onWrapBlocks?.()

    const newRange = document.createRange()
    if (blockType === 'calendar' || blockType === 'divider') {
      newRange.setStartAfter(newBlock.closest('.block-outer') ?? newBlock)
    } else {
      const editable = newBlock.querySelector('[contenteditable="true"]') ?? newBlock
      newRange.selectNodeContents(editable)
      newRange.collapse(blockType === 'code')
    }
    newRange.collapse(true)
    selection.removeAllRanges()
    selection.addRange(newRange)

    const afterOuter = newBlock.closest('.block-outer') ?? newBlock
    const emptyOuter = createEmptyBlockOuter()
    afterOuter.after(emptyOuter)
    onWrapBlocks?.()

    hide()
    onPersist()
  }

  const applySelection = () => {
    const cmd = filteredCommands[activeIndex]
    if (!cmd) return

    if (cmd.block === 'codefusion') {
      removeSlashText()
      hide()
      onOpenCodeFusion()
      onPersist()
      return
    }

    if (cmd.block === 'text') {
      removeSlashText()
      hide()
      onPersist()
      return
    }

    insertBlock(cmd.block)
  }

  const handleInput = () => {
    const ctx = getSlashContext()
    if (!ctx) {
      hide()
      return
    }

    slashQuery = ctx.query
    activeIndex = 0
    renderMenu()
  }

  const handleKeydown = (event) => {
    if (slashMenu.classList.contains('hidden')) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      activeIndex = (activeIndex + 1) % filteredCommands.length
      renderMenu()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length
      renderMenu()
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      applySelection()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      hide()
    }
  }

  contentEl.addEventListener('input', handleInput)
  contentEl.addEventListener('keydown', handleKeydown)

  document.addEventListener('click', (event) => {
    if (!slashMenu.contains(event.target) && !contentEl.contains(event.target)) {
      hide()
    }
  })

  return { hide }
}

function getCurrentBlockEl(range) {
  let node = range.startContainer
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
  return node?.closest?.('.editor-block') ?? null
}

function createEmptyBlockOuter() {
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

export function renderCalendarMiniBlock(container) {
  const today = new Date()
  const month = today.toLocaleString('default', { month: 'long', year: 'numeric' })
  const day = today.getDate()

  container.innerHTML = `
    <div class="calendar-mini-card">
      <div class="calendar-mini-header">
        <span>📅 Calendar Plus</span>
        <span class="calendar-mini-month">${month}</span>
      </div>
      <div class="calendar-mini-body">
        <div class="calendar-mini-day">${day}</div>
        <div class="calendar-mini-info">
          <p>Today</p>
          <p class="calendar-mini-sub">Open Calendar Plus from sidebar for full view</p>
        </div>
      </div>
    </div>
  `
}
