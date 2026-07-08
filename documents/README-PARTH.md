# Parth Patel — Notes & Flashcards

| | |
|---|---|
| **Student ID** | N01779255 |
| **Epics** | 3 (Notes), 7 (Flashcards) |
| **Branch** | `parth` — simplified on purpose (textarea, no block editor) |

---

## If professor asks "is this all AI?"

Say this:

1. **My part is `editor.js`** — about 100 lines, plain textarea + course dropdown.
2. We **removed** the Notion-style block editor so the code is explainable.
3. Epic 3 = when you pick a course, it saves on the page object in `state.js`.
4. Flashcards (Epic 7) only **reads** `##` and `•` from that same text — partial, not finished.

Full team honesty doc: [FOR_PROFESSOR.md](./FOR_PROFESSOR.md)  
File map (who owns what): [FILES.md](./FILES.md)

---

## Your #1 user story (demo this)

### Epic 3 — Organize notes: auto-link to course and lecture

> *"As a student, every note is auto-linked to its course and lecture so I don't manually tag files."*

**30-second demo**

1. Sidebar → click **+ Note** to create a lecture note
2. Pick **Course** (xml/Js) and type **Lecture** (e.g. Week 3 — XML)
3. Point at the orange bar: **Linked to xml/Js · Week 3…**
4. Type in the **text area** under `## Key concepts`
5. Sidebar shows the note under **Notes** with course badge

**Also try:** **+ Todo** for `☐` tasks · **+ Journal** for free writing (no course)

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

[← Main README](../README.md)
