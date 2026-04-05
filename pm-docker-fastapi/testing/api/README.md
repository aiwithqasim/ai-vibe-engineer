# API integration tests (pytest)

HTTP tests against a **live** application URL (default **http://localhost:8000**). These assert the real Docker-built stack: static frontend, `/login` HTML route, `/api/hello`, and Kanban HTML markers.

## Prerequisites

1. Build and start the stack (see **`../../README.md`**):

   - `scripts/start.bat` (Windows) or `scripts/start.sh` (Mac/Linux)

2. Install **pytest** and **httpx** if needed:

   ```bash
   pip install pytest httpx
   ```

## Run

From the **repository root**:

```bash
pytest testing/api/
```

Ensure nothing else is blocking port **8000** or change `BASE_URL` inside `test_frontend_served.py` if you use a different host/port.

## Scope

- **`test_frontend_served.py`** — `GET /` HTML, `GET /api/hello`, content checks for the Kanban app when the static export is present in the running image.
- **`test_board_flow.py`** — login, `POST /api/cards`, `GET /api/board`, `DELETE /api/cards/{id}` (skips if nothing is listening on `localhost:8000`; optional `API_BASE_URL` env override).

## See also

- **`../README.md`** — testing directory overview
- **`../../README.md`** — how to run the project
