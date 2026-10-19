import pytest
import sys
import os

# Añadir el directorio backend al path
# /api/pdf solo se sirve en el servidor interno de escritorio; las pruebas simulan ese entorno
os.environ.setdefault("CUADERNOFP_PDF_LOCAL", "1")

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)


@pytest.fixture(scope="session")
def app():
    """Fixture para la aplicación FastAPI"""
    from main import app
    return app


@pytest.fixture(scope="session")
def client(app):
    """Fixture para el cliente de pruebas"""
    from fastapi.testclient import TestClient
    return TestClient(app)
