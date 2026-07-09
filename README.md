# Student Workspace

Group project for XML & JavaScript — Humber College, summer 2026.

We built a small academic app: notes, a today dashboard, assignments, flashcards, calendar. Data saves in the browser (`localStorage`). You can sign in with Supabase to sync one JSON row to the cloud.

**Where we're at:** 4 features work well enough to demo (one each). A few more screens exist but aren't finished. AI is just a placeholder page for now.

More detail for the professor: [FOR_PROFESSOR.md](./documents/FOR_PROFESSOR.md)

## What's actually done vs not

| | What |
|---|------|
| Works for demo | Today dashboard (Dhruv), notes + course link (Parth), Kanban (Kelvin), exam prep (Sahil) |
| Started but rough | Profile, study planner, flashcards, analytics |
| Not built yet | AI chat (whole team — screen only) |

We have 9 sidebar links because our story map has 9 epics. That doesn't mean all 9 are done.

## How to use the app

1. Open app → lands on **Today**
2. Sidebar → pick a screen or click a page under Notes / Todo / Journal
3. **+ Note** → pick course + lecture, type in the textarea
4. **Assignments** → drag cards between To do / In progress / Done
5. Sign in (optional) → data copies to Supabase

## Who owns what

| Epic | Feature | Sidebar | Person |
|------|---------|---------|--------|
| 1 | Profile, sign-in, syllabus | Profile | Dhruv |
| 2 | Today's dashboard | Today | Dhruv |
| 3 | Notes + course/lecture | + Note | Parth |
| 4 | AI assistant | AI | Whole team |
| 5 | Assignment Kanban | Assignments | Kelvin |
| 6 | Study planner | Study planner | Kelvin |
| 7 | Flashcards | Flashcards | Parth |
| 8 | Exam prep | Exam prep | Sahil |
| 9 | Analytics | Analytics | Sahil |

## Team docs

| Person | Guide |
|--------|-------|
| Dhruv Patel | [README-DHRUV.md](./documents/README-DHRUV.md) |
| Parth Patel | [README-PARTH.md](./documents/README-PARTH.md) |
| Kelvin Idoko | [README-KELVIN.md](./documents/README-KELVIN.md) |
| Sahil Maniya | [README-SAHIL.md](./documents/README-SAHIL.md) |

Also: [progress tracker](./documents/project_progress_tracker.md) · [user stories](./documents/user_stories.md) · [timeline](./documents/mosco_timeline.md) · [file map](./documents/FILES.md)

## Demo cheat sheet (one per person)

| Person | Click this | Show this |
|--------|------------|-----------|
| Dhruv | **Today** | Today's events, due stuff, stats |
| Parth | **+ Note** | Course dropdown, lecture field, textarea saves |
| Kelvin | **Assignments** | Move a card across columns |
| Sahil | **Exam prep** | Activate on an open note |
| Everyone | **AI** | Coming soon screen — not wired yet |

First open loads some demo assignments and calendar events. No default notes — you create your own with + Note.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173
