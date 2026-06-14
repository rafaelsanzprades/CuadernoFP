import sqlite3

def recover():
    conn = sqlite3.connect('cdd_pro.db')
    cursor = conn.cursor()
    
    # Let's get the distinct didactic units from the curso ID '0237-ictve-curso-2025-26'
    # and give them the '0237-ictve-pd' ID, avoiding duplicates by just selecting the first occurrence
    
    # Which pd_id does this curso belong to?
    cursor.execute("SELECT parent_id FROM module_documents WHERE id='0237-ictve-curso-2025-26'")
    row = cursor.fetchone()
    if not row or not row[0]:
        print("No parent_id found")
        return
    pd_id = row[0]
    
    # Fetch existing UDs for curso
    cursor.execute("SELECT id, id_ud, desc_ud, horas_ud, ra_mappings FROM didactic_units WHERE module_document_id='0237-ictve-curso-2025-26' ORDER BY id DESC")
    rows = cursor.fetchall()
    
    seen = set()
    to_keep = []
    to_delete = []
    
    for r in rows:
        uid = r[1]
        if uid not in seen:
            seen.add(uid)
            to_keep.append(r[0])
        else:
            to_delete.append(r[0])
            
    # Also we need to do this for all courses! Let's do it dynamically.
    cursor.execute("SELECT id, parent_id FROM module_documents WHERE doc_type='curso'")
    cursos = cursor.fetchall()
    
    for curso_id, parent_id in cursos:
        if not parent_id: continue
        cursor.execute("SELECT id, id_ud FROM didactic_units WHERE module_document_id=? ORDER BY id DESC", (curso_id,))
        ud_rows = cursor.fetchall()
        c_seen = set()
        c_keep = []
        c_del = []
        for ur in ud_rows:
            if ur[1] not in c_seen:
                c_seen.add(ur[1])
                c_keep.append(ur[0])
            else:
                c_del.append(ur[0])
                
        # Delete duplicates
        for d in c_del:
            cursor.execute("DELETE FROM didactic_units WHERE id=?", (d,))
            
        # Update kept ones to point to parent_id
        for k in c_keep:
            cursor.execute("UPDATE didactic_units SET module_document_id=? WHERE id=?", (parent_id, k))
            
    conn.commit()
    print("Recovery done!")
    
recover()
