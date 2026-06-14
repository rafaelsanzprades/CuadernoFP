import json
import sqlite3
import pandas as pd
from routers.pdf import PdfRequest, generate_pdf

def test_local():
    conn = sqlite3.connect("cdd_pro.db")
    cursor = conn.cursor()
    
    # Let's get the module document
    cursor.execute("SELECT data FROM module_documents WHERE id='0237-ictve-pd'")
    row = cursor.fetchone()
    if not row:
        print("Module not found")
        return
        
    module_data = json.loads(row[0])
    
    # Get curso document
    cursor.execute("SELECT data FROM module_documents WHERE parent_id='0237-ictve-pd'")
    row = cursor.fetchone()
    if not row:
        curso_data = module_data # Fallback
    else:
        curso_data = json.loads(row[0])
        
    request = PdfRequest(module_data=module_data, curso_data=curso_data)
    
    try:
        res = generate_pdf(type="matrices", request=request)
        print("Matrices success:", len(res.body))
    except Exception as e:
        import traceback
        traceback.print_exc()

test_local()
