# Staff portal architecture

> The 2026-10-15 role-based update below supersedes earlier staff-only/session assumptions. See [current API contract](api-contract.md).

Status: implementation decisions and source review for the first release. Runtime verification is recorded in the test report.

## Responsibilities and dependencies

Use the existing JavaScript React/Vite/Tailwind/Axios/React Router stack. The application composition layer wires repositories and session services into React. Screens and hooks consume those injected capabilities; only transport adapters import the configured Axios client. Plain transformation and validation functions accept and return plain values.

| Responsibility | Location | Boundary |
| --- | --- | --- |
| Routes, providers, dependency wiring | `src/app/` | May import concrete adapters and presentation |
| Reusable controls and layout | `src/components/` | No knowledge of HTTP endpoints |
| Session and record workflows/UI | `src/features/` | Consume injected capabilities; no direct Axios calls in presentation |
| HTTP configuration and adapters | `src/services/` or feature infrastructure | Translate server envelopes and errors; preserve backend payload names |
| Shared visual tokens | `src/styles/` or existing entry stylesheet | Accessible focus, contrast, glass fallbacks, responsive rules |

The resources share ordinary CRUD behavior; a small explicit resource definition may describe fields, labels and routes. Resource-specific requirements remain visible in those definitions or focused functions. Avoid a general form engine, inheritance hierarchy, DI container, or empty layers. Extract a domain/application module only when it owns actual policy or independently testable behavior.

The implementation uses `src/App.jsx` as composition root, `src/app/StaffApp.jsx` for session and route coordination, `features/staff/infrastructure/staffGateway.js` for the injected transport adapter, and `features/staff/domain/resources.js` for explicit resource definitions and pure form/format transformations. Shared staff presentation implements the common list/detail/editor workflow. The config-driven reuse is justified by the identical CRUD lifecycle across these resources; separate classes or empty use-case layers would add no behavior.

## Decisions

1. **Use a JSON API alongside existing Django pages.** Existing template routes cannot serve as a React integration contract. New API endpoints adapt the existing models; backend validation and permissions remain authoritative. Preserve `adress` and custom primary-key fields at the API boundary.
2. **Use Django session authentication and CSRF protection.** One client sends credentials and the CSRF header. Do not store passwords or bearer tokens in browser storage. Bootstrap the session before rendering protected data. Frontend guards are navigation behavior, while server staff checks enforce access.
3. **Keep Admin identity separate from account identity.** A Django staff account signs in. Admin records supply ownership choices. No fake mapping between their IDs is introduced.
4. **Keep server state honest.** Mutations update or reload actual data after success. Network failures are errors, not successful empty results. Clear stale screen data on resource changes; cancel/ignore superseded requests so an older search cannot replace newer results.
5. **Keep form state local.** Store editable values, submission state, validation errors and selected record close to their screen. Derive labels, filtered views and summaries instead of duplicating state. Use a focused context for the authenticated session and injected services when genuinely shared.
6. **Translate dates at an explicit boundary.** Date-only inscription fields stay `YYYY-MM-DD`. Exam timestamps are ISO datetimes; local datetime controls convert to/from an instant explicitly. Do not trim ISO timestamps as though UTC were local time.
7. **Preserve relationships on deletion.** New portal deletion rejects cascades affecting dependent records. Show the server conflict and let staff resolve those records deliberately. This narrows the existing models' cascade behavior for the new API without rewriting model migrations.
8. **Test behavior at the owning boundary.** Pure transformations and workflow policy need focused tests; adapters need error/contract tests; React needs interaction tests for meaningful user flows; Django needs auth/CSRF/validation/persistence tests. Avoid tests that only assert implementation details.

## Review checklist

- Presentation imports no Axios client or concrete repository implementation; infrastructure imports no screen/component.
- Resource definitions retain actual backend field names and correctly distinguish editable, generated and nullable values.
- Hooks obey React rules, renders stay pure, and effects clean up asynchronous synchronization.
- Expected errors are actionable; unexpected exceptions are not displayed raw. No fake-success fallback hides an integration failure.
- Functions and modules have readable domain names and one coherent responsibility. Abstractions remove shared knowledge rather than merely similar JSX.
- A feature is complete only after its loading, empty, failed, validation and success states are verified.

This is a practical application of the repository's [architecture agent](../agents/architecture.md), not a prescribed folder structure attributed to Robert C. Martin. The implementation should stay smaller than the problem while keeping UI and external transport independently testable.

## Source review checkpoint — 2026-10-14

Task and scope: TASK-009, session, resource forms/details, transport errors and dependency boundaries. Outcome after follow-up review: **Pass for the agreed release scope**. Final `npm test` passed 4 files and 16 tests; `npm run test:e2e` passed 6 desktop/mobile Chromium tests; `npm run build` passed with 109 modules. The final isolated Django API suite passed 12 tests with no system-check issues. Six screenshots were reviewed without remaining observed layout defects. Exact coverage is recorded in [test-report.md](test-report.md).

- Dependency review passed: only `services/httpClient.js` imports Axios; `App.jsx` constructs concrete dependencies; screens receive the gateway through props; infrastructure imports no presentation code. Resource functions have no React/HTTP dependency. Read requests cancel on cleanup and suppress stale results.
- Correctness finding resolved: exam datetime initialization now retains seconds/milliseconds and its input uses `step="any"`. A direct Node recheck in `TZ=Africa/Casablanca` confirms `2026-10-14T12:30:45.123Z` round-trips unchanged. The regression test now uses that nonzero-second timestamp.
- Acceptance gap resolved in source: score detail renders read-only `created_at` as “Recorded on”, separate from editable fields.
- Accessibility correction resolved in source: Admin relationship labels render as text; supported resource relationships retain real links.
- Late-save navigation resolved in source: the editor's mounted guard suppresses completion navigation and state updates after leaving the form.
- Session recovery resolved in source: public session bootstrap returns null user and a CSRF token for nonstaff sessions so users can sign in with a staff account. Staff checks still enforce access on resource endpoints.
- Adapter validation improved: list elements and records require native integer IDs; configured date fields are checked before reaching presentation. This is focused boundary validation, not a full JSON schema contract.

All identified blocking review findings were corrected and the final verification passed. Configured PostgreSQL connectivity remains unverified because the read-only probe was sandbox-denied and escalation was interrupted; no writes or migrations were applied there. The inspected migration graph has no conflicts. The isolated API/browser results establish implemented behavior without claiming that external database is reachable. Chromium coverage does not imply Safari, Firefox, physical-device or full screen-reader coverage.

## Role-based update — 2026-10-15

- `accounts` owns the custom User, profile links, DRF permissions, JWT serializers,
  and protected account management. Existing school model fields and IDs remain.
- `sms.api.RecordsView.get_queryset()` owns data visibility for every list/detail;
  nonadmin writes are rejected before validation. Legacy HTML routes are unmounted.
- `AuthProvider` owns user/role/tokens and server verification at startup. A small
  injected session store uses sessionStorage. Passwords are never persisted.
- Axios owns Bearer attachment and one shared in-flight refresh, rotates stored
  tokens and retries a request once. Login skips refresh. A pending refresh cannot
  restore a cleared session. Auth operation revisions prevent late password/login
  responses from restoring credentials after sign-out.
- Auth/account gateway owns HTTP transport. Record screens continue using their
  injected gateway; no HTTP implementation imports were added to UI components.
- Three layouts compose a shared shell with distinct navigation. School-record
  screens accept a URL prefix and read-only mode; backend permissions remain
  authoritative. ProtectedRoute checks authentication, onboarding and allowedRoles.
- Account IDs and school record IDs remain distinct. Account creation requires an
  existing record and creates the user/profile in one database transaction.
- Custom User reuses auth_user; staged migrations support adoption. Replacement
  Group/Scores migrations permit fresh installs without replaying duplicate fields.

Reference behavior follows [DRF queryset filtering](https://www.django-rest-framework.org/api-guide/generic-views/),
[SimpleJWT rotation and revocation settings](https://django-rest-framework-simplejwt.readthedocs.io/en/stable/settings.html),
and [Django custom-user migration constraints](https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#changing-to-a-custom-user-model-mid-project).
See the current test report for verification and database limits.

### Teacher URL identity
`workspacePaths.js` centralizes workspace/dashboard URL construction from the authenticated user. TeacherLayout reads `teacherId` with `useParams()` and compares it to `user.id` before rendering nested pages. The account ID stays stable across name changes. The existing backend queryset filtering remains authoritative.

### Teacher create permissions
RecordsView permits teacher POST only for exams/scores, assigns the linked Teacher ID and restricts ModelChoiceField querysets before validation. Score validation checks exam/student group consistency. Frontend separates canCreate from readOnly, keeping detail modification unavailable. Stable teacher form configurations omit server-owned fields. No migrations or new dependencies.
