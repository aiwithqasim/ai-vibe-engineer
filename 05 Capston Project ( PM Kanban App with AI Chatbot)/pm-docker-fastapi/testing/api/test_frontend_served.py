"""
Integration tests against the running Docker stack (http://localhost:8000).
Run: pytest testing/api/
Requires: docker compose up (scripts/start.bat or scripts/start.sh)
"""
import pytest
import httpx

BASE_URL = "http://localhost:8000"


@pytest.fixture(scope="module")
def http():
    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        yield client


def test_root_returns_200(http):
    response = http.get("/")
    assert response.status_code == 200


def test_root_serves_html(http):
    response = http.get("/")
    assert "text/html" in response.headers["content-type"]


def test_root_contains_kanban_app(http):
    response = http.get("/")
    # Next.js static export embeds the app title in the HTML
    assert "Kanban" in response.text


def test_api_hello_still_works(http):
    response = http.get("/api/hello")
    assert response.status_code == 200
    assert response.json() == {"message": "hello world"}
