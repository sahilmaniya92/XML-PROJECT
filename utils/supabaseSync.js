import { supabase, isSupabaseConfigured } from './supabase.js'

function pageToRow(page, userId) {
  return {
    id: page.id,
    user_id: userId,
    title: page.title,
    icon: page.icon,
    cover: page.cover,
    content: page.content,
    favorite: page.favorite,
    trashed: page.trashed ?? false,
    updated_at: new Date(page.updatedAt).toISOString(),
  }
}

function rowToPage(row) {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon ?? '📄',
    cover: row.cover ?? 'ocean',
    content: row.content ?? '',
    favorite: row.favorite ?? false,
    trashed: row.trashed ?? false,
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

export async function fetchUserData(userId) {
  if (!isSupabaseConfigured) return null

  const [pagesRes, eventsRes, settingsRes] = await Promise.all([
    supabase.from('pages').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('calendar_events').select('*').eq('user_id', userId),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
  ])

  if (pagesRes.error) throw pagesRes.error
  if (eventsRes.error) throw eventsRes.error
  if (settingsRes.error) throw settingsRes.error

  const pages = (pagesRes.data ?? []).map(rowToPage)
  const calendarEvents = (eventsRes.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    date: row.date,
    color: row.color ?? '#7c3aed',
  }))

  const settings = settingsRes.data
  return {
    pages: pages.length ? pages : null,
    calendarEvents: calendarEvents.length ? calendarEvents : null,
    activePageId: settings?.active_page_id ?? null,
    sidebarOpen: settings?.sidebar_open ?? true,
    activeView: settings?.active_view ?? 'home',
    codefusionMessages: settings?.codefusion_messages ?? null,
  }
}

export async function syncPages(userId, pages) {
  if (!isSupabaseConfigured || !userId) return

  const rows = pages.map((page) => pageToRow(page, userId))
  const { error } = await supabase.from('pages').upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

export async function syncCalendarEvents(userId, events) {
  if (!isSupabaseConfigured || !userId) return

  const rows = events.map((event) => ({
    id: event.id,
    user_id: userId,
    title: event.title,
    date: event.date,
    color: event.color ?? '#7c3aed',
  }))

  const { error } = await supabase.from('calendar_events').upsert(rows, { onConflict: 'id' })
  if (error) throw error
}

export async function deletePageFromCloud(id) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) throw error
}

export async function deleteEventFromCloud(id) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) throw error
}

export async function syncUserSettings(userId, settings) {
  if (!isSupabaseConfigured || !userId) return

  const { error } = await supabase.from('user_settings').upsert(
    {
      user_id: userId,
      active_page_id: settings.activePageId,
      sidebar_open: settings.sidebarOpen,
      active_view: settings.activeView,
      codefusion_messages: settings.codefusionMessages,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw error
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase.auth.signInWithPassword({ email, password })
}

export function formatAuthError(error) {
  const message = error?.message ?? 'Something went wrong'
  const lower = message.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('email rate')) {
    return 'Email rate limit exceeded. Wait 30–60 minutes, or sign in if you already created an account. For testing, disable email confirmation in Supabase → Authentication → Providers → Email.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Wrong email or password. If you just signed up, confirm your email first or disable confirmation in Supabase.'
  }
  if (lower.includes('user already registered')) {
    return 'This email is already registered. Use Sign in instead.'
  }

  return message
}

export async function signOut() {
  if (!supabase) return
  return supabase.auth.signOut()
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}
