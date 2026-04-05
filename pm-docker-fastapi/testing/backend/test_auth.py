def test_login_success_sets_cookie(client):
    res = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    assert res.status_code == 200
    assert res.json() == {"ok": True}
    assert "session" in res.cookies


def test_login_wrong_password(client):
    res = client.post(
        "/api/auth/login",
        json={"username": "user", "password": "wrong"},
    )
    assert res.status_code == 401


def test_me_with_valid_cookie(client):
    client.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    res = client.get("/api/auth/me")
    assert res.status_code == 200
    assert res.json() == {"username": "user"}


def test_me_without_cookie(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_logout_clears_session(client):
    client.post(
        "/api/auth/login",
        json={"username": "user", "password": "password"},
    )
    assert client.get("/api/auth/me").status_code == 200
    assert client.post("/api/auth/logout").status_code == 200
    assert client.get("/api/auth/me").status_code == 401
