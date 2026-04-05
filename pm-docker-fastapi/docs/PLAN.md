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

- [ ] Update `Dockerfile` — add Node.js build stage: `npm ci && npm run build` inside `frontend/`, copy `frontend/out/` to backend static dir
- [ ] Update `next.config.ts` — set `output: "export"` and `basePath` if needed, disable image optimization for static export
- [ ] Update FastAPI `main.py` — mount `/` to serve the exported static files directory
- [ ] Verify routing: Next.js static export produces `index.html` at root
- [ ] Smoke test: rebuild Docker image and confirm Kanban board loads at `http://localhost:8000/`

### Tests (in `testing/frontend/`)

- [ ] Existing Vitest unit tests pass: `npm run test:unit`
- [ ] New integration test: confirm exported `out/index.html` exists after `npm run build`
- [ ] Update Playwright config `baseURL` to `http://localhost:8000` for Docker context (keep `http://127.0.0.1:3000` for local dev)
- [ ] E2e smoke test in `testing/frontend/` — load `/`, assert 5 columns present

### Tests (in `testing/api/`)

- [ ] `test_frontend_served.py` — `GET /` returns 200 and contains Kanban app HTML

### Success Criteria

- `http://localhost:8000/` shows the Kanban board (all 5 columns, seeded cards)
- Drag and drop works in browser
- All unit and e2e tests pass

---

## Part 4: Authentication

**Goal:** A login page guards the Kanban board. Hardcoded credentials (`user` / `password`). A logout button clears the session.

### Steps

- [ ] Add `POST /api/auth/login` to FastAPI — accepts `{username, password}`, validates against hardcoded values, returns a signed JWT (or session token) in an HTTP-only cookie
- [ ] Add `POST /api/auth/logout` — clears the cookie
- [ ] Add `GET /api/auth/me` — returns `{username}` if authenticated, else 401
- [ ] Create `frontend/src/app/login/page.tsx` — login form (username, password, submit); redirects to `/` on success
- [ ] Update `frontend/src/app/page.tsx` — call `/api/auth/me` on load; redirect to `/login` if 401
- [ ] Add logout button to board header calling `POST /api/auth/logout` then redirecting to `/login`
- [ ] Rebuild Docker image; confirm full flow works end-to-end

### Tests (in `testing/backend/`)

- [ ] `test_auth.py`:
  - `POST /api/auth/login` with correct creds returns 200 + sets cookie
  - `POST /api/auth/login` with wrong creds returns 401
  - `GET /api/auth/me` with valid cookie returns `{username: "user"}`
  - `GET /api/auth/me` without cookie returns 401
  - `POST /api/auth/logout` clears cookie

### Tests (in `testing/frontend/`)

- [ ] Vitest: login form renders, submits, shows error on bad credentials
- [ ] Playwright e2e in `testing/frontend/`:
  - Unauthenticated visit to `/` redirects to `/login`
  - Logging in with correct credentials shows the board
  - Logging in with wrong credentials shows an error message
  - Logout returns to `/login`

### Success Criteria

- Unauthenticated users cannot see the board
- `user` / `password` logs in successfully
- Wrong credentials show an error
- Logout works and clears session
- All tests pass

---

## Part 5: Database Modeling

**Goal:** Propose and get sign-off on a SQLite schema that supports multiple users and multiple boards (future-proofed MVP).

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

### Steps

- [ ] Add `sqlalchemy` (or raw `sqlite3`) and `alembic` (optional) to `pyproject.toml`
- [ ] Create `backend/database.py` — SQLite connection, table creation on startup if not exists
- [ ] Create `backend/models.py` — SQLAlchemy models (or dataclasses) for users, boards, columns, cards
- [ ] Create `backend/crud.py` — functions: `get_board(user_id)`, `update_column_title(column_id, title)`, `move_card(card_id, target_column_id, position)`, `create_card(column_id, title, details)`, `delete_card(card_id)`
- [ ] Add API routes in `backend/main.py`:
  - `GET /api/board` — returns full board for authenticated user
  - `PATCH /api/columns/{id}` — rename column
  - `POST /api/cards` — create card
  - `PATCH /api/cards/{id}` — move or edit card
  - `DELETE /api/cards/{id}` — delete card
- [ ] Seed default board with 5 columns and sample cards on first login
- [ ] All routes require valid auth cookie (middleware or dependency)

### Tests (in `testing/backend/`)

- [ ] `test_board_api.py`:
  - `GET /api/board` returns full board structure for authenticated user
  - `PATCH /api/columns/{id}` updates column title and persists
  - `POST /api/cards` creates card in correct column and persists
  - `PATCH /api/cards/{id}` moves card to correct column at correct position
  - `DELETE /api/cards/{id}` removes card and persists
  - All routes return 401 when unauthenticated
- [ ] `test_database.py` — database is created if it doesn't exist on startup

### Tests (in `testing/api/`)

- [ ] Integration tests hitting the full Docker stack via HTTP

### Success Criteria

- All CRUD operations persist across container restarts (SQLite file mounted as volume)
- All unit tests pass with isolated in-memory SQLite
- Unauthenticated requests to all API routes return 401

---

## Part 7: Frontend + Backend Integration

**Goal:** The frontend reads and writes Kanban data from the real API. No more `initialData` in memory.

### Steps

- [ ] Create `frontend/src/lib/api.ts` — typed fetch helpers for all API routes (`getBoard`, `renameColumn`, `createCard`, `moveCard`, `deleteCard`)
- [ ] Update `KanbanBoard.tsx` — replace `initialData` useState init with `useEffect` fetch to `GET /api/board`; show loading state
- [ ] Update all board mutation handlers to call API functions and then update local state on success (optimistic or confirmed)
- [ ] Handle API errors gracefully (show toast or error message, do not silently fail)
- [ ] Rebuild and test full Docker stack end-to-end

### Tests (in `testing/frontend/`)

- [ ] Vitest: mock `api.ts` and test `KanbanBoard` fetches on mount, calls API on mutations
- [ ] Update `testing/frontend/` e2e tests to run against Docker stack (`http://localhost:8000`):
  - Login, load board, rename column, add card, move card, delete card, refresh — data persists

### Tests (in `testing/api/`)

- [ ] Full flow integration test: login → load board → add card → reload → card still present

### Success Criteria

- Board state survives page refresh
- All Kanban operations (rename column, add/move/delete card) persist to database
- No use of `initialData` in production flow
- All tests pass

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
