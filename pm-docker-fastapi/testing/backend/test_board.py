def _login(client):
    r = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    assert r.status_code == 200


def test_board_requires_auth(client):
    assert client.get("/api/board").status_code == 401


def test_get_board_after_login(client):
    _login(client)
    r = client.get("/api/board")
    assert r.status_code == 200
    data = r.json()
    assert len(data["columns"]) == 5
    assert data["columns"][0]["id"] == "col-backlog"
    assert "card-1" in data["cards"]


def test_put_board_persists(client):
    _login(client)
    r = client.get("/api/board")
    data = r.json()
    data["columns"][2]["cardIds"] = ["card-5", "card-4"]
    assert client.put("/api/board", json=data).status_code == 200
    r2 = client.get("/api/board")
    assert r2.json()["columns"][2]["cardIds"] == ["card-5", "card-4"]
