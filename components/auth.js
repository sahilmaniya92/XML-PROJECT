/**
 * Auth modal for Supabase sign-in / sign-up.
 */
export function renderAuthModal(container, { open, user, configured, onClose, onSignIn, onSignUp, onSignOut }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  if (user) {
    container.innerHTML = `
      <div class="app-modal-backdrop is-open" data-action="close-auth">
        <div class="app-modal app-modal-sm" role="dialog" aria-label="Account">
          <div class="app-modal-header">
            <h2>Account</h2>
            <button type="button" class="icon-btn" data-action="close-auth" aria-label="Close">×</button>
          </div>
          <div class="app-modal-body">
            <p class="auth-user-email">${escapeHtml(user.email)}</p>
            <p class="auth-sync-note">Your pages and calendar sync to Supabase.</p>
          </div>
          <div class="app-modal-footer">
            <button type="button" class="topbar-btn topbar-btn-danger" data-action="sign-out">Sign out</button>
          </div>
        </div>
      </div>
    `
    container.querySelector('[data-action="sign-out"]')?.addEventListener('click', onSignOut)
    bindClose(container, onClose)
    return
  }

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-auth">
      <div class="app-modal app-modal-sm" role="dialog" aria-label="Sign in">
        <div class="app-modal-header">
          <h2>${configured ? 'Sign in to TaskScape' : 'Supabase not configured'}</h2>
          <button type="button" class="icon-btn" data-action="close-auth" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          ${
            configured
              ? `
            <p class="auth-hint">Sign in to sync your workspace across devices.</p>
            <form id="auth-form" class="auth-form">
              <label class="auth-label">
                Email
                <input type="email" name="email" class="auth-input" required autocomplete="email" placeholder="you@example.com" />
              </label>
              <label class="auth-label">
                Password
                <input type="password" name="password" class="auth-input" required minlength="6" autocomplete="current-password" placeholder="••••••••" />
              </label>
              <p id="auth-error" class="auth-error hidden"></p>
              <div class="auth-actions">
                <button type="submit" class="topbar-btn topbar-btn-primary" data-action="sign-in">Sign in</button>
                <button type="button" class="topbar-btn" data-action="sign-up">Create account</button>
              </div>
            </form>`
              : `
            <p class="auth-hint">Add your Supabase credentials to <code>.env</code>:</p>
            <pre class="auth-code">VITE_SUPABASE_URL=...\nVITE_SUPABASE_PUBLISHABLE_KEY=...</pre>
            <p class="auth-hint">Copy <code>.env.example</code> to <code>.env</code>, add your Supabase URL and anon key, then restart the dev server.</p>
            <p class="auth-hint">You can still use TaskScape locally — data saves to your browser.</p>`
          }
        </div>
      </div>
    </div>
  `

  bindClose(container, onClose)

  if (!configured) return

  const form = container.querySelector('#auth-form')
  const errorEl = container.querySelector('#auth-error')

  const showError = (message) => {
    if (errorEl) {
      errorEl.textContent = message
      errorEl.classList.remove('hidden')
    }
  }

  const getCredentials = () => {
    const email = form?.email?.value?.trim()
    const password = form?.password?.value
    return { email, password }
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const { email, password } = getCredentials()
    try {
      await onSignIn(email, password)
    } catch (err) {
      showError(err.message ?? 'Sign in failed')
    }
  })

  container.querySelector('[data-action="sign-up"]')?.addEventListener('click', async () => {
    const { email, password } = getCredentials()
    if (!email || !password) {
      showError('Enter email and password')
      return
    }
    try {
      await onSignUp(email, password)
    } catch (err) {
      showError(err.message ?? 'Sign up failed')
    }
  })
}

function bindClose(container, onClose) {
  container.querySelector('.app-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) onClose()
  })
  container.querySelectorAll('[data-action="close-auth"]').forEach((btn) => {
    if (btn.classList.contains('icon-btn')) {
      btn.addEventListener('click', onClose)
    }
  })
  container.querySelector('.app-modal')?.addEventListener('click', (e) => e.stopPropagation())
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
