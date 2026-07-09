# User stories

Our 9 epics for Student Workspace.  
Team: Dhruv, Parth, Kelvin, Sahil · Humber · summer 2026

Courses in the app: xml/Js, sqlServer, OracleServer, pl/sql, DSA, data analitics

---

## Epic 1 — Profile & sign-in

**As a student, I want to set up my profile and sign in so my work saves.**

- **Owner:** Dhruv (N10015893)
- **Where:** Profile
- **Status:** Partial

What works now: name, university, semester, course checkboxes, Google/email sign-in, paste syllabus → calendar dates, Supabase sync when signed in.

---

## Epic 2 — Today's dashboard

**As a student, I want to see only what matters today.**

- **Owner:** Dhruv (N10015893)
- **Where:** Today
- **Status:** Done

What works now: today's classes/events, assignments due today, stat cards, progress bars.

---

## Epic 3 — Notes linked to course

**As a student, I want notes linked to course and lecture without manual tagging.**

- **Owner:** Parth (N01779255)
- **Where:** + Note in sidebar
- **Status:** Done

What works now: course dropdown, lecture field, textarea editor, saves to localStorage. Also + Todo and + Journal page types.

---

## Epic 4 — AI assistant

**As a student, I want to ask questions about my notes.**

- **Owner:** Whole team
- **Where:** AI
- **Status:** Placeholder (UI only)

Plan for August: Gemini API, search your notes, show answers in chat. Not started yet.

---

## Epic 5 — Assignment Kanban

**As a student, I want a Kanban board for assignments.**

- **Owner:** Kelvin (N01777723)
- **Where:** Assignments
- **Status:** Done

What works now: To do / In progress / Done columns, move cards, add new assignment.

---

## Epic 6 — Study planner

**As a student, I want a weekly study plan from my deadlines.**

- **Owner:** Kelvin (N01777723)
- **Where:** Study planner
- **Status:** Partial

What works now: Generate week button, simple grid. Can't edit individual blocks yet.

---

## Epic 7 — Flashcards

**As a student, I want flashcards from my notes.**

- **Owner:** Parth (N01779255)
- **Where:** Flashcards
- **Status:** Partial

What works now: generate from `##` and `•` in notes, review with Again/Good/Easy. Duplicate bug if you generate multiple times.

---

## Epic 8 — Exam prep

**As a student, I want exam mode to prep from my open note.**

- **Owner:** Sahil (N01769967)
- **Where:** Exam prep
- **Status:** Partial

What works now: summary + flashcard preview, activate creates cards from open note.

---

## Epic 9 — Analytics

**As a student, I want to see how much I studied.**

- **Owner:** Sahil (N01769967)
- **Where:** Analytics
- **Status:** Partial

What works now: 7-day bar chart, assignment count, log study time button.

---

## Demo quick ref

| Person | Click |
|--------|-------|
| Dhruv | Today |
| Parth | + Note |
| Kelvin | Assignments |
| Sahil | Exam prep |
| All | AI (shell) |

---

Status: ✅ done for demo · 🟡 partial · ⬜ not built

[Progress tracker](./project_progress_tracker.md) · [Timeline](./mosco_timeline.md) · [Main README](../README.md)
