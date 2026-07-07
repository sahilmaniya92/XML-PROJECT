const CODEFUSION_RESPONSES = {
  summarize:
    'Summary: TaskScape is a Notion-like workspace for notes and tasks. Phase 3 delivers the UI shell with sidebar navigation, block editing, and CodeFusion AI integration planned for later phases.',
  improve:
    'Improved version: TaskScape combines structured note-taking with task management in a clean, Notion-inspired interface — helping students and teams organize work in one centralized workspace.',
  expand:
    'Expanded: TaskScape is designed as an all-in-one productivity platform. Users can create nested pages, write rich content, track tasks, and soon leverage CodeFusion AI for summarization, rewriting, and smart suggestions powered by the Gemini API.',
  tasks:
    'Suggested tasks:\n1. Finalize Phase 3 UI review\n2. Prepare professor presentation\n3. Define Supabase schema for Phase 4\n4. Wire CodeFusion to Gemini API',
}

/**
 * Renders the CodeFusion AI assistant panel.
 * @param {HTMLElement} container
 * @param {object} options
 */
export function renderCodeFusion(container, { open, activePage, messages = [], onClose, onAction }) {
  container.innerHTML = `
    <div class="codefusion-backdrop ${open ? 'is-open' : ''}" data-action="close-backdrop" aria-hidden="${!open}"></div>

    <aside
      class="codefusion-panel ${open ? 'is-open' : ''}"
      aria-label="CodeFusion AI Assistant"
      aria-hidden="${!open}"
    >
      <div class="codefusion-header">
        <div class="flex items-center gap-3 min-w-0">
          <div class="codefusion-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-sm font-semibold text-gray-900">CodeFusion</h2>
            <p class="text-xs text-gray-500 truncate">AI writing assistant for CodeFusion</p>
          </div>
        </div>
        <button type="button" class="icon-btn" data-action="close" aria-label="Close CodeFusion">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="codefusion-body">
        <div class="codefusion-welcome">
          <div class="codefusion-badge">Powered by CodeFusion</div>
          <p class="text-sm text-gray-600 leading-relaxed">
            Ask CodeFusion to summarize, improve, or expand your page content.
            Full Gemini API integration arrives in a later phase.
          </p>
        </div>

        <div class="codefusion-actions">
          <button type="button" class="codefusion-action-btn" data-ai-action="summarize">
            <span>✨</span>
            <span>Summarize page</span>
          </button>
          <button type="button" class="codefusion-action-btn" data-ai-action="improve">
            <span>📝</span>
            <span>Improve writing</span>
          </button>
          <button type="button" class="codefusion-action-btn" data-ai-action="expand">
            <span>📖</span>
            <span>Expand content</span>
          </button>
          <button type="button" class="codefusion-action-btn" data-ai-action="tasks">
            <span>✅</span>
            <span>Suggest tasks</span>
          </button>
        </div>

        <div class="codefusion-context">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Current page</p>
          <div class="codefusion-context-card">
            <span class="text-lg">${activePage.icon}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">${escapeHtml(activePage.title)}</p>
              <p class="text-xs text-gray-500 truncate">${activePage.content ? 'Content available' : 'Empty page'}</p>
            </div>
          </div>
        </div>

        <div id="codefusion-messages" class="codefusion-messages">
          ${messages
            .map(
              (message) => `
                <div class="codefusion-message ${message.role === 'user' ? 'codefusion-message-user' : 'codefusion-message-ai'}">
                  <div class="codefusion-message-label">${message.role === 'user' ? 'You' : 'CodeFusion'}</div>
                  <p>${escapeHtml(message.text).replace(/\n/g, '<br>')}</p>
                </div>
              `
            )
            .join('')}
        </div>
      </div>

      <div class="codefusion-footer">
        <div class="codefusion-input-wrap">
          <input
            id="codefusion-input"
            type="text"
            class="codefusion-input"
            placeholder="Ask CodeFusion anything..."
            autocomplete="off"
          />
          <button type="button" class="codefusion-send-btn" data-action="send" aria-label="Send prompt">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `

  container.querySelector('[data-action="close"]')?.addEventListener('click', onClose)
  container.querySelector('[data-action="close-backdrop"]')?.addEventListener('click', onClose)

  container.querySelectorAll('[data-ai-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.aiAction
      onAction(action, button.querySelector('span:last-child')?.textContent ?? action)
    })
  })

  const input = container.querySelector('#codefusion-input')
  const sendBtn = container.querySelector('[data-action="send"]')

  const sendPrompt = () => {
    const value = input?.value.trim()
    if (!value) return
    onAction('custom', value)
    if (input) input.value = ''
  }

  sendBtn?.addEventListener('click', sendPrompt)
  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendPrompt()
  })

  const messagesEl = container.querySelector('#codefusion-messages')
  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight
}

export function getCodeFusionResponse(action, prompt) {
  if (action === 'custom') {
    return `CodeFusion received: "${prompt}"\n\nThis is a preview response. In a future phase, this will connect to the Gemini API for real AI-generated answers.`
  }
  return CODEFUSION_RESPONSES[action] ?? 'CodeFusion is ready to help once the API is connected.'
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
