# Project Progress Tracker

**Student Workspace** — 4-week MVP story map status  
Last updated: July 8, 2026

---

## Quick summary

| Status | Count | Meaning |
|--------|-------|---------|
| **Demo-ready** | **4** | One polished story per teammate — works for professor demo |
| **Basic / partial** | **4** | Screen exists and does something simple, not fully polished |
| **Placeholder (team)** | **1** | UI shell in place — Epic 4 AI built by **whole team** |

**Coverage score**

- Epics with a working screen: **9 / 9** (AI has placeholder UI)
- Epics demo-ready for presentation: **~4–5 / 9**
- One story per teammate ready: **4 / 4** (Dhruv, Parth, Kelvin, Sahil via Exam prep)

---

## By person (who owns what)

| Person | Student ID | Epic | User story | Status |
|--------|------------|------|------------|--------|
| **Dhruv Patel** | N10015893 | 2 | View today's schedule | **Done** |
| **Dhruv Patel** | N10015893 | 1 | Profile + sign-in + syllabus | **Partial** |
| **Parth Patel** | N01779255 | 3 | Notes linked to course + lecture | **Done** |
| **Parth Patel** | N01779255 | 7 | Flashcards from notes | **Partial** |
| **Kelvin Idoko** | N01777723 | 5 | Kanban assignment tracking | **Done** |
| **Kelvin Idoko** | N01777723 | 6 | Weekly study planner | **Partial** |
| **Sahil Maniya** | N01769967 | 8 | One-click exam prep | **Partial** |
| **Sahil Maniya** | N01769967 | 9 | Study analytics | **Partial** |
| **Whole team** | — | 4 | AI answers from notes | **Placeholder** (shared) |

> **Epic 4 (AI)** is not owned by one person — **Dhruv, Parth, Sahil, and Kelvin** all contribute.

---

## One demo per person

| Person | User story | Where to click |
|--------|------------|--------------|
| **Dhruv** | View today's schedule | **Today** |
| **Parth** | Notes linked to course + lecture | **xml/Js — XML & JavaScript lecture** |
| **Sahil** | Exam prep from open note | **Exam prep** → Activate |
| **Kelvin** | Kanban assignment tracking | **Assignments** → move cards |
| **All** | AI section (shell only) | **AI** → coming soon screen |

> First open loads demo data (lecture note, today's events, assignments).

---

## All 9 epics — detail

### Fully working (good for demo)

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

### Built but basic (not fully polished)

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

### Placeholder — whole team (Epic 4)

#### Epic 4 — AI (`AI`)
- Sidebar link + screen layout done
- "Coming soon" UI — input and send button disabled for now
- No API, no chat history, no RAG yet
- **Owners:** **Whole team** — `components/ai.js`, routing in `main.js` / `state.js`
- **Planned:** grounded answers from lecture notes using Gemini (team builds together)

| Teammate | Likely contribution |
|----------|---------------------|
| Dhruv | Auth + API keys, sync chat to Supabase |
| Parth | Note indexing, course/lecture context for prompts |
| Sahil | Gemini API integration, prompt design |
| Kelvin | UI polish, loading states, error handling |

---

## Extra features (not in the 9 epics)

| Feature | Status | Notes |
|---------|--------|-------|
| **Calendar** | Partial | Add/delete events |
| **Supabase sync** | Partial | Sign in → data syncs to cloud |
| **CodeFusion panel** | Legacy | Old note-side AI panel (separate from Epic 4) |
| **Search, trash, templates** | Basic | Note utilities |

---

## Tech stack

- Vanilla JavaScript + Vite + Tailwind v4
- Data: `localStorage` + optional Supabase (`workspaces` table, JSON `data` column)
- No external AI API connected yet (Epic 4 — team task)

 
---

## Next steps

- [ ] Wire Epic 4 AI (Gemini + note search) — **whole team**
- [ ] Fix flashcard duplicate generation — Parth
- [ ] Polish study planner (edit sessions) — Kelvin
- [ ] Remove or simplify CodeFusion legacy panel

---

## Team READMEs

| Person | File |
|--------|------|
| Dhruv Patel | [README-DHRUV.md](./README-DHRUV.md) |
| Parth Patel | [README-PARTH.md](./README-PARTH.md) |
| Sahil Maniya | [README-SAHIL.md](./README-SAHIL.md) |
| Kelvin Idoko | [README-KELVIN.md](./README-KELVIN.md) |

[← Main README](../README.md)
