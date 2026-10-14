# Using the frontend roles

Start with [the shared workflow](../AGENTS.md). These files provide instructions for an AI coding assistant; they are not running services or automatically registered agent processes.

Example prompts:

- **Requirements:** “Follow `frontend/agents/requirements.md`. Inspect the Django backend and produce MVP requirements and an API gap analysis for the frontend.”
- **Task:** “Follow `frontend/agents/task.md`. Turn the requirements and design into an ordered Agile backlog with acceptance criteria and dependencies.”
- **Design:** “Follow `frontend/agents/design.md`. Define a simple Liquid Glass–inspired UX and UI system for the confirmed requirements.”
- **Architecture:** “Follow `frontend/agents/architecture.md`. Implement or review the current React task using Clean Code and Clean Architecture. Check dependency boundaries, readability, and behavior tests; keep the structure proportionate to the feature.”
- **Delivery:** “Follow `frontend/AGENTS.md`. Read the plans, start with the first ready backlog task, implement and test it, update the backlog, and continue through the agreed scope.”

The planning artifacts will live in `frontend/docs/`: `requirements.md`, `api-contract.md`, `design.md`, `backlog.md`, and `test-report.md`. Record significant implementation decisions in `architecture.md` there as they arise. Create these artifacts from actual discovery when planning begins. Application implementation remains in `frontend/src/`.
