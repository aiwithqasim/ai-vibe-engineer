# Scripts

Cross-platform helpers to start and stop the **Docker Compose** stack from the **repository root**. Scripts change directory to the parent of `scripts/` automatically, so you can run them from anywhere if you use the full path.

## Files

| Script | Platform | Command |
|--------|----------|---------|
| `start.sh` | Mac / Linux | `docker compose up --build -d` |
| `stop.sh` | Mac / Linux | `docker compose down` |
| `start.bat` | Windows | `docker compose up --build -d` |
| `stop.bat` | Windows | `docker compose down` |

## Requirements

- **Docker Desktop** (or compatible engine) must be running.
- **`.env`** at the repo root — required by `docker-compose.yml` (`env_file`). Create an empty file if you have no secrets yet. Add **`OPENROUTER_API_KEY`** (and optionally **`OPENROUTER_MODEL`**) for AI chat; see **`../README.md`**.

## Usage

**Windows (Command Prompt or PowerShell), from repo root:**

```text
scripts\start.bat
scripts\stop.bat
```

**Mac / Linux:**

```bash
chmod +x scripts/start.sh scripts/stop.sh
./scripts/start.sh
./scripts/stop.sh
```

After a successful start, the UI is at **http://localhost:8000**.

`start.bat` checks the exit code of `docker compose` and prints an error instead of a success line if Docker is not reachable.

## See also

- **`../README.md`** — full runbook and environment variables
- **`../docker-compose.yml`** — service definition, port `8000:8000`, volume for `/app/data`
