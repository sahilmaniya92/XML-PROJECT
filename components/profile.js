import { COURSES } from '../utils/courses.js'
import { escapeHtml, escapeAttr } from '../utils/shared.js'

export function renderProfile(container, { profile, user, onSave, onUploadSyllabus, onGoogleSignIn, onBack }) {
  container.innerHTML = `
    <div class="ws-view ws-view-narrow">
      <header class="ws-hero ws-hero-compact">
        <button type="button" class="ws-back" data-action="back">← Dashboard</button>
        <h1 class="ws-title">Account & profile</h1>
        <p class="ws-lead">Update your details and import syllabus deadlines.</p>
      </header>

      <form class="ws-form" id="profile-form">
        <section class="ws-panel">
          <h2 class="ws-panel-title">Sign in</h2>
          ${
            user
              ? `<p class="ws-signed-in">Signed in as <strong>${escapeHtml(user.email)}</strong></p>`
              : `
          <div class="ws-form-row">
            <button type="button" class="ws-btn ws-btn-google" data-action="google">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22 12c0-.68-.06-1.37-.17-2H12v3.77h5.92A5.08 5.08 0 0112 19.17v3h7.56A10 10 0 0022 12z"/><path fill="#34A853" d="M12 23a10 10 0 007.56-2.44l-3.7-3h-5.86v3.77A5.08 5.08 0 016 19.17z"/><path fill="#FBBC05" d="M6 14.09V10.23H12v3.86H6z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10 10 0 002 12h4.09V8.14H12V5.38z"/></svg>
              Continue with Google
            </button>
            <p class="ws-hint">Or use email sign-in from the sidebar.</p>
          </div>`
          }
        </section>

        <section class="ws-panel">
          <h2 class="ws-panel-title">Academic profile</h2>
          <label class="ws-field">
            <span>Full name</span>
            <input type="text" name="name" value="${escapeAttr(profile.name)}" placeholder="Your name" />
          </label>
          <label class="ws-field">
            <span>University</span>
            <input type="text" name="university" value="${escapeAttr(profile.university)}" placeholder="e.g. Humber College" />
          </label>
          <label class="ws-field">
            <span>Semester</span>
            <input type="text" name="semester" value="${escapeAttr(profile.semester)}" placeholder="e.g. Winter 2026" />
          </label>
          <label class="ws-field">
            <span>Enrolled courses</span>
            <select name="courses" multiple class="ws-select-multi">
              ${COURSES.map(
                (c) =>
                  `<option value="${escapeAttr(c)}" ${profile.courses?.includes(c) ? 'selected' : ''}>${escapeHtml(c)}</option>`
              ).join('')}
            </select>
            <span class="ws-hint">Hold Ctrl to select multiple</span>
          </label>
          <button type="submit" class="ws-btn ws-btn-primary">Save profile</button>
        </section>

        <section class="ws-panel">
          <h2 class="ws-panel-title">Syllabus upload</h2>
          <p class="ws-hint">Paste course outline text — dates are extracted automatically.</p>
          <textarea name="syllabus" class="ws-textarea" rows="8" placeholder="xml/Js — Week 1: Jan 12 Intro&#10;DSA — Exam: Mar 15&#10;Project due: 4/10">${escapeHtml(profile.syllabusText || '')}</textarea>
          <button type="button" class="ws-btn" data-action="parse-syllabus">Parse dates → calendar</button>
        </section>
      </form>
    </div>
  `

  container.querySelector('[data-action="back"]')?.addEventListener('click', onBack)
  container.querySelector('[data-action="google"]')?.addEventListener('click', onGoogleSignIn)
  container.querySelector('[data-action="parse-syllabus"]')?.addEventListener('click', () => {
    const text = container.querySelector('[name="syllabus"]')?.value ?? ''
    onUploadSyllabus(text)
  })

  container.querySelector('#profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const form = e.target
    const selected = [...form.courses.selectedOptions].map((o) => o.value)
    onSave({
      name: form.name.value.trim(),
      university: form.university.value.trim(),
      semester: form.semester.value.trim(),
      courses: selected,
      syllabusText: form.syllabus.value,
    })
  })
}
