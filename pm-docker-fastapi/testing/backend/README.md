# Backend Tests

Unit tests for FastAPI routes using pytest + HTTPX TestClient.

## Setup

From the project root (`pm/`):

```
uv pip install -e "backend/[test]"
```

Or install test deps directly:

```
uv pip install pytest httpx
```

## Run

```
pytest testing/backend/
```
