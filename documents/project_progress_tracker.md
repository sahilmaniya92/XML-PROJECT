# Progress tracker

**Student Workspace** — updated July 8, 2026

Quick status for our group meetings.

---

## Summary

- **4 demos ready** — one per person (Dhruv, Parth, Kelvin, Sahil)
- **4 screens started** — profile, planner, flashcards, analytics (not polished)
- **1 placeholder** — AI page (team, no API yet)

All 9 epic screens exist in the sidebar. That doesn't mean all 9 work fully.

---

## By person

| Person | ID | Epic | Story | Status |
|--------|-----|------|-------|--------|
| Dhruv | N10015893 | 2 | Today's dashboard | Done |
| Dhruv | N10015893 | 1 | Profile + sign-in | Partial |
| Parth | N01779255 | 3 | Notes + course link | Done |
| Parth | N01779255 | 7 | Flashcards | Partial |
| Kelvin | N01777723 | 5 | Kanban | Done |
| Kelvin | N01777723 | 6 | Study planner | Partial |
| Sahil | N01769967 | 8 | Exam prep | Partial |
| Sahil | N01769967 | 9 | Analytics | Partial |
| Team | — | 4 | AI chat | Placeholder |

---

## Demo clicks

| Person | Click |
|--------|-------|
| Dhruv | **Today** |
| Parth | **+ Note** → set course |
| Kelvin | **Assignments** → move a card |
| Sahil | **Exam prep** → activate |
| All | **AI** → coming soon |

First open: demo assignments + calendar. No default notes.

---

## Epic details

### Done enough to demo

**Epic 2 — Today** (Dhruv)  
Schedule for today, due assignments, stat cards, progress bars.  
`components/dashboard.js`

**Epic 3 — Notes** (Parth)  
Textarea editor, course dropdown, lecture field. + Todo and + Journal too.  
`components/editor.js`, `utils/courses.js`

**Epic 5 — Assignments** (Kelvin)  
3-column Kanban, add new assignment.  
`components/assignments.js`

### Works but needs work

**Epic 1 — Profile** (Dhruv)  
Form fields, Google sign-in, syllabus paste → calendar. Supabase sync sometimes flaky.

**Epic 6 — Planner** (Kelvin)  
Generate week button makes a grid. Can't edit blocks yet.

**Epic 7 — Flashcards** (Parth)  
Generate from note text. Spaced repetition works. Bug: generating twice makes duplicates.

**Epic 8 — Exam prep** (Sahil)  
Needs a note open with `##` headings. Activate creates flashcards.

**Epic 9 — Analytics** (Sahil)  
7-day bar chart, assignment count. Manual study log.

### Not built

**Epic 4 — AI** (team)  
Screen exists, input disabled. No Gemini, no chat history. Plan for August.

Rough split when we get there:
- Dhruv — auth + Supabase for chat
- Parth — note context in prompts
- Sahil — Gemini API
- Kelvin — UI polish

---

## Extra stuff (not epics)

| Thing | Status |
|-------|--------|
| Calendar | Partial — add/delete events |
| Supabase sync | Partial — sign in to cloud save |
| Search / trash | Basic |

Old `codefusion.js` and block editor removed on `parth` branch.

---

## Stack

Vanilla JS, Vite, Tailwind v4, localStorage, Supabase optional.

---

## To do next

- [ ] Wire AI (August — whole team)
- [ ] Fix flashcard duplicates (Parth)
- [ ] Planner edit sessions (Kelvin)
- [ ] Rehearse all 4 demos before presentation

---

## Personal guides

[Dhruv](./README-DHRUV.md) · [Parth](./README-PARTH.md) · [Kelvin](./README-KELVIN.md) · [Sahil](./README-SAHIL.md)

[← Main README](../README.md)
