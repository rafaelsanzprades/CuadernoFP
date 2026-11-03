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


def test_el_chat_abierto_ya_no_existe(client: TestClient):
    assert client.post("/api/ai/chat", json={"messages": [{"role": "user", "parts": "hola"}]}).status_code == 404


def test_generar_texto_rechaza_prompts_enormes(client: TestClient):
    assert client.post("/api/ai/generar-texto", json={"prompt": "x" * 6001}).status_code == 422
    assert client.post("/api/ai/generar-texto", json={"prompt": ""}).status_code == 422


def test_generar_texto_limita_peticiones_por_minuto(client: TestClient, monkeypatch):
    from services import redactor
    monkeypatch.setattr(redactor, "generar_texto", lambda p: "ok")
    codigos = [client.post("/api/ai/generar-texto", json={"prompt": "hola"}).status_code for _ in range(12)]
    assert codigos[0] == 200
    assert 429 in codigos


def test_generar_texto_sin_clave_responde_503(client: TestClient, monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    from services import redactor
    monkeypatch.setattr(redactor, "_usados", 0)
    r = client.post("/api/ai/generar-texto", json={"prompt": "hola"})
    assert r.status_code in (503, 429)


def test_redactor_respeta_el_tope_diario(monkeypatch):
    import pytest
    from services import redactor
    monkeypatch.setenv("GEMINI_API_KEY", "clave-de-prueba")
    monkeypatch.setattr(redactor, "TOPE_DIARIO", 2)
    monkeypatch.setattr(redactor, "_dia", None)
    monkeypatch.setattr(redactor, "_usados", 0)
    monkeypatch.setattr(redactor.genai, "configure", lambda **k: None)

    class Falso:
        def __init__(self, **k): pass
        def generate_content(self, p):
            class R: text = "texto"
            return R()
    monkeypatch.setattr(redactor.genai, "GenerativeModel", Falso)
    monkeypatch.setattr(redactor.genai, "GenerationConfig", lambda **k: None)
    assert redactor.generar_texto("a") == "texto"
    assert redactor.generar_texto("b") == "texto"
    with pytest.raises(redactor.TopeDiario):
        redactor.generar_texto("c")
