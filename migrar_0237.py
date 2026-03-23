import json
import os
import shutil

FILE = "0237-ictve.json"
BACKUP = "0237-ictve.json.bak"

def migrate():
    if not os.path.exists(FILE):
        print(f"[{FILE}] No encontrado. Nada que migrar.")
        return

    shutil.copy(FILE, BACKUP)
    print(f"Backup creado: {BACKUP}")

    with open(FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Migrar df_ra
    for row in data.get("df_ra", []):
        if "ID" in row: row["id_ra"] = row.pop("ID")
        if "% Pond" in row: row["peso_ra"] = row.pop("% Pond")
        if "% RA" in row: row["peso_ra"] = row.pop("% RA")
        if "Dualizado" in row: row["is_dual"] = row.pop("Dualizado")
        if "Descripción" in row: row["desc_ra"] = row.pop("Descripción")

    # Migrar df_ud
    for row in data.get("df_ud", []):
        if "ID" in row: row["id_ud"] = row.pop("ID")
        if "Horas" in row: row["horas_ud"] = row.pop("Horas")
        if "Título" in row: row["desc_ud"] = row.pop("Título")
        
        # Eliminar columnas con IDs de RA si existían visualmente o reemplazarlas por float
        # Dejaremos los IDs de RA numéricos intactos, pero si queremos podemos purificarlos
        pass

    # Migrar df_ce
    for row in data.get("df_ce", []):
        if "RA" in row: row["id_ra"] = row.pop("RA")
        if "OG Vinculados" in row: row["og_vinc"] = row.pop("OG Vinculados")
        if "CPE Vinculadas" in row: row["cpe_vinc"] = row.pop("CPE Vinculadas")
        if "Criterio Evaluación (CE)" in row: row["id_ce"] = row.pop("Criterio Evaluación (CE)")
        if "Criterio evaluación" in row: row["id_ce"] = row.pop("Criterio evaluación")
        if "Descripción CE" in row: row["desc_ce"] = row.pop("Descripción CE")
        if "Ponderación en RA (%)" in row: row["peso_ce"] = row.pop("Ponderación en RA (%)")
        if "% RA" in row: row["peso_ce"] = row.pop("% RA")
        if "Unidad Didáctica (UD)" in row: row["id_ud"] = row.pop("Unidad Didáctica (UD)")
        if "Unidad didáctica" in row: row["id_ud"] = row.pop("Unidad didáctica")

    # Migrar df_act
    for row in data.get("df_act", []):
        if "ID" in row: row["id_act"] = row.pop("ID")
        if "Instrumento" in row: row["desc_act"] = row.pop("Instrumento")
        if "Criterios vinculados" in row: row["ce_vinc"] = row.pop("Criterios vinculados")
        if "Trimestre" in row: row["tri_act"] = row.pop("Trimestre")
        if "Ponderación (%)" in row: row["peso_act"] = row.pop("Ponderación (%)")
        if "Criterios de calificación" in row: row["crit_calif"] = row.pop("Criterios de calificación")
        if "Activa" in row: row["is_active"] = row.pop("Activa")

    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        
    print(f"Migración completada con éxito en {FILE}.")

if __name__ == "__main__":
    migrate()
