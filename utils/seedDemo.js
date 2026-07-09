import { COURSES } from './courses.js'
import { createFlashcard } from './flashcards.js'

export const DEMO_VERSION = 5

const SEED_PAGE_IDS = new Set(['page-lecture-1', 'page-task-1', 'page-1', 'page-2', 'page-3'])

function todayAt(hour, min = 0) {
  const d = new Date()
  d.setHours(hour, min, 0, 0)
  return d
}

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(23, 59, 0, 0)
  return d.getTime()
}

function todayDateKey() {
  return new Date().toISOString().slice(0, 10)
}

/** Demo data for dashboard, assignments, calendar — no default notes/pages. */
export function getDemoWorkspace() {
  const today = todayDateKey()

  return {
    demoVersion: DEMO_VERSION,
    profile: {
      name: 'Student',
      university: 'Humber College',
      semester: 'Winter 2026',
      courses: [COURSES[0], COURSES[1], COURSES[4]],
      syllabusText: `xml/Js — Week 1: ${today} Course intro\nDSA — Exam: Mar 15\nProject due: 4/10`,
    },
    pages: [],
    activePageId: null,
    assignments: [
      {
        id: 'asgn-today',
        title: 'XML Project — professor demo',
        course: COURSES[0],
        dueDate: todayAt(23, 59).getTime(),
        status: 'progress',
        priority: 'high',
      },
      {
        id: 'asgn-2',
        title: 'SQL Server lab report',
        course: COURSES[1],
        dueDate: daysFromNow(4),
        status: 'todo',
        priority: 'normal',
      },
      {
        id: 'asgn-3',
        title: 'PL/SQL stored procedures quiz',
        course: COURSES[3],
        dueDate: daysFromNow(-2),
        status: 'done',
        priority: 'normal',
      },
    ],
    calendarEvents: [
      {
        id: 'evt-today-1',
        title: 'xml/Js lecture — XML & DOM',
        date: today,
        time: '10:00 AM',
        color: '#e87722',
      },
      {
        id: 'evt-today-2',
        title: 'Study group — XML project',
        date: today,
        time: '3:00 PM',
        color: '#7c3aed',
      },
    ],
    flashcards: [
      createFlashcard({
        front: 'What is XML used for?',
        back: 'Structured data and documents with tags and attributes',
        course: COURSES[0],
      }),
      createFlashcard({
        front: 'What does DOM stand for?',
        back: 'Document Object Model — how JS interacts with page structure',
        course: COURSES[0],
      }),
    ],
    studyPlan: [],
    studyLog: {
      [today]: 45,
      [offsetDay(-1)]: 30,
      [offsetDay(-2)]: 60,
    },
    activeCourse: COURSES[0],
    activeView: 'home',
  }
}

function offsetDay(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function shouldSeedDemo(stored) {
  if (!stored) return true
  return (stored.demoVersion ?? 0) < DEMO_VERSION
}

export function applyDemoToStorage(stored) {
  const demo = getDemoWorkspace()
  if (!stored) return demo

  const today = todayDateKey()
  let assignments = [...(stored.assignments || [])]
  if (!assignments.some((a) => a.id === 'asgn-today')) {
    assignments = [demo.assignments[0], ...assignments]
  }

  let calendarEvents = [...(stored.calendarEvents || [])]
  if (!calendarEvents.some((e) => (e.date || e.dateKey) === today)) {
    calendarEvents = [...demo.calendarEvents, ...calendarEvents]
  }

  let pages = (stored.pages ?? []).filter((p) => !SEED_PAGE_IDS.has(p.id))

  return {
    ...stored,
    demoVersion: DEMO_VERSION,
    profile: {
      ...demo.profile,
      ...(stored.profile || {}),
      courses: demo.profile.courses,
    },
    pages,
    assignments,
    calendarEvents,
    flashcards: stored.flashcards?.length ? stored.flashcards : demo.flashcards,
    studyLog: Object.keys(stored.studyLog || {}).length ? stored.studyLog : demo.studyLog,
    activePageId: pages.some((p) => p.id === stored.activePageId) ? stored.activePageId : null,
    activeCourse: COURSES.includes(stored.activeCourse) ? stored.activeCourse : demo.activeCourse,
    activeView: stored.activeView === 'page' && !(stored.pages || []).length ? 'home' : (stored.activeView ?? 'home'),
  }
}
