/** Placeholder AI screen — wired up later. */
export function renderAi(container, { onBack }) {
  container.innerHTML = `
    <div class="ws-view">
      <header class="ws-hero ws-hero-compact">
        <button type="button" class="ws-back" data-action="back">← Dashboard</button>
        <div>
          <h1 class="ws-title">AI</h1>
          <p class="ws-lead">Ask questions about your notes. <strong>Coming soon</strong> — not connected yet.</p>
        </div>
      </header>

      <section class="ws-panel ws-ai-placeholder">
        <div class="ws-ai-empty">
          <span class="ws-ai-icon">✦</span>
          <h2>AI assistant</h2>
          <p>This section is reserved for Sahil's Epic 4 work. For now it does nothing — no API, no chat history.</p>
          <p class="ws-muted">When ready: grounded answers from your lecture notes using Gemini.</p>
        </div>

        <form class="ws-chat-input ws-ai-disabled" id="ai-form">
          <input type="text" placeholder="Ask about your notes…" disabled />
          <button type="submit" class="ws-btn ws-btn-primary" disabled>Send</button>
        </form>
      </section>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)

  container.querySelector('#ai-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
  })
}
