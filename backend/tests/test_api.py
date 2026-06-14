import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "CDD Pro API" in data["message"]


def test_get_module():
    """Test get module endpoint - fetches a valid module from the list"""
    list_resp = client.get("/api/modules")
    assert list_resp.status_code == 200
    modules_data = list_resp.json()["data"]
    all_ids = modules_data.get("pd_modules", []) + modules_data.get("curso_modules", [])
    if not all_ids:
        pytest.skip("No modules in DB")
    module_id = all_ids[0]
    response = client.get(f"/api/module/{module_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data


def test_get_module_not_found():
    """Test get module with invalid ID returns 404"""
    response = client.get("/api/module/nonexistent-module-xyz")
    assert response.status_code == 404


def test_list_families():
    """Test list families endpoint"""
    response = client.get("/api/families")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)


def test_list_modules():
    """Test list modules endpoint"""
    response = client.get("/api/modules")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    assert "pd_modules" in data["data"]
    assert "curso_modules" in data["data"]
    assert "centro_modules" in data["data"]


def test_put_module_disabled():
    """Test that PUT module is disabled (Local-First Architecture)"""
    response = client.put("/api/module/test-module", json={})
    assert response.status_code == 403
    data = response.json()
    assert "Local-First Architecture" in data["detail"]


def test_backup_endpoint():
    """Test backup endpoint"""
    response = client.post("/admin/backup")
    assert response.status_code in [200, 500]
    data = response.json()
    assert "status" in data


def test_list_centers():
    """Test list centers endpoint"""
    response = client.get("/api/centers")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)
