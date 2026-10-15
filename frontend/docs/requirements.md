# Staff portal requirements

> The 2026-10-15 role-based update below supersedes earlier staff-only/session assumptions. See [current API contract](api-contract.md).

Approved scope: a staff portal using real Django data. Deliver a small, usable React application for students, teachers, groups, exams, and scores. This document records the first release, not a claim that every acceptance criterion has already passed; see [backlog](backlog.md) and [test report](test-report.md) for delivery evidence.

## Users and scope

Authenticated, active Django staff users can manage school records. The existing `Admin` model represents a record owner and is separate from the Django account used to sign in. Existing Admin records are available through read-only relationship selectors. Account creation remains a Django administration/setup operation.

The MVP includes session sign-in/out, navigation, searchable record lists, record details, creation, editing, confirmed deletion, relationship selectors, and accessible responsive screens. Empty databases must produce useful empty states, never fabricated records. No student/teacher self-service, enrollment workflow, analytics, invented grade scale, exports, bulk actions, or deployment is included. `StudentExam` is not edited; scores use the existing `Scores.Score` model.

## Backend evidence

At discovery, `backend/sms/urls.py` exposes `/admin/`, `/admins/`, `/students/`, and `/teachers/`. App views use Django generic template views and HTML form redirects. A JSON API and staff authorization are integration prerequisites, tracked separately in the backlog.

| Model source | Relevant facts |
| --- | --- |
| `backend/student/models.py` | `id_student`; required fullname, address, inscription date, admin, group |
| `backend/Teachers/models.py` | `id_teacher`; API address spelling is `adress`; nullable admin |
| `backend/Group/models.py` | `id_group`; name, positive integer year, required admin; nullable one-to-one teacher |
| `backend/exam/models.py` | `id_exam`; name, place, date/time; optional teacher and group |
| `backend/Scores/models.py` | Standard `id`; student, floating point `note`; nullable teacher, exam, admin; read-only creation time |
| `backend/Admin/models.py` | `id_admin`, fullname, address, inscription date; no authentication link |
| `backend/student_exam/models.py` | Separate enrollment/score representation, excluded from this release |

Model nullability and form requiredness are not identical. The implemented API contract is authoritative for optional relationship inputs. The server validates existence of foreign keys and the one-group-per-teacher constraint. Preserve existing API field names and do not infer a `/20` or `/100` grading scale.

## Requirements and acceptance criteria

All requirements below are Must priority for this release.

| ID | User story | Observable acceptance criteria |
| --- | --- | --- |
| REQ-001 | As staff, I can sign in and out securely. | Given an anonymous visitor, opening the portal shows sign-in. When valid active staff credentials are submitted, the portal loads and refresh preserves the session. Invalid credentials show a useful error. Nonstaff users cannot access any new record API. Sign-out clears access. Unsafe requests without CSRF protection are rejected. |
| REQ-002 | As staff, I can find the section I need on desktop or mobile. | Given a signed-in session, students, teachers, groups, exams and scores are reachable with visible active navigation. At narrow viewport widths controls remain usable and content stays readable. Keyboard users can reach navigation, forms, and actions with visible focus. |
| REQ-003 | As staff, I can find and inspect real records. | Each section loads real API records and supports search. Selecting a record exposes its meaningful fields and relationship labels. Loading, no records, no search matches, failed request and retry have distinct states. A failed request never masquerades as an empty database. |
| REQ-004 | As staff, I can create and update student records. | A valid form saves fullname, address, inscription date, admin and group; list/detail refresh shows saved values. Required/invalid fields show errors and failed saves retain entered values. Existing relationships populate on edit. |
| REQ-005 | As staff, I can create and update teachers and groups. | Teacher address writes `adress`. Group forms use existing Admin and Teacher records. Assigning a teacher already used by another group produces a useful validation error. Valid edits appear after reload. |
| REQ-006 | As staff, I can schedule exams. | Forms save name, place, date/time and optional teacher/group. Date/time conversion preserves the intended instant between local form input and server representation. Missing or invalid values produce field feedback. |
| REQ-007 | As staff, I can maintain scores. | Forms save a student and finite numeric note with supported optional relationships. Values are shown without an invented grading scale. Server validation is presented without discarding user input. |
| REQ-008 | As staff, I can remove a record deliberately. | Delete requires an explicit confirmation naming the record. Cancel changes nothing. Success refreshes the list and returns from any removed detail. Server dependency conflicts remain visible; related records are not silently deleted by the portal. |
| REQ-009 | As staff, I can choose valid related records. | Selectors use current API records and display meaningful labels. Required selectors with no available records explain the prerequisite. Admin selectors are read-only lookup choices, and no Admin creation interface is implied. |
| REQ-010 | As a maintainer, I can run and verify the portal. | Document local setup, environment variables and Django account prerequisites. Build and behavior tests pass; backend checks and API integration tests pass. Record manual/browser coverage and unavailable checks accurately. |

## UX behavior and validation

- Use simple Liquid Glass-inspired surfaces, restrained blur, readable text, clear primary actions and an opaque fallback. Respect reduced motion.
- Label inputs explicitly; expose field errors near the field and global failures in a status/alert region. Keep submit disabled while saving and restore it after failure.
- Confirm destructive actions; preserve focus and keyboard escape behavior when using dialogs. Do not rely on color alone for errors or selection.
- Use model length limits: names for students/teachers/groups 100, addresses 255, exam name 255 and place 50. Dates use valid date values; year is an integer; score is finite.
- Session expiration returns the visitor to sign-in. Validation, permission, missing record, dependent-record conflict, server, and connection errors remain distinguishable.
- Read-only values such as IDs and score creation timestamps cannot be overwritten by forms.

## Assumptions and release boundaries

English labels and the browser's local date/time presentation are used initially. Django stores timezone-aware datetimes; the existing Django timezone is UTC. Staff users have access to all portal records; ownership-specific permissions are not present in the existing domain and are not inferred from Admin relations.

The configured database is PostgreSQL, sourced from local environment settings. Integration tests may use an isolated database, but that does not prove the user's configured PostgreSQL service is reachable. Existing HTML routes and existing production configuration are outside this portal's security guarantee. Production secret/debug/host/deployment review remains a separate release activity.

## Release verification

Verify anonymous denial, staff login, CSRF rejection, session persistence, logout, each resource's create/read/update/delete behavior, invalid relationships, duplicate group teacher, finite scores, deletion dependency protection and read-only admins. Verify React's loading/error/empty paths, validation feedback, search, mutations and route handling. Run frontend build, relevant behavior tests and Django checks/tests; record exact results in the test report. Browser visual, keyboard and narrow-layout checks must be reported as performed or unverified, never assumed from a successful build.

## Role-based release — 2026-10-15

The approved scope now includes admin, teacher and student accounts. This replaces
the earlier staff-only session scope. No public registration or automatic role
assignment from supplied request fields is permitted.

| ID | Requirement | Acceptance |
| --- | --- | --- |
| RBAC-001 | Custom User and profiles | AbstractUser role, forced password default, unique teacher/student profile; existing account adoption retains IDs/passwords |
| RBAC-002 | Backend authorization | Admin-only account writes; teacher/student data filtered for both list/detail; unrelated IDs denied; missing profiles fail closed |
| RBAC-003 | JWT lifecycle | Login includes tokens/role/username/password status; refresh rotates; deactivation rejects tokens; password change validates current/new and revokes old tokens |
| RBAC-004 | Role workspaces | Refresh restores verified identity; role dashboards/layouts; anonymous → login, wrong role → unauthorized, forced change → password page |
| RBAC-005 | Account management UI | Admin lists, creates linked accounts, edits details and deactivates without deleting school records |
| RBAC-006 | Reproducible verification | Real migration graph, isolated existing-user adoption, backend ownership tests, frontend route/refresh tests, browser onboarding and documented commands |

Teachers and students receive read-only views. Each account is linked explicitly
to an existing school record, avoiding duplicate enrollment/staff data. Current
Group.teacher cardinality is retained. Per-class write/grade-entry workflows and
multi-class teacher assignment are outside this request's implemented scope.
