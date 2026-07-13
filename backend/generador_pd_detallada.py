import os
from docxtpl import DocxTemplate
try:
    from docx2pdf import convert
except ImportError:
    convert = None

def generate(data, out_docx, out_pdf):
    # Ruta donde se espera que el usuario coloque la plantilla oficial
    template_path = os.path.join(os.path.dirname(__file__), 'templates', 'modelo_pd_fp.docx')
    
    if not os.path.exists(template_path):
        # Si no existe la carpeta, la creamos y lanzamos un error claro
        os.makedirs(os.path.dirname(template_path), exist_ok=True)
        raise FileNotFoundError(f"No se encontró la plantilla en: {template_path}. Por favor, copia ahí el archivo original 'PD+ FP v1 - Modelo.docx' renombrándolo a 'modelo_pd_fp.docx'.")

    # Cargar plantilla
    doc = DocxTemplate(template_path)

    # Preparar el contexto combinando las variables planas y los diccionarios anidados
    ctx = data.get("config_contexto", {})
    fechas = data.get("info_fechas", {})
    
    context = {
        "modulo": data.get("modulo", ""),
        "ciclo": data.get("ciclo", ""),
        "departamento": data.get("departamento", ""),
        "curso_academico": data.get("curso_academico", ""),
        "horas_totales": data.get("horas_totales", ""),
        "is_dual": data.get("is_dual", False),
        
        # Listas de tablas (RAs, UDs)
        "df_ra": data.get("df_ra", []),
        "df_ud": data.get("df_ud", []),
        
        # Objetos anidados directos para que el usuario pueda usar {{ config_contexto.A1_justificacion }}
        "config_contexto": ctx,
        "info_fechas": fechas,
        "config_redondeo": data.get("config_redondeo", {}),
        
        # Listas simples (separadas por comas)
        "instrumentos_seleccionados": ", ".join(data.get("instrumentos_seleccionados", [])),
        "recursos_espacios": ", ".join(data.get("recursos_espacios", [])),
        "metodologias_seleccionadas": ", ".join(data.get("metodologias_seleccionadas", [])),
        "medidas_inclusion": ", ".join(data.get("medidas_inclusion", [])),
        "medidas_contingencia": ", ".join(data.get("medidas_contingencia", [])),
        "actividades_complementarias": ", ".join(data.get("actividades_complementarias", [])),
        "elementos_transversales": ", ".join(data.get("elementos_transversales", [])),
        
        # Textos libres
        "texto_contextualizacion_libre": data.get("texto_contextualizacion_libre", ""),
        "texto_metodologia_libre": data.get("texto_metodologia_libre", ""),
        "texto_inclusion_libre": data.get("texto_inclusion_libre", ""),
        "texto_contingencia_libre": data.get("texto_contingencia_libre", ""),
    }

    # Renderizar el documento inyectando el contexto
    doc.render(context)
    
    # Guardar DOCX
    doc.save(out_docx)
    
    # Convertir a PDF si es posible
    try:
        abs_docx = os.path.abspath(out_docx)
        abs_pdf = os.path.abspath(out_pdf)
        if convert:
            convert(abs_docx, abs_pdf)
        else:
            print("docx2pdf no disponible, saltando conversión a PDF.")
    except Exception as e:
        print(f"Error convirtiendo a PDF: {e}")
        if os.path.exists(out_pdf):
            os.remove(out_pdf)

