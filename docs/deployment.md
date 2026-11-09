# First deployment: Render + Vercel

Use branch `chore/prepare-deployment`. Review, commit and push only after approval.
No CI, Blueprint, health service or additional test framework is required.

## 1. Create a new Render PostgreSQL database

Use a new empty database with fresh credentials, in the same region as the web
service. Never reuse the historical passwords or copy the local `.env` to hosting.
Keep the internal connection URL private. Restrict external database access when
it is not needed. History still contains exposed credentials; revoke any that
remain valid. History cleanup is separate from this deployment.

## 2. Create the Render Python web service

Select this repository and branch, then configure:

- Root Directory: `backend`
- Build Command: `bash build.sh`
- Start Command:

  ```sh
  python manage.py migrate --noinput && gunicorn sms.wsgi:application --bind 0.0.0.0:$PORT
  ```

- Disable automatic deployments; trigger deployments manually.
- Choose a current patched Python 3.12 version using `PYTHON_VERSION`.

The start command applies migrations once before Gunicorn starts. This is a
simple single-service staging setup; do not run it against your existing database.
Do not run `build.sh` locally as a verification command.

Set these environment variables through Render's dashboard:

| Name | What to enter |
| --- | --- |
| `DJANGO_ENV` | `staging` |
| `DJANGO_DEBUG` | `False` |
| `SECRET_KEY` | A NEW random key of at least 64 characters, generated with a password manager |
| `DATABASE_URL` | The NEW database's internal connection URL |
| `DB_SSL_REQUIRE` | `False` for Render's same-region internal URL; `True` for an external TLS connection |
| `ALLOWED_HOSTS` | Exact backend hostname, without `https://`, ports or paths |
| `CORS_ALLOWED_ORIGINS` | Exact frontend HTTPS origin, without a trailing slash |

Use the intended stable Vercel project domain initially, then correct it if Vercel
assigns a different domain. Do not use a wildcard origin. Django admin uses its
own origin, so `CSRF_TRUSTED_ORIGINS` can stay unset. Render supplies `PORT` and
`RENDER`. Do not select the SQLite/test/legacy Django settings on Render.

## 3. Deploy React on Vercel

Create a separate staging project for this repository. Ensure the deployment uses
`chore/prepare-deployment` (check project Git settings/the deployment's Git ref).

- Root Directory: `frontend`
- Framework: Vite; Node version: 22.x
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable: `VITE_API_BASE_URL` = your Render HTTPS URL ending in `/api/`.

`VITE_API_BASE_URL` is public and embedded at build time: never put passwords,
database URLs, signing keys or tokens in it. Rebuild after changing it.
`vercel.json` supports direct page refreshes and disables Git-triggered automatic
deployments. Project creation may start an initial deployment; only import when
ready, then explicitly deploy the intended branch if needed.

## 4. Create an administrator and verify

On a Render plan with Shell access, run `python manage.py createsuperuser` and
enter unique staging credentials interactively. Shell access is plan-dependent.
If unavailable, run that command from a clean local shell configured for the new
staging database's external TLS URL, temporarily allowing only your IP. Never
reuse the local database configuration or put the URL/password in command history.

Sign in through React and complete the required password change. Check that:

1. Login, logout and page refresh work.
2. Browser API requests go to Render, not localhost or Vercel's `/api/`.
3. Django admin CSS loads, and one synthetic record can be saved/read.

The backend build collects Django static assets; WhiteNoise serves them. No user
upload feature exists, so no media infrastructure is needed for this first deploy.
Keep staging data synthetic and check the chosen database plan's expiry/backups.

## Local development and basic verification

Keep the existing ignored `backend/.env` with its local `DB_*` fields. Rotate its
exposed password separately. Omit `DATABASE_URL` to keep the local configuration;
local development defaults stay unchanged. The `.env.example` files contain
placeholders and must not be copied over an existing `.env` unchanged.

React already reads `VITE_API_BASE_URL`. Locally, omit it to use Vite's existing
`/api/` proxy. To check the frontend bundle without contacting any server:

```sh
cd frontend
VITE_API_BASE_URL=https://api.example.invalid/api/ npm run build
```

That reserved example URL is only for checking compilation, not deployment.

References: [Render Django guide](https://render.com/docs/deploy-django),
[Vercel SPA routing](https://vercel.com/docs/frameworks/frontend/vite).
