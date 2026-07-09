import { getFilteredPages, getState, getDueFlashcards } from '../utils/state.js'

const NAV = [
  { section: 'Workspace' },
  { id: 'home', label: 'Today', icon: navIcon('today') },
  { section: 'Academics' },
  { id: 'assignments', label: 'Assignments', icon: navIcon('board') },
  { id: 'planner', label: 'Study planner', icon: navIcon('plan') },
  { id: 'flashcards', label: 'Flashcards', icon: navIcon('cards'), badge: 'due' },
  { id: 'exam', label: 'Exam prep', icon: navIcon('exam') },
  { section: 'Tools' },
  { id: 'ai', label: 'AI', icon: navIcon('chat') },
  { id: 'analytics', label: 'Analytics', icon: navIcon('chart') },
  { id: 'calendar', label: 'Calendar', icon: navIcon('cal') },
]

const PAGE_SECTIONS = [
  { kind: 'todo', label: 'Todo lists' },
  { kind: 'note', label: 'Notes' },
  { kind: 'journal', label: 'Journal' },
]

export function renderSidebar(container, handlers) {
  const state = getState()
  const { activePageId, searchQuery, activeView } = state
  const pages = getFilteredPages()
  const dueCount = getDueFlashcards('All').length

  container.innerHTML = `
    <div class="sw-sidebar">
      <div class="sw-brand">
        <span class="sw-brand-mark">HC</span>
        <div class="sw-brand-text">
          <span class="sw-brand-name">Student Workspace</span>
          <span class="sw-brand-sub">MVP · XML/JS project</span>
        </div>
      </div>

      <p class="sw-mvp-tag">4 demos ready · 5 screens partial · AI not built yet</p>

      <div class="sw-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
        <input type="search" class="sw-search-input" placeholder="Search pages…" value="${escape(searchQuery)}" />
      </div>

      <nav class="sw-nav">
        ${NAV.map((item) => {
          if (item.section) return `<p class="sw-nav-label">${item.section}</p>`
          const active = activeView === item.id || (item.id === 'home' && activeView === 'home')
          const badge = item.badge === 'due' && dueCount ? `<span class="sw-badge">${dueCount}</span>` : ''
          return `
          <button type="button" class="sw-nav-item ${active ? 'is-active' : ''}" data-view="${item.id}">
            ${item.icon}
            <span>${item.label}</span>
            ${badge}
          </button>`
        }).join('')}
      </nav>

      <div class="sw-pages">
        <div class="sw-pages-head">
          <p class="sw-nav-label">Your pages</p>
          <div class="sw-add-row">
            <button type="button" class="sw-add-btn" data-action="new-todo" title="New todo list">+ Todo</button>
            <button type="button" class="sw-add-btn" data-action="new-note" title="New note">+ Note</button>
            <button type="button" class="sw-add-btn" data-action="new-journal" title="New journal">+ Journal</button>
          </div>
        </div>

        ${
          pages.length
            ? PAGE_SECTIONS.map((section) => pageSection(section, pages, activePageId, activeView)).join('')
            : `<p class="sw-empty sw-empty-pages">No pages yet — use + Todo, + Note, or + Journal above.</p>`
        }
      </div>

      <footer class="sw-footer">
        <p class="sw-team">Dhruv · Parth · Kelvin · Sahil</p>
        <button type="button" class="sw-footer-btn" data-action="profile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
          Profile
        </button>
        <button type="button" class="sw-footer-btn" data-action="auth">${state.user ? 'Account' : 'Sign in'}</button>
        ${state.user ? '<button type="button" class="sw-footer-btn sw-footer-muted" data-action="sign-out">Sign out</button>' : ''}
      </footer>
    </div>
  `

  container.querySelector('.sw-search-input')?.addEventListener('input', (e) => handlers.onSearch(e.target.value))

  const viewMap = {
    home: handlers.onOpenHome,
    assignments: handlers.onOpenAssignments,
    planner: handlers.onOpenPlanner,
    flashcards: handlers.onOpenFlashcards,
    exam: handlers.onOpenExam,
    ai: handlers.onOpenAi,
    analytics: handlers.onOpenAnalytics,
    calendar: handlers.onOpenCalendarPlus,
  }

  container.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => viewMap[btn.dataset.view]?.())
  })

  container.querySelectorAll('[data-page-id]').forEach((btn) => {
    btn.addEventListener('click', () => handlers.onSelectPage(btn.dataset.pageId))
  })

  container.querySelector('[data-action="profile"]')?.addEventListener('click', handlers.onOpenProfile)
  container.querySelector('[data-action="new-todo"]')?.addEventListener('click', () => handlers.onNewPage('todo'))
  container.querySelector('[data-action="new-note"]')?.addEventListener('click', () => handlers.onNewPage('note'))
  container.querySelector('[data-action="new-journal"]')?.addEventListener('click', () => handlers.onNewPage('journal'))
  container.querySelector('[data-action="auth"]')?.addEventListener('click', handlers.onOpenAuth)
  container.querySelector('[data-action="sign-out"]')?.addEventListener('click', () => handlers.onSignOut?.())
}

function pageSection({ kind, label }, pages, activePageId, activeView) {
  const items = pages.filter((p) => (p.kind ?? 'note') === kind)
  if (!items.length) return ''
  return `
    <div class="sw-page-group">
      <p class="sw-page-group-label">${label}</p>
      <div class="sw-notes-list">
        ${items.map(pageRow(activePageId, activeView)).join('')}
      </div>
    </div>`
}

function pageRow(activePageId, activeView) {
  return (page) => `
    <button type="button" class="sw-note-item ${page.id === activePageId && activeView === 'page' ? 'is-active' : ''}" data-page-id="${page.id}">
      <span class="sw-note-icon">${page.icon || '📄'}</span>
      <span class="sw-note-text">
        <span class="sw-note-title">${escape(page.title)}</span>
        ${page.kind === 'note' && page.course ? `<span class="sw-note-course">${escape(page.course)}</span>` : ''}
      </span>
    </button>`
}

function navIcon(type) {
  const icons = {
    today: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></svg>',
    board: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="15" rx="1"/></svg>',
    plan: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h10M4 18h6"/></svg>',
    cards: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h6"/></svg>',
    exam: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9 4v6c0 5-4 8-9 8s-9-3-9-8V7l9-4z"/></svg>',
    chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z"/></svg>',
    chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5M10 19V9M16 19v-6M22 19V3"/></svg>',
    cal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  }
  return icons[type] ?? ''
}

function escape(v) {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
