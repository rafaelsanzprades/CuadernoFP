from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "CDD Pro API is running"}

def test_documents_list_root(client: TestClient):
    response = client.get("/api/documents/list?path=")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert type(data["data"]) == list

def test_documents_path_traversal(client: TestClient):
    response = client.get("/api/documents/list?path=../")
    assert response.status_code == 403
    assert "Path traversal detectado" in response.json()["detail"]
