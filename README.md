# Student Workspace — 4-Week MVP

Simple academic app: notes, today's dashboard, assignments, flashcards, calendar.  
Data saves in **browser localStorage**. Sign in to sync one JSON row to **Supabase**.

## How it works (simple)

1. **Open app** → you land on **Today** (dashboard).
2. **Sidebar** → pick a screen (Assignments, Flashcards, etc.) or click a **note** to edit.
3. **Notes** → type like a doc. Pick **Course** + **Lecture** so notes stay organized.
4. **Assignments** → Kanban board: To do → In progress → Done.
5. **Sign in** (optional) → same data copies to Supabase `workspaces` table.

**AI (Epic 4)** → sidebar screen exists; full chat is a **whole-team** task (Gemini later).

## Epic coverage

| Epic | Feature | Sidebar | Owner |
|------|---------|---------|-------|
| 1 | Profile, Google sign-in, syllabus parse | Profile | Dhruv |
| 2 | Today's dashboard, progress | **Today** | Dhruv |
| 3 | Rich notes + course/lecture link | Notes list | Parth |
| 4 | AI assistant (UI shell) | **AI** | **Whole team** |
| 5 | Assignment Kanban | **Assignments** | Kelvin |
| 6 | Weekly study plan generator | **Study planner** | Kelvin |
| 7 | Flashcards + spaced repetition | **Flashcards** | Parth |
| 8 | One-click exam prep | **Exam prep** | Sahil |
| 9 | Study hours chart | **Analytics** | Sahil |

## Team READMEs

| Person | File |
|--------|------|
| Dhruv Patel | [README-DHRUV.md](./README-DHRUV.md) |
| Sahil Maniya | [README-SAHIL.md](./README-SAHIL.md) |
| Parth Patel | [README-PARTH.md](./README-PARTH.md) |
| Kelvin Idoko | [README-KELVIN.md](./README-KELVIN.md) |

**Progress tracker:** [project_progress_tracker.md](./project_progress_tracker.md)  
**User stories:** [user_stories.md](./user_stories.md)  
**Timeline:** [mosco_timeline.md](./mosco_timeline.md) (June → August 2026)

## One demo per person

| Person | User story | Click here |
|--------|------------|------------|
| **Dhruv** | View today's schedule | **Today** |
| **Parth** | Notes linked to course + lecture | **xml/Js — XML & JavaScript lecture** |
| **Sahil** | Exam prep from open note | **Exam prep** → activate |
| **Kelvin** | Kanban assignment tracking | **Assignments** → move cards |
| **All** | AI section (shell) | **AI** → coming soon |

> First open loads demo data (lecture note, today's events, assignments).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)
