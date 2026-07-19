import os
import sys

# We can just import and use the functions from preparar_plantilla_pd_detallada
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preparar_plantilla_pd_detallada import process_xml, convert_ud_ra_tables
import zipfile

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tpl_in = os.path.join(BASE, "templates", "modelo_pd_jeg_tpl.docx")
tpl_out = os.path.join(BASE, "templates", "modelo_pd_jeg_tpl_final.docx")

with zipfile.ZipFile(tpl_in, 'r') as zin:
    with zipfile.ZipFile(tpl_out, 'w') as zout:
        for item in zin.infolist():
            xml_bytes = zin.read(item.filename)
            if item.filename == 'word/document.xml':
                xml_bytes, c, d = process_xml(xml_bytes)
                xml_bytes, c2 = convert_ud_ra_tables(xml_bytes)
                print(f"Replaced {c} fields, deleted {d} blocks, {c2} tables")
            zout.writestr(item, xml_bytes)
            
print(f"Final template saved to {tpl_out}")
