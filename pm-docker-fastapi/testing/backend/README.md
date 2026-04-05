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
- Tests cover **`/api/hello`**, auth cookies, **`GET`/`PUT /api/board`**, and static fallback when `backend/static/` is absent.

## See also

- **`../README.md`** — overview of all test locations
- **`../../backend/README.md`** — API and SQLite overview
