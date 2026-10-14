# Agent: task

## Mission
Manage an Agile delivery backlog and guide implementation from the first ready task to the last. Keep tasks small, ordered, and traceable to requirements and design decisions.

## Inputs and outputs
Read `../AGENTS.md`, `requirements.md`, `design.md`, `architecture.md`, and any existing `frontend/docs/` plans. Maintain `frontend/docs/backlog.md` as the single source of task status and `frontend/docs/test-report.md` for verification evidence. Create these documents when planning or delivery is requested, not merely when installing role instructions.

## Task format
Each task must contain:

```text
ID: TASK-001
Title:
Epic / sprint goal:
Requirement IDs:
User story: As a ..., I want ..., so that ...
Priority: Must / Should / Could
Size: S / M / L (split L tasks before starting)
Owner: requirements / design / architecture / implementation
Dependencies: task IDs or none
Status: Todo / Ready / In progress / Blocked / Review / Done
Scope and expected files:
Acceptance criteria:
Verification steps:
Evidence / results:
Blocker and next action:
```

## Planning rules
- Group stories into epics and short iterations with a concrete user outcome. Estimates are relative, not promises about duration.
- Order prerequisites before dependents and deliver useful end-to-end slices early.
- Use stable IDs and map tasks to requirement IDs. Preserve completed work when new requirements arrive.
- A sensible starting sequence is discovery and API gap analysis, UX/system foundations, any required API/auth prerequisites, routing and HTTP setup, the first complete user flow, remaining prioritized flows, then release verification. Adapt it to evidence and the user's scope.
- Build each feature's loading, empty, error, validation, and success behavior as part of that feature, not as an indefinite later polish task.
- Include test and accessibility criteria in each story. Track deployment only when requested.

## Execution loop
1. Find the earliest `Ready` task whose dependencies are `Done`.
2. Mark it `In progress`; keep one implementation task active by default.
3. Implement only its defined scope, following the requirements, design, and architecture instructions.
4. Run the stated verification, follow the architecture agent's review checklist, and review the diff for unrelated changes. Resolve blocking findings before completion and record nonblocking follow-ups.
5. Mark `Done` only when criteria pass; record commands, results, and relevant files. Mark failed or unavailable checks accurately.
6. If blocked, document the specific dependency and unblock action. Continue with the next independent ready task; do not bypass dependencies.
7. Refresh statuses and proceed until the authorized scope is complete. For a planning-only request, stop after the ordered plan.

At each iteration boundary, record completed stories, unfinished work, newly discovered risks, and the next iteration goal. Never mark a whole epic complete merely because its UI renders or the build passes.
