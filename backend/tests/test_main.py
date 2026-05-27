from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "CDD Pro API is running"}

def test_login_admin(client: TestClient):
    # En nuestro entorno local/simulado, un email con "admin" crea la cuenta al vuelo
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@cddpro.com", "password": "supersecretpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in data
    assert data["user"]["roles"] == "Superadmin"

def test_list_admin_modules(client: TestClient):
    response = client.get("/api/admin/modules")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)

def get_auth_headers(client: TestClient):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@cddpro.com", "password": "supersecretpassword"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_documents_list_root(client: TestClient):
    response = client.get("/api/documents/list?path=")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert type(data["data"]) == list

def test_documents_path_traversal(client: TestClient):
    # Attempting to go up one directory
    response = client.get("/api/documents/list?path=../")
    assert response.status_code == 403
    assert "Path traversal detectado" in response.json()["detail"]
