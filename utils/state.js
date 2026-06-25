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

const DEFAULT_PAGES = [
  {
    id: 'page-1',
    title: 'Getting Started',
    icon: '📝',
    cover: 'ocean',
    content:
      'Welcome to TaskScape\n\nThis is your workspace for notes, tasks, and ideas — inspired by Notion.\n\nType / anywhere to insert blocks, or use the sidebar to switch pages.',
    favorite: true,
    updatedAt: Date.now(),
  },
  {
    id: 'page-2',
    title: 'Project Notes',
    icon: '📋',
    cover: 'forest',
    content:
      '## Meeting Notes\n\n• Define project phases\n• Assign team roles\n• Review UI with professor\n\n## Next Steps\n\nConnect Supabase in a future phase.',
    favorite: false,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'page-3',
    title: 'Task List',
    icon: '✅',
    cover: 'sunset',
    content:
      '☐ Finish Phase 3 UI\n☐ Present to professor\n☐ Plan Phase 4 backend\n☐ Integrate CodeFusion with Gemini API',
    favorite: false,
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

if (stored?.calendarEvents) {
  loadCalendarEvents(stored.calendarEvents)
}

const listeners = new Set()
let persistTimer

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
  }, 400)
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
    ...getCalendarState(),
  }
}

function notify() {
  listeners.forEach((listener) => listener(getState()))
  persist()
}

export function getActivePage() {
  return pages.find((page) => page.id === activePageId) ?? pages[0]
}

export function getFilteredPages() {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return pages
  return pages.filter(
    (page) =>
      page.title.toLowerCase().includes(query) ||
      page.content.toLowerCase().includes(query)
  )
}

export function getRecentPages(limit = 6) {
  return [...pages].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit)
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

export function createPage() {
  const id = `page-${Date.now()}`
  const newPage = {
    id,
    title: 'Untitled',
    icon: '📄',
    cover: 'ocean',
    content: '',
    favorite: false,
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
  if (pages.length <= 1) return
  pages = pages.filter((page) => page.id !== id)
  if (activePageId === id) {
    activePageId = pages[0].id
    activeView = 'page'
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
