# -*- coding: utf-8 -*-
"""
pdf_helpers.py
Escapado de texto libre para los generadores de PDF (ReportLab). Un
Paragraph() de ReportLab interpreta un mini-lenguaje tipo HTML (<b>, <font>,
<br/>...) dentro de su string: si un dato introducido por el profesor
(nombre, descripcion de UD/tarea, criterio de rubrica...) contiene un '<' o
'&' suelto, rompe el parseo y falla la generacion del PDF. `esc()` convierte
esos caracteres a su forma segura (&lt;, &amp;...) justo antes de
interpolarlos en el markup, sin tocar el dato guardado ni restringir lo que
el profesor puede escribir en la app.
"""
from xml.sax.saxutils import escape as _xml_escape


def esc(value) -> str:
    """Escapa texto libre para insertarlo dentro de un Paragraph() de
    ReportLab. Úsalo sobre cualquier valor que provenga de un campo de texto
    del usuario (nombre, descripción...), nunca sobre markup ya construido
    a propósito (p.ej. "<b>...</b>" que añade el propio generador)."""
    if value is None:
        return ""
    return _xml_escape(str(value))
