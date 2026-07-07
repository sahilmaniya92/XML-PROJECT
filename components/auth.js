import { isSupabaseConfigured, testConnection } from '../utils/supabase.js'

/**
 * Renders login / signup screen.
 */
export function renderAuth(container, { onLogin, onSignup, onDemoMode, authError, authSuccess, authLoading }) {
  const configured = isSupabaseConfigured

  container.innerHTML = `
    <div class="auth-shell">
      <div class="auth-brand-panel">
        <div class="auth-brand-inner">
          <div class="auth-logo">C</div>
          <h1 class="auth-brand-title">CodeFusion</h1>
          <p class="auth-brand-tagline">A professional workspace for organized notes, nested pages, and seamless cloud collaboration.</p>
          <ul class="auth-features">
            <li>
              <span class="auth-feature-icon">📝</span>
              <span>Block-based editor with slash commands</span>
            </li>
            <li>
              <span class="auth-feature-icon">🗂️</span>
              <span>Nested sub-pages for structured workflows</span>
            </li>
            <li>
              <span class="auth-feature-icon">☁️</span>
              <span>Secure Supabase sync across all your devices</span>
            </li>
            <li>
              <span class="auth-feature-icon">✨</span>
              <span>CodeFusion AI writing assistant</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-form-card">
          <h2 class="auth-form-title">Welcome back</h2>
          <p class="auth-form-subtitle">Access your workspace or register for a new account</p>

          ${authError ? `<div class="auth-error" role="alert">${escapeHtml(authError)}</div>` : ''}
          ${authSuccess ? `<div class="auth-success" role="status">${escapeHtml(authSuccess)}</div>` : ''}

          ${!configured ? `
            <div class="auth-warning">
              <strong>Supabase not configured.</strong>
              Copy <code>.env.example</code> to <code>.env</code> and add your project URL &amp; anon key, then restart the dev server.
            </div>
          ` : ''}

          <div class="auth-tabs" role="tablist">
            <button type="button" class="auth-tab auth-tab-active" data-tab="login" role="tab">Log in</button>
            <button type="button" class="auth-tab" data-tab="signup" role="tab">Sign up</button>
          </div>

          <form id="auth-form-login" class="auth-form" data-mode="login">
            <label class="auth-label">
              Email
              <input type="email" name="email" class="auth-input" placeholder="you@example.com" required autocomplete="email" ${!configured ? 'disabled' : ''} />
            </label>
            <label class="auth-label">
              Password
              <input type="password" name="password" class="auth-input" placeholder="••••••••" required minlength="6" autocomplete="current-password" ${!configured ? 'disabled' : ''} />
            </label>
            <button type="submit" class="auth-submit" ${authLoading || !configured ? 'disabled' : ''}>
              ${authLoading ? '<span class="auth-spinner"></span> Signing in…' : 'Log in'}
            </button>
          </form>

          <form id="auth-form-signup" class="auth-form hidden" data-mode="signup">
            <label class="auth-label">
              Full name
              <input type="text" name="fullName" class="auth-input" placeholder="Sahil Maniya" required autocomplete="name" ${!configured ? 'disabled' : ''} />
            </label>
            <label class="auth-label">
              Email
              <input type="email" name="email" class="auth-input" placeholder="you@example.com" required autocomplete="email" ${!configured ? 'disabled' : ''} />
            </label>
            <label class="auth-label">
              Password
              <input type="password" name="password" class="auth-input" placeholder="Min. 6 characters" required minlength="6" autocomplete="new-password" ${!configured ? 'disabled' : ''} />
            </label>
            <button type="submit" class="auth-submit auth-submit-signup" ${authLoading || !configured ? 'disabled' : ''}>
              ${authLoading ? '<span class="auth-spinner"></span> Creating account…' : 'Create account'}
            </button>
          </form>

          <div class="auth-divider"><span>or</span></div>

          <button type="button" class="auth-demo-btn" data-action="demo" ${authLoading ? 'disabled' : ''}>
            Continue in demo mode (local only)
          </button>

          <p id="auth-connection-status" class="auth-connection-status"></p>
        </div>

        <p class="auth-footer">CodeFusion · Parth Patel, Sahil Maniya, Kelvin Idoko, Dhruv Patel</p>
      </div>
    </div>
  `

  let activeTab = 'login'

  container.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab
      container.querySelectorAll('.auth-tab').forEach((t) => t.classList.toggle('auth-tab-active', t.dataset.tab === activeTab))
      container.querySelector('#auth-form-login').classList.toggle('hidden', activeTab !== 'login')
      container.querySelector('#auth-form-signup').classList.toggle('hidden', activeTab !== 'signup')
    })
  })

  container.querySelector('#auth-form-login')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await onLogin(fd.get('email'), fd.get('password'))
  })

  container.querySelector('#auth-form-signup')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await onSignup(fd.get('email'), fd.get('password'), fd.get('fullName'))
  })

  container.querySelector('[data-action="demo"]')?.addEventListener('click', onDemoMode)

  if (configured) {
    const statusEl = container.querySelector('#auth-connection-status')
    testConnection().then((result) => {
      if (!statusEl) return
      statusEl.textContent = result.message
      statusEl.className = `auth-connection-status ${result.ok ? 'is-ok' : 'is-error'}`
    })
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
