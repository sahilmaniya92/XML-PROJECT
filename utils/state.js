import {
  getCalendarState,
  goToPrevMonth,
  goToNextMonth,
  setSelectedDate,
  addCalendarEvent,
  deleteCalendarEvent,
  loadCalendarEvents,
  loadCalendarState,
} from './calendar.js'
import { loadFromStorage, saveToStorage } from './persistence.js'
import {
  fetchWorkspace,
  saveWorkspace,
  formatDatabaseError,
  testDatabaseConnection,
  signOut,
} from './supabaseSync.js'
import { isSupabaseConfigured } from './supabase.js'
import { COURSES } from './courses.js'
import {
  generateCardsFromNote,
  isCardDue,
  reviewCard,
} from './flashcards.js'
import { parseSyllabus } from './syllabus.js'
import { generateWeeklyPlan } from './planner.js'
import { shouldSeedDemo, applyDemoToStorage, getDemoWorkspace } from './seedDemo.js'

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

const rawStored = loadFromStorage()
const stored = shouldSeedDemo(rawStored)
  ? applyDemoToStorage(rawStored) ?? getDemoWorkspace()
  : rawStored

if (shouldSeedDemo(rawStored)) {
  saveToStorage({
    ...stored,
    sidebarOpen: stored?.sidebarOpen ?? true,
    codefusionMessages: stored?.codefusionMessages ?? [],
    privateSectionCollapsed: stored?.privateSectionCollapsed ?? false,
  })
}

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
let activeView = stored?.activeView === 'assistant' ? 'home' : (stored?.activeView ?? 'home')

// Auth & sync
let user = null
let syncStatus = isSupabaseConfigured ? 'idle' : 'offline'
let dbStatus = isSupabaseConfigured ? 'unknown' : 'offline'
let syncError = null
let lastSyncedAt = null
let dbSetupModalOpen = false
let authModalOpen = false
let shareModalOpen = false
let templatesModalOpen = false
let trashModalOpen = false
let inboxModalOpen = false
let eventModalOpen = false
let shortcutsModalOpen = false
let privateSectionCollapsed = stored?.privateSectionCollapsed ?? false
let flashcards = stored?.flashcards ?? []
let activeCourse = stored?.activeCourse ?? COURSES[0]

let profile = stored?.profile ?? {
  name: '',
  university: '',
  semester: '',
  courses: [COURSES[0]],
  syllabusText: '',
}

let assignments = stored?.assignments ?? [
  {
    id: 'asgn-1',
    title: 'XML Project presentation',
    course: COURSES[0],
    dueDate: Date.now() + 3 * 86400000,
    status: 'progress',
    priority: 'high',
  },
  {
    id: 'asgn-2',
    title: 'SQL Server lab report',
    course: COURSES[1],
    dueDate: Date.now() + 6 * 86400000,
    status: 'todo',
    priority: 'normal',
  },
]

let studyPlan = stored?.studyPlan ?? []
let studyLog = stored?.studyLog ?? {}

if (stored?.calendarEvents) {
  loadCalendarEvents(stored.calendarEvents)
} else if (shouldSeedDemo(rawStored)) {
  loadCalendarEvents(getDemoWorkspace().calendarEvents)
}

const listeners = new Set()
let persistTimer
let cloudSyncTimer
let syncInFlight = false
let syncPending = false
let signingOut = false

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
      privateSectionCollapsed,
      flashcards,
      activeCourse,
      profile,
      assignments,
      studyPlan,
      studyLog,
      demoVersion: 3,
    })
    scheduleCloudSync()
  }, 400)
}

function getWorkspaceSnapshot() {
  const calendar = getCalendarState()
  return {
    version: 1,
    pages,
    activePageId,
    sidebarOpen,
    activeView,
    codefusionMessages,
    calendarEvents: calendar.calendarEvents,
    calendarMonth: calendar.calendarMonth,
    calendarYear: calendar.calendarYear,
    selectedDateKey: calendar.selectedDateKey,
    privateSectionCollapsed,
    flashcards,
    activeCourse,
    profile,
    assignments,
    studyPlan,
    studyLog,
  }
}

function applyWorkspaceSnapshot(snapshot) {
  if (!snapshot) return false

  if (Array.isArray(snapshot.pages) && snapshot.pages.length) {
    pages = snapshot.pages
  }
  if (snapshot.activePageId && pages.some((p) => p.id === snapshot.activePageId)) {
    activePageId = snapshot.activePageId
  } else {
    activePageId = pages.find((p) => !p.trashed)?.id ?? pages[0]?.id
  }
  if (typeof snapshot.sidebarOpen === 'boolean') sidebarOpen = snapshot.sidebarOpen
  if (snapshot.activeView) {
    activeView = snapshot.activeView === 'assistant' ? 'home' : snapshot.activeView
  }
  if (snapshot.codefusionMessages) codefusionMessages = snapshot.codefusionMessages
  if (typeof snapshot.privateSectionCollapsed === 'boolean') {
    privateSectionCollapsed = snapshot.privateSectionCollapsed
  }

  loadCalendarState({
    events: snapshot.calendarEvents ?? [],
    month: snapshot.calendarMonth,
    year: snapshot.calendarYear,
    selectedDateKey: snapshot.selectedDateKey,
  })

  if (Array.isArray(snapshot.flashcards)) flashcards = snapshot.flashcards
  if (snapshot.activeCourse) activeCourse = snapshot.activeCourse
  if (snapshot.profile) profile = { ...profile, ...snapshot.profile }
  if (Array.isArray(snapshot.assignments)) assignments = snapshot.assignments
  if (Array.isArray(snapshot.studyPlan)) studyPlan = snapshot.studyPlan
  if (snapshot.studyLog) studyLog = snapshot.studyLog

  return true
}

function maxPageUpdatedAt(snapshot) {
  if (!snapshot?.pages?.length) return 0
  return Math.max(...snapshot.pages.map((page) => page.updatedAt ?? 0))
}

function mergeCalendarEvents(localEvents = [], remoteEvents = []) {
  const merged = new Map()
  for (const event of [...remoteEvents, ...localEvents]) {
    const key = event.id ?? `${event.date ?? ''}:${event.title ?? ''}`
    const existing = merged.get(key)
    if (!existing || (event.updatedAt ?? 0) >= (existing.updatedAt ?? 0)) {
      merged.set(key, event)
    }
  }
  return [...merged.values()]
}

function mergeWorkspaceSnapshots(local, remote) {
  if (!remote) return local
  if (!local?.pages?.length) return remote

  const pageMap = new Map()
  for (const page of remote.pages ?? []) {
    pageMap.set(page.id, page)
  }
  for (const page of local.pages ?? []) {
    const existing = pageMap.get(page.id)
    if (!existing || (page.updatedAt ?? 0) >= (existing.updatedAt ?? 0)) {
      pageMap.set(page.id, page)
    }
  }

  const localNewer = maxPageUpdatedAt(local) > maxPageUpdatedAt(remote)
  const prefer = localNewer ? local : remote
  const fallback = localNewer ? remote : local
  const localMessages = local.codefusionMessages?.length ?? 0
  const remoteMessages = remote.codefusionMessages?.length ?? 0

  const mergedPages = [...pageMap.values()]

  return {
    version: 1,
    pages: mergedPages,
    activePageId: mergedPages.some((p) => p.id === prefer.activePageId)
      ? prefer.activePageId
      : fallback.activePageId ?? mergedPages.find((p) => !p.trashed)?.id ?? mergedPages[0]?.id,
    sidebarOpen: prefer.sidebarOpen ?? fallback.sidebarOpen,
    activeView: prefer.activeView ?? fallback.activeView,
    codefusionMessages:
      localMessages >= remoteMessages ? local.codefusionMessages : remote.codefusionMessages,
    calendarEvents: mergeCalendarEvents(local.calendarEvents, remote.calendarEvents),
    calendarMonth: prefer.calendarMonth ?? fallback.calendarMonth,
    calendarYear: prefer.calendarYear ?? fallback.calendarYear,
    selectedDateKey: prefer.selectedDateKey ?? fallback.selectedDateKey,
    privateSectionCollapsed:
      prefer.privateSectionCollapsed ?? fallback.privateSectionCollapsed,
    flashcards: mergeFlashcards(local.flashcards, remote.flashcards),
    activeCourse: prefer.activeCourse ?? fallback.activeCourse ?? COURSES[0],
    profile: { ...fallback.profile, ...prefer.profile },
    assignments: mergeById(local.assignments, remote.assignments),
    studyPlan: prefer.studyPlan?.length ? prefer.studyPlan : remote.studyPlan,
    studyLog: { ...remote.studyLog, ...local.studyLog },
  }
}

function mergeById(local = [], remote = []) {
  const map = new Map()
  for (const item of [...remote, ...local]) {
    if (!item?.id) continue
    map.set(item.id, item)
  }
  return [...map.values()]
}

function mergeFlashcards(localCards = [], remoteCards = []) {
  const merged = new Map()
  for (const card of [...remoteCards, ...localCards]) {
    const existing = merged.get(card.id)
    if (!existing || (card.updatedAt ?? 0) >= (existing.updatedAt ?? 0)) {
      merged.set(card.id, card)
    }
  }
  return [...merged.values()]
}

function scheduleCloudSync() {
  if (!user) return
  syncPending = true
  clearTimeout(cloudSyncTimer)
  cloudSyncTimer = setTimeout(() => runCloudSync(), 1200)
}

async function runCloudSync(retry = true) {
  if (!user) return
  const userId = user.id
  if (syncInFlight) {
    syncPending = true
    return
  }

  syncInFlight = true
  syncPending = false

  try {
    setSyncStatus('syncing')
    syncError = null
    await saveWorkspace(userId, getWorkspaceSnapshot())
    if (!user || user.id !== userId) return
    lastSyncedAt = Date.now()
    setSyncStatus('synced')
    setDbStatus('connected')
  } catch (err) {
    if (!user || user.id !== userId) return
    if (retry) {
      syncInFlight = false
      await new Promise((r) => setTimeout(r, 1500))
      return runCloudSync(false)
    }
    syncError = formatDatabaseError(err)
    setSyncStatus('error')
    if (syncError.toLowerCase().includes('missing') || syncError.toLowerCase().includes('does not exist')) {
      setDbStatus('missing_table')
    } else if (syncError.toLowerCase().includes('permission') || syncError.toLowerCase().includes('policy')) {
      setDbStatus('permission')
    } else if (syncError.toLowerCase().includes('signed in') || syncError.toLowerCase().includes('session')) {
      setDbStatus('error')
    } else {
      setDbStatus('error')
    }
  } finally {
    syncInFlight = false
    if (syncPending) {
      syncPending = false
      scheduleCloudSync()
    }
  }
}

function setSyncStatus(status) {
  syncStatus = status
  listeners.forEach((listener) => listener(getState()))
}

function setDbStatus(status) {
  dbStatus = status
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
    dbStatus,
    syncError,
    lastSyncedAt,
    dbSetupModalOpen,
    authModalOpen,
    shareModalOpen,
    templatesModalOpen,
    trashModalOpen,
    inboxModalOpen,
    eventModalOpen,
    shortcutsModalOpen,
    isSupabaseConfigured,
    privateSectionCollapsed,
    flashcards,
    activeCourse,
    profile,
    assignments,
    studyPlan,
    studyLog,
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

export function getDueFlashcards(courseFilter = activeCourse) {
  return flashcards.filter(
    (card) =>
      (courseFilter === 'All' || card.course === courseFilter) && isCardDue(card)
  )
}

export function openFlashcards() {
  activeView = 'flashcards'
  mobileSidebarOpen = false
  notify()
}

export function closeFlashcards() {
  activeView = 'home'
  notify()
}

export function setActiveCourse(course) {
  activeCourse = course
  notify()
}

export function setPageCourse(pageId, course) {
  const page = pages.find((p) => p.id === pageId)
  if (!page) return
  page.course = course
  page.updatedAt = Date.now()
  notify()
}

export function setPageLecture(pageId, lecture) {
  const page = pages.find((p) => p.id === pageId)
  if (!page) return
  page.lecture = lecture
  page.updatedAt = Date.now()
  notify()
}

export function generateFlashcardsFromPage(pageId) {
  const page = pages.find((p) => p.id === pageId && !p.trashed)
  if (!page) return 0

  const newCards = generateCardsFromNote(page.content, {
    course: page.course || activeCourse,
    pageId: page.id,
  })
  if (!newCards.length) return 0

  flashcards = [...newCards, ...flashcards]
  notify()
  return newCards.length
}

export function reviewFlashcard(cardId, quality) {
  const index = flashcards.findIndex((c) => c.id === cardId)
  if (index === -1) return
  flashcards[index] = reviewCard(flashcards[index], quality)
  notify()
}

export function deleteFlashcard(cardId) {
  flashcards = flashcards.filter((c) => c.id !== cardId)
  notify()
}

export function openHome() {
  activeView = 'home'
  mobileSidebarOpen = false
  notify()
}

export function openProfile() {
  activeView = 'profile'
  mobileSidebarOpen = false
  notify()
}

export function openAssignments() {
  activeView = 'assignments'
  mobileSidebarOpen = false
  notify()
}

export function openStudyPlanner() {
  activeView = 'planner'
  mobileSidebarOpen = false
  notify()
}

export function openExamMode() {
  activeView = 'exam'
  mobileSidebarOpen = false
  notify()
}

export function openAi() {
  activeView = 'ai'
  mobileSidebarOpen = false
  notify()
}

export function openAnalytics() {
  activeView = 'analytics'
  mobileSidebarOpen = false
  notify()
}

export function saveProfile(updates) {
  profile = { ...profile, ...updates }
  notify()
}

export function parseAndImportSyllabus(text) {
  profile.syllabusText = text
  const events = parseSyllabus(text)
  for (const ev of events) {
    addCalendarEvent({
      title: ev.title,
      date: ev.dateKey,
    })
  }
  notify()
  return events.length
}

export function addAssignment(data) {
  assignments = [
    {
      id: `asgn-${Date.now()}`,
      priority: 'normal',
      status: 'todo',
      ...data,
    },
    ...assignments,
  ]
  notify()
}

export function moveAssignment(id, status) {
  const a = assignments.find((x) => x.id === id)
  if (!a) return
  a.status = status
  a.updatedAt = Date.now()
  notify()
}

export function deleteAssignment(id) {
  assignments = assignments.filter((a) => a.id !== id)
  notify()
}

export function generateStudyPlan() {
  studyPlan = generateWeeklyPlan({
    assignments,
    courses: profile.courses?.length ? profile.courses : COURSES,
    hoursPerWeek: 10,
  })
  notify()
}

export function activateExamMode() {
  const page = getActivePage()
  if (!page) return 0
  const count = generateFlashcardsFromPage(page.id)
  const key = new Date().toISOString().slice(0, 10)
  studyLog[key] = (studyLog[key] ?? 0) + 15
  notify()
  return count
}

export function logStudyMinutes(mins = 30) {
  const key = new Date().toISOString().slice(0, 10)
  studyLog[key] = (studyLog[key] ?? 0) + mins
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

export function togglePrivateSection() {
  privateSectionCollapsed = !privateSectionCollapsed
  notify()
}

export function duplicatePage(id) {
  const page = pages.find((p) => p.id === id)
  if (!page) return null
  const newPage = {
    ...structuredClone(page),
    id: `page-${Date.now()}`,
    title: page.title === 'Untitled' ? 'Untitled (copy)' : `${page.title} (copy)`,
    trashed: false,
    updatedAt: Date.now(),
  }
  pages = [newPage, ...pages]
  activePageId = newPage.id
  activeView = 'page'
  mobileSidebarOpen = false
  notify()
  return newPage
}

export function openDbSetupModal() {
  dbSetupModalOpen = true
  notify()
}

export function closeDbSetupModal() {
  dbSetupModalOpen = false
  notify()
}

export async function checkDatabaseConnection() {
  if (!isSupabaseConfigured) {
    setDbStatus('offline')
    return { ok: false }
  }

  try {
    const result = await testDatabaseConnection()
    setDbStatus(result.status)
    if (!result.ok) syncError = result.message
    listeners.forEach((listener) => listener(getState()))
    return result
  } catch (err) {
    setDbStatus('error')
    syncError = formatDatabaseError(err)
    listeners.forEach((listener) => listener(getState()))
    return { ok: false, status: 'error', message: syncError }
  }
}

export async function forceCloudSync() {
  if (!user) return false
  clearTimeout(cloudSyncTimer)
  syncPending = false
  await runCloudSync()
  return syncStatus === 'synced'
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

export function openShortcutsModal() {
  shortcutsModalOpen = true
  notify()
}

export function closeShortcutsModal() {
  shortcutsModalOpen = false
  notify()
}

export function setUser(newUser) {
  user = newUser
  if (!newUser) {
    clearTimeout(cloudSyncTimer)
    syncInFlight = false
    syncPending = false
    syncStatus = isSupabaseConfigured ? 'idle' : 'offline'
    syncError = null
  }
  notify()
}

export function isSigningOut() {
  return signingOut
}

export async function signOutUser() {
  if (signingOut) return
  signingOut = true

  clearTimeout(cloudSyncTimer)
  syncInFlight = false
  syncPending = false
  authModalOpen = false

  user = null
  syncStatus = isSupabaseConfigured ? 'idle' : 'offline'
  syncError = null
  dbStatus = isSupabaseConfigured ? 'idle' : 'offline'
  notify()

  try {
    await signOut()
  } catch {
    /* local session already cleared above */
  } finally {
    signingOut = false
  }

  checkDatabaseConnection()
    .catch(() => setDbStatus('idle'))
    .finally(() => notify())
}

export async function loadFromSupabase(userId) {
  const localSnapshot = getWorkspaceSnapshot()
  const remote = await fetchWorkspace(userId)

  if (remote?.snapshot) {
    const merged = mergeWorkspaceSnapshots(localSnapshot, remote.snapshot)
    applyWorkspaceSnapshot(merged)
    setSyncStatus('synced')
    setDbStatus('connected')
    syncError = null
    notify()

    await saveWorkspace(userId, getWorkspaceSnapshot())
    return maxPageUpdatedAt(localSnapshot) > maxPageUpdatedAt(remote.snapshot) ? 'merged-local' : 'loaded'
  }

  // First login — upload local workspace to cloud
  await saveWorkspace(userId, localSnapshot)
  setSyncStatus('synced')
  setDbStatus('connected')
  syncError = null
  notify()
  return 'uploaded'
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

export const TASK_LIST_TEMPLATE = {
  icon: '✅',
  title: 'Task list',
  content: '## Tasks\n\n☐ Task 1\n☐ Task 2\n☐ Task 3',
}

export function createPage(template) {
  const id = `page-${Date.now()}`
  const newPage = {
    id,
    title: template?.title ?? 'Untitled',
    icon: template?.icon ?? '📄',
    cover: 'ocean',
    content: template?.content ?? '',
    course: template?.course ?? activeCourse,
    lecture: template?.lecture ?? '',
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
