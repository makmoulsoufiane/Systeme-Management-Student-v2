# Frontend agent workflow

## Goal
Build a simple, accessible student management frontend using the existing Django backend. Work from requirements to an ordered plan, implementation, and verified results. Use React, Vite, Tailwind CSS, Axios, and React Router DOM already installed in this directory.

## Roles
Read the relevant role instructions before working:

- [requirements](agents/requirements.md): discover backend capabilities, define scope and acceptance criteria, and guide delivery through build and test.
- [task](agents/task.md): maintain an Agile backlog with dependencies and execute work from the first ready task to the last.
- [design](agents/design.md): define simple UX and an Apple Liquid Glass–inspired visual system.
- [architecture](agents/architecture.md): apply Clean Code and Clean Architecture to React implementation and review dependency boundaries, maintainability, and tests.

These Markdown files are reusable role instructions. They do not register or launch separate agents automatically. A single assistant can follow the roles in sequence. Delegate only when explicitly requested, with distinct file ownership and a shared backlog.

## Working sequence
1. Read the user's request, these instructions, and existing planning documents.
2. Follow `requirements` to inspect backend code and identify supported behavior, unknowns, and missing API contracts.
3. Follow `design` to define navigation, flows, component states, and visual guidance for the requested scope.
4. Follow `architecture` to identify proportionate implementation boundaries, then `task` to split the scope into small, ordered, verifiable tasks.
5. Implement the first ready task following `architecture`, verify its acceptance criteria, complete the architecture review, record evidence, and continue within the user's authorized scope.
6. Finish with a summary of changes, checks run, remaining blockers, and the next task if any.

If the request is only for instructions or planning, produce those artifacts without starting product implementation. For an implementation request, continue through build and testing; do not stop after writing a plan.

## Project conventions
- Keep Django in `../backend/` and frontend code in `src/`.
- Create folders only when needed: `src/app/` for routing/providers, `src/components/` for reusable UI, `src/features/<feature>/` for feature pages and logic, `src/services/` for Axios configuration, and `src/styles/` for shared design tokens.
- Within features, follow the dependency boundaries in `agents/architecture.md`; introduce domain, application, infrastructure, and presentation folders only as actual responsibilities require them.
- Keep JavaScript/JSX and the existing Vite/Tailwind setup unless the user requests a change.
- Use one configurable Axios client. Document public environment variables in `.env.example`; never put secrets in `VITE_*` variables.
- Inspect actual endpoints and response formats before integrating. Existing Django HTML pages are not JSON APIs. Never claim mocked data is a working integration.
- Verify authentication, authorization, CSRF, and CORS requirements from backend behavior. Frontend route guards alone do not enforce access control.
- Preserve field names in API payloads; adapt labels for users. Do not rename backend fields as incidental frontend cleanup.
- Add routes, features, and dependencies only when the current task needs them.
- Keep backend changes focused on required integration work and within the user's request; record missing backend work as a dependency when out of scope.

## Verification and completion
- Run `npm run build` from `frontend/` after code/configuration changes.
- Add behavior-focused tests for meaningful flows and error cases using the project's test tooling; introduce a minimal test setup when a task requires it. A successful build is not a functional test.
- Check responsive layouts, keyboard access, loading, empty, error, and success states for implemented screens.
- For backend changes, run `env/bin/python backend/manage.py check` from the repository root and relevant backend tests.
- Record exact commands and outcomes. If a browser, database, or API is unavailable, state which checks remain unverified.
- Never mark a task done until its acceptance criteria are verified or an explicit scope change removes them.
