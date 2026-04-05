# Backend

Python FastAPI backend. Serves the static Next.js frontend at `/` and exposes API routes under `/api/`.

## Stack

| Concern | Choice |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Package manager | uv |
| Database | SQLite (`board_state` JSON snapshot; see `docs/schema.json` for target relational schema) |
| HTTP client | httpx (OpenRouter) |
| Python | 3.12 |

## Structure

```
backend/
├── main.py             # FastAPI app, static mount, includes chat router
├── auth.py             # JWT session cookie, require_user dependency
├── ai.py               # OpenRouter call, Pydantic mutation / AiResponse models
├── prompts.py          # CHAT_SYSTEM_PROMPT for board-aware assistant
├── board_mutations.py  # Apply AI mutation payloads to in-memory board dict
├── routers/
│   └── chat.py         # POST /api/chat
├── models.py           # Pydantic models for board + request bodies
├── crud.py             # Board mutations, apply_ai_mutations_from_payloads
├── database.py         # SQLite init/load/save
├── board_seed.py       # Default board JSON
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
| POST | `/api/ai/test` | Auth required; short OpenRouter sanity check; returns `{answer}` |
| POST | `/api/chat` | Auth required; body `{message, history[]}`; AI reply + optional mutations; returns `{message, mutations_applied, board}` |
| GET | `/` | Serves static frontend (or fallback HTML if not built) |

SQLite file: `DATABASE_PATH` env, or `{DATA_DIR}/kanban.db` (Docker: `DATA_DIR=/app/data`, volume-mounted). Seeded once with default columns/cards matching the frontend.

JWT signing uses env `AUTH_SECRET` (default insecure dev string if unset).

**OpenRouter:** `OPENROUTER_API_KEY` required for AI routes. Optional `OPENROUTER_MODEL` (default `openai/gpt-oss-120b:free` in `ai.py`).

## Static File Serving

On startup, `main.py` checks for a `backend/static/` directory. If present (populated by the Docker build from `frontend/out/`), it mounts it at `/` using `StaticFiles(html=True)`. If absent (local dev without a built frontend), it serves a minimal HTML fallback. `GET /login` serves `login.html` when static is present.

## Running Locally (without Docker)

```
uv pip install -e ".[test]"
uvicorn backend.main:app --reload
```

## Tests

See `testing/backend/`.
