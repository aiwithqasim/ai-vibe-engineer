# Chat / AI integration tests

## Current state

- **`test_chat_integration.py`** — module skipped by default; reserved for future end-to-end flows against Docker + real or stubbed AI.

## Covered elsewhere

- **Mocked HTTP:** `testing/backend/test_ai.py`, `testing/backend/test_chat.py` (no OpenRouter key required).
- **Optional live call:** `testing/api/test_ai_live.py` with `RUN_LIVE_AI=1` and stack + key (see `../api/README.md`).

## Run

```bash
pytest testing/chat/
```

## See also

- **`../../docs/PLAN.md`** — product phases
- **`../README.md`** — testing directory overview
