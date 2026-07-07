/**
 * Auth modal for Supabase sign-in / sign-up.
 */
let lastAuthRenderKey = ''

const DB_LABELS = {
  connected: 'Database connected',
  missing_table: 'Database table missing',
  permission: 'Database permission issue',
  error: 'Database error',
  offline: 'Offline mode',
  unknown: 'Checking database…',
  idle: 'Database ready',
}

const SYNC_LABELS = {
  synced: 'Saved to cloud',
  syncing: 'Syncing…',
  error: 'Sync error',
  idle: 'Ready',
  offline: 'Offline',
}

function syncLabel(status) {
  return SYNC_LABELS[status] ?? 'Ready'
}

function patchAuthStatus(container, { syncStatus, dbStatus }) {
  const syncDot = container.querySelector('[data-auth-sync-dot]')
  const syncText = container.querySelector('[data-auth-sync-label]')
  const dbDot = container.querySelector('[data-auth-db-dot]')
  const dbText = container.querySelector('[data-auth-db-label]')
  const hint = container.querySelector('[data-auth-db-hint]')

  if (syncDot) syncDot.className = `sync-dot sync-dot-${syncStatus}`
  if (syncText) syncText.textContent = `Sync: ${syncLabel(syncStatus)}`
  if (dbDot) dbDot.className = `sync-dot sync-dot-${dbStatus === 'connected' ? 'synced' : 'error'}`
  if (dbText) dbText.textContent = DB_LABELS[dbStatus] ?? dbStatus
  if (hint) hint.classList.toggle('hidden', dbStatus === 'connected')
}

function bindAccountActions(container, { onClose, onSignOut, onOpenDbSetup, onForceSync }) {
  container.querySelector('[data-action="sign-out"]')?.addEventListener('click', async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const btn = e.currentTarget
    if (btn.disabled) return
    btn.disabled = true
    btn.textContent = 'Signing out…'
    try {
      await onSignOut()
    } catch {
      btn.disabled = false
      btn.textContent = 'Sign out'
    }
  })
  container.querySelector('[data-action="force-sync"]')?.addEventListener('click', onForceSync)
  container.querySelector('[data-action="db-setup"]')?.addEventListener('click', () => {
    onClose()
    onOpenDbSetup?.()
  })
  bindClose(container, onClose)
}

export function renderAuthModal(container, {
  open,
  user,
  configured,
  dbStatus,
  syncStatus,
  onClose,
  onSignIn,
  onSignUp,
  onSignOut,
  onOpenDbSetup,
  onForceSync,
}) {
  if (!open) {
    container.innerHTML = ''
    lastAuthRenderKey = ''
    return
  }

  if (user) {
    const renderKey = `account:${user.id}`
    const existing = container.querySelector('.app-modal')

    if (existing && lastAuthRenderKey === renderKey) {
      patchAuthStatus(container, { syncStatus, dbStatus })
      return
    }

    lastAuthRenderKey = renderKey
    container.innerHTML = `
      <div class="app-modal-backdrop is-open" data-action="close-auth">
        <div class="app-modal app-modal-sm" role="dialog" aria-label="Account">
          <div class="app-modal-header">
            <h2>Account</h2>
            <button type="button" class="icon-btn" data-action="close-auth" aria-label="Close">×</button>
          </div>
          <div class="app-modal-body">
            <p class="auth-user-email">${escapeHtml(user.email)}</p>
            <div class="auth-status-row">
              <span class="sync-dot sync-dot-${syncStatus}" data-auth-sync-dot></span>
              <span data-auth-sync-label>Sync: ${syncLabel(syncStatus)}</span>
            </div>
            <div class="auth-status-row">
              <span class="sync-dot sync-dot-${dbStatus === 'connected' ? 'synced' : 'error'}" data-auth-db-dot></span>
              <span data-auth-db-label>${DB_LABELS[dbStatus] ?? dbStatus}</span>
            </div>
            <p class="auth-hint ${dbStatus === 'connected' ? 'hidden' : ''}" data-auth-db-hint>
              Open the database setup guide to connect TaskScape to Supabase.
            </p>
          </div>
          <div class="app-modal-footer auth-modal-footer-stack">
            <button type="button" class="topbar-btn" data-action="force-sync">Sync now</button>
            <button type="button" class="topbar-btn" data-action="db-setup">Database setup</button>
            <button type="button" class="topbar-btn topbar-btn-danger" data-action="sign-out">Sign out</button>
          </div>
        </div>
      </div>
    `
    bindAccountActions(container, { onClose, onSignOut, onOpenDbSetup, onForceSync })
    return
  }

  const renderKey = configured ? 'sign-in' : 'offline'
  if (container.querySelector('.app-modal') && lastAuthRenderKey === renderKey) {
    return
  }

  lastAuthRenderKey = renderKey
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
            <p class="auth-hint">Sign in to save your workspace to Supabase database.</p>
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
            </form>
            <button type="button" class="auth-link-btn" data-action="db-setup">Database not connected? Open setup guide</button>`
              : `
            <p class="auth-hint">Add your Supabase credentials to <code>.env</code>:</p>
            <pre class="auth-code">VITE_SUPABASE_URL=...\nVITE_SUPABASE_PUBLISHABLE_KEY=...</pre>
            <p class="auth-hint">Copy <code>.env.example</code> to <code>.env</code>, add your Supabase URL and key, then restart the dev server.</p>
            <p class="auth-hint">You can still use TaskScape locally — data saves to your browser.</p>`
          }
        </div>
      </div>
    </div>
  `

  bindClose(container, onClose)

  container.querySelector('[data-action="db-setup"]')?.addEventListener('click', () => {
    onClose()
    onOpenDbSetup?.()
  })

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
    const submitBtn = form.querySelector('[data-action="sign-in"]')
    const { email, password } = getCredentials()
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = 'Signing in…'
    }
    try {
      await onSignIn(email, password)
    } catch (err) {
      showError(err.message ?? 'Sign in failed')
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = 'Sign in'
      }
    }
  })

  container.querySelector('[data-action="sign-up"]')?.addEventListener('click', async () => {
    const signUpBtn = container.querySelector('[data-action="sign-up"]')
    const { email, password } = getCredentials()
    if (!email || !password) {
      showError('Enter email and password')
      return
    }
    if (signUpBtn) {
      signUpBtn.disabled = true
      signUpBtn.textContent = 'Creating…'
    }
    try {
      await onSignUp(email, password)
    } catch (err) {
      showError(err.message ?? 'Sign up failed')
    } finally {
      if (signUpBtn) {
        signUpBtn.disabled = false
        signUpBtn.textContent = 'Create account'
      }
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
