import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function TutoriaTab() {
  const { cursoData, updateCursoData } = useAppStore();

  const df_al = cursoData?.df_al || [];
  const tutoria_ledger = cursoData?.tutoria_ledger || {}; 
  const df_evaluable = df_al.filter((al: any) => al.Estado !== "Baja");

  const [selectedAlId, setSelectedAlId] = useState<string>(df_evaluable.length > 0 ? (df_evaluable[0].ID || "") : "");

  const getTutorias = (al_id: string) => {
    const list = tutoria_ledger[al_id];
    return Array.isArray(list) ? list : [];
  };

  const handleAddTutoria = () => {
    if (!selectedAlId) return;
    
    const newLedger = { ...tutoria_ledger };
    if (!newLedger[selectedAlId]) newLedger[selectedAlId] = [];
    
    const now = new Date();
    const newEntry = {
      id: `tut_${now.getTime()}`,
      fecha: now.toISOString().split('T')[0],
      canal: "Presencial",
      ambito: "Alumno/a",
      tema: "",
      acuerdos: ""
    };
    
    newLedger[selectedAlId].push(newEntry);
    updateCursoData("tutoria_ledger", newLedger);
  };

  const handleUpdateTutoria = (al_id: string, idx: number, field: string, value: any) => {
    const newLedger = { ...tutoria_ledger };
    newLedger[al_id][idx][field] = value;
    updateCursoData("tutoria_ledger", newLedger);
  };

  const handleDeleteTutoria = (al_id: string, idx: number) => {
    const newLedger = { ...tutoria_ledger };
    newLedger[al_id].splice(idx, 1);
    updateCursoData("tutoria_ledger", newLedger);
  };

  return (
    <div className="animate-in fade-in duration-500 flex gap-6 min-h-[600px]">

      {/* Sidebar de Alumnado */}
      <Card className="w-64 p-4 flex flex-col border-r border-[var(--glass-border)] bg-foreground/5 overflow-hidden">
        <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-accent" />
          Alumnado
        </h3>
        <div className="overflow-y-auto flex-1 space-y-1 pr-2 scrollbar-thin">
          {df_evaluable.map((al: any) => {
            const hasNotes = getTutorias(al.ID).length > 0;
            return (
              <button
                key={al.ID}
                onClick={() => setSelectedAlId(al.ID)}
                className={`w-full text-left px-3 py-2 rounded transition-all text-body flex justify-between items-center border border-transparent ${
                  selectedAlId === al.ID 
                    ? 'border-accent text-foreground font-semibold bg-accent/5 shadow-sm' 
                    : 'hover:bg-foreground/10 text-muted'
                }`}
              >
                <span className="truncate">{al.Apellidos}, {al.Nombre}</span>
                {hasNotes && (
                  <span className={`text-caption px-2 rounded-full ${selectedAlId === al.ID ? 'bg-black/20' : 'bg-accent/20 text-accent'}`}>
                    {getTutorias(al.ID).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Panel de Tutorías */}
      <Card className="flex-1 p-6 flex flex-col h-full overflow-hidden">
        {selectedAlId ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-heading font-bold text-foreground">
                Registro de tutoría: <span>{df_al.find((a:any) => a.ID === selectedAlId)?.Nombre} {df_al.find((a:any) => a.ID === selectedAlId)?.Apellidos}</span>
              </h2>
              <Button onClick={handleAddTutoria} variant="primary" className="gap-2">
                <Plus className="w-4 h-4" /> Añadir Registro
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {getTutorias(selectedAlId).length === 0 ? (
                <div className="text-center py-12 text-muted flex flex-col items-center justify-center h-full">
                  <ClipboardList className="w-16 h-16 opacity-20 mb-4" />
                  <p>No hay registros de tutoría para este estudiante.</p>
                  <p className="text-body mt-2 opacity-70">Pulsa "Añadir Registro" para comenzar.</p>
                </div>
              ) : (
                getTutorias(selectedAlId).map((tut: any, idx: number) => (
                  <div key={tut.id} className="bg-foreground/5 border border-[var(--glass-border)] rounded-lg p-4 relative group">
                    <button 
                      onClick={() => handleDeleteTutoria(selectedAlId, idx)}
                      className="absolute top-4 right-4 text-danger/50 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="flex flex-wrap gap-4 mb-4 pr-8">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-caption text-muted-foreground font-bold mb-1">Fecha</label>
                        <input 
                          type="date" 
                          value={tut.fecha || ""} 
                          onChange={(e) => handleUpdateTutoria(selectedAlId, idx, "fecha", e.target.value)}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded px-3 py-1.5 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-caption text-muted-foreground font-bold mb-1">Ámbito</label>
                        <select 
                          value={tut.ambito || "Alumno/a"} 
                          onChange={(e) => handleUpdateTutoria(selectedAlId, idx, "ambito", e.target.value)}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded px-3 py-1.5 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                        >
                          <option value="Alumno/a">Alumno/a</option>
                          <option value="Familia">Familia</option>
                          <option value="Equipo Docente">Equipo docente</option>
                          <option value="Orientación">Departamento Orientación</option>
                        </select>
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-caption text-muted-foreground font-bold mb-1">Canal</label>
                        <select 
                          value={tut.canal || "Presencial"} 
                          onChange={(e) => handleUpdateTutoria(selectedAlId, idx, "canal", e.target.value)}
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded px-3 py-1.5 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
                        >
                          <option value="Presencial">Reunión presencial</option>
                          <option value="Videollamada">Videollamada</option>
                          <option value="Teléfono">Llamada telefónica</option>
                          <option value="Email">Correo electrónico</option>
                          <option value="Pasillo">Informal / Pasillo</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-caption text-muted-foreground font-bold mb-1">Tema tratado / Desarrollo</label>
                        <textarea 
                          value={tut.tema || ""}
                          onChange={(e) => handleUpdateTutoria(selectedAlId, idx, "tema", e.target.value)}
                          placeholder="Describe brevemente lo comentado en la tutoría..."
                          className="w-full bg-foreground/10 border border-[var(--glass-border)] rounded px-3 py-2 min-h-[80px] resize-y focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none placeholder:text-muted/40"
                        />
                      </div>
                      <div>
                        <label className="block text-caption text-success font-bold mb-1">Acuerdos / Compromisos</label>
                        <textarea 
                          value={tut.acuerdos || ""}
                          onChange={(e) => handleUpdateTutoria(selectedAlId, idx, "acuerdos", e.target.value)}
                          placeholder="¿A qué acuerdos se ha llegado? ¿Qué tareas pendientes quedan?"
                          className="w-full bg-success/10 border border-[var(--glass-border)] rounded px-3 py-2 min-h-[60px] resize-y focus:border-success focus:ring-1 focus:ring-success focus:outline-none placeholder:text-success/40"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
            Selecciona un alumno en el panel lateral para ver sus tutorías.
          </div>
        )}
      </Card>
    </div>
  );
}
