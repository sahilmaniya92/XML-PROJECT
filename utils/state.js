import {
  getCalendarState,
  goToPrevMonth,
  goToNextMonth,
  setSelectedDate,
  addCalendarEvent,
  deleteCalendarEvent,
  loadCalendarEvents,
  getCalendarEvents,
  setCalendarEvents,
} from './calendar.js'
import { loadFromStorage, saveToStorage, clearStorage } from './persistence.js'
import { isSupabaseConfigured, supabase } from './supabase.js'
import {
  fetchPages,
  upsertPage,
  deletePageRemote,
  fetchCalendarEvents,
  insertCalendarEvent,
  deleteCalendarEventRemote,
  seedDefaultPages,
  subscribeToPages,
  subscribeToEvents,
  mapPage,
  mapEvent,
} from './db.js'

const DEFAULT_PAGES = [
  {
    id: 'page-1',
    parentId: null,
    title: 'Getting Started',
    icon: '📝',
    cover: 'ocean',
    content:
      'Welcome to TaskScape\n\nThis is your workspace for notes, tasks, and ideas — inspired by Notion.\n\nType / anywhere to insert blocks, or use the sidebar to switch pages.',
    favorite: true,
    sortOrder: 0,
    updatedAt: Date.now(),
  },
  {
    id: 'page-2',
    parentId: null,
    title: 'Project Notes',
    icon: '📋',
    cover: 'forest',
    content:
      '## Meeting Notes\n\n• Define project phases\n• Assign team roles\n• Review UI with professor',
    favorite: false,
    sortOrder: 1,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'page-3',
    parentId: null,
    title: 'Task List',
    icon: '✅',
    cover: 'sunset',
    content:
      '☐ Finish Phase 3 UI\n☐ Present to professor\n☐ Plan Phase 4 backend\n☐ Integrate CodeFusion with Gemini API',
    favorite: false,
    sortOrder: 2,
    updatedAt: Date.now() - 172800000,
  },
]

let user = null
let session = null
let authLoading = true
let authError = null
let authSuccess = null
let demoMode = false
let syncStatus = 'idle'
let pages = []
let activePageId = null
let sidebarOpen = true
let mobileSidebarOpen = false
let codefusionOpen = false
let searchQuery = ''
let codefusionMessages = [
  { role: 'ai', text: "Hi! I'm CodeFusion, your AI assistant. Choose a quick action or type a prompt below." },
]
let activeView = 'home'
let expandedPageIds = new Set()
let realtimeChannels = []

const listeners = new Set()
let persistTimer
let syncTimer
let initialized = false

function isUuid(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

function generateLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function notify() {
  listeners.forEach((listener) => listener(getState()))
}

function persistLocal() {
  if (!demoMode && user) return
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    saveToStorage({
      pages,
      activePageId,
      sidebarOpen,
      codefusionMessages,
      activeView,
      expandedPageIds: [...expandedPageIds],
      calendarEvents: getCalendarEvents(),
      demoMode,
    })
  }, 400)
}

async function syncPageToCloud(page) {
  if (!user || demoMode || !isSupabaseConfigured) return
  try {
    syncStatus = 'syncing'
    notify()
    await upsertPage(user.id, page)
    syncStatus = 'synced'
    notify()
  } catch (err) {
    console.error('Sync error:', err)
    syncStatus = 'error'
    notify()
  }
}

function scheduleSync(page) {
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => syncPageToCloud(page), 600)
}

function loadLocalState() {
  const stored = loadFromStorage()
  pages = stored?.pages ?? structuredClone(DEFAULT_PAGES)
  activePageId = stored?.activePageId ?? pages[0]?.id
  sidebarOpen = stored?.sidebarOpen ?? true
  codefusionMessages = stored?.codefusionMessages ?? codefusionMessages
  activeView = stored?.activeView ?? 'home'
  demoMode = stored?.demoMode ?? false
  if (stored?.expandedPageIds) expandedPageIds = new Set(stored.expandedPageIds)
  if (stored?.calendarEvents) loadCalendarEvents(stored.calendarEvents)
}

function teardownRealtime() {
  realtimeChannels.forEach((ch) => {
    if (ch && supabase) supabase.removeChannel(ch)
  })
  realtimeChannels = []
}

async function loadUserData(userId) {
  syncStatus = 'syncing'
  notify()

  let fetched = await fetchPages(userId)
  if (!fetched.length) {
    fetched = await seedDefaultPages(userId)
  }
  pages = fetched
  activePageId = pages[0]?.id ?? null
  activeView = 'home'

  const events = await fetchCalendarEvents(userId)
  setCalendarEvents(events)

  syncStatus = 'synced'
  notify()
  persistLocal()
}

function setupRealtime(userId) {
  teardownRealtime()

  const pagesChannel = subscribeToPages(userId, async (payload) => {
    if (payload.eventType === 'DELETE') {
      pages = pages.filter((p) => p.id !== payload.old.id)
    } else {
      const mapped = mapPage(payload.new)
      const idx = pages.findIndex((p) => p.id === mapped.id)
      if (mapped.isDeleted) {
        pages = pages.filter((p) => p.id !== mapped.id)
      } else if (idx >= 0) {
        if (mapped.id !== activePageId) {
          pages[idx] = { ...pages[idx], ...mapped }
        } else {
          pages[idx] = { ...mapped, ...pages[idx], title: pages[idx].title, content: pages[idx].content }
        }
      } else {
        pages = [...pages, mapped]
      }
    }
    notify()
  })

  const eventsChannel = subscribeToEvents(userId, async (payload) => {
    const current = getCalendarEvents()
    if (payload.eventType === 'INSERT') {
      loadCalendarEvents([...current, mapEvent(payload.new)])
    } else if (payload.eventType === 'DELETE') {
      loadCalendarEvents(current.filter((e) => e.id !== payload.old.id))
    } else if (payload.eventType === 'UPDATE') {
      const mapped = mapEvent(payload.new)
      loadCalendarEvents(current.map((e) => (e.id === mapped.id ? mapped : e)))
    }
    notify()
  })

  realtimeChannels = [pagesChannel, eventsChannel]
}

export async function initApp() {
  if (initialized) return
  initialized = true

  if (!isSupabaseConfigured) {
    loadLocalState()
    if (!demoMode) demoMode = true
    authLoading = false
    notify()
    return
  }

  const { data } = await supabase.auth.getSession()
  session = data.session
  user = data.session?.user ?? null

  if (user) {
    try {
      await loadUserData(user.id)
      setupRealtime(user.id)
    } catch (err) {
      console.error(err)
      authError = 'Failed to load workspace data.'
    }
  } else {
    loadLocalState()
    if (demoMode) {
      authLoading = false
    }
  }

  supabase.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_OUT') {
      session = null
      user = null
      teardownRealtime()
      pages = []
      activePageId = null
      demoMode = false
      clearStorage()
      loadLocalState()
      authLoading = false
      notify()
      return
    }

    if (event === 'INITIAL_SESSION' && newSession?.user && !user) {
      await completeAuthSession(newSession, newSession.user)
      return
    }

    if (event === 'SIGNED_IN' && newSession?.user && user?.id !== newSession.user.id) {
      await completeAuthSession(newSession, newSession.user)
    }
  })

  authLoading = false
  notify()
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState() {
  return {
    user,
    session,
    authLoading,
    authError,
    authSuccess,
    demoMode,
    syncStatus,
    isAuthenticated: Boolean(user) || demoMode,
    showAuth: isSupabaseConfigured && !user && !demoMode && !authLoading,
    pages,
    activePageId,
    sidebarOpen,
    mobileSidebarOpen,
    codefusionOpen,
    searchQuery,
    codefusionMessages,
    activeView,
    expandedPageIds,
    isSupabaseConfigured,
    ...getCalendarState(),
  }
}

export function getActivePage() {
  return pages.find((page) => page.id === activePageId) ?? pages[0]
}

export function getPageAncestors(pageId) {
  const chain = []
  let current = pages.find((p) => p.id === pageId)
  while (current) {
    chain.unshift(current)
    current = current.parentId ? pages.find((p) => p.id === current.parentId) : null
  }
  return chain
}

export function getChildPages(parentId) {
  return pages
    .filter((p) => p.parentId === parentId && !p.isDeleted)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getRootPages() {
  return getChildPages(null)
}

export function getFilteredPages() {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return pages.filter((p) => !p.isDeleted)
  return pages.filter(
    (page) =>
      !page.isDeleted &&
      (page.title.toLowerCase().includes(query) || page.content.toLowerCase().includes(query))
  )
}

export function getRecentPages(limit = 8) {
  return [...pages].filter((p) => !p.isDeleted).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit)
}

export async function signIn(email, password) {
  authError = null
  authSuccess = null
  authLoading = true
  notify()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password,
    })

    if (error) {
      authLoading = false
      authError = formatAuthError(error.message)
      notify()
      return { ok: false }
    }

    const ok = await completeAuthSession(data.session, data.user)
    return { ok }
  } catch (err) {
    authLoading = false
    authError = formatNetworkError(err)
    notify()
    return { ok: false }
  }
}

export async function signUp(email, password, fullName) {
  authError = null
  authSuccess = null
  authLoading = true
  notify()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      authLoading = false
      authError = formatAuthError(error.message)
      notify()
      return { ok: false, needsConfirmation: false }
    }

    if (data.session && data.user) {
      const ok = await completeAuthSession(data.session, data.user)
      return { ok, needsConfirmation: false }
    }

    authLoading = false
    authSuccess =
      'Account created! Check your email for a confirmation link, then use the Log in tab.'
    notify()
    return { ok: true, needsConfirmation: true }
  } catch (err) {
    authLoading = false
    authError = formatNetworkError(err)
    notify()
    return { ok: false, needsConfirmation: false }
  }
}

async function completeAuthSession(newSession, newUser) {
  session = newSession
  user = newUser ?? newSession?.user ?? null

  if (!user) {
    authLoading = false
    authError = 'Sign in succeeded but no user session was returned.'
    notify()
    return false
  }

  demoMode = false
  authError = null
  authSuccess = null
  authLoading = true
  notify()

  try {
    await loadUserData(user.id)
    setupRealtime(user.id)
    authLoading = false
    notify()
    return true
  } catch (err) {
    authLoading = false
    authError = `Signed in, but could not load your workspace: ${err.message}. Open Supabase → SQL Editor and run supabase/schema.sql.`
    notify()
    return false
  }
}

function formatAuthError(message) {
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. If you just signed up, confirm your email first (check inbox/spam).'
  }
  if (message.includes('already registered')) {
    return 'This email is already registered. Use the Log in tab instead.'
  }
  if (message.includes('Password')) {
    return message
  }
  return message
}

function formatNetworkError(err) {
  const msg = err?.message ?? String(err)
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Cannot reach Supabase. Check your internet, API key, and that your project is not paused. Use the legacy anon key (starts with eyJ) in .env — see fix below.'
  }
  return msg
}

export async function signOut() {
  if (isSupabaseConfigured && user) {
    await supabase.auth.signOut()
  }
  demoMode = false
  teardownRealtime()
  clearStorage()
  loadLocalState()
  authError = null
  notify()
}

export function enterDemoMode() {
  authError = null
  authSuccess = null
  loadLocalState()
  demoMode = true
  activeView = 'home'
  if (!pages.length) {
    pages = structuredClone(DEFAULT_PAGES)
    activePageId = pages[0]?.id ?? null
  }
  persistLocal()
  notify()
}

export function setActivePage(id) {
  activePageId = id
  activeView = 'page'
  mobileSidebarOpen = false
  const ancestors = getPageAncestors(id)
  ancestors.forEach((a) => expandedPageIds.add(a.id))
  notify()
  persistLocal()
}

export function openHome() {
  activeView = 'home'
  mobileSidebarOpen = false
  notify()
  persistLocal()
}

export function togglePageExpanded(id) {
  if (expandedPageIds.has(id)) expandedPageIds.delete(id)
  else expandedPageIds.add(id)
  notify()
}

export function setSearchQuery(query) {
  searchQuery = query
  notify()
}

export function toggleSidebar() {
  sidebarOpen = !sidebarOpen
  notify()
  persistLocal()
}

export function toggleMobileSidebar() {
  mobileSidebarOpen = !mobileSidebarOpen
  notify()
}

export function closeMobileSidebar() {
  mobileSidebarOpen = false
  notify()
}

export function toggleCodeFusion() {
  codefusionOpen = !codefusionOpen
  notify()
}

export function closeCodeFusion() {
  codefusionOpen = false
  notify()
}

export function createPage(parentId = null) {
  const id = user && !demoMode ? crypto.randomUUID() : generateLocalId()
  const siblings = pages.filter((p) => p.parentId === parentId)
  const newPage = {
    id,
    parentId,
    title: 'Untitled',
    icon: '📄',
    cover: 'ocean',
    content: '',
    favorite: false,
    sortOrder: siblings.length,
    updatedAt: Date.now(),
  }
  pages = [newPage, ...pages]
  activePageId = id
  activeView = 'page'
  mobileSidebarOpen = false
  if (parentId) expandedPageIds.add(parentId)
  notify()
  persistLocal()
  scheduleSync(newPage)
  return newPage
}

export function createSubPage(parentId) {
  return createPage(parentId)
}

export function openCalendarPlus() {
  activeView = 'calendar'
  notify()
  persistLocal()
}

export function closeCalendarPlus() {
  activeView = 'page'
  notify()
  persistLocal()
}

export {
  goToPrevMonth,
  goToNextMonth,
  setSelectedDate,
  addCalendarEvent,
  deleteCalendarEvent,
}

export function calendarPrevMonth() {
  goToPrevMonth()
  notify()
}

export function calendarNextMonth() {
  goToNextMonth()
  notify()
}

export function calendarSelectDate(dateKey) {
  setSelectedDate(dateKey)
  notify()
}

export async function calendarAddEvent(payload) {
  if (user && !demoMode && isSupabaseConfigured) {
    try {
      const event = await insertCalendarEvent(user.id, payload)
      const current = getCalendarEvents()
      loadCalendarEvents([...current, event])
    } catch (err) {
      console.error(err)
    }
  } else {
    addCalendarEvent(payload)
  }
  notify()
  persistLocal()
}

export async function calendarDeleteEvent(id) {
  if (user && !demoMode && isSupabaseConfigured && isUuid(id)) {
    try {
      await deleteCalendarEventRemote(id)
    } catch (err) {
      console.error(err)
    }
  } else {
    deleteCalendarEvent(id)
  }
  notify()
  persistLocal()
}

export function updateActivePage(updates, { silent = false } = {}) {
  pages = pages.map((page) =>
    page.id === activePageId ? { ...page, ...updates, updatedAt: Date.now() } : page
  )
  const page = pages.find((p) => p.id === activePageId)
  if (page) scheduleSync(page)
  if (!silent) notify()
  else persistLocal()
}

export function addCodeFusionMessage(role, text) {
  codefusionMessages = [...codefusionMessages, { role, text }]
  notify()
  persistLocal()
}

export async function deletePage(id) {
  const hasChildren = pages.some((p) => p.parentId === id)
  if (hasChildren) {
    pages = pages.map((p) => (p.parentId === id ? { ...p, parentId: null } : p))
  }
  pages = pages.filter((page) => page.id !== id)
  if (activePageId === id) {
    activePageId = pages[0]?.id ?? null
    activeView = pages.length ? 'page' : 'home'
  }
  if (user && !demoMode && isSupabaseConfigured && isUuid(id)) {
    try {
      await deletePageRemote(id)
    } catch (err) {
      console.error(err)
    }
  }
  notify()
  persistLocal()
}

export function toggleFavorite(id) {
  pages = pages.map((page) => (page.id === id ? { ...page, favorite: !page.favorite } : page))
  const page = pages.find((p) => p.id === id)
  if (page) scheduleSync(page)
  notify()
  persistLocal()
}

export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export function formatFullDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getUserDisplayName() {
  if (!user) return 'Guest'
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
}

export function getUserInitials() {
  const name = getUserDisplayName()
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
