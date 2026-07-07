# Parth Patel — Notes & Flashcards

| | |
|---|---|
| **Student ID** | N01779255 |
| **Epics** | 3 (Notes), 7 (Flashcards) |

---

## Your #1 user story (demo this)

### Epic 3 — Organize notes: auto-link to course and lecture

> *"As a student, every note is auto-linked to its course and lecture so I don't manually tag files."*

**30-second demo**

1. Sidebar → open **xml/Js — XML & JavaScript lecture**
2. Point at the blue bar: **Linked to xml/Js · Week 3 — XML, DOM & JSON**
3. Show **Course** dropdown + **Lecture** field (change course → saves automatically)
4. Type under `## Key concepts` to prove editing works
5. Sidebar shows **xml/Js** badge next to the note name

**Files you own:** `components/editor.js`, `utils/courses.js`, `components/modal.js` (lecture template)

---

## Backup story (Epic 7)

**Generate flashcards from notes** → Sidebar → Flashcards → **Generate from open note** → **Review due**

---

## Technical notes

- Notes stored as plain text with `##` headings and `•` bullets
- `course` + `lecture` fields on each page object in `state.js`
- New pages inherit the active course automatically

---

[← Main README](./README.md)
