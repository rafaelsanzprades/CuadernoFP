from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "CDD Pro API is running"}



def test_docs_cerrados_por_defecto(client: TestClient):
    for ruta in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(ruta).status_code == 404


def test_admin_backup_sin_token_no_existe(client: TestClient, monkeypatch):
    monkeypatch.delenv("CDD_ADMIN_TOKEN", raising=False)
    assert client.post("/admin/backup").status_code == 404


def test_admin_backup_exige_token(client: TestClient, monkeypatch):
    monkeypatch.setenv("CDD_ADMIN_TOKEN", "token-de-prueba")
    assert client.post("/admin/backup").status_code == 403
    assert client.post("/admin/backup", headers={"X-Admin-Token": "otro"}).status_code == 403
    assert client.post("/admin/backup", headers={"X-Admin-Token": "token-de-prueba"}).status_code in (200, 500)


def test_chat_rechaza_conversaciones_enormes(client: TestClient):
    mensajes = [{"role": "user", "parts": "hola"}] * 31
    assert client.post("/api/ai/chat", json={"messages": mensajes}).status_code == 422


def test_chat_limita_peticiones_por_minuto(client: TestClient, monkeypatch):
    import routers.ai_assistant as ai
    monkeypatch.setattr(ai, "get_chatbot_response", lambda m: "ok")
    cuerpo = {"messages": [{"role": "user", "parts": "hola"}]}
    codigos = [client.post("/api/ai/chat", json=cuerpo).status_code for _ in range(12)]
    assert codigos[0] == 200
    assert 429 in codigos
