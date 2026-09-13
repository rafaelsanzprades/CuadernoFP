# -*- coding: utf-8 -*-
"""
Tercera pasada sobre modelo_pd_jeg_tpl_final.docx (PD+/JEG): restaura el
estilo de encabezado (Heading 1/3) de 4 párrafos que en el Modelo.docx
oficial (RF Ideas/RF PD -=+/PD+ FP v1 - Modelo.docx) sí son encabezados de
verdad, pero que en nuestra plantilla ya convertida a Jinja aparecían como
texto plano ("Normal") -- se perdió en algún punto de la conversión previa
(preparar_plantilla_jeg_final.py / _pass2.py), antes de esta sesión.

Detectado comparando la salida generada contra el Ejemplo.docx/Modelo.docx
de referencia. Autorizado explicitamente por Rafael (2026-09-13): "arregla
también los encabezados que se perdieron".

Uso: .venv/Scripts/python.exe scripts/arreglar_plantilla_jeg_3.py
"""
import os
import docx

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "..", "templates", "modelo_pd_jeg_tpl_final.docx")

# texto exacto del parrafo -> nombre del estilo de encabezado correcto
# (segun PD+ FP v1 - Modelo.docx)
ENCABEZADOS_A_RESTAURAR = {
    "Entorno geográfico y sociocultural": "Heading 3",
    "Entorno socioeconómico y productivo": "Heading 3",
    "Contexto escolar": "Heading 3",
    "Plan de contingencia": "Heading 1",
}


def main():
    doc = docx.Document(TEMPLATE_PATH)
    paras = doc.paragraphs

    pendientes = dict(ENCABEZADOS_A_RESTAURAR)
    arreglados = []
    for p in paras:
        texto = p.text.strip()
        if texto in pendientes:
            p.style = doc.styles[pendientes[texto]]
            arreglados.append(texto)
            del pendientes[texto]

    if pendientes:
        print("AVISO -- no se encontraron estos parrafos:", list(pendientes.keys()))

    doc.save(TEMPLATE_PATH)
    print(f"OK -- {len(arreglados)} encabezados restaurados: {arreglados}")


if __name__ == "__main__":
    main()
