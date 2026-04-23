Project: VibeFlow Kanban Board

Architecture:
- FE: React (JS, Zustand, @dnd-kit)
- BE: .NET 8 REST API
- DB: PostgreSQL
- Auth: JWT
- Containerization: Docker Compose

Kanban Columns (fixed order):
Backlog
Todo
In Progress
In Review
QA
Blocked
Ready For Release
Done

----------------------------------------

User Management & Authentication

- User can register (email, password).
- User can login via JWT.
- Invalid credentials rejected.
- Password stored using BCrypt.
- Auth required for all endpoints except register/login.
- Logout handled client-side by token removal.

----------------------------------------

Shared Board

- All users see same board.
- Board contains 8 columns.
- Tasks visible to all authenticated users.

Task Card Fields:
- Title (required, max 255)
- Assignee (nullable)
- Due Date (nullable)
- Created By
- Status (column)
- Order (for sorting)
- Description (optional, nullable)

----------------------------------------

Task Creation

- Only Title required.
- Default:
  - Status: Backlog
  - Assignee: null
- Created_by = logged-in user.
- New tasks appended at bottom.
- Title must be trimmed before validation.

----------------------------------------

Drag and Drop

- Move tasks across columns.
- Reorder within column.
- Persist order + status in DB.
- Changes survive refresh.
- Order must be explicitly updated for all affected tasks in column.

----------------------------------------

Assignment Management

- Assign/unassign users.
- Dropdown shows all users.
- Changes persisted.
- No assignment change if same user selected.

Assignment History:
- old_assignee_id
- new_assignee_id
- changed_by
- timestamp
- Ordered latest first

----------------------------------------

Time Logging

- Add time in decimal hours.
- Include description.
- Linked to user + task.
- Immutable (no edit/delete).
- Multiple entries allowed.
- Time must be > 0.

----------------------------------------

Reports

Route: /reports/time

Each Task shows:
- Title
- Status
- Assignee
- Total logged hours

Aggregations:
- Per task total
- Global total
- Report query must be optimized (single query aggregation, no loops).
(All aggregation handled in backend)

----------------------------------------

Backend Design

Layers:
- Controllers
- Services
- Repositories

Entities:
- User
- Task
- AssignmentHistory
- WorkLog
- All IDs must be UUID (not integers).
----------------------------------------

Docker

Services:
- frontend
- backend
- postgres

Requirements:
- docker-compose up works without errors
- App runs on http://localhost:8080
- Data persists via volume

----------------------------------------

Testing

Framework: xUnit

Required Tests:
- Time logging logic
- Assignment history creation
- Report aggregation
- Tests must be implemented alongside feature development (not after).
- Tests are mandatory for completion of each feature.
- No feature is considered complete without passing tests.
- Do not mock core business logic; test actual behavior.
- Use isolated test cases per feature.
- Build must fail if tests fail.

----------------------------------------

Acceptance Rule

All KPIs must pass.
No partial completion accepted.
Frontend must not compute business logic; backend is source of truth.
No caching layer required.
Enforce strict schema constraints (title max length, nullability).
All write operations must return updated entity state.