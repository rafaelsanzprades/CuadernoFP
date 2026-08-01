import { Plus, X, Settings } from "lucide-react";
import React, { useState } from "react";
import { TaskConfigModal } from "./TaskConfigModal";

export function TaskTable({ df_tareas, handleUpdateTarea, handleAddTarea, handleDeleteTarea }: any) {
  const [editingTask, setEditingTask] = useState<any>(null);
  return (
    <div className="overflow-x-auto">
      <div className="w-full text-sm">
        <div className="flex text-muted border-b border-[var(--glass-border)] pb-2 mb-2 items-center">
          <div className="w-16">Id</div>
          <div className="w-48 pr-2">RA/CE</div>
          <div className="flex-1 pr-2">Tarea</div>
          <div className="w-10"></div>
        </div>
        <div className="space-y-2">
          {df_tareas.map((tc: any) => {
            const globalIdx = df_tareas.findIndex((gTc: any) => gTc === tc);
            return (
              <div key={globalIdx} className="border-b border-white/5 pb-3 hover:bg-foreground/5">
                {/* Primera Línea */}
                <div className="flex items-center mb-2">
                  <div className="w-16 font-mono text-muted-foreground">{tc.ID || tc.id_act}</div>
                  <div className="w-48 pr-2">
                    <input 
                      type="text"
                      value={tc.RA_Asociados || ""}
                      onChange={(e) => handleUpdateTarea(globalIdx, "RA_Asociados", e.target.value)}
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 pr-2">
                    <input 
                      type="text"
                      value={tc.Nombre_Tarea || ""}
                      onChange={(e) => handleUpdateTarea(globalIdx, "Nombre_Tarea", e.target.value)}
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                    />
                  </div>
                  <div className="w-20 flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingTask(tc)}
                      className="p-1.5 hover:bg-foreground/10 rounded-md text-muted hover:text-accent transition-colors"
                      title="Configurar tarea competencial"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTarea(globalIdx)}
                      className="p-1.5 text-danger/70 hover:bg-danger/10 hover:text-danger rounded-md font-bold transition-colors"
                      title="Eliminar tarea"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Segunda Línea: Identada y con Contexto e Instrumento */}
                <div className="flex items-center gap-4 pl-16">
                  <div className="flex-1 flex flex-col">
                    <span className="text-xs text-muted-foreground tracking-wider mb-1 font-semibold">Contexto</span>
                    <input 
                      type="text"
                      value={tc.Reto || ""}
                      onChange={(e) => handleUpdateTarea(globalIdx, "Reto", e.target.value)}
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 flex flex-col pr-10">
                    <span className="text-xs text-muted-foreground tracking-wider mb-1 font-semibold">Instrumento</span>
                    <input 
                      type="text"
                      value={tc.Instrumento || tc.desc_act || ""}
                      onChange={(e) => handleUpdateTarea(globalIdx, "Instrumento", e.target.value)}
                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-info focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <button 
          onClick={handleAddTarea}
          className="text-sm text-info hover:text-info font-semibold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Añadir nueva tarea competencial
        </button>
      </div>
      {editingTask && (
        <TaskConfigModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(task_id, updates) => {
            const idx = df_tareas.findIndex((t: any) => t.ID === task_id || t.id_act === task_id);
            if (idx !== -1) {
              Object.keys(updates).forEach((key) => {
                handleUpdateTarea(idx, key, updates[key]);
              });
            } else {
              Object.assign(editingTask, updates);
            }
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
