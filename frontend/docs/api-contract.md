# Staff portal API contract

Source-verified implementation: `backend/sms/api/urls.py`, `views.py`, and `resources.py`, mounted at `/api/` in `backend/sms/urls.py`. This contract describes the new JSON API, not the existing HTML routes. Runtime test evidence belongs in [test-report.md](test-report.md); reading source alone does not verify the configured database connection.

## Authentication and transport

Use same-origin `/api/` requests; the Vite development proxy forwards them to Django. Production should route frontend and `/api/` under one origin. No permissive cross-origin policy is assumed. The HTTP client sends cookies and JSON (`Content-Type: application/json`). Obtain `csrfToken` from the session response and include it as `X-CSRFToken` on login, logout, POST, PATCH, and DELETE. Use the latest returned token after login because Django rotates it. Never persist credentials in browser storage.

| Method | Path | Request | Success |
| --- | --- | --- | --- |
| GET | `/api/session/` | None | `200 {"user": null, "csrfToken": "…"}` or authenticated user |
| POST | `/api/login/` | `{"username":"staff","password":"…"}` | `200` session response |
| POST | `/api/logout/` | None required | `200` session response with `user: null` |

Authenticated user shape: `{ "id": 1, "username": "staff", "display_name": "Staff Name" }`. An active Django staff account is required. Missing/incorrect credentials yield 400/401; nonstaff credentials yield 403. Anonymous resource requests yield 401; authenticated nonstaff resource requests yield 403. Session bootstrap is public and returns `user: null` plus a CSRF token for an existing nonstaff session, allowing the portal to show sign-in and switch to a staff account. It does not grant resource access to the nonstaff account. Django CSRF failures yield a JSON 403 with a refresh/retry message.

## Resources and operations

`resource` is one of `students`, `teachers`, `groups`, `exams`, `scores` or `admins`.

| Method | Path | Response |
| --- | --- | --- |
| GET | `/api/{resource}/` | `200 {"results": [record, …]}`; all records ordered by primary key |
| GET | `/api/{resource}/{id}/` | `200 {"record": record}` |
| POST | `/api/{resource}/` | JSON editable fields; `201 {"record": record}` |
| PATCH | `/api/{resource}/{id}/` | JSON changed editable fields; `200 {"record": record}` |
| DELETE | `/api/{resource}/{id}/` | `204` with empty body |

Admins are GET-only; writes return 405. PUT is unsupported. Collection PATCH/DELETE and detail POST are unsupported. There is no pagination, server search, filter or sort contract; the first-release frontend searches the returned records locally. Large datasets will need a subsequent pagination/search change across API and UI.

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
| 403 | Staff access denied or CSRF failure | Show returned message; refresh session/token as appropriate |
| 404 | Unknown resource or missing record | Show unavailable record and return/retry action |
| 405 | Unsupported method or Admin mutation | Treat as unsupported operation; never expose Admin write controls |
| 409 | Dependent records prevent deletion or concurrent integrity conflict | Show the conflict and retain current record/form |

DELETE inspects Django's deletion collector. If deleting a record would cascade to another record, it returns 409 without deleting it. `SET_NULL` relationships may be cleared by successful deletion. The UI always asks for explicit confirmation first. This protection is specific to the new API; it does not change the legacy HTML deletion views.

Network failures and unexpected 5xx responses may not have this envelope; adapters provide a safe generic error while preserving expected validation/auth distinctions. Do not expose raw Django debug HTML to users.
