# Role-based authentication and database upgrade

`accounts.User` extends `AbstractUser`, reuses the existing `auth_user` table,
and adds `role`, `must_change_password` and an internal `token_version`.
TeacherProfile/StudentProfile link a login to exactly one existing school record.
No account or school records are seeded in the configured database.

## Existing database: one-time upgrade

Stop the old server and back up the database first. Rehearse these commands on a
copy of your database. The repository's configured PostgreSQL instance has not
been modified or verified by this implementation.

From the repository root:

```sh
env/bin/python -m pip install -r backend/requirements.txt
# Only for an existing installation that used Django's auth.User:
env/bin/python backend/manage.py migrate accounts 0001 --settings=sms.legacy_auth_settings
env/bin/python backend/manage.py migrate
env/bin/python backend/manage.py check
```

The first command runs with `AUTH_USER_MODEL=auth.User`. The custom model is
swapped out, so `accounts.0001` is recorded without recreating `auth_user`.
The second command uses normal settings and adds the new fields and profiles.
Do not run the application or migrate beyond `accounts 0001` with legacy settings.
Do not fake migrations or delete the existing user table.

This order matters because Django admin migrations acquire a dependency on the
custom user's initial migration when `AUTH_USER_MODEL` changes. See
[Django's custom-user migration guidance](https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#changing-to-a-custom-user-model-mid-project).

Existing staff/superusers become `admin`; other existing users default to
`student`. All must change their password in React on the next login. User IDs,
password hashes, memberships and admin log references are retained. Existing
nonstaff users need an explicitly linked profile; there is no automatic matching
by names. Use Django admin to assign the correct role and create their profile.
Review group/direct model permissions for the new `accounts.User` content type;
old `auth.User` permissions are not translated automatically. Superusers retain
full administration access.

The Group/Scores replacement migrations fix duplicate-column branches for fresh
installs. Original migrations remain for existing installations. An installation
with only part of those old branches applied requires its migration history and
schema to be reconciled on a copy first; do not blindly fake the remaining branch.
The tested adoption fixture covers a standard migrated `auth.User` schema.

## Fresh database

Skip the legacy step on a new database:

```sh
env/bin/python -m pip install -r backend/requirements.txt
env/bin/python backend/manage.py migrate
env/bin/python backend/manage.py createsuperuser
env/bin/python backend/manage.py runserver
```

`createsuperuser` creates an admin role and defaults to requiring a password
change. First sign in through React, change your password, then use `/admin/`
if you need Django administration. Supply your own username and password.

For a disposable SQLite demo, use a new path and the SQLite settings on **every**
command (do not point this at a database with an unknown migration history):

```sh
export SMS_SQLITE_PATH=/tmp/campus-role-demo.sqlite3
env/bin/python backend/manage.py migrate --settings=sms.sqlite_settings
env/bin/python backend/manage.py createsuperuser --settings=sms.sqlite_settings
env/bin/python backend/manage.py runserver --settings=sms.sqlite_settings
```

## Configuration and access behavior

Use `backend/.env.example` to add missing values to your existing `.env` without
overwriting its database credentials. Set a private `SECRET_KEY` for stable JWT
signing. Without it, development generates a temporary key on each restart;
`DJANGO_DEBUG=False` requires an explicit key. Django 5.2 LTS, DRF, SimpleJWT, and CORS
dependencies are declared in `backend/requirements.txt`.

- Admins can manage all school records and create/edit/deactivate teacher and
  student accounts. Account creation requires an unlinked school `record_id`.
  This avoids duplicating records when adding logins to an existing school.
- Teachers can read their assigned classes, students, class exams and student
  scores. Students can read only their own profile/scores and their class/exams.
  Missing profiles yield empty lists. Unrelated detail IDs return 404.
- `Group.teacher` retains the existing one-to-one assignment constraint.
  Multiple classes per teacher would require a separate school-model change.
- All school-data/account endpoints require a completed password change.
  `/auth/me/`, change-password and logout remain accessible during onboarding.
- Roles and account status are checked against the database, not trusted from
  JWT role claims. A role change or deactivation invalidates previously issued
  tokens, including after later reactivation. Change-password invalidates all
  old tokens and returns a fresh pair.
- Refresh tokens rotate and are blacklisted after use. Logout blacklists the
  supplied refresh token and React clears its local session. An already issued
  access token can remain valid until its five-minute expiry unless the account
  is deactivated or its password/role changes.
- React stores tokens in sessionStorage, surviving refresh in the current tab.
  Tokens are accessible to JavaScript; HTTPS and protection against script
  injection remain essential for deployment. No passwords are stored there.
- CORS is restricted to `CORS_ALLOWED_ORIGINS`. API requests use a Bearer header,
  not session cookies. Django admin retains its session/CSRF protection and also
  checks admin role and mandatory password change.
- Legacy `/admins/`, `/students/` and `/teachers/` HTML routes were removed from
  the root URL configuration to prevent bypassing the new permissions.
- `flushexpiredtokens` can be scheduled daily to clean expired blacklist entries.

## Main new files

| Files | Responsibility |
| --- | --- |
| `models.py`, `admin.py`, `apps.py`, `migrations/0001_initial.py`, `0002_roles.py`, `0003_profiles.py` | Custom user, profiles and adoption migrations |
| `permissions.py`, `authentication.py`, `middleware.py` | Role, password and session-version enforcement |
| `serializers.py`, `views.py`, `urls.py`, `exceptions.py` | JWT endpoints, account management, validation and errors |
| `tests.py`, `test_migrations.py` | Authorization/ownership tests and existing-user adoption rehearsal |
| `../sms/legacy_auth_settings.py` | One-time adoption setting |
| `../Group/migrations/0001_squashed_legacy.py`, `../Scores/migrations/0001_squashed_legacy.py` | Fresh-database replacement migrations |
| `../../frontend/src/features/auth/application/` | AuthContext and session persistence |
| `../../frontend/src/features/auth/infrastructure/authGateway.js` | Authentication/account HTTP adapter |
| `../../frontend/src/features/auth/presentation/ProtectedRoute.jsx`, `ChangePasswordPage.jsx` | Route guard and password flow |
| `../../frontend/src/layouts/` | Shared shell plus AdminLayout, TeacherLayout and StudentLayout |
| `../../frontend/src/features/dashboard/Dashboard.jsx` | Three role dashboards |
| `../../frontend/src/features/accounts/presentation/` | Account list, create, edit and deactivate screens |
| `../../frontend/src/services/apiRequest.js`, `httpClient.test.js` | API error adapter and refresh concurrency checks |
| `../../frontend/tests/browser/roles.spec.js` | Role dashboard and onboarding integration checks |

Updated existing files include Django settings/root URLs/records API, React
composition/routing/Axios client, record screens, shared shell/dialog, browser
fixtures, test expectations and documentation. No new frontend dependencies.

Teacher accounts can now POST exams for their assigned group and POST scores for their group’s students/exams. Teacher identity is assigned automatically; administrator approval cannot be assigned by teachers. Student writes and teacher edits/deletes remain forbidden. No migration is required for this change.
