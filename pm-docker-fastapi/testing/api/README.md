# API Integration Tests

HTTP integration tests that run against the full Docker stack.

## Prerequisites

Stack must be running:

```
scripts/start.bat   # Windows
scripts/start.sh    # Mac / Linux
```

## Run

```
pytest testing/api/
```
