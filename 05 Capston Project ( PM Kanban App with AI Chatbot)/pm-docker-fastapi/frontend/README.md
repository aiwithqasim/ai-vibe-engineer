# Frontend (Next.js)

Kanban Studio UI: login, authenticated board with five columns, drag-and-drop cards, column rename, add/delete cards, and an **AI chat** sidebar (OpenRouter via backend `POST /api/chat`). Talks to FastAPI via **`/api/*`** (same origin in Docker; proxied in local dev).

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** (`globals.css` design tokens match repo color scheme)
- **@dnd-kit** for drag and drop
- **Vitest** + Testing Library for unit tests
- **Playwright** for end-to-end tests

## Static export

`next.config.ts` sets `output: "export"` so `npm run build` produces **`out/`**. The Docker image copies `out/` into `backend/static/`; FastAPI serves it at `/`.

**Rewrites:** In development only, `/api/*` is rewritten to `http://127.0.0.1:8000/api/*` so `npm run dev` can run against a local Uvicorn instance. Static export builds do not apply those rewrites; in Docker the browser calls the same host for HTML and API.

## Routes

| Path | File | Role |
|------|------|------|
| `/` | `src/app/page.tsx` | `AuthGate` + `KanbanBoard` |
| `/login` | `src/app/login/page.tsx` | Sign-in form |

## Data flow

- **Load:** `KanbanBoard` calls `fetchBoard()` (`GET /api/board`) after auth.
- **Save (granular):** Column rename uses debounced `PATCH /api/columns/{id}`; add card `POST /api/cards`; delete `DELETE /api/cards/{id}`; drag uses `PATCH /api/cards/{id}` with `column_id` and `index` from `findCardPlacement` on the client-computed layout. Responses wrap the full board as `{ board }`; `src/lib/api.ts` maps those to `BoardData`.
- **Bulk:** `persistBoard()` / `PUT /api/board` remains available for tools or future use.
- **AI chat:** `sendChat(message, history)` → `POST /api/chat` (`src/lib/api.ts`). `ChatSidebar` refreshes board from the response when `mutations_applied` is non-empty.
- **`initialData`** in `src/lib/kanban.ts` is the default seed shape (kept in sync with `backend/board_seed.py`); it is not the runtime source of truth after a successful load.

## Commands

Install dependencies:

```bash
npm install
```

Development server (run backend on port 8000 separately):

```bash
npm run dev
```

Production static build:

```bash
npm run build
```

Output directory: **`out/`**

Lint:

```bash
npm run lint
```

## Tests

```bash
npm run test:unit
npm run test:e2e
npm run test:e2e:docker
npm run test:all
```

`test:e2e:docker` expects the app on port 8000 (e.g. Docker) and uses `playwright.docker.config.ts`.

**Unit tests** mock `fetch` for `/api/board`, column/card routes, and `/api/chat` where needed (`KanbanBoard.test.tsx`, `ChatSidebar.test.tsx`).

**E2e** (`playwright.config.ts`) starts two processes: Uvicorn from the repo root (with a temp SQLite file via `DATABASE_PATH`) and `npm run dev` on port 3000. Tests log in with `user` / `password` before board scenarios.

## Structure (high level)

```
src/
  app/           layout, global styles, page, login
  components/    KanbanBoard, KanbanColumn, cards, NewCardForm, ChatSidebar, AuthGate
  lib/           kanban types/logic, api.ts (incl. sendChat), session.ts
tests/           Playwright specs
```

Component-level detail: **`AGENTS.md`** in this folder.

See **`../README.md`** for running the full Docker stack.
