# Project Plan — Kanban Studio

## Status Legend

- [ ] Not started
- [x] Complete
- [~] In progress

---

## Part 1: Plan and Documentation

**Goal:** Produce a signed-off, detailed execution plan and document the existing frontend code before any build work begins.

### Steps

- [x] Explore existing `frontend/` codebase
- [x] Create `frontend/AGENTS.md` describing all components, data model, tests, and gaps
- [x] Enrich this document (`docs/PLAN.md`) with substeps, checklists, tests, and success criteria for all parts
- [ ] User reviews and signs off on plan

### Success Criteria

- `frontend/AGENTS.md` exists and accurately describes the existing code
- This plan document is detailed enough that an agent can execute each part without ambiguity
- User has explicitly approved the plan

---

## Part 2: Scaffolding

**Goal:** Docker container runs a FastAPI backend that serves static HTML at `/`, with a working `/api/hello` endpoint confirming backend is alive.

### Steps

- [x] Create `backend/main.py` — minimal FastAPI app with one `GET /api/hello` route returning `{"message": "hello world"}`
- [x] Create `backend/pyproject.toml` using `uv` — dependencies: `fastapi`, `uvicorn`
- [x] Create `Dockerfile` at project root — multistage: build stage installs Python deps with `uv`, final stage copies app and serves on port 8000
- [x] Create `docker-compose.yml` at project root — single service, port 8000:8000, mounts `.env`
- [x] Create `scripts/start.sh` (Mac/Linux) — `docker compose up --build -d`
- [x] Create `scripts/start.bat` (Windows) — `docker compose up --build -d`
- [x] Create `scripts/stop.sh` (Mac/Linux) — `docker compose down`
- [x] Create `scripts/stop.bat` (Windows) — `docker compose down`
- [x] Serve a static fallback HTML at `/` from FastAPI (static frontend served once built)
- [x] Update `backend/AGENTS.md` with description of backend structure
- [x] Update `scripts/AGENTS.md` with description of script structure

### Tests (in `testing/backend/`)

- [x] `test_hello.py` — `GET /api/hello` returns 200 and `{"message": "hello world"}`
- [x] `test_static.py` — `GET /` returns 200 and HTML content

### Success Criteria

- `docker compose up` starts without errors
- `http://localhost:8000/` returns HTML in browser
- `http://localhost:8000/api/hello` returns `{"message": "hello world"}`
- Both unit tests pass
- Start and stop scripts exist for Mac/Linux and Windows

---

## Part 3: Add in Frontend

**Goal:** The statically built Next.js Kanban board is served by FastAPI at `/`, replacing the placeholder HTML.

### Steps

- [x] Update `Dockerfile` — add Node.js build stage: `npm ci && npm run build` inside `frontend/`, copy `frontend/out/` to backend static dir
- [x] Update `next.config.ts` — set `output: "export"` and `basePath` if needed, disable image optimization for static export
- [x] Update FastAPI `main.py` — mount `/` to serve the exported static files directory
- [x] Verify routing: Next.js static export produces `index.html` at root
- [x] Smoke test: rebuild Docker image and confirm Kanban board loads at `http://localhost:8000/`

### Tests (in `testing/frontend/`)

- [x] Existing Vitest unit tests pass: `npm run test:unit`
- [ ] New integration test: confirm exported `out/index.html` exists after `npm run build` (optional; not added)
- [ ] Playwright `baseURL` for Docker-only runs (`http://localhost:8000`) — optional; local e2e uses dev server + API (see `frontend/playwright.config.ts`)
- [x] E2e in `frontend/tests/` — board flows (with auth from Part 4); five columns asserted after login

### Tests (in `testing/api/`)

- [x] `test_frontend_served.py` — `GET /` returns 200 and contains Kanban app HTML

### Success Criteria

- `http://localhost:8000/` shows the Kanban board (all 5 columns, seeded cards)
- Drag and drop works in browser
- All unit and e2e tests pass (e2e requires API on port 8000; Playwright starts it alongside Next dev)

---

## Part 4: Authentication

**Goal:** A login page guards the Kanban board. Hardcoded credentials (`user` / `password`). A logout button clears the session.

### Steps

- [x] Add `POST /api/auth/login` to FastAPI — accepts `{username, password}`, validates against hardcoded values, returns a signed JWT (or session token) in an HTTP-only cookie
- [x] Add `POST /api/auth/logout` — clears the cookie
- [x] Add `GET /api/auth/me` — returns `{username}` if authenticated, else 401
- [x] Create `frontend/src/app/login/page.tsx` — login form (username, password, submit); redirects to `/` on success
- [x] Update `frontend/src/app/page.tsx` — `AuthGate` calls `/api/auth/me` on load; redirect to `/login` if 401
- [x] Add logout button to board header calling `POST /api/auth/logout` then redirecting to `/login`
- [x] Rebuild Docker image; confirm full flow works end-to-end

### Tests (in `testing/backend/`)

- [x] `test_auth.py`:
  - `POST /api/auth/login` with correct creds returns 200 + sets cookie
  - `POST /api/auth/login` with wrong creds returns 401
  - `GET /api/auth/me` with valid cookie returns `{username: "user"}`
  - `GET /api/auth/me` without cookie returns 401
  - `POST /api/auth/logout` clears cookie

### Tests (in `testing/frontend/`)

- [x] Vitest: `frontend/src/app/login/page.test.tsx` — form renders; bad credentials show error (e2e lives under `frontend/tests/` per current layout, not `testing/frontend/`)

### Tests (Playwright, `frontend/tests/`)

- [x] Unauthenticated visit to `/` redirects to `/login`
- [x] Logging in with correct credentials shows the board
- [x] Wrong credentials show an error message
- [x] Logout returns to `/login`

### Success Criteria

- Unauthenticated users cannot see the board
- `user` / `password` logs in successfully
- Wrong credentials show an error
- Logout works and clears session
- All tests pass

---

## Part 5: Database Modeling

**Goal:** Propose and get sign-off on a SQLite schema that supports multiple users and multiple boards (future-proofed MVP).

**Implementation note (current code vs this part):** Parts 6–7 were implemented **before** this design package using a **stopgap** store: table `board_state` with a single row and a **JSON payload** for the whole board (`backend/database.py`, `backend/board_seed.py`). There are **no** `users` / `boards` / `columns` / `cards` tables yet, and board data is **not** keyed by user ID in the database (the MVP has one logical board per deployment). **Part 5 is still the right next documentation step** when you want a signed-off `docs/schema.json` and `docs/DATABASE.md` so a later refactor can migrate the JSON snapshot into normalized tables, tie rows to `users`, and support multiple boards without changing the product goals.

### Steps

- [ ] Design schema covering: `users`, `boards`, `columns`, `cards` tables
- [ ] Save schema as `docs/schema.json` (table definitions, field types, constraints, relationships)
- [ ] Create `docs/DATABASE.md` documenting design decisions and rationale
- [ ] Present to user for sign-off before any implementation

### Success Criteria

- `docs/schema.json` defines all tables and relationships
- `docs/DATABASE.md` explains design choices
- User has explicitly approved the schema

---

## Part 6: Backend API

**Goal:** FastAPI reads and writes Kanban data from SQLite. Database is auto-created if it doesn't exist.

**MVP implementation note:** The board is stored as a **single JSON snapshot** in SQLite (`board_state` table, one row). The API is **`GET /api/board`** and **`PUT /api/board`** instead of per-resource `PATCH`/`POST`/`DELETE` routes. That satisfies persistence for the MVP; granular REST routes remain optional if the schema moves to normalized tables (Part 5).

### Steps

- [x] Add `sqlite3` (stdlib) — no SQLAlchemy/Alembic for this MVP slice
- [x] Create `backend/database.py` — SQLite path from `DATABASE_PATH` or `{DATA_DIR}/kanban.db`, `init_db()` on app lifespan, `load_board` / `save_board`
- [x] Create `backend/board_seed.py` — default board JSON (kept in sync with `frontend/src/lib/kanban.ts` `initialData`)
- [ ] Create `backend/models.py` — deferred until Part 5 normalized schema
- [ ] Create `backend/crud.py` — deferred; full-board read/write covers MVP mutations
- [x] Add API routes in `backend/main.py`:
  - [x] `GET /api/board` — returns full board for authenticated user
  - [x] `PUT /api/board` — replaces full board JSON (covers rename, add, move, delete on the client)
  - [ ] `PATCH /api/columns/{id}`, `POST /api/cards`, `PATCH /api/cards/{id}`, `DELETE /api/cards/{id}` — optional future split endpoints
- [x] Seed default board (5 columns, sample cards) on first DB init
- [x] Board routes require auth (`Depends(require_user)`)

### Tests (in `testing/backend/`)

- [x] `test_board.py` — `GET /api/board` after login; `PUT` persists changes; unauthenticated `GET` returns 401
- [ ] Per-route tests for `PATCH/POST/DELETE` — N/A until those routes exist
- [x] DB creation on startup — covered by `TestClient` lifespan + `test_board` (tables + seed)

### Tests (in `testing/api/`)

- [ ] Integration tests hitting the full Docker stack via HTTP (optional; `test_frontend_served.py` covers static + hello)

### Success Criteria

- [x] Board state persists across container restarts (SQLite on Docker volume `/app/data`)
- [x] Unit tests pass with isolated test DB (`testing/backend/.pytest_kanban.db` via `DATABASE_PATH`)
- [x] Unauthenticated `GET/PUT /api/board` return 401

---

## Part 7: Frontend + Backend Integration

**Goal:** The frontend reads and writes Kanban data from the real API. No more **client-only** `initialData` as the source of truth after load.

**MVP implementation note:** `frontend/src/lib/api.ts` exposes **`fetchBoard`** and **`persistBoard`** (full snapshot). Each local mutation updates React state and then **`PUT /api/board`**. `initialData` remains in `kanban.ts` for types, Vitest mocks, seed parity with the backend, and non-production demos — it is **not** used to initialize the board after `GET /api/board` succeeds.

### Steps

- [x] Create `frontend/src/lib/api.ts` — `fetchBoard` / `persistBoard` (`GET` / `PUT /api/board`); not the per-operation helpers from the original checklist
- [x] Update `KanbanBoard.tsx` — `useEffect` loads `GET /api/board`; loading and load-error UI
- [x] Mutation handlers (drag, rename, add, delete) update state and call `persistBoard`
- [x] API errors — load failure message; save failure banner (non-silent)
- [x] Docker stack serves app + API on one origin; dev uses Next rewrites to port 8000

### Tests (in `testing/frontend/`)

- [ ] Folder still minimal; Vitest/Playwright live under `frontend/`

### Tests (Vitest / Playwright, `frontend/`)

- [x] Vitest: `KanbanBoard.test.tsx` mocks `fetch` for `GET`/`PUT /api/board`
- [x] Playwright `frontend/tests/kanban.spec.ts` — login, board, add/move cards (API on 8000 via dual `webServer`)

### Tests (in `testing/api/`)

- [ ] Full flow integration test: login → load board → add card → reload (optional enhancement)

### Success Criteria

- [x] Board state survives page refresh (server is source of truth)
- [x] Rename column, add/move/delete card persist via `PUT /api/board`
- [x] Runtime board data does not come from `initialData`; that object is only seed/types/tests
- [x] Relevant unit + e2e tests pass

---

## Part 8: AI Connectivity

**Goal:** Backend can make an OpenRouter API call. Connectivity verified with a simple arithmetic prompt.

### Steps

- [ ] Add `httpx` (or `openai`) to `pyproject.toml`
- [ ] Create `backend/ai.py` — `call_openrouter(messages)` function using the OpenRouter API with model `openai/gpt-oss-120b:free`; reads `OPENROUTER_API_KEY` from environment
- [ ] Add `POST /api/ai/test` route — calls AI with `"What is 2+2?"` and returns the response text (dev/debug only)
- [ ] Pass `OPENROUTER_API_KEY` from `.env` into Docker via `docker-compose.yml`

### Tests (in `testing/backend/`)

- [ ] `test_ai.py` — mock OpenRouter HTTP call; assert `call_openrouter` sends correct headers, model name, and messages

### Tests (in `testing/api/`)

- [ ] Live connectivity test (marked skip by default, run manually): `POST /api/ai/test` returns a response containing "4"

### Success Criteria

- `call_openrouter` function exists and is testable with mocked HTTP
- Live test against OpenRouter returns a sensible answer to "2+2"
- `OPENROUTER_API_KEY` is passed via environment variable, never hardcoded

---

## Part 9: AI Kanban Agent

**Goal:** The AI receives the full board state and conversation history, and responds with structured output that optionally includes board mutations.

### Steps

- [ ] Define a Pydantic response schema in `backend/ai.py`:
  ```
  AiResponse:
    message: str                     # text reply to user
    mutations: list[BoardMutation] | None
  
  BoardMutation (discriminated union):
    CreateCard:  column_id, title, details
    MoveCard:    card_id, target_column_id, position
    DeleteCard:  card_id
    RenameColumn: column_id, title
  ```
- [ ] Update `call_openrouter` to use structured output / JSON mode with the schema above
- [ ] Create `backend/routers/chat.py` — `POST /api/chat` route:
  - Accepts `{message: str, history: [{role, content}]}`
  - Fetches current board for authenticated user
  - Sends board JSON + history + user message to AI
  - Applies any `mutations` to database
  - Returns `{message, mutations_applied}`
- [ ] Write system prompt in `backend/prompts.py` explaining the board structure and available mutation types

### Tests (in `testing/backend/`)

- [ ] `test_chat.py`:
  - Mock AI call; assert board JSON is included in the prompt
  - Assert mutations are applied to the database
  - Assert response includes `message`
  - Test each mutation type: create, move, delete, rename

### Tests (in `testing/api/`)

- [ ] Integration: `POST /api/chat` with message "Move card X to Done" results in card being in Done column

### Success Criteria

- AI always receives full board state + conversation history
- Board mutations are applied atomically
- Response includes natural language message to user
- All unit tests pass with mocked AI

---

## Part 10: AI Chat Sidebar UI

**Goal:** A polished sidebar in the frontend enables full AI chat. If the AI returns mutations, the board refreshes automatically.

### Steps

- [ ] Create `frontend/src/components/ChatSidebar.tsx` — collapsible sidebar panel:
  - Message history (user / assistant bubbles)
  - Text input + Send button
  - Loading indicator while waiting for AI response
  - Auto-scroll to latest message
- [ ] Integrate `ChatSidebar` into `KanbanBoard.tsx` layout alongside the board
- [ ] On AI response, if `mutations_applied` is non-empty, call `getBoard` and refresh board state
- [ ] Add toggle button in board header to open/close sidebar
- [ ] Persist chat history in component state for the session (not database)
- [ ] Style to match color scheme: navy header, purple send button, accent yellow highlights

### Tests (in `testing/frontend/`)

- [ ] Vitest: `ChatSidebar` renders input and history; send message calls API; response appears in history
- [ ] Playwright e2e in `testing/frontend/`:
  - Open sidebar, type a message, submit
  - AI response appears in sidebar
  - If mutation applied, board columns/cards update without manual refresh

### Tests (in `testing/chat/`)

- [ ] Integration: send a natural language instruction, assert board is updated and sidebar shows AI reply

### Success Criteria

- Chat sidebar opens and closes cleanly
- Full conversation history displayed during session
- Board auto-refreshes when AI makes changes
- No page reload required at any point
- All tests pass

---

## Testing Directory Structure

All tests live under `testing/` at the project root, separate from source:

```
testing/
├── frontend/     # Vitest unit/integration and Playwright e2e for the UI
├── backend/      # pytest unit tests for FastAPI routes, database, auth
├── api/          # HTTP integration tests against the running Docker stack
└── chat/         # End-to-end AI chat flow tests
```

Each subfolder has its own `README.md` explaining how to run its tests.
