import pandas as pd

# ==========================================
# ESQUEMAS CENTRALIZADOS DE DATOS
# ==========================================

# Mapeo de columnas lógicas a "snake_case" para protección estructural

SCHEMA_RA = {
    "id_ra": str,         # Antes: "ID"
    "peso_ra": float,     # Antes: "% Pond" o "% RA"
    "is_dual": bool,      # Antes: "Dualizado"
    "desc_ra": str        # Antes: "Descripción" o "Resultados de aprendizaje"
}

SCHEMA_UD = {
    "id_ud": str,         # Antes: "ID"
    "horas_ud": int,      # Antes: "Horas"
    "desc_ud": str        # Antes: "Título" o "Unidades didácticas"
}

SCHEMA_CE = {
    "id_ra": str,         # Antes: "RA"
    "og_vinc": str,       # Antes: "OG Vinculados"
    "cpe_vinc": str,      # Antes: "CPE Vinculadas"
    "id_ce": str,         # Antes: "Criterio de Evaluación" o "Criterio evaluación"
    "desc_ce": str,       # Antes: "Descripción CE"
    "peso_ce": float,     # Antes: "Ponderación en RA (%)" o "% RA"
    "id_ud": str          # Antes: "Unidad didáctica"
}

SCHEMA_ACT = {
    "id_act": str,        # Antes: "ID"
    "desc_act": str,      # Antes: "Instrumento"
    "ce_vinc": str,       # Antes: "Criterios vinculados"
    "tri_act": str,       # Antes: "Trimestre"
    "peso_act": float,    # Antes: "Ponderación (%)"
    "crit_calif": str,    # Antes: "Criterios de calificación"
    "is_active": bool     # Antes: "Activa"
}

def create_empty_df(schema_dict):
    """Crea un DataFrame vacío usando las keys como columnas de forma segura."""
    df = pd.DataFrame(columns=list(schema_dict.keys()))
    # En pandas limpio, al estar vacío, el as_type se pospone
    return df

def df_ra_empty(): return create_empty_df(SCHEMA_RA)
def df_ud_empty(): return create_empty_df(SCHEMA_UD)
def df_ce_empty(): return create_empty_df(SCHEMA_CE)
def df_act_empty(): return create_empty_df(SCHEMA_ACT)
