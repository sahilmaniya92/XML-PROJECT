import {
  getCalendarState,
  goToPrevMonth,
  goToNextMonth,
  setSelectedDate,
  addCalendarEvent,
  deleteCalendarEvent,
  loadCalendarEvents,
} from './calendar.js'
import { loadFromStorage, saveToStorage } from './persistence.js'
import {
  fetchUserData,
  syncPages,
  syncCalendarEvents,
  syncUserSettings,
  deletePageFromCloud,
  deleteEventFromCloud,
} from './supabaseSync.js'
import { isSupabaseConfigured } from './supabase.js'

const DEFAULT_PAGES = [
  {
    id: 'page-1',
    title: 'Getting Started',
    icon: '📝',
    cover: 'ocean',
    content:
      'Welcome to TaskScape\n\nThis is your workspace for notes, tasks, and ideas — inspired by Notion.\n\nType / anywhere to insert blocks, or use the sidebar to switch pages.',
    favorite: true,
    trashed: false,
    updatedAt: Date.now(),
  },
  {
    id: 'page-2',
    title: 'Project Notes',
    icon: '📋',
    cover: 'forest',
    content:
      '## Meeting Notes\n\n• Define project phases\n• Assign team roles\n• Review UI with professor\n\n## Next Steps\n\nYour data syncs to Supabase when signed in.',
    favorite: false,
    trashed: false,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'page-3',
    title: 'Task List',
    icon: '✅',
    cover: 'sunset',
    content:
      '☐ Finish Phase 3 UI\n☐ Present to professor\n☐ Connect Supabase backend\n☐ Integrate CodeFusion with Gemini API',
    favorite: false,
    trashed: false,
    updatedAt: Date.now() - 172800000,
  },
]

const stored = loadFromStorage()

let pages = stored?.pages ?? structuredClone(DEFAULT_PAGES)
let activePageId = stored?.activePageId ?? pages[0].id
let sidebarOpen = stored?.sidebarOpen ?? true
let mobileSidebarOpen = false
let codefusionOpen = false
let searchQuery = ''
let codefusionMessages = stored?.codefusionMessages ?? [
  {
    role: 'ai',
    text: "Hi! I'm CodeFusion, your AI assistant. Choose a quick action or type a prompt below.",
  },
]
let activeView = stored?.activeView ?? 'home'

// Auth & sync
let user = null
let syncStatus = isSupabaseConfigured ? 'idle' : 'offline'
let authModalOpen = false
let shareModalOpen = false
let templatesModalOpen = false
let trashModalOpen = false
let inboxModalOpen = false
let eventModalOpen = false

if (stored?.calendarEvents) {
  loadCalendarEvents(stored.calendarEvents)
}

const listeners = new Set()
let persistTimer
let cloudSyncTimer

function persist() {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    saveToStorage({
      pages,
      activePageId,
      sidebarOpen,
      codefusionMessages,
      activeView,
      calendarEvents: getCalendarState().calendarEvents,
    })
    scheduleCloudSync()
  }, 400)
}

function scheduleCloudSync() {
  if (!user) return
  clearTimeout(cloudSyncTimer)
  cloudSyncTimer = setTimeout(async () => {
    try {
      setSyncStatus('syncing')
      await syncPages(user.id, pages)
      await syncCalendarEvents(user.id, getCalendarState().calendarEvents)
      await syncUserSettings(user.id, {
        activePageId,
        sidebarOpen,
        activeView,
        codefusionMessages,
      })
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }, 800)
}

function setSyncStatus(status) {
  syncStatus = status
  listeners.forEach((listener) => listener(getState()))
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState() {
  return {
    pages,
    activePageId,
    sidebarOpen,
    mobileSidebarOpen,
    codefusionOpen,
    searchQuery,
    codefusionMessages,
    activeView,
    user,
    syncStatus,
    authModalOpen,
    shareModalOpen,
    templatesModalOpen,
    trashModalOpen,
    inboxModalOpen,
    eventModalOpen,
    isSupabaseConfigured,
    ...getCalendarState(),
  }
}

function notify() {
  listeners.forEach((listener) => listener(getState()))
  persist()
}

export function getActivePage() {
  const active = pages.find((page) => page.id === activePageId && !page.trashed)
  return active ?? pages.find((p) => !p.trashed) ?? pages[0]
}

export function getFilteredPages() {
  const query = searchQuery.trim().toLowerCase()
  const visible = pages.filter((page) => !page.trashed)
  if (!query) return visible
  return visible.filter(
    (page) =>
      page.title.toLowerCase().includes(query) ||
      page.content.toLowerCase().includes(query)
  )
}

export function getTrashedPages() {
  return pages.filter((page) => page.trashed)
}

export function getRecentPages(limit = 6) {
  return [...pages]
    .filter((p) => !p.trashed)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
}

export function setActivePage(id) {
  activePageId = id
  activeView = 'page'
  mobileSidebarOpen = false
  notify()
}

export function openHome() {
  activeView = 'home'
  mobileSidebarOpen = false
  notify()
}

export function setSearchQuery(query) {
  searchQuery = query
  notify()
}

export function toggleSidebar() {
  sidebarOpen = !sidebarOpen
  notify()
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

export function openAuthModal() {
  authModalOpen = true
  notify()
}

export function closeAuthModal() {
  authModalOpen = false
  notify()
}

export function openShareModal() {
  shareModalOpen = true
  notify()
}

export function closeShareModal() {
  shareModalOpen = false
  notify()
}

export function openTemplatesModal() {
  templatesModalOpen = true
  notify()
}

export function closeTemplatesModal() {
  templatesModalOpen = false
  notify()
}

export function openTrashModal() {
  trashModalOpen = true
  notify()
}

export function closeTrashModal() {
  trashModalOpen = false
  notify()
}

export function openInboxModal() {
  inboxModalOpen = true
  notify()
}

export function closeInboxModal() {
  inboxModalOpen = false
  notify()
}

export function openEventModal() {
  eventModalOpen = true
  notify()
}

export function closeEventModal() {
  eventModalOpen = false
  notify()
}

export function setUser(newUser) {
  user = newUser
  notify()
}

export async function loadFromSupabase(userId) {
  const data = await fetchUserData(userId)
  if (!data) return

  if (data.pages) pages = data.pages
  if (data.calendarEvents) loadCalendarEvents(data.calendarEvents)
  if (data.activePageId && pages.some((p) => p.id === data.activePageId)) {
    activePageId = data.activePageId
  } else {
    activePageId = pages.find((p) => !p.trashed)?.id ?? pages[0]?.id
  }
  if (data.sidebarOpen !== null && data.sidebarOpen !== undefined) sidebarOpen = data.sidebarOpen
  if (data.activeView) activeView = data.activeView
  if (data.codefusionMessages) codefusionMessages = data.codefusionMessages

  setSyncStatus('synced')
  notify()
}

export function resetToLocalDefaults() {
  pages = structuredClone(DEFAULT_PAGES)
  activePageId = pages[0].id
  activeView = 'home'
  codefusionMessages = [
    {
      role: 'ai',
      text: "Hi! I'm CodeFusion, your AI assistant. Choose a quick action or type a prompt below.",
    },
  ]
  loadCalendarEvents(null)
  notify()
}

export function createPage(template) {
  const id = `page-${Date.now()}`
  const newPage = {
    id,
    title: template?.title ?? 'Untitled',
    icon: template?.icon ?? '📄',
    cover: 'ocean',
    content: template?.content ?? '',
    favorite: false,
    trashed: false,
    updatedAt: Date.now(),
  }
  pages = [newPage, ...pages]
  activePageId = id
  activeView = 'page'
  mobileSidebarOpen = false
  notify()
  return newPage
}

export function openCalendarPlus() {
  activeView = 'calendar'
  notify()
}

export function closeCalendarPlus() {
  activeView = 'page'
  notify()
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

export function calendarAddEvent(payload) {
  addCalendarEvent(payload)
  notify()
}

export function calendarDeleteEvent(id) {
  deleteCalendarEvent(id)
  if (user) deleteEventFromCloud(id).catch(() => setSyncStatus('error'))
  notify()
}

export function updateActivePage(updates, { silent = false } = {}) {
  pages = pages.map((page) =>
    page.id === activePageId
      ? { ...page, ...updates, updatedAt: Date.now() }
      : page
  )
  if (!silent) notify()
  else persist()
}

export function addCodeFusionMessage(role, text) {
  codefusionMessages = [...codefusionMessages, { role, text }]
  notify()
}

export function deletePage(id) {
  const visible = pages.filter((p) => !p.trashed)
  if (visible.length <= 1 && !pages.find((p) => p.id === id)?.trashed) return
  pages = pages.map((page) =>
    page.id === id ? { ...page, trashed: true, updatedAt: Date.now() } : page
  )
  if (activePageId === id) {
    activePageId = pages.find((p) => !p.trashed)?.id ?? pages[0].id
    activeView = 'page'
  }
  notify()
}

export function restorePage(id) {
  pages = pages.map((page) =>
    page.id === id ? { ...page, trashed: false, updatedAt: Date.now() } : page
  )
  notify()
}

export function permanentDeletePage(id) {
  pages = pages.filter((page) => page.id !== id)
  if (user) deletePageFromCloud(id).catch(() => setSyncStatus('error'))
  if (activePageId === id) {
    activePageId = pages.find((p) => !p.trashed)?.id ?? pages[0]?.id
  }
  notify()
}

export function toggleFavorite(id) {
  pages = pages.map((page) =>
    page.id === id ? { ...page, favorite: !page.favorite } : page
  )
  notify()
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
