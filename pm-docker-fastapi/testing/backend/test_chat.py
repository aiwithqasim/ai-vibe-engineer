import json


def _login(client):
    assert (
        client.post(
            "/api/auth/login",
            json={"username": "user", "password": "password"},
        ).status_code
        == 200
    )


def test_chat_requires_auth(client):
    r = client.post("/api/chat", json={"message": "hi", "history": []})
    assert r.status_code == 401


def test_chat_passes_board_in_prompt(monkeypatch, client):
    _login(client)
    captured: list[list] = []

    def fake(messages, json_mode=False):
        captured.append(messages)
        return json.dumps({"message": "ok", "mutations": None})

    monkeypatch.setattr("backend.routers.chat.call_openrouter", fake)
    r = client.post("/api/chat", json={"message": "What columns exist?", "history": []})
    assert r.status_code == 200
    assert len(captured) == 1
    last_user = captured[0][-1]["content"]
    assert "<board_json>" in last_user
    assert "col-backlog" in last_user


def test_chat_applies_rename(monkeypatch, client):
    _login(client)

    def fake(messages, json_mode=False):
        return json.dumps(
            {
                "message": "Renamed.",
                "mutations": [
                    {
                        "type": "rename_column",
                        "column_id": "col-backlog",
                        "title": "Inbox",
                    },
                ],
            }
        )

    monkeypatch.setattr("backend.routers.chat.call_openrouter", fake)
    r = client.post("/api/chat", json={"message": "Rename Backlog to Inbox", "history": []})
    assert r.status_code == 200
    body = r.json()
    assert body["message"] == "Renamed."
    assert len(body["mutations_applied"]) == 1
    titles = [c["title"] for c in body["board"]["columns"] if c["id"] == "col-backlog"]
    assert titles == ["Inbox"]


def test_chat_create_card(monkeypatch, client):
    _login(client)

    def fake(messages, json_mode=False):
        return json.dumps(
            {
                "message": "Added.",
                "mutations": [
                    {
                        "type": "create_card",
                        "column_id": "col-backlog",
                        "title": "AI card",
                        "details": "via test",
                    },
                ],
            }
        )

    monkeypatch.setattr("backend.routers.chat.call_openrouter", fake)
    r = client.post("/api/chat", json={"message": "Add a card", "history": []})
    assert r.status_code == 200
    cards = r.json()["board"]["cards"]
    assert any(c.get("title") == "AI card" for c in cards.values())


def test_chat_move_card(monkeypatch, client):
    _login(client)

    def fake(messages, json_mode=False):
        return json.dumps(
            {
                "message": "Moved.",
                "mutations": [
                    {
                        "type": "move_card",
                        "card_id": "card-1",
                        "target_column_id": "col-discovery",
                        "position": 0,
                    },
                ],
            }
        )

    monkeypatch.setattr("backend.routers.chat.call_openrouter", fake)
    r = client.post("/api/chat", json={"message": "Move card-1 to Discovery", "history": []})
    assert r.status_code == 200
    disc = next(c for c in r.json()["board"]["columns"] if c["id"] == "col-discovery")
    assert "card-1" in disc["cardIds"]


def test_chat_delete_card(monkeypatch, client):
    _login(client)

    def fake(messages, json_mode=False):
        return json.dumps(
            {
                "message": "Removed.",
                "mutations": [{"type": "delete_card", "card_id": "card-8"}],
            }
        )

    monkeypatch.setattr("backend.routers.chat.call_openrouter", fake)
    r = client.post("/api/chat", json={"message": "Delete card-8", "history": []})
    assert r.status_code == 200
    assert "card-8" not in r.json()["board"]["cards"]
