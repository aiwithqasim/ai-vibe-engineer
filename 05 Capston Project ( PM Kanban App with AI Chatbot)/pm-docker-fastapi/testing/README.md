# Testing

Automated tests live under **`testing/`** (pytest) and inside **`frontend/`** (Vitest and Playwright). This directory is separate from application source on purpose.

## Layout

| Subfolder | Scope |
|-----------|--------|
| **`backend/`** | Pytest: FastAPI routes with `TestClient` (auth, board, hello, static fallback). |
| **`api/`** | Pytest + HTTPX against a **running** stack (usually `http://localhost:8000` after Docker start). |
| **`frontend/`** | Notes only; Vitest and Playwright run from **`frontend/`** (`npm run test:unit`, `npm run test:e2e`). |
| **`chat/`** | Skipped placeholder (`test_chat_integration.py`) for future full-stack AI flows; backend chat is covered with mocks under `testing/backend/`. |

## Quick commands

From the **repository root**:

```bash
PYTHONPATH=. python -m pytest testing/backend/
```

With Docker already up:

```bash
pytest testing/api/
```

From **`frontend/`**:

```bash
npm run test:unit
npm run test:e2e
```

Each subfolder has its own **README.md** with prerequisites and details.
