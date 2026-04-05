# Scripts

Start and stop scripts for the Docker stack. All scripts must be run from any directory — they resolve the project root automatically.

## Files

| File | Platform | Description |
|---|---|---|
| `start.sh` | Mac / Linux | `docker compose up --build -d` |
| `stop.sh` | Mac / Linux | `docker compose down` |
| `start.bat` | Windows | `docker compose up --build -d` |
| `stop.bat` | Windows | `docker compose down` |

## Usage

**Windows:**
```
scripts\start.bat
scripts\stop.bat
```

**Mac / Linux:**
```
chmod +x scripts/start.sh scripts/stop.sh
scripts/start.sh
scripts/stop.sh
```

After starting, the app is available at `http://localhost:8000`.

Compose reads a project-root `.env` (create if missing). Add `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`) for AI chat and `/api/ai/test`; see root `README.md`.
