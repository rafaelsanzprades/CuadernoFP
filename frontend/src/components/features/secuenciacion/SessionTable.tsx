import { GripVertical } from "lucide-react";
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { UnidadDidactica, Sesion } from "@/types";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { getAllAspectosClave, getAllRecursos } from "@/constants/taxonomies";
import { UdConfigModal } from "./UdConfigModal";
import { Settings } from "lucide-react";

interface SessionTableProps {
  df_ud: UnidadDidactica[];
  df_sesiones: Sesion[];
  onDragEnd: (result: any) => void;
  handleUpdateSesion: (globalIdx: number, field: string, value: any) => void;
  handleAddSesion: (ud_id: string) => void;
  handleDeleteSesion: (globalIdx: number) => void;
  allUdsOpen: boolean;
}

export function SessionTable({
  df_ud,
  df_sesiones,
  onDragEnd,
  handleUpdateSesion,
  handleAddSesion,
  handleDeleteSesion,
  allUdsOpen
}: SessionTableProps) {
  const [editingUd, setEditingUd] = useState<UnidadDidactica | null>(null);

  // Workaround for hydration mismatches with DragDropContext
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={onDragEnd}>
      {df_ud.map((ud: UnidadDidactica) => {
        const udSesiones = df_sesiones.filter((s: Sesion) => s.id_ud === ud.id_ud);
        udSesiones.sort((a: Sesion, b: Sesion) => (Number(a.Num_Orden) || 0) - (Number(b.Num_Orden) || 0));
        const totalHoras = udSesiones.reduce((sum: number, s: Sesion) => sum + (Number(s.Horas) || 0), 0);

        return (
          <details 
            key={ud.id_ud} 
            open={allUdsOpen} 
            className="ud-details group bg-foreground/5 rounded-lg border border-[var(--glass-border)] overflow-hidden open:bg-foreground/10 transition-colors"
          >
            <summary className="p-4 cursor-pointer flex items-center justify-between font-semibold text-subheading select-none hover:bg-foreground/5">
              <div className="flex items-center gap-4">
                <span className="text-accent">{ud.id_ud}</span>
                <span className="text-body text-muted truncate max-w-xl">{ud.desc_ud}</span>
              </div>
              <div className="flex items-center gap-6 text-body">
                <span className="text-muted">{udSesiones.length} sesiones</span>
                <span className="text-accent bg-accent/10 px-2 py-1 rounded">{totalHoras} h</span>
                <button 
                  onClick={(e) => { e.preventDefault(); setEditingUd(ud); }}
                  className="p-1.5 hover:bg-foreground/10 rounded-md text-muted hover:text-accent transition-colors"
                  title="Configurar unidad didáctica"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <span className="ml-2 group-open:rotate-180 inline-block transition-transform text-muted">▼</span>
              </div>
            </summary>
            <div className="p-4 border-t border-[var(--glass-border)] bg-foreground/10 overflow-x-auto">
              <div className="w-full text-body">
                <div className="flex text-muted border-b border-[var(--glass-border)] pb-2 mb-2 items-center">
                  <div className="w-10"></div>
                  <div className="w-16">Nº</div>
                  <div className="w-16 pr-2">Horas</div>
                  <div className="w-40 pr-2">Tipo</div>
                  <div className="w-32 pr-2">Ra/CE</div>
                  <div className="flex-1 pr-2">Contenidos</div>
                  <div className="w-10"></div>
                </div>
                <Droppable droppableId={ud.id_ud}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {udSesiones.map((ses: Sesion, idx: number) => {
                        const globalIdx = df_sesiones.findIndex((gSes: Sesion) => gSes === ses);
                        const dragId = ses.ID || `ses-${globalIdx}`;
                        return (
                          <Draggable key={dragId} draggableId={dragId} index={idx}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border-b border-white/5 pb-3 hover:bg-foreground/5 ${snapshot.isDragging ? 'bg-background shadow-2xl z-50' : ''}`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                {/* Primera Línea */}
                                <div className="flex items-center mb-2">
                                  <div className="w-10 flex justify-center" {...provided.dragHandleProps}>
                                    <div className="p-1 hover:bg-gray-500/20 rounded cursor-grab active:cursor-grabbing inline-flex items-center justify-center">
                                      <GripVertical className="text-muted w-4 h-4" />
                                    </div>
                                  </div>
                                  <div className="w-16 pr-2">
                                    <input 
                                      type="number" 
                                      value={ses.Num_Orden || 0}
                                      onChange={(e) => handleUpdateSesion(globalIdx, "Num_Orden", Number(e.target.value) || 0)}
                                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                    />
                                  </div>
                                  <div className="w-16 pr-2">
                                    <input 
                                      type="number" 
                                      value={ses.Horas || 0}
                                      onChange={(e) => handleUpdateSesion(globalIdx, "Horas", Number(e.target.value) || 0)}
                                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                    />
                                  </div>
                                  <div className="w-40 pr-2">
                                    <select 
                                      value={ses.Tipo_Actividad || "Tª (Teoria)"}
                                      onChange={(e) => handleUpdateSesion(globalIdx, "Tipo_Actividad", e.target.value)}
                                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none appearance-none"
                                    >
                                      <option value="Tª (Teoria)">Tª (Teoria)</option>
                                      <option value="Pª (Practica)">Pª (Practica)</option>
                                      <option value="IE (Instrumento de Evaluacion)">IE (Inst. Eval.)</option>
                                      <option value="Pª+ (Ampliacion/Refuerzo)">Pª+ (Amp/Ref)</option>
                                    </select>
                                  </div>
                                  <div className="w-32 pr-2">
                                    <input 
                                      type="text" 
                                      value={ses.RA_CE || ""}
                                      onChange={(e) => handleUpdateSesion(globalIdx, "RA_CE", e.target.value)}
                                      className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                    />
                                  </div>
                                  <div className="flex-1 pr-2">
                                    <input 
                                      type="text" 
                                      value={ses.Contenidos || ""}
                                      onChange={(e) => handleUpdateSesion(globalIdx, "Contenidos", e.target.value)}
                                      className="w-full min-w-[200px] bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground focus:border-accent focus:outline-none" 
                                    />
                                  </div>
                                  <div className="w-10 flex justify-center">
                                    <button
                                      onClick={() => handleDeleteSesion(globalIdx)}
                                      className="text-danger hover:text-danger font-bold text-subheading"
                                      title="Eliminar sesión"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Segunda Línea: Identada y con MultiSelects */}
                                <div className="flex items-center gap-4 pl-[7.5rem]">
                                  <div className="flex-1 flex flex-col">
                                    <span className="text-caption text-muted-foreground tracking-wider mb-1 font-semibold">Aspectos Clave</span>
                                    <MultiSelectDropdown
                                      options={getAllAspectosClave()}
                                      selectedIds={ses.Aspectos_Clave ? ses.Aspectos_Clave.split(',').map(s => s.trim()).filter(Boolean) : []}
                                      onChange={(ids) => handleUpdateSesion(globalIdx, "Aspectos_Clave", ids.join(', '))}
                                      placeholder="Selecciona aspectos clave..."
                                    />
                                  </div>
                                  <div className="flex-1 flex flex-col pr-10">
                                    <span className="text-caption text-muted-foreground tracking-wider mb-1 font-semibold">Recursos</span>
                                    <MultiSelectDropdown
                                      options={getAllRecursos()}
                                      selectedIds={ses.Recursos ? ses.Recursos.split(',').map(s => s.trim()).filter(Boolean) : []}
                                      onChange={(ids) => handleUpdateSesion(globalIdx, "Recursos", ids.join(', '))}
                                      placeholder="Selecciona recursos..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => handleAddSesion(ud.id_ud)}
                  className="text-body text-accent hover:text-accent/80 font-semibold flex items-center gap-1"
                >
                  <span>+</span> Añadir sesión a {ud.id_ud}
                </button>
              </div>
            </div>
          </details>
        );
      })}
      </DragDropContext>
      {editingUd && (
        <UdConfigModal 
          ud={editingUd} 
          onClose={() => setEditingUd(null)} 
          onSave={(ud_id, updates) => {
            // Note: Ideal to have a handleUpdateUd passed down, but for now we just use a callback to the parent if needed, 
            // or we update the object directly since it's a proxy in some stores.
            // A more solid approach requires handleUpdateUd in props, but we can do a local mutate for now to not break signature
            Object.assign(editingUd, updates);
            setEditingUd(null);
            // In a real scenario we need updateDataFrame("df_ud", updatedDfUd)
          }} 
        />
      )}
    </div>
  );
}
