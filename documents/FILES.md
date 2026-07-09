## Team

| Person | ID | Epics | Main files |
|--------|-----|-------|------------|
| Dhruv | N10015893 | 1, 2 | `dashboard.js`, `profile.js`, `auth.js` |
| Parth | N01779255 | 3, 7 | `editor.js`, `courses.js`, `flashcards.js` |
| Kelvin | N01777723 | 5, 6 | `assignments.js`, `studyPlanner.js`, `planner.js` |
| Sahil | N01769967 | 8, 9 | `examMode.js`, `analytics.js` |
| Team | — | 4 | `ai.js` |
| Everyone | — | — | `main.js`, `state.js`, `sidebar.js`, `topbar.js`, `styles.css` |

---

## Components

| File | Who | Epic | Needs |
|------|-----|------|-------|
| `dashboard.js` | Dhruv | 2 | `state.js`, `shared.js` |
| `profile.js` | Dhruv | 1 | `courses.js`, `state.js` |
| `auth.js` | Dhruv | 1 | `state.js`, `supabase.js` |
| `calendar.js` | Dhruv | — | `calendar.js` utils, `state.js` |
| `editor.js` | Parth | 3 | `courses.js`, `state.js` |
| `flashcards.js` | Parth | 7 | `flashcards.js` utils, `state.js` |
| `assignments.js` | Kelvin | 5 | `courses.js`, `state.js` |
| `studyPlanner.js` | Kelvin | 6 | `planner.js`, `state.js` |
| `examMode.js` | Sahil | 8 | `flashcards.js` utils, `state.js` |
| `analytics.js` | Sahil | 9 | `state.js` |
| `ai.js` | Team | 4 | `state.js` (shell only) |
| `sidebar.js` | Shared | — | `state.js` |
| `topbar.js` | Shared | — | `state.js` |
| `modal.js` | Shared | — | used from `main.js` |

---

## Utils

| File | Who | What it does |
|------|-----|--------------|
| `state.js` | Shared — be careful | All app data, navigation, save/load |
| `persistence.js` | Shared | localStorage |
| `seedDemo.js` | Shared | Demo assignments + calendar on first open |
| `shared.js` | Shared | `escapeHtml`, date helpers |
| `courses.js` | Parth | Our semester course list |
| `flashcards.js` | Parth | Parse notes → cards, spaced repetition |
| `planner.js` | Kelvin | Weekly plan generator |
| `syllabus.js` | Dhruv | Syllabus text → dates |
| `calendar.js` | Dhruv | Month grid |
| `supabase.js` | Shared | Supabase client |
| `supabaseSync.js` | Shared | Cloud save one JSON workspace |

---

## Planning docs (this folder)

`user_stories.md`, `project_progress_tracker.md`, `mosco_timeline.md`, `FOR_PROFESSOR.md`, `FILES.md` — whole team

---

## Old files — ignore on `parth`

| File | Note |
|------|------|
| `codefusion.js` | Deleted |
| `home.js` | Deleted |
| `blockEditor.js` | Not imported |
| `slashMenu.js` | Not imported |
| `covers.js` | Not imported |

---

## How data flows (simplified)

```
index.html → main.js
  → sidebar, topbar, screens (dashboard, editor, etc.)
  → state.js
      → persistence.js (localStorage)
      → seedDemo.js
      → supabaseSync.js (optional)
```

**Parth's note path:**
```
editor.js → courses.js, shared.js
onUpdatePage() → state.js → localStorage
```

**Kelvin's Kanban:**
```
assignments.js → state.js (addAssignment, moveAssignment)
```

**Sahil's exam:**
```
examMode.js → flashcards.js utils → reads open page from state.js
```

---

## Rules we agreed on

1. Change your own component first before touching `state.js`
2. Message the group before adding new fields to `state.js`
3. Don't change `courses.js` without asking Parth — whole app uses it
4. Keep the simple textarea editor on `parth` — don't bring back block editor

---

## Who to ask

| Changing… | Ask |
|-----------|-----|
| Editor, + Note / + Todo / + Journal | Parth |
| Course list | Parth |
| Flashcards or exam card parsing | Parth + Sahil |
| Kanban or planner | Kelvin |
| Dashboard, profile, sign-in | Dhruv |
| Analytics charts | Sahil |
| AI screen | Team |
| Sidebar, main.js, big CSS changes | Whoever's online |

---

[← Main README](../README.md) · [For professor](./FOR_PROFESSOR.md) · [Progress](./project_progress_tracker.md)
