import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  return raw
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '')
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes('your-project') &&
    !anonKey.includes('PASTE_YOUR') &&
    !anonKey.includes('your-anon-key')
)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Quick connectivity check — call from auth screen */
export async function testConnection() {
  if (!url || !anonKey) return { ok: false, message: 'Missing URL or API key in .env' }
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
    })
    if (res.ok) return { ok: true, message: 'Connected to Supabase' }
    return { ok: false, message: `Supabase returned status ${res.status}` }
  } catch (err) {
    return {
      ok: false,
      message:
        'Browser cannot reach Supabase. Disable ad blockers, check internet, restart npm run dev, or try another browser.',
    }
  }
}