from io import BytesIO

from fastapi import UploadFile


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extrae el texto de un PDF subido con pypdf (licencia BSD-3, permisiva).

    Se usaba PyMuPDF, que es AGPL-3.0; pypdf evita esa obligación de licencia.
    """
    try:
        from pypdf import PdfReader  # import diferido: no impide arrancar si la librería faltara

        reader = PdfReader(BytesIO(await file.read()))
        if reader.is_encrypted and not reader.decrypt(""):
            raise ValueError("El PDF está protegido con contraseña.")
        return "".join((pagina.extract_text() or "") + "\n\n" for pagina in reader.pages)
    except ImportError:
        raise ValueError("pypdf no está disponible en este entorno.")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")
