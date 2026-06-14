import sqlite3

def update_weights():
    conn = sqlite3.connect('cdd_pro.db')
    cursor = conn.cursor()
    
    # Get all distinct modules and RAs
    cursor.execute("SELECT DISTINCT module_document_id, id_ra FROM evaluation_criterion_items")
    module_ras = cursor.fetchall()
    
    for module_id, ra_id in module_ras:
        # Get all CEs for this module and RA
        cursor.execute("SELECT id_ce FROM evaluation_criterion_items WHERE module_document_id=? AND id_ra=? ORDER BY id_ce", (module_id, ra_id))
        ce_rows = cursor.fetchall()
        ce_ids = [r[0] for r in ce_rows]
        
        n = len(ce_ids)
        if n == 0:
            continue
            
        base_weight = 100 // n
        remainder = 100 % n
        
        # Distribute the remainder
        weights = [base_weight + 1 if i < remainder else base_weight for i in range(n)]
        
        # Update the DB
        for ce_id, w in zip(ce_ids, weights):
            cursor.execute("UPDATE evaluation_criterion_items SET peso_ce=? WHERE module_document_id=? AND id_ra=? AND id_ce=?", (str(w), module_id, ra_id, ce_id))
            
    conn.commit()
    print("All weights updated without decimals across the entire database!")

update_weights()
