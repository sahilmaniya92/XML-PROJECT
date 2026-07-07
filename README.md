# Student Workspace — 4-Week MVP

Simple academic app: notes, today's dashboard, assignments, flashcards, calendar.  
Data saves in **browser localStorage**. Sign in to sync one JSON row to **Supabase**.

## How it works (simple)

1. **Open app** → you land on **Today** (dashboard).
2. **Sidebar** → pick a screen (Assignments, Flashcards, etc.) or click a **note** to edit.
3. **Notes** → type like a doc. Pick **Course** + **Lecture** so notes stay organized.
4. **Assignments** → Kanban board: To do → In progress → Done.
5. **Sign in** (optional) → same data copies to Supabase `workspaces` table.

No AI assistant in this version — just plain JS screens and local data.

## Epic coverage

| Epic | Feature | Sidebar |
|------|---------|---------|
| 1 | Profile, Google sign-in, syllabus parse | Profile |
| 2 | Today's dashboard, progress | **Today** |
| 3 | Rich notes + course/lecture link | Notes list |
| 5 | Assignment Kanban | **Assignments** |
| 6 | Weekly study plan generator | **Study planner** |
| 7 | Flashcards + spaced repetition | **Flashcards** |
| 8 | One-click exam prep | **Exam prep** |
| 9 | Study hours chart | **Analytics** |

## Team READMEs

| Person | File |
|--------|------|
| Dhruv Patel | [README-DHRUV.md](./README-DHRUV.md) |
| Sahil Maniya | [README-SAHIL.md](./README-SAHIL.md) |
| Parth Patel | [README-PARTH.md](./README-PARTH.md) |
| Kelvin Idoko | [README-KELVIN.md](./README-KELVIN.md) |

**Progress tracker:** [project_progress_tracker.md](./project_progress_tracker.md)

## One demo per person

| Person | User story | Click here |
|--------|------------|------------|
| **Dhruv** | View today's schedule | **Today** |
| **Parth** | Notes linked to course + lecture | **xml/Js — XML & JavaScript lecture** |
| **Sahil** | Exam prep from open note | **Exam prep** → activate |
| **Kelvin** | Kanban assignment tracking | **Assignments** → move cards |

> First open loads demo data (lecture note, today's events, assignments).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)
