"""
Live OpenRouter check (optional). Run with Docker up and a real key:

  set RUN_LIVE_AI=1
  pytest testing/api/test_ai_live.py -v
"""

import os

import httpx
import pytest

BASE = os.environ.get("API_BASE_URL", "http://localhost:8000")

pytestmark = pytest.mark.skipif(
    os.environ.get("RUN_LIVE_AI", "").lower() not in ("1", "true", "yes"),
    reason="Set RUN_LIVE_AI=1 and OPENROUTER_API_KEY in .env to run",
)


def _server_up() -> bool:
    try:
        return httpx.get(f"{BASE}/api/hello", timeout=2.0).status_code == 200
    except httpx.RequestError:
        return False


@pytest.mark.skipif(not _server_up(), reason="Stack not running on %s" % BASE)
def test_ai_test_endpoint_contains_four():
    with httpx.Client(base_url=BASE, timeout=120.0) as client:
        login = client.post(
            "/api/auth/login",
            json={"username": "user", "password": "password"},
        )
        assert login.status_code == 200
        r = client.post("/api/ai/test")
        assert r.status_code == 200
        text = (r.json().get("answer") or "").lower()
        assert "4" in text
