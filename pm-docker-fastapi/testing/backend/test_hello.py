def test_hello_returns_200(client):
    response = client.get("/api/hello")
    assert response.status_code == 200


def test_hello_returns_expected_body(client):
    response = client.get("/api/hello")
    assert response.json() == {"message": "hello world"}
