"""La importación de programaciones desde PDF extrae el texto con pypdf (licencia BSD, no AGPL)."""
import asyncio
import io

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from starlette.datastructures import UploadFile

from services.pdf_extractor import extract_text_from_pdf


def _pdf_de_prueba() -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    c.drawString(72, 750, "Resultado de aprendizaje 1: instala y configura sistemas")
    c.showPage()
    c.drawString(72, 750, "Criterio de evaluacion a) se ha comprobado el montaje")
    c.save()
    return buf.getvalue()


def test_extrae_el_texto_de_todas_las_paginas():
    archivo = UploadFile(file=io.BytesIO(_pdf_de_prueba()), filename="prueba.pdf")
    texto = asyncio.run(extract_text_from_pdf(archivo))
    assert "Resultado de aprendizaje 1" in texto
    assert "Criterio de evaluacion a)" in texto


def test_un_fichero_que_no_es_pdf_da_error_claro():
    archivo = UploadFile(file=io.BytesIO(b"esto no es un pdf"), filename="falso.pdf")
    try:
        asyncio.run(extract_text_from_pdf(archivo))
        assert False, "debería haber fallado"
    except ValueError as e:
        assert "PDF" in str(e)
