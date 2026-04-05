import json

import httpx
import pytest

from backend.ai import call_openrouter, parse_ai_response_json


@pytest.fixture
def openrouter_key(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "sk-test-key")


class _FakeClientCtx:
    last_json: dict | None = None
    last_headers: dict | None = None
    last_url: str | None = None

    def __init__(self, response_content: str):
        self._content = response_content

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def post(self, url, headers=None, json=None):
        _FakeClientCtx.last_url = url
        _FakeClientCtx.last_headers = headers
        _FakeClientCtx.last_json = json
        content = self._content

        class R:
            def raise_for_status(self):
                return None

            def json(self):
                return {"choices": [{"message": {"content": content}}]}

        return R()


def test_call_openrouter_json_mode(openrouter_key, monkeypatch):
    monkeypatch.setenv("OPENROUTER_MODEL", "test/model")

    def factory(**_kwargs):
        return _FakeClientCtx('{"message":"hi","mutations":null}')

    monkeypatch.setattr(httpx, "Client", factory)

    out = call_openrouter([{"role": "user", "content": "x"}], json_mode=True)
    assert out == '{"message":"hi","mutations":null}'
    assert _FakeClientCtx.last_json["model"] == "test/model"
    assert _FakeClientCtx.last_json["response_format"]["type"] == "json_object"
    assert _FakeClientCtx.last_headers["Authorization"] == "Bearer sk-test-key"
    assert "openrouter" in (_FakeClientCtx.last_url or "")


def test_call_openrouter_missing_key(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    with pytest.raises(RuntimeError, match="OPENROUTER_API_KEY"):
        call_openrouter([{"role": "user", "content": "x"}])


def test_parse_ai_response():
    text = json.dumps(
        {
            "message": "Done",
            "mutations": [
                {"type": "rename_column", "column_id": "col-x", "title": "X"},
            ],
        }
    )
    p = parse_ai_response_json(text)
    assert p.message == "Done"
    assert p.mutations is not None
    assert len(p.mutations) == 1
    assert p.mutations[0].type == "rename_column"
