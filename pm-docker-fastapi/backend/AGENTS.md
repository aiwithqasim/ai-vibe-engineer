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
| GET | `/` | Serves static frontend (or fallback HTML if not built) |

More routes are added in Parts 4, 6, 8, 9.

## Static File Serving

On startup, `main.py` checks for a `backend/static/` directory. If present (populated by the Docker build from `frontend/out/`), it mounts it at `/` using `StaticFiles(html=True)`. If absent (local dev without a built frontend), it serves a minimal HTML fallback.

## Running Locally (without Docker)

```
uv pip install -e ".[test]"
uvicorn backend.main:app --reload
```

## Tests

See `testing/backend/`.
