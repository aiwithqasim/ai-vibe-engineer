# Frontend tests (documentation)

Vitest and Playwright for the Next.js app are **not** stored under `testing/frontend/`. They run from the **`frontend/`** package.

## Unit tests (Vitest)

From **`frontend/`**:

```bash
npm run test:unit
```

Files include `src/**/*.test.tsx`, `src/**/*.test.ts` (e.g. `KanbanBoard`, `ChatSidebar`, login page, `kanban` helpers).

## End-to-end tests (Playwright)

From **`frontend/`**:

```bash
npm run test:e2e
```

`playwright.config.ts` starts:

1. Uvicorn for `backend.main:app` on port **8000** (with `DATABASE_PATH` pointing at a temp SQLite file).
2. Next dev server on port **3000**.

Tests use `baseURL` **http://127.0.0.1:3000** and exercise login plus board interactions.

## See also

- **`../../frontend/README.md`** — frontend commands and architecture
- **`../README.md`** — testing directory overview
