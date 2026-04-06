"""
Full-stack flow: login, create card, fetch board (requires Docker on localhost:8000).

Run: pytest testing/api/test_board_flow.py
Skip automatically when the server is not reachable.
"""

import os

import httpx
import pytest

BASE = os.environ.get("API_BASE_URL", "http://localhost:8000")


def _server_up() -> bool:
    try:
        r = httpx.get(f"{BASE}/api/hello", timeout=2.0)
        return r.status_code == 200
    except httpx.RequestError:
        return False


pytestmark = pytest.mark.skipif(
    not _server_up(),
    reason="Docker stack not running on %s" % BASE,
)


@pytest.fixture(scope="module")
def http():
    with httpx.Client(base_url=BASE, timeout=15.0) as client:
        yield client


def test_login_board_create_persist(http):
    login = http.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    assert login.status_code == 200

    before = http.get("/api/board")
    assert before.status_code == 200
    ids_before = set(before.json()["cards"])

    created = http.post(
        "/api/cards",
        json={
            "column_id": "col-backlog",
            "title": "API flow card",
            "details": "from test_board_flow",
        },
    )
    assert created.status_code == 200
    board = created.json()["board"]
    new_ids = set(board["cards"]) - ids_before
    assert len(new_ids) == 1
    new_id = new_ids.pop()

    again = http.get("/api/board")
    assert again.status_code == 200
    titles = [c["title"] for c in again.json()["cards"].values()]
    assert "API flow card" in titles

    deleted = http.delete(f"/api/cards/{new_id}")
    assert deleted.status_code == 200
    assert new_id not in deleted.json()["board"]["cards"]
