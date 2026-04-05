# Backend (FastAPI)

Python service that exposes JSON APIs under `/api/`, authenticates users with an HTTP-only session cookie (JWT), persists the Kanban board in **SQLite**, and (when `backend/static/` is populated) serves the exported Next.js app at `/`.

## Layout

| File / area | Role |
|-------------|------|
| `main.py` | FastAPI app, lifespan (`database.init_db`), auth, board routes, `POST /api/ai/test`, chat router include, static mount |
| `ai.py`, `prompts.py`, `board_mutations.py`, `routers/chat.py` | OpenRouter client, system prompt, mutation apply, `POST /api/chat` |
| `auth.py` | JWT create/decode, MVP credentials `user` / `password`, cookie name `session` |
| `models.py` | Pydantic models for board payloads and PATCH/POST bodies |
| `crud.py` | Mutations on in-memory board dict + `save_board` |
| `database.py` | SQLite path, `init_db`, `load_board`, `save_board`, `reset_board_to_seed` (tests) |
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
| PUT | `/api/board` | Cookie | Replace full board JSON (bulk) |
| PATCH | `/api/columns/{id}` | Cookie | Body `{ "title" }`; response `{ "board": ... }` |
| POST | `/api/cards` | Cookie | Body `{ "column_id", "title", "details" }`; response `{ "board": ... }` |
| PATCH | `/api/cards/{id}` | Cookie | Optional `title`, `details`, `column_id`, `index` (at least one); `{ "board": ... }` |
| DELETE | `/api/cards/{id}` | Cookie | Response `{ "board": ... }` |
| POST | `/api/ai/test` | Cookie | OpenRouter sanity check; response `{ "answer": ... }` (503 if key missing) |
| POST | `/api/chat` | Cookie | Body `{ "message", "history": [{ "role", "content" }] }`; response `{ "message", "mutations_applied", "board" }` |

**Environment (AI):** `OPENROUTER_API_KEY` required for chat and ai/test. Optional `OPENROUTER_MODEL` (default in code: `openai/gpt-oss-120b:free`).

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
