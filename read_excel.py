import pandas as pd
import json

file_path = "c:\\GD-rsp\\APP\\RF Ideas\\20260312 Cuaderno digital - General - COPIA.xlsx"
xls = pd.ExcelFile(file_path)
sheet = next((s for s in xls.sheet_names if 'fchs' in s.lower() or 'fechas' in s.lower()), xls.sheet_names[0])
df = pd.read_excel(file_path, sheet_name=sheet)

events = {}

for col_idx in range(len(df.columns)):
    for row_idx in range(len(df)):
        cell = df.iloc[row_idx, col_idx]
        if isinstance(cell, str) and len(cell) > 3 and cell not in ["Festivos", "Relevantes", "Fecha"]:
            # Check if there is a date in the same row, somewhere to the left
            # We can just look 1 or 2 columns to the left
            date_val = None
            if col_idx > 0:
                v1 = df.iloc[row_idx, col_idx-1]
                if isinstance(v1, pd.Timestamp): date_val = v1
            if not date_val and col_idx > 1:
                v2 = df.iloc[row_idx, col_idx-2]
                if isinstance(v2, pd.Timestamp): date_val = v2
                
            if date_val:
                events[date_val.strftime("%d/%m/%Y")] = str(cell).strip()

print(json.dumps(events, indent=2, ensure_ascii=False))
