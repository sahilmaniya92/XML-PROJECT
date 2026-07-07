import { supabase } from './supabase.js'

function mapPage(row) {
  return {
    id: row.id,
    parentId: row.parent_id ?? null,
    title: row.title,
    icon: row.icon ?? '📄',
    cover: row.cover ?? 'ocean',
    content: row.content ?? '',
    favorite: row.favorite ?? false,
    sortOrder: row.sort_order ?? 0,
    isDeleted: row.is_deleted ?? false,
    updatedAt: new Date(row.updated_at).getTime(),
    createdAt: new Date(row.created_at).getTime(),
  }
}

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    color: row.color ?? '#7c3aed',
  }
}

export async function fetchPages(userId) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapPage)
}

export async function upsertPage(userId, page) {
  const row = {
    id: page.id,
    user_id: userId,
    parent_id: page.parentId || null,
    title: page.title,
    icon: page.icon,
    cover: page.cover,
    content: page.content,
    favorite: page.favorite,
    sort_order: page.sortOrder ?? 0,
    is_deleted: page.isDeleted ?? false,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('pages').upsert(row).select().single()
  if (error) throw error
  return mapPage(data)
}

export async function deletePageRemote(id) {
  const { error } = await supabase
    .from('pages')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function fetchCalendarEvents(userId) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapEvent)
}

export async function insertCalendarEvent(userId, event) {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: userId,
      title: event.title,
      event_date: event.date,
      color: event.color,
    })
    .select()
    .single()
  if (error) throw error
  return mapEvent(data)
}

export async function deleteCalendarEventRemote(id) {
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) throw error
}

export async function seedDefaultPages(userId) {
  const defaults = [
    {
      user_id: userId,
      title: 'Getting Started',
      icon: '📝',
      cover: 'ocean',
      content:
        'Welcome to TaskScape\n\nYour workspace syncs to Supabase in real time.\n\nType / for blocks, or create sub-pages from the sidebar.',
      favorite: true,
      sort_order: 0,
    },
    {
      user_id: userId,
      title: 'Project Notes',
      icon: '📋',
      cover: 'forest',
      content: '## Meeting Notes\n\n• Define project phases\n• Assign team roles\n• Review UI with professor',
      favorite: false,
      sort_order: 1,
    },
    {
      user_id: userId,
      title: 'Task List',
      icon: '✅',
      cover: 'sunset',
      content: '☐ Finish UI polish\n☐ Connect Supabase\n☐ Present to professor',
      favorite: false,
      sort_order: 2,
    },
  ]

  const { data, error } = await supabase.from('pages').insert(defaults).select()
  if (error) throw error
  return (data ?? []).map(mapPage)
}

export function subscribeToPages(userId, onChange) {
  return supabase
    .channel(`pages:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pages', filter: `user_id=eq.${userId}` },
      (payload) => onChange(payload)
    )
    .subscribe()
}

export function subscribeToEvents(userId, onChange) {
  return supabase
    .channel(`events:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'calendar_events', filter: `user_id=eq.${userId}` },
      (payload) => onChange(payload)
    )
    .subscribe()
}

export { mapPage, mapEvent }
