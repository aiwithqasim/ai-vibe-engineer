# Backend (FastAPI)

Python service that exposes JSON APIs under `/api/`, authenticates users with an HTTP-only session cookie (JWT), persists the Kanban board in **SQLite**, and (when `backend/static/` is populated) serves the exported Next.js app at `/`.

## Layout

| File / area | Role |
|-------------|------|
| `main.py` | FastAPI app, lifespan (`database.init_db`), auth routes, board routes, static mount or HTML fallback |
| `auth.py` | JWT create/decode, MVP credentials `user` / `password`, cookie name `session` |
| `database.py` | SQLite path, `init_db`, `load_board`, `save_board` |
| `board_seed.py` | Default board JSON (must stay aligned with `frontend/src/lib/kanban.ts` `initialData`) |
| `static/` | Filled at Docker build time from `frontend/out/` (not always present in a raw clone) |
| `pyproject.toml` | Package metadata; optional `[test]` extras for local pytest |

## API (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/hello` | No | Health JSON |
| POST | `/api/auth/login` | No | Body: `username`, `password`; sets `session` cookie |
| POST | `/api/auth/logout` | No | Clears `session` |
| GET | `/api/auth/me` | Cookie | `{"username"}` or 401 |
| GET | `/api/board` | Cookie | Full board JSON |
| PUT | `/api/board` | Cookie | Replace full board JSON |

## SQLite

- Default file: `{DATA_DIR}/kanban.db` (`DATA_DIR` defaults to `data` locally, `/app/data` in Docker).
- Table: `board_state` — single row `id = 1`, column `payload` (JSON text).
- Override with **`DATABASE_PATH`** (absolute or relative path to the file).

## Running locally

From the **repository root**:

```bash
export PYTHONPATH=.   # Windows: set PYTHONPATH=.
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Without `backend/static/`, `GET /` returns a minimal HTML stub; APIs still work.

## Tests

See **`../testing/backend/README.md`**.

More context for agents: **`AGENTS.md`** in this directory.
