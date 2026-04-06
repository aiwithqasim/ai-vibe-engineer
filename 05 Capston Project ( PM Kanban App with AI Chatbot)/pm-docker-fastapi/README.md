# Kanban Studio (PM MVP)

Local-first project management UI: sign in, Kanban board with drag-and-drop, persisted board state in SQLite. Packaged as a single Docker image (FastAPI serves the static Next.js app and JSON APIs).

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, Vitest, Playwright |
| Backend | Python 3.12, FastAPI, Uvicorn, PyJWT, stdlib `sqlite3` |
| AI | OpenRouter (`OPENROUTER_API_KEY` in `.env`; optional `OPENROUTER_MODEL`) |

## Prerequisites

- **Docker Desktop** running (for the default workflow)
- Optional: **Node.js 22+** and **Python 3.12+** for local frontend/backend development and tests without rebuilding the image

## Quick start (Docker)

1. Create a `.env` file in the project root (same directory as `docker-compose.yml`). Docker Compose expects this file to exist. For AI chat and `POST /api/ai/test`, set **`OPENROUTER_API_KEY`** (see **Environment variables** below).

2. Start the stack:

   - **Windows:** `scripts\start.bat`
   - **Mac / Linux:** `chmod +x scripts/start.sh scripts/stop.sh` then `./scripts/start.sh`

3. Open **http://localhost:8000**

4. Sign in with **`user`** / **`password`** (MVP hardcoded account).

5. Stop the stack:

   - **Windows:** `scripts\stop.bat`
   - **Mac / Linux:** `./scripts/stop.sh`

The app listens on port **8000**. Board data is stored in SQLite inside the Docker volume at **`/app/data/kanban.db`** (see `docker-compose.yml`).

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `OPENROUTER_API_KEY` | `.env` | OpenRouter API for `POST /api/chat` and `POST /api/ai/test` |
| `OPENROUTER_MODEL` | `.env` (optional) | Model id (default `openai/gpt-oss-120b:free` in backend) |
| `AUTH_SECRET` | `.env` (optional) | JWT signing secret; default dev string if unset |
| `DATA_DIR` | Docker image / compose | SQLite directory (default `/app/data` in container) |
| `DATABASE_PATH` | Optional | Full path to SQLite file; overrides `{DATA_DIR}/kanban.db` |
| `RUN_LIVE_AI` | Shell (optional) | Set to `1` to run optional live OpenRouter check in `testing/api/test_ai_live.py` |

## Local development (without Docker)

**Backend only**

From the repository root, with Python 3.12 and dependencies installed (`pip install fastapi uvicorn PyJWT python-multipart` or use `backend/pyproject.toml`):

```bash
set PYTHONPATH=.
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

SQLite file defaults to `data/kanban.db` under the repo (directory is created on startup).

**Frontend only**

From `frontend/`:

```bash
npm install
npm run dev
```

`next.config.ts` rewrites `/api/*` to `http://127.0.0.1:8000` in development, so run the API on port 8000 at the same time for login and board APIs.

## Project layout

| Path | Role |
|------|------|
| `backend/` | FastAPI app, auth, SQLite board persistence, static export target |
| `frontend/` | Next.js Kanban UI (static export built into the image) |
| `docs/` | Execution plan and future database design docs |
| `scripts/` | Docker Compose start/stop helpers |
| `testing/` | Pytest (backend, API) and notes for frontend tests (Vitest/Playwright live under `frontend/`) |

Each of these folders has its own **README.md** with more detail.

## Tests

- **Backend (pytest):** from repo root, `PYTHONPATH=. python -m pytest testing/backend/`
- **API integration (needs Docker up):** `pytest testing/api/` (skips if `localhost:8000` is unreachable; includes `test_board_flow.py`, optional live AI test behind `RUN_LIVE_AI=1`)
- **Frontend unit:** `cd frontend && npm run test:unit`
- **Frontend e2e:** `cd frontend && npm run test:e2e` (Playwright starts the API and Next dev server; see `frontend/playwright.config.ts`)
- **Frontend e2e vs Docker only:** start the stack, then `cd frontend && npm run test:e2e:docker` (see `frontend/playwright.docker.config.ts`)
- **Static export check:** `cd frontend && npm run build` runs `verify:export` after build (`out/index.html`, `out/login.html`)

## Documentation

- Product and agent rules: **`AGENTS.md`** (repo root)
- Phased delivery checklist: **`docs/PLAN.md`**
