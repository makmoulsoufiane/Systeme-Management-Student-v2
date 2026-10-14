# Systeme-Management-Student-v2

## Project structure

```text
backend/
  manage.py
  sms/              # Django settings, URLs, ASGI, and WSGI
  student/          # Django applications, with their models and migrations
  Admin/
  Teachers/
  Group/
  Scores/
  exam/
  student_exam/
  accounts/
  userauth/
  static/
  staticfiles/
  media/
frontend/           # React staff portal powered by Vite
env/                # Local Python virtual environment (ignored by Git)
```

Existing application templates remain inside their Django applications.
Local database configuration is stored in `backend/.env` (ignored by Git).

## Run the backend

From the project root, activate the existing environment and start Django:

```sh
source env/bin/activate
python backend/manage.py runserver
```

To check the Django configuration:

```sh
python backend/manage.py check
```

## Run the frontend

Use Node.js 20.19+ or 22.12+ and run:

```sh
cd frontend
npm install
npm run dev
```

Open the URL Vite prints. Sign in with an active Django account with `is_staff=True`.
If you need a new staff account, run `python backend/manage.py createsuperuser`
from the project root with your Python environment activated.

The portal supports searching, viewing, creating, editing, and deleting students,
teachers, groups, exams, and scores. It connects to the JSON API under `/api/`.
Vite proxies these requests to `http://127.0.0.1:8000` so session cookies and CSRF
work on the same browser origin. Set the shell variable `DJANGO_API_TARGET` to
use a different backend address. `frontend/.env.example` documents the API URL.

Administrator records are school data, separate from login accounts. Create an
administrator record in Django admin (`http://127.0.0.1:8000/admin/`) before
creating groups or students. Create a group before adding its students. No
sample records or accounts are added to your configured database by this setup.

The normal backend uses the PostgreSQL settings in `backend/.env`. The opt-in
`sms.sqlite_settings` is an isolated development/test sandbox, not a migration
of that database. It builds application tables directly from the current models
for disposable fixtures; normal database migrations remain separate.

Run `npm run build` from `frontend/` to create a production build. A deployment
must serve SPA routes with an `index.html` fallback and proxy `/api/` to Django
on the same origin; Vite's development proxy is not part of the built files.
Production hardening of the existing Django settings is a separate deployment task.

## Verification

From the repository root:

```sh
env/bin/python backend/manage.py check
env/bin/python backend/manage.py test sms.api --settings=sms.test_settings --noinput
```

From `frontend/`:

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start disposable Django and Vite servers on ports 8001 and 5174.
They create synthetic records in a temporary SQLite database, exercise the real
API in desktop/mobile Chromium, and never use the configured school database.
Keep those two ports available. Screenshots and failure traces are written to
the ignored `frontend/test-results/` directory.

See [requirements](frontend/docs/requirements.md), [API contract](frontend/docs/api-contract.md),
[design](frontend/docs/design.md), [architecture](frontend/docs/architecture.md),
[backlog](frontend/docs/backlog.md), and [verification report](frontend/docs/test-report.md).
