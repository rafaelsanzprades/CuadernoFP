import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TutoriaActuacion, Alumnado } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Calendar, Clock, MessageSquare, Trash2, Users } from 'lucide-react';

export const ActuacionesTab = () => {
  const { cursoData, updateCursoData } = useAppStore();
  const actuaciones = cursoData?.actuaciones_tutoria || [];
  const df_al = cursoData?.df_al || [];
  
  const [selectedId, setSelectedId] = useState<string | null>(actuaciones.length > 0 ? actuaciones[0].id : null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddActuacion = () => {
    const newAct: TutoriaActuacion = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: "",
      horaFin: "",
      alumnadoIds: ["ALL"],
      ambito: "",
      canal: "",
      tipo: "",
      tema: "Nueva actuación",
      participantes: "",
      desarrollo: "",
      acuerdos: ""
    };
    const newLista = [newAct, ...actuaciones];
    updateCursoData('actuaciones_tutoria', newLista);
    setSelectedId(newAct.id);
  };

  const handleUpdate = (field: keyof TutoriaActuacion, value: any) => {
    if (!selectedId) return;
    const newLista = actuaciones.map(act => act.id === selectedId ? { ...act, [field]: value } : act);
    updateCursoData('actuaciones_tutoria', newLista);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta actuación?")) return;
    const newLista = actuaciones.filter(act => act.id !== id);
    updateCursoData('actuaciones_tutoria', newLista);
    if (selectedId === id) setSelectedId(null);
  };

  const activeActuacion = actuaciones.find(a => a.id === selectedId);

  const filteredActuaciones = actuaciones.filter(a => 
    a.tema?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.fecha?.includes(searchTerm)
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Sidebar List */}
      <div className="w-80 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5 bg-foreground/10 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div className="text-xs font-medium text-muted tracking-wider">
              Actuaciones ({actuaciones.length})
            </div>
            <Button onClick={handleAddActuacion} className="bg-accent/20 text-accent hover:bg-accent hover:text-background h-8 px-3 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-4 h-4 mr-1" /> Nueva
            </Button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted" />
            <input 
              type="text" 
              placeholder="Buscar actuación..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          {filteredActuaciones.map((act) => {
            const isSelected = act.id === selectedId;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedId(act.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex flex-col gap-1 ${
                  isSelected 
                    ? "bg-accent text-background font-bold shadow-md shadow-accent/15"
                    : "text-foreground/80 hover:bg-foreground/5"
                }`}
              >
                <div className="text-sm truncate w-full flex items-center justify-between">
                  <span className="truncate pr-2">{act.tema || "Sin título"}</span>
                </div>
                <div className={`text-[10px] flex items-center gap-3 ${isSelected ? "text-background/80" : "text-muted"}`}>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {act.fecha || "--"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {act.horaInicio || "--"}</span>
                </div>
              </button>
            );
          })}
          {filteredActuaciones.length === 0 && (
            <div className="text-center p-6 text-sm text-muted">
              No hay actuaciones registradas.
            </div>
          )}
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 bg-foreground/5 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {activeActuacion ? (
          <>
            <div className="p-6 border-b border-white/5 bg-foreground/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-accent" /> Registro de Actuación
                </h3>
              </div>
              <Button onClick={() => handleDelete(activeActuacion.id)} variant="ghost" className="text-danger hover:bg-danger/10 hover:text-danger flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Eliminar
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Fecha</label>
                  <input
                    type="date"
                    value={activeActuacion.fecha || ""}
                    onChange={(e) => handleUpdate("fecha", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Hora Inicio</label>
                  <input
                    type="time"
                    value={activeActuacion.horaInicio || ""}
                    onChange={(e) => handleUpdate("horaInicio", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Hora Fin</label>
                  <input
                    type="time"
                    value={activeActuacion.horaFin || ""}
                    onChange={(e) => handleUpdate("horaFin", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Alumnado implicado</label>
                  <select
                    value={activeActuacion.alumnadoIds?.[0] || "ALL"}
                    onChange={(e) => handleUpdate("alumnadoIds", [e.target.value])}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="ALL" className="bg-[#0f172a]">Todo el grupo</option>
                    {df_al.map((al: Alumnado) => (
                      <option key={al.ID} value={al.ID} className="bg-[#0f172a]">
                        {al.Apellidos}, {al.Nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Participantes adicionales</label>
                  <input
                    type="text"
                    value={activeActuacion.participantes || ""}
                    onChange={(e) => handleUpdate("participantes", e.target.value)}
                    placeholder="Ej. Familiares, PT, Orientador..."
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-white/5 pt-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Ámbito</label>
                  <select
                    value={activeActuacion.ambito || ""}
                    onChange={(e) => handleUpdate("ambito", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">-- Seleccionar --</option>
                    <option value="Grupo completo" className="bg-[#0f172a]">Grupo completo</option>
                    <option value="Alumno/a" className="bg-[#0f172a]">Alumno/a individual</option>
                    <option value="Familia" className="bg-[#0f172a]">Familia / Tutores legales</option>
                    <option value="Equipo docente" className="bg-[#0f172a]">Equipo docente</option>
                    <option value="Orientación" className="bg-[#0f172a]">Orientación / Dpto.</option>
                    <option value="Otro" className="bg-[#0f172a]">Otro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Canal</label>
                  <select
                    value={activeActuacion.canal || ""}
                    onChange={(e) => handleUpdate("canal", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">-- Seleccionar --</option>
                    <option value="Presencial" className="bg-[#0f172a]">Reunión presencial</option>
                    <option value="Videoconferencia" className="bg-[#0f172a]">Videoconferencia</option>
                    <option value="Teléfono" className="bg-[#0f172a]">Llamada telefónica</option>
                    <option value="Correo electrónico" className="bg-[#0f172a]">Correo electrónico</option>
                    <option value="Plataforma" className="bg-[#0f172a]">Plataforma educativa</option>
                    <option value="Otro" className="bg-[#0f172a]">Otro</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Tipo de actuación</label>
                  <select
                    value={activeActuacion.tipo || ""}
                    onChange={(e) => handleUpdate("tipo", e.target.value)}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground text-sm focus:border-accent focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="" className="bg-[#0f172a]">-- Seleccionar --</option>
                    <option value="Seguimiento académico" className="bg-[#0f172a]">Seguimiento académico</option>
                    <option value="Evaluación" className="bg-[#0f172a]">Evaluación y notas</option>
                    <option value="Convivencia" className="bg-[#0f172a]">Convivencia / Disciplina</option>
                    <option value="Orientación profesional" className="bg-[#0f172a]">Orientación prof. / laboral</option>
                    <option value="Absentismo" className="bg-[#0f172a]">Control de absentismo</option>
                    <option value="Incidencia" className="bg-[#0f172a]">Incidencia médica/personal</option>
                    <option value="Otro" className="bg-[#0f172a]">Otro</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Tema principal</label>
                  <input
                    type="text"
                    value={activeActuacion.tema || ""}
                    onChange={(e) => handleUpdate("tema", e.target.value)}
                    placeholder="Asunto breve de la actuación"
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-2.5 text-foreground font-semibold text-lg focus:border-accent focus:outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted tracking-wider">Desarrollo de la actuación</label>
                  <textarea
                    value={activeActuacion.desarrollo || ""}
                    onChange={(e) => handleUpdate("desarrollo", e.target.value)}
                    placeholder="Describe los puntos tratados durante la actuación..."
                    rows={4}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-3 text-foreground text-sm focus:border-accent focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-success tracking-wider flex items-center gap-2">
                    <span className="bg-success/20 p-1 rounded"><Users className="w-3 h-3" /></span> Acuerdos alcanzados
                  </label>
                  <textarea
                    value={activeActuacion.acuerdos || ""}
                    onChange={(e) => handleUpdate("acuerdos", e.target.value)}
                    placeholder="Compromisos y próximos pasos..."
                    rows={3}
                    className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded-lg px-3 py-3 text-foreground text-sm focus:border-success focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-muted">
            <MessageSquare className="w-12 h-12 text-muted/50 mb-3" />
            <p className="font-semibold text-lg">No hay actuación seleccionada</p>
            <p className="text-sm opacity-80">Selecciona una del panel izquierdo o crea una nueva.</p>
          </div>
        )}
      </div>
    </div>
  );
};
