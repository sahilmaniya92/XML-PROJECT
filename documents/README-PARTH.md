# Parth — Notes & Flashcards

| | |
|---|---|
| **ID** | N01779255 |
| **Epics** | 3 (notes), 7 (flashcards) |

---

## My demo (Epic 3)

User story: *every note links to a course and lecture so I don't have to tag files myself.*

Steps (~30 sec):

1. Sidebar → **+ Note**
2. Pick **Course** (xml/Js) and type **Lecture** (e.g. Week 3 — XML)
3. Orange bar shows: Linked to xml/Js · Week 3…
4. Type under `## Key concepts` in the textarea
5. Note shows in sidebar under **Notes** with the course name

Also built: **+ Todo** (checkbox lines with ☐) and **+ Journal** (free writing, no course).

**My files:** `components/editor.js`, `utils/courses.js`

---

## Backup demo (Epic 7 — not fully done)

Sidebar → **Flashcards** → generate from open note → review due cards.

Reads `##` for question and `•` for answer from the same note text. Still has bugs (duplicates if you generate too many times).

**Also mine:** `components/flashcards.js`, `utils/flashcards.js`

---

## How it works (short)

- Plain `<textarea>` — we removed the Notion-style block editor so the code is ~130 lines
- `course` and `lecture` live on each page object in `state.js`
- Saves on every keystroke through `onUpdatePage()`

---

## Epic 4 (AI)

Team thing. I might help with note context for prompts later. Screen is in `ai.js` — not connected yet.

Team notes: [FOR_PROFESSOR.md](./FOR_PROFESSOR.md) · [FILES.md](./FILES.md)

---

[← Main README](../README.md)
