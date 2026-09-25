"""
Arranque del backend como sidecar de la app de escritorio (Tauri).

No usar para desarrollo normal -- iniciar.bat / PM2 siguen usando el
`if __name__ == "__main__"` de main.py (host 0.0.0.0, --reload). Este script
es exclusivamente para el proceso empaquetado: host 127.0.0.1, sin reload,
puerto libre elegido en el momento (para no chocar con nada que ya esté
usando el 8000), impreso por stdout para que el lanzador de Tauri lo lea.

DATABASE_URL: si el proceso padre (Tauri) ya lo puso en el entorno --
apuntando al recurso empaquetado de solo lectura --, se respeta tal cual.
Si no, se calcula una ruta absoluta junto a este script (no relativa al cwd,
a diferencia del fallback de database.py) para que este script sea
ejecutable de forma standalone sin depender de desde dónde se lance.
"""
import os
import socket
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))


def _find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main() -> None:
    if "DATABASE_URL" not in os.environ:
        db_path = os.path.join(_backend_dir, "cdd_pro.db")
        os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    if "CORS_ORIGINS" not in os.environ:
        # tauri://localhost es el origen del webview empaquetado;
        # http://localhost:1420 es el puerto por defecto de `tauri dev`.
        os.environ["CORS_ORIGINS"] = "tauri://localhost,http://localhost:1420,http://127.0.0.1:1420"

    port = _find_free_port()

    # Import diferido a propósito: DATABASE_URL/CORS_ORIGINS deben quedar
    # fijados en el entorno antes de que main.py (y database.py, que lee
    # DATABASE_URL en tiempo de import) se importen.
    import uvicorn

    print(f"PORT={port}", flush=True)
    sys.stdout.flush()

    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False, log_level="info")


if __name__ == "__main__":
    main()
