import { fileManager } from "./fileManager";

// Store reference to original fetch function
let originalFetch: typeof fetch | null = null;

// Mock Response Helper
function createMockResponse(body: any, status = 200, statusText = "OK") {
  const jsonStr = JSON.stringify(body);
  const blob = new Blob([jsonStr], { type: "application/json" });
  
  return new Response(blob, {
    status,
    statusText,
    headers: { "Content-Type": "application/json" }
  });
}

export const apiInterceptor = {
  init() {
    if (typeof window === 'undefined') return;
    if (originalFetch) return; // Already initialized

    originalFetch = window.fetch;
    
    // Override window.fetch globally
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const urlStr = typeof input === 'string' ? input : (input as any).url || input.toString();
      
      // Determine if we should handle this request locally
      // We only intercept /api/module, /api/attendance, /api/demo/seed
      const isModuleApi = urlStr.includes('/api/module/');
      const isAttendanceApi = urlStr.includes('/api/attendance');
      const isSeedApi = urlStr.includes('/api/demo/seed');
      
      const dataSourceType = fileManager.getDataSourceType();
      
      // If we are in local/demo mode and it's one of our data APIs, intercept!
      if ((isModuleApi || isAttendanceApi || isSeedApi) && originalFetch) {
        
        try {
          // --- Endpoint 1: POST /api/demo/seed ---
          if (isSeedApi && init?.method === 'POST') {
            fileManager.resetActiveDb();
            return createMockResponse({ status: "success", message: "Database reseeded successfully" });
          }

          // --- Endpoint 2: GET /api/module/:id ---
          if (isModuleApi && (!init?.method || init.method === 'GET')) {
            const parts = urlStr.split('/api/module/');
            const idWithParams = parts[parts.length - 1];
            const id = idWithParams.split('?')[0]; // Remove query params
            
            const data = fileManager.getModuleData(id);
            
            // If we have local data, return it
            if (data) {
              return createMockResponse({ status: "success", data });
            } else {
              // Return a default empty object to prevent frontend crashes
              // If it contains '-curso-', it's cursoData, otherwise moduleData
              const isCurso = id.includes('-curso-');
              const defaultData = isCurso ? { df_al: [], tutoria_ledger: {}, daily_ledger: {} } : { df_ud: [], df_sesiones: [] };
              return createMockResponse({ status: "success", data: defaultData });
            }
          }

          // --- Endpoint 3: PUT /api/module/:id ---
          if (isModuleApi && init?.method === 'PUT' && init.body) {
            const parts = urlStr.split('/api/module/');
            const idWithParams = parts[parts.length - 1];
            const id = idWithParams.split('?')[0];
            
            const body = JSON.parse(init.body.toString());
            fileManager.saveModuleData(id, body);
            
            return createMockResponse({ status: "success", message: "Module updated successfully" });
          }

          // --- Endpoint 4: GET /api/attendance/:moduleId ---
          if (isAttendanceApi && (!init?.method || init.method === 'GET') && !urlStr.endsWith('/api/attendance/')) {
            const parts = urlStr.split('/api/attendance/');
            const idWithParams = parts[parts.length - 1];
            const moduleId = idWithParams.split('?')[0];
            
            const moduleData = fileManager.getModuleData(moduleId) || {};
            const records = moduleData.attendance_records || [];
            
            return createMockResponse(records);
          }

          // --- Endpoint 5: POST /api/attendance/ ---
          if (isAttendanceApi && init?.method === 'POST' && init.body) {
            const body = JSON.parse(init.body.toString());
            const moduleId = body.module_document_id;
            
            if (moduleId) {
              const moduleData = fileManager.getModuleData(moduleId) || {};
              if (!moduleData.attendance_records) {
                moduleData.attendance_records = [];
              }
              
              // Find and update or create
              const existingIdx = moduleData.attendance_records.findIndex(
                (r: any) => r.student_id === body.student_id && r.date_str === body.date_str
              );
              
              const record = {
                id: existingIdx >= 0 ? moduleData.attendance_records[existingIdx].id : Math.floor(Math.random() * 1000000),
                module_document_id: body.module_document_id,
                student_id: body.student_id,
                date_str: body.date_str,
                status: body.status
              };
              
              if (existingIdx >= 0) {
                moduleData.attendance_records[existingIdx] = record;
              } else {
                moduleData.attendance_records.push(record);
              }
              
              fileManager.saveModuleData(moduleId, moduleData);
              return createMockResponse(record);
            }
          }

          // --- Endpoint 6: GET /api/attendance/ (Fallback / List all) ---
          if (isAttendanceApi && (!init?.method || init.method === 'GET') && urlStr.endsWith('/api/attendance/')) {
            // Return all records for all modules loaded in local database
            const db = fileManager.getDb();
            const allRecords: any[] = [];
            Object.keys(db).forEach(key => {
              if (db[key].attendance_records) {
                allRecords.push(...db[key].attendance_records);
              }
            });
            return createMockResponse(allRecords);
          }

        } catch (e) {
          console.error("Interceptor failed to handle simulated API request", e);
          return createMockResponse({ status: "error", detail: String(e) }, 500, "Internal Server Error");
        }
      }

      // Fallback: use original fetch for all other requests
      if (originalFetch) {
        return originalFetch(input, init);
      } else {
        return Promise.reject("Original fetch not available");
      }
    };
  }
};
