# For Professor — Honest Project Scope

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
| Parth Patel | N01779255 | 3 | **xml/Js lecture note** | Course dropdown + lecture field + plain `<textarea>` notes |
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

## 60-second answer if asked "Did you use AI?"

> "We used AI like Stack Overflow — to fix bugs and layout ideas.  
> The **logic we demo** is ours: course dropdown on notes, Kanban columns, dashboard filters for today, reading `##` headings for exam prep.  
> We kept the editor **simple on purpose** (textarea) so we can explain every line.  
> AI chat is **not built** — that epic is for later weeks."

---

## Show you understand the code (Parth example)

Open `components/editor.js` and explain:

1. We build HTML as a string and put it in the page (`container.innerHTML`).
2. Course list comes from `utils/courses.js` — our real semester courses.
3. On `input` / `change`, we call `onUpdatePage()` which saves to `state.js` → localStorage.
4. Flashcards read the same plain text (`##` and `•`) — no magic.

---

## Why it looks "big"

- **9 sidebar links** = story map coverage (screens exist), not 9 finished features.
- **Demo seed data** (`utils/seedDemo.js`) loads sample notes so the demo works on first open.
- Old CSS from earlier experiments is still in `styles.css` — we simplified the editor, not deleted every old style rule.

---

[← Main README](./README.md) · [Progress tracker](./project_progress_tracker.md) · [File map](./FILES.md)
