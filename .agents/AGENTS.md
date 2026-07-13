# Reglas de Proyecto: CuadernoFP

## Uso de Plantillas y Modelos Oficiales
Esta aplicación (CuadernoFP) es una herramienta para suministrar datos extraídos de una base de datos a modelos oficiales de Programaciones Didácticas (DOCX).
Al redactar o modificar generadores de documentos:
1. **NO INVENTAR TEXTOS GENÉRICOS:** Si un campo está vacío o no hay datos, no rellenes el apartado con texto "boilerplate" o texto inventado (ej. "Se fomentará el aprendizaje significativo..."). Déjalo vacío o usa estrictamente los datos de la app.
2. **RESPETAR LOS TEXTOS BASE DEL MODELO:** Los textos "patrón" que sean normativos o base de la plantilla oficial sí deben mantenerse tal cual, pero los huecos o campos editables `[[ ... ]]` se rellenan única y exclusivamente con la información que el docente ha metido en la aplicación (campos de `config_contexto`, `info_fechas`, `df_ra`, `df_ud`, etc.).

