# TaskScape — Notion-Style Workspace

A collaborative vanilla JavaScript project that replicates a **Notion-like workspace**: sidebar navigation, home dashboard, block-based page editor, Calendar Plus, and CodeFusion AI panel. Built with **Vite** and **Tailwind CSS v4**.

## Team Members

| # | Name | Student ID |
|---|------|------------|
| 1 | **Parth Patel** | N01779255 |
| 2 | **Sahil Maniya** | N01769967 |
| 3 | **Kelvin Idoko** | N01777723 |
| 4 | **Dhruv Patel** | N10015893 |

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## Project Structure

```
MY PROJECT/
├── index.html              # HTML entry point
├── main.js                 # App bootstrap & render orchestration
├── vite.config.js          # Vite + Tailwind configuration
├── package.json
├── components/
│   ├── sidebar.js          # Left sidebar (pages, search, nav)
│   ├── topbar.js           # Top navigation bar
│   ├── editor.js           # Notion-style page editor
│   ├── home.js             # Home dashboard
│   ├── auth.js             # Login / signup screen
│   ├── calendar.js         # Calendar Plus view
│   └── codefusion.js       # CodeFusion AI side panel
├── supabase/
│   └── schema.sql          # Database schema (run in Supabase SQL Editor)
├── styles/
│   └── styles.css          # Tailwind + Notion-style design tokens
└── utils/
    ├── supabase.js         # Supabase client
    ├── db.js               # Cloud CRUD + realtime subscriptions
    ├── state.js            # Central app state & page CRUD
    ├── persistence.js      # localStorage save/load
    ├── slashMenu.js        # "/" block command menu
    ├── blockEditor.js      # Block handles, Enter/Backspace logic
    ├── covers.js           # Page cover gradients
    └── calendar.js         # Calendar events & grid logic
```

---

## Features

- **User authentication** — email/password login & signup via Supabase Auth
- **Cloud sync** — pages and calendar events saved to Supabase with realtime updates
- **Nested sub-pages** — create pages inside pages (Notion-style tree in sidebar)
- **Home dashboard** — greeting, recently visited pages, favorites, quick actions
- **Block editor** — cover image, page icon, slash commands (`/`), to-do checkboxes, callouts
- **Calendar Plus** — monthly grid, event add/delete, synced to cloud
- **CodeFusion AI** — side panel with quick actions (Gemini API planned)
- **Demo mode** — works offline with localStorage when Supabase is not configured
- **Responsive** — mobile sidebar drawer, adaptive layout

---

## Supabase Setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New Project.

### 2. Run the database schema
Open **SQL Editor** in your Supabase dashboard and paste the contents of `supabase/schema.sql`, then click **Run**.

### 3. Enable Email Auth
In **Authentication → Providers**, ensure **Email** is enabled.

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` with your project values from **Settings → API**:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Restart the dev server
```bash
npm run dev
```

You will see the login screen. Create an account or log in — your workspace syncs across devices automatically.

> **Without Supabase:** The app opens in demo mode using localStorage only. Click **Continue in demo mode** on the auth screen.

---

## Division of Work

### 1. Kelvin Idoko — Project Setup & Build Environment

| Task | Details |
|------|---------|
| Vite project initialization | Created `package.json`, installed Vite v6, configured `vite.config.js` |
| Tailwind CSS v4 setup | Integrated `@tailwindcss/vite` plugin and `styles.css` with `@import 'tailwindcss'` |
| HTML entry point | Built `index.html` with meta tags, Google Fonts link, and app mount point |
| Dev scripts | Configured `npm run dev`, `npm run build`, and `npm run preview` |
| Environment troubleshooting | Resolved Node.js not being installed / not on PATH so the team could run the project |
| `.gitignore` | Excluded `node_modules/`, `dist/`, and local env files |

**Files:** `index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`

---

### 2. Dhruv Patel — State Management & App Architecture

| Task | Details |
|------|---------|
| Central state module | Built `utils/state.js` with pages array, active page, sidebar, and view switching |
| Page CRUD | Implemented create, update, delete, favorite toggle, and search filter |
| View routing | Managed `activeView` for Home, Page editor, and Calendar Plus |
| localStorage persistence | Created `utils/persistence.js` to auto-save pages and settings on every change |
| Calendar state | Built `utils/calendar.js` for month navigation, events, and date grid |
| App orchestration | Wired `main.js` to subscribe to state and render sidebar, topbar, editor, home, and calendar |
| Toast notifications | Added user feedback for save, delete, and event actions |

**Files:** `main.js`, `utils/state.js`, `utils/persistence.js`, `utils/calendar.js`

---

### 3. Sahil Maniya — UI Components & Navigation

| Task | Details |
|------|---------|
| Sidebar | Workspace header, search input, quick links (Home, Inbox, Calendar Plus), page list with favorite/delete actions |
| Top bar | Breadcrumb with page icon, edited time, Share button, CodeFusion trigger, mobile menu toggle |
| Home dashboard | Greeting header, recently visited cards with cover previews, favorites list, quick actions, keyboard tips |
| Calendar Plus UI | Full calendar grid, event list for selected date, add/delete events, upcoming events sidebar |
| CodeFusion panel | AI side drawer with quick actions (summarize, improve, expand, tasks), message history, prompt input |
| Mobile responsiveness | Sidebar drawer, backdrop overlay, and collapsed layout for small screens |

**Files:** `components/sidebar.js`, `components/topbar.js`, `components/home.js`, `components/calendar.js`, `components/codefusion.js`

---

### 4. Parth Patel — Block Editor, Styling & Documentation

| Task | Details |
|------|---------|
| Page editor | Cover image picker, icon picker, editable title, properties row, content area |
| Slash command menu | Grouped `/` menu (Basic blocks, Media, AI) with keyboard navigation (↑ ↓ Enter Esc) |
| Block system | Block gutter handles (+ and drag), Enter for new block, Backspace to remove empty blocks |
| Block types | Text, H1–H3, bullet/numbered lists, to-do, quote, divider, callout, toggle, code, calendar embed |
| Content serialization | Convert between HTML blocks and plain-text storage format in `blockEditor.js` |
| Notion-style design | Colors (`#f7f6f3` sidebar, `#37352f` text), typography, spacing, hover states in `styles.css` |
| Cover gradients | `utils/covers.js` with 9 gradient presets |
| README | Project documentation, team division, and problem log |

**Files:** `components/editor.js`, `utils/slashMenu.js`, `utils/blockEditor.js`, `utils/covers.js`, `styles/styles.css`, `README.md`

---

## Problems Faced & Solutions

### Problem 1: `npm` command not recognized

**What happened:** Running `npm run dev` failed with *"npm is not recognized as the name of a cmdlet"*. Node.js was not installed on the machine.

**How we solved it:**
1. Checked if Node.js existed using `where.exe node` — it did not.
2. Temporarily served the old `dist/` folder using Python: `py -m http.server 5173`
3. Installed Node.js LTS via winget: `winget install OpenJS.NodeJS.LTS`
4. Refreshed PATH and ran `npm install` then `npm run dev` successfully.

**Lesson:** Always verify Node.js is installed before starting a Vite project. Use `node -v` and `npm -v` to confirm.

---

### Problem 2: Project folder path contains spaces

**What happened:** The project lives in `d:\ITS\SEM-2\JAVA SCRIPT\MY PROJECT`. Some terminal commands failed or behaved unexpectedly because of spaces in the path.

**How we solved it:**
- Always wrap the path in quotes when running commands: `"d:\ITS\SEM-2\JAVA SCRIPT\MY PROJECT"`
- Set the working directory explicitly before running `npm` commands instead of `cd`-ing with unquoted paths.

**Lesson:** Avoid spaces in folder names for dev projects when possible, or always quote paths in scripts.

---

### Problem 3: Full page re-render loses editor cursor position

**What happened:** Every state change called `renderApp()` which replaced the entire DOM with `innerHTML`. While typing in the editor, any sidebar click or auto-save caused the page to re-render and the cursor jumped to the start.

**How we solved it:**
- Used `{ silent: true }` on `updateActivePage()` during typing so `notify()` is skipped and no re-render happens on every keystroke.
- Only call `persist()` (localStorage save) silently without triggering a full UI refresh.
- Full re-render only happens on navigation, page switch, or structural changes.

**Lesson:** Separate *data persistence* from *UI re-rendering* in state-driven vanilla JS apps.

---

### Problem 4: Slash menu (`/`) not appearing inside blocks

**What happened:** The slash menu only detected `/` when the cursor was in a direct `TEXT_NODE`. If the user typed inside a nested element (e.g. a `<li>` or `<span>` inside a callout), the menu did not open.

**How we solved it:**
- Improved `getSlashContext()` in `slashMenu.js` to walk up the DOM tree and find the nearest text node at the cursor offset.
- Positioned the menu relative to `.editor-content-wrap` instead of the raw content element for correct placement when scrolling.

**Lesson:** `contenteditable` editors have complex DOM trees — always test slash commands inside lists, callouts, and nested blocks.

---

### Problem 5: Block content lost on page switch

**What happened:** Early versions stored only `innerText` of the whole editor. Switching pages and coming back lost formatting (headings, lists, to-do states).

**How we solved it:**
- Built `serializeBlocks()` in `blockEditor.js` to convert each block type to a plain-text format (e.g. `# Heading`, `☐ Task`, `---` for divider).
- Built `buildEditorHtml()` in `editor.js` to parse that format back into styled HTML blocks on load.
- Wrapped each block in a `.block-outer` container with gutter handles for a Notion-like editing experience.

**Lesson:** Never store rich content as raw `innerHTML` if you need portability — use a structured serialization format.

---

### Problem 6: Tailwind v4 configuration differences

**What happened:** Tailwind CSS v4 uses `@import 'tailwindcss'` and `@theme {}` in CSS instead of a separate `tailwind.config.js`. Initial setup failed because we followed v3 tutorials.

**How we solved it:**
- Removed `tailwind.config.js` and `postcss.config.js`
- Added `@tailwindcss/vite` plugin directly in `vite.config.js`
- Defined design tokens in `styles.css` using `@theme { --color-sidebar: #f7f6f3; ... }`

**Lesson:** Always check the major version docs — Tailwind v4 has a different setup than v3.

---

### Problem 7: Old `dist/` build showing outdated UI

**What happened:** After making changes, opening the app via Python's `http.server` on the `dist/` folder still showed the old UI because we had not rebuilt.

**How we solved it:**
- Run `npm run build` after major changes to update `dist/`
- For development, always use `npm run dev` (Vite dev server with hot reload) instead of serving `dist/` manually.

**Lesson:** `dist/` is a snapshot — it only updates when you run `npm run build`.

---

## Design System

| Token | Value |
|-------|-------|
| Sidebar width | 240px |
| Editor max width | 720px |
| Sidebar background | `#f7f6f3` |
| Text color | `#37352f` |
| Muted text | `#9b9a97` |
| Border | `#e9e9e7` |
| Font | System sans-serif stack (Notion-like) |

---

## Remaining Future Work

- CodeFusion connected to Gemini API
- Drag-and-drop block reordering
- Real-time collaborative cursors (multi-user editing)
- Page sharing between users
