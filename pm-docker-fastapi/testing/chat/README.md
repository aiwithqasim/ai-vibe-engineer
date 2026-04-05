# Chat / AI integration tests (placeholder)

Reserved for end-to-end or integration tests that cover the **AI chat** flow once implemented (`PLAN.md` Parts 8–10: OpenRouter connectivity, `POST /api/chat`, sidebar UI).

## Planned prerequisites

- Docker stack running (or equivalent local API).
- Valid **`OPENROUTER_API_KEY`** in `.env` for live-model tests (optional; prefer mocked HTTP in CI).

## Planned run

```bash
pytest testing/chat/
```

Add tests here when chat routes and UI exist.

## See also

- **`../../docs/PLAN.md`** — Parts 8, 9, 10
- **`../README.md`** — testing directory overview
