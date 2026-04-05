# Documentation

Planning and design references for Kanban Studio.

## Contents

| File | Purpose |
|------|---------|
| **`PLAN.md`** | Phased execution plan (Parts 1–10): scaffolding, frontend in Docker, auth, database modeling, API, AI, chat UI. Includes **implementation notes** where the repo shipped an MVP variant (e.g. full-board JSON in SQLite before normalized `users` / `boards` / `columns` / `cards`). |

## Planned additions (Part 5)

When database modeling is finalized:

- `schema.json` — table definitions, types, constraints, relationships
- `DATABASE.md` — design decisions and rationale

These are described in **`PLAN.md`** Part 5.

## Related

- Repo-wide product requirements and stack choices: **`../AGENTS.md`**
- How to run the app: **`../README.md`**
