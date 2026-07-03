import json
import os

files_to_clean = [
    r"c:\GD-rsp\APP-CuadernoFP\backend\documentos\Autores\Editoriales\C - 2025-26 - 1A-GM - ELE-203 - PRUEBA.fpc",
    r"c:\GD-rsp\APP-CuadernoFP\backend\documentos\Autores\Editoriales\C - 2025-26 - 1B-GM - ELE-203 - PRUEBA.fpc",
    r"c:\GD-rsp\APP-CuadernoFP\backend\documentos\Autores\Editoriales\C - 2025-26 - 1C-GM - ELE-203 - PRUEBA.fpc"
]

keys_to_remove = [
    "tutoria_ledger",
    "actuaciones_tutoria",
    "orientacion",
    "tendencias",
    "itinerario"
]

for file_path in files_to_clean:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        for key in keys_to_remove:
            if key in data:
                del data[key]
                modified = True
                
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Cleaned {os.path.basename(file_path)}")
        else:
            print(f"No changes needed for {os.path.basename(file_path)}")
    else:
        print(f"File not found: {file_path}")
