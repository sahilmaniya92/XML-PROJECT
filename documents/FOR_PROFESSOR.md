# Notes for professor

**Student Workspace** — Dhruv, Parth, Kelvin, Sahil · XML & JavaScript · Humber College

This is our story-map MVP from weeks 3–4. Not a finished app.

---

## What to expect

- Not a Notion clone. We stripped the fancy block editor on purpose.
- Not a real AI product. The AI page is layout only — no API hooked up.
- 9 sidebar screens = our plan on paper. About 4 are demo-ready.

---

## What to click in the demo

| Student | ID | Click | What happens |
|---------|-----|-------|--------------|
| Dhruv Patel | N10015893 | **Today** | Today's schedule, due assignments, quick stats |
| Parth Patel | N01779255 | **+ Note** | Course dropdown, lecture field, plain textarea |
| Kelvin Idoko | N01777723 | **Assignments** | Kanban — move cards between columns |
| Sahil Maniya | N01769967 | **Exam prep** | Reads `##` headings and `•` bullets from your open note |

Profile, planner, flashcards, analytics — there but basic. AI — placeholder.

---

## Tech (stuff from class)

- Vanilla JS — modules, `innerHTML`, `addEventListener`
- One screen at a time, re-render when state changes
- `localStorage` for saving
- Supabase optional — one JSON row per user
- Vite for dev server
- No React, no TypeScript
- Notes = plain `<textarea>`, not a rich editor

---

## Who wrote what

| Person | Main files |
|--------|------------|
| Dhruv | `dashboard.js`, `profile.js`, `auth.js` |
| Parth | `editor.js`, `courses.js`, `flashcards.js` |
| Kelvin | `assignments.js`, `studyPlanner.js` |
| Sahil | `examMode.js`, `analytics.js` |
| Everyone | `main.js`, `state.js`, `sidebar.js` |

---

## If you ask about AI tools

We used ChatGPT / Cursor sometimes to fix bugs or CSS — same as asking a friend or Stack Overflow.

The parts we demo are code we can walk through line by line: course dropdown saves to `state.js`, Kanban columns, dashboard filters for today, exam prep parsing `##` from note text.

We kept the editor as a textarea so we can actually explain it in class. The AI chat feature isn't built — that's August.

---

## Example: Parth explaining `editor.js`

1. We build HTML as a string and drop it in with `container.innerHTML`
2. Courses come from `utils/courses.js` — our real semester list
3. On `input` / `change` we call `onUpdatePage()` → saves to `state.js` → `localStorage`
4. Flashcards read the same text (`##` and `•`) — no separate database

---

## Why the repo looks bigger than it is

- Old CSS and unused utils are still in the repo from earlier experiments
- `seedDemo.js` loads sample assignments + calendar on first open (no default notes)
- 9 epic screens exist as UI shells even if the logic is thin

---

[← Main README](../README.md) · [Progress](./project_progress_tracker.md) · [Files](./FILES.md)
