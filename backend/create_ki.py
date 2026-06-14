import os
import json
import shutil
import uuid

# Define paths
knowledge_dir = r"C:\Users\rafae\.gemini\antigravity-ide\knowledge"
if not os.path.exists(knowledge_dir):
    os.makedirs(knowledge_dir)

# Create a unique ID for the KI
ki_id = "arquitectura_datos_" + str(uuid.uuid4())[:8]
ki_path = os.path.join(knowledge_dir, ki_id)
os.makedirs(ki_path)
os.makedirs(os.path.join(ki_path, "artifacts"))

# The artifact we just created
artifact_src = r"C:\Users\rafae\.gemini\antigravity-ide\brain\b1f09d65-1a70-450f-91b7-12e4bd7b4e94\ARQUITECTURA_DATOS.md"
artifact_dest = os.path.join(ki_path, "artifacts", "ARQUITECTURA_DATOS.md")
shutil.copy2(artifact_src, artifact_dest)

# Create metadata.json
metadata = {
    "title": "Arquitectura de Datos y Responsabilidades",
    "summary": "Define la separación estricta entre la BBDD Web (solo catálogos y datos DEMO) y los Archivos Locales (datos reales de Programación y Curso). El servidor web NUNCA debe almacenar ni sobrescribir el trabajo real del docente.",
    "created_at": "2026-06-13T09:16:00Z",
    "references": [
        "User instructions regarding data separation",
        "ARQUITECTURA_DATOS.md"
    ]
}

with open(os.path.join(ki_path, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print(f"Created Knowledge Item at: {ki_path}")
