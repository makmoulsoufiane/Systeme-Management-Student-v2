# School management system

React + Django REST Framework + SimpleJWT, with three roles: **admin**, **teacher**,
and **student**. The existing glass login page opens the appropriate workspace.

## Start the backend

From the repository root:

```sh
source env/bin/activate
pip install -r backend/requirements.txt
```

If this database already used the previous login system, follow the
[one-time existing-user upgrade](backend/accounts/README.md#existing-database-one-time-upgrade)
before starting the server. It preserves existing account IDs and passwords.
The configured database has not been migrated automatically.

For a **fresh** database, configure `backend/.env` using
[the example](backend/.env.example), then run:

```sh
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver
```

If you do not have `env/`, create it with `python3 -m venv env` first.
Use a private `SECRET_KEY` in `.env` for stable JWT sessions. The backend defaults
to PostgreSQL; a disposable SQLite setup is documented in the upgrade guide.

## Start React

In another terminal, using Node.js 20.19+ or 22.12+:

```sh
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/`. Log in with your superuser credentials and change
the password when prompted. Admins open `/admin/dashboard`, teachers
`/teacher/<account-id>/dashboard`, and students `/student/dashboard`.

Vite proxies `/api/` to `http://127.0.0.1:8000`. Use `DJANGO_API_TARGET` for a
custom backend address. `frontend/.env.example` documents the frontend API URL;
`CORS_ALLOWED_ORIGINS` in backend settings permits the configured React origins.
Production needs an SPA route fallback and an API proxy or configured CORS.

## Create teacher and student accounts

1. After changing the admin password, create an administrator school record in
   Django admin at `http://127.0.0.1:8000/admin/` if none exists. It is separate
   from the login account.
2. Use the admin workspace's school-record pages to add teachers, groups and
   students. Assign teachers and students to their groups.
3. Open **Teacher accounts** or **Student accounts**, choose **Create account**,
   select the school record, and enter a username and temporary password.
4. Share those credentials privately. The new user must change their password
   before accessing school data. There is no public registration.
5. Use **Edit** to update account details or reactivate access; **Deactivate**
   blocks login and invalidates tokens while retaining school records.

Teachers and students have read-only workspaces filtered by the backend.
Admins retain school-record CRUD. Backend permissions enforce all access rules;
React route guards provide navigation and feedback only.

## Verify

```sh
# Repository root: isolated database, real migrations
env/bin/python backend/manage.py test accounts sms.api --settings=sms.test_settings --noinput
env/bin/python backend/manage.py check --settings=sms.sqlite_settings
env/bin/python backend/manage.py makemigrations --check --dry-run --settings=sms.sqlite_settings

# Frontend
cd frontend
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests use temporary SQLite data and isolated Django/Vite servers on
ports 8001/5174, never the configured school database. Test screenshots and
traces are ignored by Git.

See [new files and migration details](backend/accounts/README.md),
[API contract](frontend/docs/api-contract.md),
[requirements](frontend/docs/requirements.md),
[architecture](frontend/docs/architecture.md), and
[test report](frontend/docs/test-report.md).
