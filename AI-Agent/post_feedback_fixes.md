Context:
You are working on an existing production-ready Kanban board application.

Stack:
- Frontend: React (JS, Zustand, Tailwind, @dnd-kit)
- Backend: .NET 8 Web API, EF Core, PostgreSQL
- Auth: JWT + BCrypt

Rules:
- Do NOT change business logic
- Do NOT break existing KPIs (all must remain PASS)
- Do NOT refactor unrelated code
- Only implement requested improvements
- Keep implementation minimal and production-ready

----------------------------------------

Task 1: Replace Polling with Real-Time Updates

Current Issue:
- Frontend uses setInterval polling for tasks

Goal:
- Replace polling with real-time updates

Requirements:
- Use SignalR (ASP.NET Core)
- Backend:
  - Add SignalR Hub for task updates
  - Broadcast events:
    - TaskCreated
    - TaskUpdated
    - TaskMoved
    - TaskAssigned
    - WorkLogged
- Frontend:
  - Establish SignalR connection
  - Handle events and update Zustand store
  - Remove polling logic completely
- Add reconnection logic

Constraints:
- No duplicate API calls
- State must remain consistent

----------------------------------------

Task 2: Add Frontend Testing

Current Issue:
- No frontend tests

Goal:
- Add test coverage for critical UI

Requirements:
- Use Vitest + React Testing Library
- Add minimum 10 tests

Test Coverage:
- KanbanBoard:
  - renders columns
  - drag and drop behavior
- TaskModal:
  - open/close
  - assignment change
  - worklog submission
- Reports page:
  - data rendering
  - totals display

Constraints:
- Do not over-mock
- Test real behavior
- Keep tests simple and focused

----------------------------------------

Task 3: Standardize Database

Current Issue:
- SQLite in development
- PostgreSQL in production

Goal:
- Use PostgreSQL everywhere

Requirements:
- Remove SQLite config
- Update appsettings.Development.json to PostgreSQL
- Ensure migrations work
- Update Docker config if needed

Constraints:
- No schema changes
- No data loss logic

----------------------------------------

Task 4: CI/CD Pipeline

Goal:
- Automate build and test

Requirements:
- Use GitHub Actions
- Steps:
  - Install dependencies
  - Run backend tests
  - Run frontend tests
  - Build Docker images
- Keep pipeline minimal

----------------------------------------

Task 5: Performance Monitoring

Goal:
- Add basic observability

Requirements:
- Track:
  - API response time
  - error rates
- Use:
  - OpenTelemetry or Application Insights (minimal setup)

Constraints:
- No heavy instrumentation
- Keep lightweight

----------------------------------------

Execution Strategy:
- Implement tasks one by one
- Do NOT combine tasks
- After each task, return only affected code

Output Rules:
- No explanations
- No full project regeneration
- Only changed files