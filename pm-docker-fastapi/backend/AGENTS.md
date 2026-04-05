# Backend

Python FastAPI backend. Serves the static Next.js frontend at `/` and exposes API routes under `/api/`.

## Stack

| Concern | Choice |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Package manager | uv |
| Database | SQLite (added in Part 6) |
| Python | 3.12 |

## Structure

```
backend/
├── main.py          # FastAPI app, route definitions, static file mounting
└── pyproject.toml   # Project metadata and dependencies
```

## Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/hello` | Health check — returns `{"message": "hello world"}` |
| POST | `/api/auth/login` | JSON `{username, password}` — MVP: `user` / `password`; sets HTTP-only `session` cookie (JWT) |
| POST | `/api/auth/logout` | Clears `session` cookie |
| GET | `/api/auth/me` | Returns `{"username"}` if cookie valid, else 401 |
| GET | `/` | Serves static frontend (or fallback HTML if not built) |
| GET | `/api/board` | Returns board JSON (columns + cards); requires auth cookie |
| PUT | `/api/board` | Replaces full board state; requires auth cookie |

SQLite file: `DATABASE_PATH` env, or `{DATA_DIR}/kanban.db` (Docker: `DATA_DIR=/app/data`, volume-mounted). Seeded once with default columns/cards matching the frontend.

JWT signing uses env `AUTH_SECRET` (default insecure dev string if unset). More routes are added in Parts 8, 9.

## Static File Serving

On startup, `main.py` checks for a `backend/static/` directory. If present (populated by the Docker build from `frontend/out/`), it mounts it at `/` using `StaticFiles(html=True)`. If absent (local dev without a built frontend), it serves a minimal HTML fallback.

## Running Locally (without Docker)

```
uv pip install -e ".[test]"
uvicorn backend.main:app --reload
```

## Tests

See `testing/backend/`.
