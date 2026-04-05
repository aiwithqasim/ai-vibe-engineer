def _login(client):
    assert (
        client.post(
            "/api/auth/login",
            json={"username": "user", "password": "password"},
        ).status_code
        == 200
    )


def test_column_patch_requires_auth(client):
    r = client.patch("/api/columns/col-backlog", json={"title": "X"})
    assert r.status_code == 401


def test_column_patch_renames(client):
    _login(client)
    r = client.patch("/api/columns/col-backlog", json={"title": "Renamed"})
    assert r.status_code == 200
    board = r.json()["board"]
    assert board["columns"][0]["title"] == "Renamed"


def test_post_card_requires_auth(client):
    r = client.post(
        "/api/cards",
        json={"column_id": "col-backlog", "title": "T", "details": ""},
    )
    assert r.status_code == 401


def test_post_card_creates(client):
    _login(client)
    r = client.post(
        "/api/cards",
        json={"column_id": "col-backlog", "title": "New", "details": "D"},
    )
    assert r.status_code == 200
    board = r.json()["board"]
    backlog = board["columns"][0]
    new_ids = [cid for cid in backlog["cardIds"] if cid not in ("card-1", "card-2")]
    assert len(new_ids) == 1
    assert board["cards"][new_ids[0]]["title"] == "New"


def test_delete_card_requires_auth(client):
    assert client.delete("/api/cards/card-1").status_code == 401


def test_delete_card(client):
    _login(client)
    r = client.delete("/api/cards/card-1")
    assert r.status_code == 200
    assert "card-1" not in r.json()["board"]["cards"]


def test_patch_card_move_requires_auth(client):
    r = client.patch(
        "/api/cards/card-1",
        json={"column_id": "col-discovery", "index": 0},
    )
    assert r.status_code == 401


def test_patch_card_moves(client):
    _login(client)
    r = client.patch(
        "/api/cards/card-1",
        json={"column_id": "col-discovery", "index": 0},
    )
    assert r.status_code == 200
    disc = next(c for c in r.json()["board"]["columns"] if c["id"] == "col-discovery")
    assert "card-1" in disc["cardIds"]


def test_patch_card_unknown(client):
    _login(client)
    r = client.patch(
        "/api/cards/card-nope",
        json={"column_id": "col-backlog", "index": 0},
    )
    assert r.status_code == 404
