import sys
import os

# MUST be first: add backend/ to path before ANY other imports.
# Fixes "ModuleNotFoundError: No module named 'database'" when Render
# runs this as 'backend.main:app' from the repo root.
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import modules, users, catalogs, pdf, documents

app = FastAPI(title="CDD Pro - Modular API")

# Configurar CORS para entorno local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los enrutadores modulares
app.include_router(users.router)
app.include_router(catalogs.router)
app.include_router(modules.router)
app.include_router(pdf.router)
app.include_router(documents.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "CDD Pro API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
