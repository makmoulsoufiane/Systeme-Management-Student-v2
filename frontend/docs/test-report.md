# Staff portal verification — 2026-10-14

## Scope and environment
The first release provides staff authentication and model-backed student, teacher,
group, exam, and score management. Tests exercised the real Django API using an
isolated SQLite database; they did not write to the configured school database.
The normal runtime remains PostgreSQL through `backend/.env`.

## Recorded checks

| Check | Command / method | Result |
| --- | --- | --- |
| Frontend behavior | `npm test` from `frontend/` | 16 tests across 4 files passed |
| Production bundle | `npm run build` from `frontend/` | Passed; 109 modules transformed |
| Browser integration | `npm run test:e2e` from `frontend/` | 6 tests passed, desktop and mobile Chromium |
| Django API regression | `env/bin/python backend/manage.py test sms.api --settings=sms.test_settings --noinput` | 12 tests passed, including updated nonstaff session recovery |
| Django system check | `env/bin/python backend/manage.py check` | Passed during API implementation |
| Dependency audit | npm installation audit after updating Vitest to 4.1.11 | 0 known npm vulnerabilities reported |
| Architecture | Manual dependency and behavior review | Findings corrected; no remaining blocking source findings |
| Design | Six desktop/mobile screenshots | Reviewed; no remaining observed layout defects |

## Coverage
- API tests cover anonymous/nonstaff rejection, session and CSRF, native field
  contracts, CRUD, field and relationship validation, teacher uniqueness,
  finite scores, readonly administrator lookup, invalid requests, safe SET_NULL
  deletion and rejection of cascading deletion.
- Frontend tests cover session loading/retry/expiry, resource retry and empty
  state, unknown routes, API envelope/record validation, CSRF token rotation,
  empty delete responses, preserved field errors, required lookup prerequisites,
  zero scores, optional relationships, exam timestamp precision, and ignoring
  a save completion after leaving the form.
- Browser tests use live HTTP requests through the Vite proxy. On both 1440px
  desktop and 390px mobile they cover invalid/valid login, search/no-results,
  detail navigation and reload, logout, create/edit/delete for all five resources,
  deletion cancellation, dependent-delete conflicts, Escape and focus restoration.
  Width assertions check the directory and detail layouts. Mobile menu navigation
  is exercised. Initial login flow captures browser exceptions and had none.
- A separate non-UTC `TZ=Africa/Casablanca` check confirmed that an exam time
  containing seconds and milliseconds survives form conversion unchanged.

## Corrections found during verification
- Preserved seconds/milliseconds when editing exam timestamps.
- Displayed score creation metadata and rendered read-only Admin relationships as text.
- Allowed staff login to replace an existing nonstaff Django session.
- Closed native dialogs during effect cleanup so StrictMode and Escape restore
  focus to the original delete button.
- Positioned the table scroll container so a visually hidden header cannot
  cause page-level horizontal overflow on mobile.
- Updated the test runner to resolve the reported npm vulnerabilities.

The first browser attempt using installed Chrome stalled during screenshot
capture and was stopped. The final run uses Playwright's matching Chromium and
completed successfully. Early focus/overflow failures were corrected and the
complete six-test browser suite was rerun successfully.

## Limits and handoff
- Configured PostgreSQL connectivity was not verified: the read-only probe was
  denied by the sandbox and its escalation was interrupted. The migration graph
  inspection reported no conflicts. No migrations or fixture writes were applied
  to that database.
- Browser tests cover Chromium desktop/mobile emulation, not Safari, Firefox,
  physical devices, or a complete screen-reader accessibility audit.
- Search currently filters the loaded directory locally; server pagination and
  large-dataset performance work are future scope.
- All active staff accounts can manage all records through this API. Per-school
  or per-teacher permissions, student self-service, and production deployment are
  outside the agreed first release. Existing HTML routes retain their legacy behavior.

Reproduce the checks using the root README. Screenshots are generated under
`frontend/test-results/` (ignored by Git); they contain synthetic test data only.

## Login glass styling update — 2026-10-14

The login presentation now uses a scoped stylesheet, translucent card, glass
shapes, moving light, entrance animation, and button reflections. Authentication
submission, routes, and backend code were not changed.

- `npm run test:e2e -- --grep 'staff can sign in'`: both desktop and mobile tests
  passed against the disposable Django backend, including invalid credentials,
  successful sign-in, navigation, session restore, and sign-out.
- Desktop and mobile login screenshots were visually reviewed for legibility,
  clipping, and spacing.
- An ad hoc Chromium check against localhost:5173 verified running, paused, and
  resumed ambient motion, no horizontal overflow at 390px/320px, 16px mobile
  inputs, and disabled animation under reduced-motion preference. This visual
  check stubbed only session bootstrap; authentication was verified separately
  by the real-backend integration tests above.
- CSS provides an opaque fallback when backdrop filtering is unavailable or
  reduced transparency is requested. Styles are scoped to `.glass-login`.
- Final `npm run build` passed after the styling adjustments (110 modules).
