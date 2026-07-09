# Kelvin Idoko — Assignments & Planner

| | |
|---|---|
| **Student ID** | N01777723 |
| **My Contributions** | Epic 5 (Assignments), Epic 6 (Study Planner) |

---

# My Tasks

## Epic 5 — Assignment Tracking Kanban Board

> *"As a student, I update task completion using a Kanban board (To do → In progress → Done)."*

### Task Description
I was responsible for developing the Assignment Tracker feature, which allows students to create, organize, and track assignment progress through a Kanban board workflow.

### Files Worked On
- `components/assignments.js`
- `utils/state.js`

### How I Planned to Finish It

#### Completed So Far:
- Designed and implemented the Assignment Kanban board interface.
- Created three assignment progress columns:
  - To do
  - In progress
  - Done
- Added the ability to create new assignments with:
  - Assignment title
  - Course selection
  - Due date
- Implemented functionality to move assignments between different progress stages.
- Added the ability to delete assignments.
- Added due date tracking and urgency indicators for assignments approaching deadlines.
- Connected assignment functionality with the application state system.
- Ensured assignment updates are saved using the existing persistence structure.

#### How I Intend to Complete It:
- Perform final testing to ensure all assignment functions work correctly.
- Verify that assignment data remains consistent after refreshing the application.
- Make final UI improvements and adjustments where necessary.
- Ensure smooth interaction between assignments and the Study Planner feature.

### Status

**Completed**

The Assignment Tracker feature has been successfully implemented and integrated into the application.

---

# Epic 6 — Study Planner

> *"As a student, I can generate a weekly study plan based on my assignments and courses."*

### Task Description
I was responsible for implementing the Study Planner feature, which displays a generated weekly study schedule based on available study sessions.

### Files Worked On
- `components/planner.js`
- `utils/state.js`

### How I Planned to Finish It

#### Completed So Far:
- Created the Study Planner interface.
- Added a weekly schedule layout organized by days of the week:
  - Monday
  - Tuesday
  - Wednesday
  - Thursday
  - Friday
  - Saturday
  - Sunday
- Added the "Generate week" feature to create a study schedule.
- Implemented display of study sessions containing:
  - Study time
  - Course information
  - Session title
  - Duration
- Added sorting functionality to display study sessions in the correct order.
- Connected the planner with application state management.
- Added an empty state message when no study plan has been generated.

#### How I Intend to Complete It:
- Improve the study plan generation logic.
- Ensure assignments are properly considered when creating schedules.
- Test the relationship between assignment deadlines and generated study sessions.
- Verify data persistence and overall functionality.
- Apply final UI improvements.

### Status

**In Progress**

The Study Planner interface and functionality have been implemented. Further improvements and testing are still required before final completion.

---

# Resources Used

### Development Tools
- JavaScript ES6 modules
- Vite development environment
- HTML/CSS
- Browser developer tools
- Cursor AI Agent for code assistance, debugging, and improving implementation workflow
- ChatGPT for code explanations, troubleshooting, documentation support, and development guidance

### Project Resources
- Existing application state management (`utils/state.js`)
- Shared utility functions:
  - `escapeHtml()`
  - `formatDate()`
  - `formatTime()`
- Course data from `courses.js`
- Existing project components and structure

### Application Features Used
- Local storage persistence
- Application state updates
- Existing assignment and course data models
- Dynamic HTML rendering
