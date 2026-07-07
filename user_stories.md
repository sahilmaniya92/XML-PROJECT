# User Stories — Student Workspace

Simple list of what we are building.  
9 epics · 4 teammates · courses: xml/Js, sqlServer, OracleServer, pl/sql, DSA, data analitics

---

## Epic 1 — Account & profile

**As a student, I want to set up my profile and sign in so my work saves to the cloud.**

| | |
|---|---|
| **Owner** | Dhruv Patel (N10015893) |
| **Where** | Sidebar → Profile |
| **Status** | 🟡 Partial |

**Acceptance (for now)**
- Fill name, university, semester, courses
- Sign in with email or Google
- Paste syllabus text → dates go to calendar
- Data syncs to Supabase when signed in

---

## Epic 2 — Today's dashboard

**As a student, I want a dashboard that shows only what matters today so I know what to focus on.**

| | |
|---|---|
| **Owner** | Dhruv Patel (N10015893) |
| **Where** | Sidebar → Today |
| **Status** | ✅ Done |

**Acceptance (for now)**
- See today's classes and events
- See assignments due today
- See quick stats (cards to review, tasks done, study time)

---

## Epic 3 — Notes linked to course & lecture

**As a student, I want every note linked to a course and lecture so I don't manually organize files.**

| | |
|---|---|
| **Owner** | Parth Patel (N01779255) |
| **Where** | Sidebar → click any note |
| **Status** | ✅ Done |

**Acceptance (for now)**
- Pick course from dropdown
- Add lecture name (e.g. Week 3 — XML & DOM)
- Edit note content like a simple doc
- Sidebar shows course badge on each note

---

## Epic 4 — AI assistant

**As a student, I want to ask questions about my notes and get answers grounded in my lecture materials.**

| | |
|---|---|
| **Owner** | Whole team (Dhruv, Parth, Sahil, Kelvin) |
| **Where** | Sidebar → AI |
| **Status** | ⬜ Placeholder (UI only) |

**Acceptance (planned)**
- Ask a question in chat
- Answer uses your uploaded notes (not generic web answers)
- Gemini API + note search (team builds together)

---

## Epic 5 — Assignment Kanban

**As a student, I want to track assignments on a Kanban board so I can see progress at a glance.**

| | |
|---|---|
| **Owner** | Kelvin Idoko (N01777723) |
| **Where** | Sidebar → Assignments |
| **Status** | ✅ Done |

**Acceptance (for now)**
- Three columns: To do, In progress, Done
- Move cards with buttons on each assignment
- Add new assignment with title, course, due date

---

## Epic 6 — Study planner

**As a student, I want a weekly study plan generated from my courses and deadlines.**

| | |
|---|---|
| **Owner** | Kelvin Idoko (N01777723) |
| **Where** | Sidebar → Study planner |
| **Status** | 🟡 Partial |

**Acceptance (for now)**
- Click "Generate week"
- See study blocks spread across the week
- Based on assignments and enrolled courses

---

## Epic 7 — Flashcards

**As a student, I want flashcards generated from my notes so I can review before exams.**

| | |
|---|---|
| **Owner** | Parth Patel (N01779255) |
| **Where** | Sidebar → Flashcards |
| **Status** | 🟡 Partial |

**Acceptance (for now)**
- Generate cards from note headings and bullets
- Review due cards (Again / Good / Easy)
- Filter by course

---

## Epic 8 — Exam prep

**As a student, I want one-click exam mode to summarize my note and prep flashcards.**

| | |
|---|---|
| **Owner** | Sahil Maniya (N01769967) |
| **Where** | Sidebar → Exam prep |
| **Status** | 🟡 Partial |

**Acceptance (for now)**
- Open a lecture note first
- See summary and flashcard preview
- Activate exam mode → creates flashcards from that note

---

## Epic 9 — Analytics

**As a student, I want to see how much I studied so I can track my habits.**

| | |
|---|---|
| **Owner** | Sahil Maniya (N01769967) |
| **Where** | Sidebar → Analytics |
| **Status** | 🟡 Partial |

**Acceptance (for now)**
- Bar chart of study minutes (last 7 days)
- Assignment completion count
- Log study time manually

---

## Quick demo (one per person)

| Person | Story | Click |
|--------|-------|-------|
| Dhruv | Today's schedule | **Today** |
| Parth | Notes + course link | **xml/Js — XML & JavaScript lecture** |
| Kelvin | Kanban board | **Assignments** |
| Sahil | Exam prep | **Exam prep** → Activate |
| All | AI (shell) | **AI** |

---

## Status key

| Symbol | Meaning |
|--------|---------|
| ✅ | Demo-ready |
| 🟡 | Works but basic |
| ⬜ | Placeholder / not wired yet |

---

[Progress tracker](./project_progress_tracker.md) · [Main README](./README.md)
