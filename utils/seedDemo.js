import { COURSES } from './courses.js'
import { createFlashcard } from './flashcards.js'

export const DEMO_VERSION = 3

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

/** Demo data so each teammate has one user story that works on first open. */
export function getDemoWorkspace() {
  const today = todayDateKey()
  const lectureContent = `## Key concepts
• XML stores structured data with tags and attributes
• JavaScript can parse XML with DOMParser
• Vite bundles modern JS for fast local development
• JSON is lighter than XML for most web APIs

## Definitions
### What is XML?
XML (eXtensible Markup Language) is a markup format for documents and data exchange.

### What is the DOM?
The Document Object Model lets JavaScript read and change HTML/XML on the page.

## Exam tips
• Practice loading and parsing a small XML file in the browser
• Know the difference between XML elements and attributes
• Review fetch() and JSON for the JS portion of the project`

  return {
    demoVersion: DEMO_VERSION,
    profile: {
      name: 'Student',
      university: 'Ontario Tech University',
      semester: 'Winter 2026',
      courses: [COURSES[0], COURSES[1], COURSES[4]],
      syllabusText: `xml/Js — Week 1: ${today} Course intro\nDSA — Exam: Mar 15\nProject due: 4/10`,
    },
    pages: [
      {
        id: 'page-lecture-1',
        title: 'xml/Js — XML & JavaScript lecture',
        icon: '📚',
        cover: 'ocean',
        course: COURSES[0],
        lecture: 'Week 3 — XML, DOM & JSON',
        content: lectureContent,
        favorite: true,
        trashed: false,
        updatedAt: Date.now(),
      },
      {
        id: 'page-task-1',
        title: 'Weekly tasks',
        icon: '✅',
        cover: 'forest',
        course: COURSES[0],
        lecture: '',
        content: '☑ Read XML lecture notes\n☐ Finish XML/JS project UI\n☐ Review flashcards\n☐ Prepare professor demo',
        favorite: false,
        trashed: false,
        updatedAt: Date.now() - 3600000,
      },
    ],
    activePageId: 'page-lecture-1',
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
        color: '#1d4ed8',
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
        pageId: 'page-lecture-1',
      }),
      createFlashcard({
        front: 'What does DOM stand for?',
        back: 'Document Object Model — how JS interacts with page structure',
        course: COURSES[0],
        pageId: 'page-lecture-1',
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

  const hasLecture = (stored.pages || []).some((p) => p.id === 'page-lecture-1')
  let pages = hasLecture ? [...stored.pages] : [...demo.pages, ...(stored.pages || [])]

  if (hasLecture) {
    pages = pages.map((p) =>
      p.id === 'page-lecture-1'
        ? { ...demo.pages[0], content: p.content || demo.pages[0].content, updatedAt: p.updatedAt }
        : p
    )
  }

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
    activePageId: stored.activePageId || demo.activePageId,
    activeCourse: COURSES.includes(stored.activeCourse) ? stored.activeCourse : demo.activeCourse,
  }
}
