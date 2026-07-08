# Project Scope

**Student Workspace** · 4 students · XML & JavaScript course · Humber College  
This is a **story-map MVP**, not a finished commercial app.

---

## What we are NOT claiming

- We did **not** build a full Notion clone or a real AI product.
- We did **not** finish all 9 epics — the story map is the **plan**; the app is **week 3–4 progress**.
- Epic 4 (AI) is a **placeholder screen only** — no Gemini API, no chat logic.

---

## What IS actually working (demo these 4)

| Student | ID | Epic | What to click | What it does |
|---------|-----|------|---------------|--------------|
| Dhruv Patel | N10015893 | 2 | **Today** | Shows today's events, due assignments, simple stats |
| Parth Patel | N01779255 | 3 | **+ Note** in sidebar | Course dropdown + lecture field + plain `<textarea>` notes |
| Kelvin Idoko | N01777723 | 5 | **Assignments** | Kanban: drag cards To do → In progress → Done |
| Sahil Maniya | N01769967 | 8 | **Exam prep** | Reads `##` and `•` from open note (basic) |

Everything else (planner, analytics, flashcards review, profile sync) = **partial** or **basic UI**.

---

## Tech we used (from class concepts)

- **Vanilla JavaScript** — `innerHTML`, `addEventListener`, modules (`import`/`export`)
- **DOM** — one screen at a time, re-render on state change
- **localStorage** — save notes and assignments in the browser
- **Supabase** (optional) — one JSON row per user when signed in
- **Vite** — dev server only (like Create React App but simpler)

No React. No TypeScript. Notes use a **plain textarea**, not a rich editor.

---

## How we split the work

Each person owns **their component file** and can explain it:

| Person | Main files |
|--------|------------|
| Dhruv | `components/dashboard.js`, `components/profile.js` |
| Parth | `components/editor.js`, `utils/courses.js`, `components/flashcards.js` |
| Kelvin | `components/assignments.js`, `components/studyPlanner.js` |
| Sahil | `components/examMode.js`, `components/analytics.js` |
| Shared | `main.js` (wires screens), `utils/state.js` (save/load data) |

---

## Why it looks "big"

- **9 sidebar links** = story map coverage (screens exist), not 9 finished features.
- **Demo seed data** (`utils/seedDemo.js`) loads sample assignments/calendar on first open (no default notes on `parth`).
- Old CSS from earlier experiments is still in `styles.css` — we simplified the editor, not deleted every old style rule.

---

[← Main README](../README.md) · [Progress tracker](./project_progress_tracker.md) · [File map](./FILES.md)
