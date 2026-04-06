def test_root_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200


def test_root_returns_html(client):
    response = client.get("/")
    assert "text/html" in response.headers["content-type"]
