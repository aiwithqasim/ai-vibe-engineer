# Backend tests (pytest)

Unit and integration-style tests for the FastAPI application using **Starlette `TestClient`** (HTTPX). No Docker required.

## Prerequisites

Install Python 3.12+ and test dependencies. From the **repository root**:

```bash
pip install pytest httpx PyJWT
```

Or use the optional extras from `backend/pyproject.toml` if you install the backend package in editable mode.

## Run

From the **repository root**:

```bash
PYTHONPATH=. python -m pytest testing/backend/
```

On Windows CMD:

```bat
set PYTHONPATH=.
python -m pytest testing/backend/
```

## Behaviour

- **`conftest.py`** sets **`DATABASE_PATH`** to `testing/backend/.pytest_kanban.db` and removes that file before import so each run gets a clean DB. It uses `TestClient` as a context manager so **FastAPI lifespan** runs (`database.init_db()`).
- An **autouse** fixture resets the board payload to **`BOARD_SEED`** before every test so mutations do not leak order.
- Tests cover **`/api/hello`**, auth, **`GET`/`PUT /api/board`**, granular column/card routes (`test_board_routes.py`), static fallback when `backend/static/` is absent, OpenRouter client mocks (`test_ai.py`), and **`POST /api/chat`** with mocked AI (`test_chat.py`).

## See also

- **`../README.md`** — overview of all test locations
- **`../../backend/README.md`** — API and SQLite overview
