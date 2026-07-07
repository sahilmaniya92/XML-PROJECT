# Project Progress Tracker

**Student Workspace** — 4-week MVP story map status  
Last updated: July 7, 2026

---

## Quick summary

| Status | Count | Meaning |
|--------|-------|---------|
| ✅ **Demo-ready** | **4** | One polished story per teammate — works for professor demo |
| 🟡 **Basic / partial** | **4** | Screen exists and does something simple, not fully polished |
| ⬜ **Placeholder only** | **1** | UI shell only — Epic 4 AI |

**Coverage score (honest)**

- Epics with a working screen: **8 / 9** (only AI is empty)
- Epics demo-ready for presentation: **~4–5 / 9**
- One story per teammate ready: **4 / 4** (Dhruv, Parth, Kelvin, Sahil via Exam prep)

---

## By person (who owns what)

| Person | Student ID | Epic | User story | Status |
|--------|------------|------|------------|--------|
| **Dhruv Patel** | N10015893 | 2 | View today's schedule | ✅ **Done** |
| **Dhruv Patel** | N10015893 | 1 | Profile + sign-in + syllabus | 🟡 **Partial** |
| **Parth Patel** | N01779255 | 3 | Notes linked to course + lecture | ✅ **Done** |
| **Parth Patel** | N01779255 | 7 | Flashcards from notes | 🟡 **Partial** |
| **Kelvin Idoko** | N01777723 | 5 | Kanban assignment tracking | ✅ **Done** |
| **Kelvin Idoko** | N01777723 | 6 | Weekly study planner | 🟡 **Partial** |
| **Sahil Maniya** | N01769967 | 8 | One-click exam prep | 🟡 **Partial** |
| **Sahil Maniya** | N01769967 | 9 | Study analytics | 🟡 **Partial** |
| **ALL** |  | 4 | AI answers from notes | ⬜ **Placeholder** |

---

## One demo per person

| Person | User story | Where to click |
|--------|------------|--------------|
| **Dhruv** | View today's schedule | **Today** |
| **Parth** | Notes linked to course + lecture | **xml/Js — XML & JavaScript lecture** |
| **Sahil** | Exam prep from open note | **Exam prep** → Activate |
| **Kelvin** | Kanban assignment tracking | **Assignments** → move cards |

> First open loads demo data (lecture note, today's events, assignments).

---

## All 9 epics — detail

### ✅ Fully working (good for demo)

#### Epic 2 — Today's dashboard (`Today`)
- Today's schedule (calendar + due assignments)
- Stat cards + progress bars
- **Owner:** Dhruv — `components/dashboard.js`

#### Epic 3 — Notes + course/lecture (notes list + editor)
- Rich note editor, course dropdown, lecture field
- Courses: xml/Js, sqlServer, OracleServer, pl/sql, DSA, data analitics
- **Owner:** Parth — `components/editor.js`, `utils/courses.js`

#### Epic 5 — Assignment Kanban (`Assignments`)
- 3 columns: To do → In progress → Done
- Add new assignment form
- **Owner:** Kelvin — `components/assignments.js`

---

### 🟡 Built but basic (not fully polished)

#### Epic 1 — Account & profile (`Profile`)
- Name, university, semester, enrolled courses
- Google sign-in + email auth
- Syllabus paste → calendar dates
- Supabase sync (1 row per user in `workspaces` table)
- **Owner:** Dhruv — `components/profile.js`, `components/auth.js`

#### Epic 6 — Study planner (`Study planner`)
- "Generate week" from assignments and courses
- Simple weekly grid (no drag/edit sessions yet)
- **Owner:** Kelvin — `components/studyPlanner.js`, `utils/planner.js`

#### Epic 7 — Flashcards (`Flashcards`)
- Generate from note headings and bullets
- Spaced repetition review (Again / Good / Easy)
- **Known issue:** generating many times creates duplicate cards (badge count inflates)
- **Owner:** Parth — `components/flashcards.js`, `utils/flashcards.js`

#### Epic 8 — Exam prep (`Exam prep`)
- Summary + flashcard preview from open note
- "Activate" creates flashcards and logs study time
- **Owner:** Sahil — `components/examMode.js`

#### Epic 9 — Analytics (`Analytics`)
- Study hours bar chart (last 7 days)
- Assignment completion + note count
- **Owner:** Sahil — `components/analytics.js`

---

### ⬜ Placeholder only

#### Epic 4 — AI (`AI`)
- Sidebar link exists
- "Coming soon" screen — input and send button disabled
- No API, no chat history, no RAG
- **Owner:** Sahil — `components/ai.js` (to be wired later with Gemini)

---

## Extra features (not in the 9 epics)

| Feature | Status | Notes |
|---------|--------|-------|
| **Calendar** | 🟡 Partial | Add/delete events |
| **Supabase sync** | 🟡 Partial | Sign in → data syncs to cloud |
| **CodeFusion panel** | Legacy | Old note-side AI panel (separate from Epic 4) |
| **Search, trash, templates** | Basic | Note utilities |

---

## Tech stack

- Vanilla JavaScript + Vite + Tailwind v4
- Data: `localStorage` + optional Supabase (`workspaces` table, JSON `data` column)
- No external AI API connected yet

---

## What to tell the professor

> "We mapped **9 epics** to the app. **4 user stories are demo-ready** (Today dashboard, linked notes, Kanban assignments, and exam/flashcard flow). **Epic 4 AI is a placeholder** for later. The rest are working prototypes with simple vanilla JS — no external AI API yet."

---

## Next steps (suggested)

- [ ] Wire Epic 4 AI (Gemini + note search) — Sahil
- [ ] Fix flashcard duplicate generation — Parth
- [ ] Polish study planner (edit sessions) — Kelvin
- [ ] Remove or simplify CodeFusion legacy panel
- [ ] Update main README to link this tracker

---

## Team READMEs

| Person | File |
|--------|------|
| Dhruv Patel | [README-DHRUV.md](./README-DHRUV.md) |
| Parth Patel | [README-PARTH.md](./README-PARTH.md) |
| Sahil Maniya | [README-SAHIL.md](./README-SAHIL.md) |
| Kelvin Idoko | [README-KELVIN.md](./README-KELVIN.md) |

[← Main README](./README.md)
