# Parth Patel — Notes & Flashcards

| | |
|---|---|
| **Student ID** | N01779255 |
| **Epics** | 3 (Notes), 7 (Flashcards) |
| **Branch** | `parth` — simplified student-style code |

---

## Your #1 user story (demo this)

### Epic 3 — Organize notes: auto-link to course and lecture

> *"As a student, every note is auto-linked to its course and lecture so I don't manually tag files."*

**30-second demo**

1. Sidebar → open **xml/Js — XML & JavaScript lecture**
2. Point at the blue bar: **Linked to xml/Js · Week 3 — XML, DOM & JSON**
3. Show **Course** dropdown + **Lecture** field (change course → saves automatically)
4. Type in the **text area** under `## Key concepts` — plain text, no fancy blocks
5. Sidebar shows **xml/Js** badge next to the note name

**Files you own:** `components/editor.js`, `utils/courses.js`

---

## Backup story (Epic 7)

**Generate flashcards from notes** → Sidebar → Flashcards → **Generate from open note** → **Review due**

---

## Technical notes (simple on purpose)

- Notes are **plain text** in a `<textarea>` — easy to read and explain to professor
- Use `##` for headings and `•` for bullets (flashcards read this)
- `course` + `lecture` saved on each page in `state.js`

---

## Shared — Epic 4 AI (whole team)

**AI assistant** → Sidebar → **AI** — UI shell only for now

---

[← Main README](./README.md)
