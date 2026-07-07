import { supabase, isSupabaseConfigured } from './supabase.js'

const WORKSPACE_TABLE = 'workspaces'
const REQUEST_TIMEOUT_MS = 15000

function withTimeout(promise, message = 'Request timed out') {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), REQUEST_TIMEOUT_MS)
  })

  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    clearTimeout(timer)
  })
}

export async function getSession() {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function ensureAuthSession() {
  const session = await getSession()
  if (!session) return null

  const expiresAt = session.expires_at ?? 0
  const now = Math.floor(Date.now() / 1000)
  if (expiresAt - now < 120) {
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data.session
  }

  return session
}

export async function testDatabaseConnection() {
  if (!isSupabaseConfigured) {
    return { ok: false, status: 'offline', message: 'Supabase is not configured in .env' }
  }

  try {
    const session = await getSession()
    if (!session) {
      return { ok: true, status: 'idle', message: 'Signed out — sign in to sync data' }
    }

    const { error } = await withTimeout(
      supabase.from(WORKSPACE_TABLE).select('user_id').limit(1),
      'Database check timed out'
    )
    if (!error) return { ok: true, status: 'connected', message: 'Database connected' }

    const msg = error.message ?? 'Unknown database error'
    if (msg.includes('does not exist') || error.code === '42P01') {
      return {
        ok: false,
        status: 'missing_table',
        message: 'Table "workspaces" not found. Create it in Supabase (see setup guide).',
      }
    }
    if (msg.includes('permission') || msg.includes('policy') || error.code === '42501') {
      return {
        ok: false,
        status: 'permission',
        message: 'Database permission denied. Check RLS policy on workspaces table.',
      }
    }
    return { ok: false, status: 'error', message: formatDatabaseError(error) }
  } catch (err) {
    return { ok: false, status: 'error', message: err.message ?? 'Connection failed' }
  }
}

export async function fetchWorkspace(userId) {
  if (!isSupabaseConfigured || !userId) return null

  await ensureAuthSession()

  const { data, error } = await withTimeout(
    supabase
      .from(WORKSPACE_TABLE)
      .select('data, updated_at')
      .eq('user_id', userId)
      .maybeSingle(),
    'Load timed out'
  )

  if (error) throw error
  if (!data?.data) return null

  return {
    snapshot: data.data,
    updatedAt: data.updated_at,
  }
}

export async function saveWorkspace(userId, snapshot) {
  if (!isSupabaseConfigured || !userId) return

  const session = await ensureAuthSession()
  if (!session) {
    throw new Error('Not signed in. Please sign in again.')
  }

  const { error } = await withTimeout(
    supabase.from(WORKSPACE_TABLE).upsert(
      {
        user_id: userId,
        data: snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    ),
    'Sync timed out'
  )

  if (error) throw error
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  return withTimeout(
    supabase.auth.signInWithPassword({ email, password }),
    'Sign in timed out — check internet connection or Supabase status'
  )
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  return withTimeout(
    supabase.auth.signUp({ email, password }),
    'Sign up timed out — check internet connection or Supabase status'
  )
}

export async function signOut() {
  if (!supabase) return
  try {
    const { error } = await withTimeout(supabase.auth.signOut(), 'Sign out timed out')
    if (error) throw error
  } catch {
    await supabase.auth.signOut({ scope: 'local' })
  }
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

export function formatAuthError(error) {
  const message = error?.message ?? 'Something went wrong'
  const lower = message.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('email rate')) {
    return 'Email rate limit exceeded. Wait 30–60 minutes, or sign in if you already have an account.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Wrong email or password. Try signing in again.'
  }
  if (lower.includes('invalid jwt') || lower.includes('invalid api key')) {
    return 'Invalid Supabase API key. In .env use VITE_SUPABASE_ANON_KEY (JWT) or VITE_SUPABASE_PUBLISHABLE_KEY from Dashboard → API.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Email not confirmed. In Supabase go to Authentication → Providers → Email and turn OFF "Confirm email".'
  }
  if (lower.includes('user already registered')) {
    return 'This email is already registered. Use Sign in instead.'
  }

  return message
}

export function formatDatabaseError(error) {
  const message = error?.message ?? 'Database sync failed'
  const lower = message.toLowerCase()

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'Sync timed out. Supabase may be slow — click sync pill to retry.'
  }
  if (lower.includes('does not exist') || error?.code === '42P01') {
    return 'Database table missing. Open setup guide from sync button.'
  }
  if (lower.includes('permission') || lower.includes('policy') || error?.code === '42501') {
    return 'Database access denied. Check RLS policy: auth.uid() = user_id'
  }
  if (lower.includes('jwt') || lower.includes('not authenticated') || lower.includes('not signed in')) {
    return 'Session expired. Sign out and sign in again.'
  }
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Network error. Check internet connection and try again.'
  }

  return message
}
