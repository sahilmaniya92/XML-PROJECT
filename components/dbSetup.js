/**
 * Database setup guide modal — create workspaces table in Supabase dashboard.
 */
export function renderDbSetupModal(container, { open, dbStatus, onClose, onTestConnection }) {
  if (!open) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="app-modal-backdrop is-open" data-action="close-modal">
      <div class="app-modal" role="dialog" aria-label="Database setup">
        <div class="app-modal-header">
          <h2>Set up Supabase database</h2>
          <button type="button" class="icon-btn" data-action="close-modal" aria-label="Close">×</button>
        </div>
        <div class="app-modal-body">
          <p class="modal-subtitle">Status: <strong class="db-status-${dbStatus}">${formatStatus(dbStatus)}</strong></p>
          <ol class="setup-steps">
            <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener">Supabase Dashboard</a></li>
            <li>Go to <strong>Table Editor</strong> → <strong>New table</strong></li>
            <li>Name: <code>workspaces</code></li>
            <li>Add columns:
              <ul>
                <li><code>user_id</code> — type <strong>uuid</strong>, Primary key</li>
                <li><code>data</code> — type <strong>jsonb</strong></li>
                <li><code>updated_at</code> — type <strong>timestamptz</strong></li>
              </ul>
            </li>
            <li>Enable <strong>Row Level Security</strong> (RLS)</li>
            <li>Go to <strong>Authentication → Policies</strong> → New policy on <code>workspaces</code>:
              <ul>
                <li>Policy name: <code>Users manage own workspace</code></li>
                <li>Allowed operation: <strong>ALL</strong></li>
                <li>Target roles: <strong>authenticated</strong></li>
                <li>USING expression: <code>auth.uid() = user_id</code></li>
                <li>WITH CHECK expression: <code>auth.uid() = user_id</code></li>
              </ul>
            </li>
            <li>In Supabase → <strong>Authentication → Providers → Email</strong>, turn OFF "Confirm email" for easy testing</li>
            <li>Sign in to TaskScape and click <strong>Test connection</strong> below</li>
          </ol>
        </div>
        <div class="app-modal-footer">
          <button type="button" class="topbar-btn" data-action="close-modal">Close</button>
          <button type="button" class="topbar-btn topbar-btn-primary" data-action="test-db">Test connection</button>
        </div>
      </div>
    </div>
  `

  container.querySelector('.app-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) onClose()
  })
  container.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
    btn.addEventListener('click', onClose)
  })
  container.querySelector('.app-modal')?.addEventListener('click', (e) => e.stopPropagation())
  container.querySelector('[data-action="test-db"]')?.addEventListener('click', onTestConnection)
}

function formatStatus(status) {
  const labels = {
    connected: 'Connected ✓',
    missing_table: 'Table missing',
    permission: 'Permission denied',
    error: 'Error',
    offline: 'Offline',
    unknown: 'Checking…',
    idle: 'Ready',
  }
  return labels[status] ?? status
}
