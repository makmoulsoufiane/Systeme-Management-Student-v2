# Staff portal delivery backlog

Release goal: staff can manage real Django school records through the React portal. Requirements are defined in [requirements.md](requirements.md); the verified source contract is in [api-contract.md](api-contract.md). Execution evidence belongs in [test-report.md](test-report.md). Status is updated only when evidence supports it. The initial design, API and UI foundations can proceed in parallel because they have distinct file ownership and an agreed contract; release verification depends on their integration.

## Iteration 1 — establish a usable staff session and first record flow

### TASK-001 — inspect backend and agree scope

- Epic / sprint goal: grounded first release.
- Requirement IDs: REQ-001–010.
- User story: As a maintainer, I want a model-backed scope so implementation uses the real backend.
- Priority / size / owner: Must / S / requirements.
- Dependencies: none.
- Status: Done.
- Scope and expected files: requirements, API contract, architecture and this backlog.
- Acceptance criteria: approved staff portal recorded; HTML/API gap identified; native fields and relationships captured; exclusions and testable stories recorded.
- Verification steps: inspect app models, URLconfs, views, settings and frontend tooling; compare new API source with contract.
- Evidence / results: source inspection on 2026-10-14 confirmed HTML-only legacy views, PostgreSQL configuration, distinct Admin/auth models and existing frontend dependencies; new JSON source matched the documented contract. Implementation verification remains tracked below.
- Blocker and next action: none; maintain contract as implementation changes.

### TASK-002 — design responsive navigation and component states

- Epic / sprint goal: usable staff workspace.
- Requirement IDs: REQ-002, REQ-003, REQ-008, REQ-009.
- User story: As staff, I want obvious navigation and readable forms across screen sizes.
- Priority / size / owner: Must / M / design.
- Dependencies: TASK-001.
- Status: Done.
- Scope and expected files: shared shell, stylesheet/tokens and design documentation.
- Acceptance criteria: simple Liquid Glass appearance with readable fallback, navigation, visible focus, responsive controls, explicit loading/error/empty states and reduced motion.
- Verification steps: inspect desktop/mobile browser layouts, keyboard navigation and shared states; run frontend build.
- Evidence / results: Six desktop/mobile screenshots reviewed with no remaining observed defects. Final Chromium tests verify mobile navigation, Escape/focus restoration and width assertions. Production build passed (109 modules); design tokens include reduced-motion support.
- Blocker and next action: None. Broader browser/screen-reader coverage is documented in the test report.


### TASK-003 — add staff session and JSON API

- Epic / sprint goal: authoritative live-data integration.
- Requirement IDs: REQ-001, REQ-003–009.
- User story: As staff, I want secure model-backed operations so saved changes persist correctly.
- Priority / size / owner: Must / M / implementation.
- Dependencies: TASK-001.
- Status: Done.
- Scope and expected files: `backend/sms/api/`, project URL/settings integration and API tests.
- Acceptance criteria: staff-only sessions, CSRF, CRUD for five resources, read-only admins, model validation, finite notes, duplicate teacher rejection, cascade deletion protection and consistent errors.
- Verification steps: Django system check; API tests with isolated data including unauthorized, validation and deletion cases.
- Evidence / results: Final env/bin/python backend/manage.py test sms.api --settings=sms.test_settings --noinput passed 12 tests (0.483s), including the updated nonstaff session regression; system check reported no issues. Final real-Django browser integration passed all 6 desktop/mobile tests. See the test report for coverage.
- Blocker and next action: None for implemented API behavior. Configured PostgreSQL access is an independently documented external limitation.


### TASK-004 — wire session, routing and transport boundaries

- Epic / sprint goal: first authenticated workspace.
- Requirement IDs: REQ-001, REQ-002, REQ-010.
- User story: As staff, I want to sign in once and navigate without losing my session.
- Priority / size / owner: Must / M / implementation.
- Dependencies: TASK-001; TASK-003 contract agreed, final integration requires TASK-003 completion.
- Status: Done.
- Scope and expected files: app providers/routes, configured HTTP client, adapters, session presentation, Vite proxy and `.env.example`.
- Acceptance criteria: cookie/CSRF flow, login/logout/session restore, server errors displayed, protected routes, missing-page handling, injected adapters and no credentials in storage.
- Verification steps: session tests, adapter tests, browser session flow and architecture import review.
- Evidence / results: Frontend suite passed 16 tests across 4 files, including session bootstrap/retry/expiry, missing routes, adapter envelopes and CSRF rotation. Real Django browser tests passed invalid/valid login, persisted-session reload and logout. Manual dependency review passed.
- Blocker and next action: None within the agreed scope.


### TASK-005 — deliver students as the first complete CRUD slice

- Epic / sprint goal: staff can maintain student records.
- Requirement IDs: REQ-003, REQ-004, REQ-008, REQ-009.
- User story: As staff, I want to find, inspect and maintain students with valid ownership and group choices.
- Priority / size / owner: Must / M / implementation.
- Dependencies: TASK-002, TASK-003, TASK-004.
- Status: Done.
- Scope and expected files: resource definitions, list/detail/editor, student payload mapping and flow tests.
- Acceptance criteria: searchable real list/detail; create/update; date and relation selectors; retained input on validation failure; empty/retry states; confirmed delete and dependency conflict handling.
- Verification steps: student workflow tests and live isolated API integration; inspect UI states.
- Evidence / results: Desktop and mobile Chromium passed student creation, editing, detail display, delete confirmation/cancellation and deletion against the real Django API. Shared UI tests passed field-error retention, required lookups, empty and retry states; browser search/no-results passed.
- Blocker and next action: None within the agreed scope.

## Iteration 2 — finish management flows and release verification


### TASK-006 — deliver teacher and group management

- Epic / sprint goal: maintain teaching organization.
- Requirement IDs: REQ-003, REQ-005, REQ-008, REQ-009.
- User story: As staff, I want to assign teachers and manage groups without invalid relationships.
- Priority / size / owner: Must / M / implementation.
- Dependencies: TASK-005.
- Status: Done.
- Scope and expected files: teacher/group definitions, relationships and focused tests.
- Acceptance criteria: complete CRUD/search/detail states; preserve `adress`; optional teacher/admin support where allowed; reject assigning an occupied group teacher; explain dependent-delete conflicts.
- Verification steps: API validation tests, frontend payload tests and user-flow checks.
- Evidence / results: Desktop/mobile browser CRUD passed for teachers and groups. Payload tests preserve adress and optional relationships; API tests cover teacher uniqueness and foreign keys. Browser dependent-delete conflict displays server feedback without deletion.
- Blocker and next action: None within the agreed scope.


### TASK-007 — deliver exam management

- Epic / sprint goal: maintain the exam schedule.
- Requirement IDs: REQ-003, REQ-006, REQ-008, REQ-009.
- User story: As staff, I want to manage exams with accurate local date/time input.
- Priority / size / owner: Must / S / implementation.
- Dependencies: TASK-006.
- Status: Done.
- Scope and expected files: exam resource definition, datetime conversion, tests.
- Acceptance criteria: CRUD/search/detail with optional group/teacher; round-trip a timestamp without timezone drift; required name/place/date validation; guarded deletion.
- Verification steps: date conversion tests including a non-UTC timezone; API persistence and form error checks.
- Evidence / results: Desktop/mobile browser exam CRUD passed. Frontend regression preserves seconds/milliseconds; a separate TZ=Africa/Casablanca round trip passed. API tests cover required fields, relations and persisted values.
- Blocker and next action: None within the agreed scope.


### TASK-008 — deliver score management

- Epic / sprint goal: maintain recorded student scores.
- Requirement IDs: REQ-003, REQ-007, REQ-008, REQ-009.
- User story: As staff, I want to record and correct scores against existing students and exams.
- Priority / size / owner: Must / S / implementation.
- Dependencies: TASK-007.
- Status: Done.
- Scope and expected files: score resource definition, numeric payload handling, tests.
- Acceptance criteria: CRUD/search/detail; finite score; correct relationship values; read-only creation time; no invented grade scale or StudentExam synchronization.
- Verification steps: numeric/relationship validation tests, CRUD API tests, inspect displayed labels.
- Evidence / results: Desktop/mobile browser score creation with zero, editing to 17.5 and deletion passed. Unit tests preserve numeric values and optional IDs; API tests cover finite values and relations. Source review confirms read-only Recorded on metadata and no invented grade scale.
- Blocker and next action: None within the agreed scope.


### TASK-009 — verify accessibility, errors and architecture

- Epic / sprint goal: reliable and maintainable release.
- Requirement IDs: REQ-001–010.
- User story: As staff, I want the portal to remain usable when requests fail or I use the keyboard.
- Priority / size / owner: Must / M / architecture.
- Dependencies: TASK-002–008.
- Status: Done.
- Scope and expected files: behavior tests, focused corrections and test report.
- Acceptance criteria: loading/empty/error/retry, validation, session expiry, confirmation cancellation and responsive/keyboard behavior covered; dependency rules inspected; blockers resolved.
- Verification steps: run frontend tests/build and Django tests/check; inspect imports and browser workflows at desktop/narrow sizes; record unavailable checks explicitly.
- Evidence / results: Manual architecture review passed after corrections. Final npm test passed 16 tests/4 files; npm run test:e2e passed 6 desktop/mobile Chromium tests; npm run build passed (109 modules). Six screenshots reviewed without remaining observed defects; npm audit reported zero vulnerabilities. See test-report.md for coverage and limits.
- Blocker and next action: None. Final Django API regression passed 12 tests with no system-check issues; all agreed implementation and verification tasks are complete.


### TASK-010 — document local run and final evidence

- Epic / sprint goal: reproducible handoff.
- Requirement IDs: REQ-010.
- User story: As a maintainer, I want clear setup and verification evidence so I can run the portal with my database.
- Priority / size / owner: Must / S / requirements.
- Dependencies: TASK-009.
- Status: Done.
- Scope and expected files: project/frontend README, `.env.example`, test report, updated backlog and contract.
- Acceptance criteria: document dependency/setup commands, backend/frontend startup, staff account and Admin-record prerequisites, proxy behavior, exact test outcomes and any unverified external service.
- Verification steps: compare documented commands with package scripts/settings; check document links and update statuses from evidence.
- Evidence / results: Root README startup/test commands, staff/Admin prerequisites, .env.example and Vite proxy configuration inspected. API contract, design, architecture and test report are linked. Report distinguishes isolated real-Django integration from unverified configured PostgreSQL access.
- Blocker and next action: None. Final Django regression passed; the parent maintains the authoritative verification report.

## Current iteration checkpoint

The agreed staff portal implementation is complete. Frontend behavior, desktop/mobile real-Django integration, build and design review passed. The final Django API regression passed 12 tests and reported no system-check issues. All ten agreed delivery tasks are complete; detailed evidence and verification boundaries are recorded in the test report.

Configured PostgreSQL connectivity was not verified: the read-only probe was sandbox-denied and escalation was interrupted. No database writes or migrations were applied there. The migration graph inspection found no conflicts. Isolated Django API/browser verification establishes implemented behavior without claiming access to that external database.
