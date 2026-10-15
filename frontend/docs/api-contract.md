# School portal API contract

Current API: Django REST Framework and SimpleJWT. The role-based contract below
supersedes the original staff session endpoints.

## Authentication

Requests use JSON. Protected requests carry `Authorization: Bearer <access>`.
No public registration endpoint exists. Login and refresh are public by design;
all other API views declare role/authentication permissions explicitly.

| Method | Path | Request / result |
| --- | --- | --- |
| POST | `/api/auth/login/` | `{username, password}` → `{access, refresh, role, username, must_change_password, user}` |
| POST | `/api/auth/refresh/` | `{refresh}` → rotated token pair and current user/role/password status |
| GET | `/api/auth/me/` | Current `{user, role, username, must_change_password}` |
| POST | `/api/auth/change-password/` | `{current_password, new_password}` → new token pair and user; invalidates previous tokens |
| POST | `/api/auth/logout/` | `{refresh}` → 204; blacklists that refresh token |

User contains `id`, `username`, `first_name`, `last_name`, `email`, `display_name`,
`role`, `must_change_password`, `is_active`. Login defaults to a forced password
change for new accounts. All records/account-management views return 403 with
`code: password_change_required` until it is completed. Invalid/expired tokens
return 401. Wrong roles return 403. Unrelated object IDs return 404.

Access tokens expire in five minutes; refresh tokens in one day, rotating on use.
Inactive users and old password/token versions are rejected on access and refresh.
Roles come from the database. A JWT role claim cannot grant privileges.

## Admin account management

All these routes require `IsAdmin` AND `PasswordChanged`.

| Method | Path | Behavior |
| --- | --- | --- |
| GET, POST | `/api/admin/teachers/` | List/create teacher login accounts |
| GET, POST | `/api/admin/students/` | List/create student login accounts |
| GET, PATCH | `/api/admin/teachers/{user_id}/` | Read/update teacher account |
| GET, PATCH | `/api/admin/students/{user_id}/` | Read/update student account |

Create body: `{username, password, record_id, first_name?, last_name?, email?, is_active?}`.
`record_id` is an existing, unlinked Teacher/Student school record ID. User and
profile are created atomically. Role is fixed by the endpoint; `role`, `is_staff`,
`is_superuser`, `must_change_password` and unknown fields are rejected. Passwords
use Django validation/hashing and are never returned. Duplicate names/profile
links fail without leaving an orphan user.

PATCH permits username, first_name, last_name, email and is_active. Deactivate with
`{is_active: false}`; DELETE is unsupported. Password changes and profile relinking
are not permitted through PATCH. Responses are account objects (list responses are
arrays), with `record: {id, name}` and no password. School records retain their
original IDs; account `id` is the distinct login-user ID.

## Role visibility

| Resource | Admin | Teacher | Student |
| --- | --- | --- | --- |
| students | All, CRUD | Students in assigned classes, read only | Own profile only |
| teachers | All, CRUD | Own teacher record only | None |
| groups | All, CRUD | Assigned classes only | Own class only |
| exams | All, CRUD | Exams belonging to assigned classes | Exams belonging to own class |
| scores | All, CRUD | Scores of students in assigned classes | Own scores only |
| admins | All, read only | None | None |

`get_queryset()` applies the same filters to lists and detail lookups. Missing
profiles return no records. Teacher/student writes are rejected regardless of
record ownership. Related linked-account records cannot be cascade deleted.

## Resources and operations

`resource` is one of `students`, `teachers`, `groups`, `exams`, `scores` or `admins`.

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/{resource}/` | `200 {"results": [record, …]}`; permitted records ordered by primary key |
| GET | `/api/{resource}/{id}/` | `200 {"record": record}` |
| POST | `/api/{resource}/` | JSON editable fields; `201 {"record": record}` |
| PATCH | `/api/{resource}/{id}/` | JSON changed editable fields; `200 {"record": record}` |
| DELETE | `/api/{resource}/{id}/` | `204` with empty body |

Administrator school records are GET-only; writes return 403. Other writes require the admin role. PUT is unsupported. Collection PATCH/DELETE and detail POST are unsupported. There is no pagination, server search, filter or sort contract; the first-release frontend searches the returned records locally. Large datasets will need a subsequent pagination/search change across API and UI.

## Fields

All generated IDs are read-only numeric values. Relationships are numeric IDs or `null`; responses add `<relation>_name` values for display. Dates are `YYYY-MM-DD`. Exam `date_hour` and score `created_at` use ISO datetimes; the frontend converts exam local input to a timezone-aware instant.

| Resource | ID | Editable fields | Optional fields |
| --- | --- | --- | --- |
| students | `id_student` | `fullname`, `address`, `date_of_inscription`, `admin`, `group` | None |
| teachers | `id_teacher` | `fullname`, `adress`, `date_of_inscription`, `admin` | `admin` |
| groups | `id_group` | `name`, `year_of_creation`, `admin`, `teacher` | `teacher` |
| exams | `id_exam` | `name`, `place`, `date_hour`, `teacher`, `group` | `teacher`, `group` |
| scores | `id` | `student`, `teacher`, `exam`, `admin`, `note` | `teacher`, `exam`, `admin` |
| admins | `id_admin` | None (read-only `fullname`, `address`, `date_of_inscription`) | None |

Scores also return read-only `created_at`. Response relationship labels are `admin_name`, `group_name`, `teacher_name`, `student_name`, and/or `exam_name`, only where that resource has the corresponding relationship. A missing optional relationship has null ID and label. Lists/details share the same record shape.

Example student response (illustrative shape, not seeded data):

```json
{
  "record": {
    "id_student": 12,
    "fullname": "Example Student",
    "address": "Example address",
    "date_of_inscription": "2026-10-14",
    "admin": 1,
    "group": 3,
    "admin_name": "Example Administrator",
    "group_name": "Group A"
  }
}
```

PATCH merges supplied editable fields with current stored values. To clear an optional relationship, send `null`. Model forms enforce required fields, existing related IDs, field lengths, valid dates, integer years, and one-to-one group teacher assignment. All nullable foreign keys are explicitly optional in the API even where older model forms required them. Scores accept finite numeric values; no minimum, maximum, or grading scale is introduced.

## Errors and deletion

Expected errors use `{ "message": "Human-readable summary", "errors": { "field": ["Field message"] } }`. `errors` is empty when there are no field-specific errors; form-level errors may use `__all__`.

| Status | Meaning | UI behavior |
| --- | --- | --- |
| 400 | Invalid JSON, non-object payload, validation, unknown/read-only field or nonscalar field | Retain form values; show summary and field errors |
| 401 | Authentication required or incorrect credentials | Return to sign-in or show credential error |
| 403 | Wrong role or required password change | Show access denied or open the password-change page |
| 404 | Unknown resource or missing record | Show unavailable record and return/retry action |
| 405 | Unsupported method | Treat as unsupported operation; never expose Admin write controls |
| 409 | Dependent records prevent deletion or concurrent integrity conflict | Show the conflict and retain current record/form |

DELETE inspects Django's deletion collector. If deleting a record would cascade to another record, it returns 409 without deleting it. `SET_NULL` relationships may be cleared by successful deletion. The UI always asks for explicit confirmation first. This protection is specific to the new API; it does not change the legacy HTML deletion views.

Network failures and unexpected 5xx responses may not have this envelope; adapters provide a safe generic error while preserving expected validation/auth distinctions. Do not expose raw Django debug HTML to users.
