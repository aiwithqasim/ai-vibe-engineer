# Backend

Python FastAPI backend. Serves the static Next.js frontend at `/` and exposes API routes under `/api/`.

## Stack

| Concern | Choice |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Package manager | uv |
| Database | SQLite (`board_state` JSON snapshot; see `docs/schema.json` for target relational schema) |
| Python | 3.12 |

## Structure

```
backend/
├── main.py          # FastAPI app, routes, static mount
├── auth.py          # JWT session cookie
├── models.py        # Pydantic models for board + request bodies
├── crud.py          # Board mutations (dict + save_board)
├── database.py      # SQLite init/load/save
├── board_seed.py    # Default board JSON
└── pyproject.toml
```

## Routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/hello` | Health check — returns `{"message": "hello world"}` |
| POST | `/api/auth/login` | JSON `{username, password}` — MVP: `user` / `password`; sets HTTP-only `session` cookie (JWT) |
| POST | `/api/auth/logout` | Clears `session` cookie |
| GET | `/api/auth/me` | Returns `{"username"}` if cookie valid, else 401 |
| GET | `/api/board` | Full board JSON; requires auth |
| PUT | `/api/board` | Replace full board JSON; requires auth |
| PATCH | `/api/columns/{id}` | Body `{title}`; returns `{board}` |
| POST | `/api/cards` | Body `{column_id, title, details}`; returns `{board}` |
| PATCH | `/api/cards/{id}` | Partial update / move (`column_id`, `index`, etc.); returns `{board}` |
| DELETE | `/api/cards/{id}` | Returns `{board}` |
| GET | `/` | Serves static frontend (or fallback HTML if not built) |

SQLite file: `DATABASE_PATH` env, or `{DATA_DIR}/kanban.db` (Docker: `DATA_DIR=/app/data`, volume-mounted). Seeded once with default columns/cards matching the frontend.

JWT signing uses env `AUTH_SECRET` (default insecure dev string if unset). More routes are added in Parts 8, 9.

## Static File Serving

On startup, `main.py` checks for a `backend/static/` directory. If present (populated by the Docker build from `frontend/out/`), it mounts it at `/` using `StaticFiles(html=True)`. If absent (local dev without a built frontend), it serves a minimal HTML fallback. `GET /login` serves `login.html` when static is present.

## Running Locally (without Docker)

```
uv pip install -e ".[test]"
uvicorn backend.main:app --reload
```

## Tests

See `testing/backend/`.
