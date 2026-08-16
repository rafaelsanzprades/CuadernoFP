"use client";
import React, { useState } from "react";
import { Layers, Plus, Trash2, Target, ClipboardList, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotasJEG, DEFAULT_CONFIG_REDONDEO } from "@/utils/calificaciones";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

const TIPOS_INSTRUMENTO = [
  { id: "rubrica", label: "Rúbrica" },
  { id: "lista_control", label: "Lista de control" },
  { id: "escala_valoracion", label: "Escala de valoración" },
  { id: "prueba_objetiva", label: "Prueba objetiva" },
  { id: "registro_observacion", label: "Registro de observación" },
  { id: "diario", label: "Diario" },
  { id: "otro", label: "Otro" },
];

const ESCALAS = [
  { id: "continua_10", label: "Continua (0-10)" },
  { id: "discreta_4", label: "Discreta (1-4)" },
  { id: "discreta_letras", label: "Letras (A-D)" },
];

const PERIODOS_EVALUACION = [
  { id: "Ev1", label: "Ev1 — 1ª evaluación" },
  { id: "Ev2", label: "Ev2 — 2ª evaluación" },
  { id: "Ev3", label: "Ev3 — 3ª evaluación" },
  { id: "EvFO", label: "EvFO — Final ordinaria / recuperación final" },
  { id: "EvFE", label: "EvFE — Final extraordinaria" },
];

const AGENTES = [
  { id: "heteroevaluacion", label: "Heteroevaluación (profesor)" },
  { id: "coevaluacion", label: "Coevaluación (entre alumnado)" },
  { id: "autoevaluacion", label: "Autoevaluación (propio alumno)" },
];

// Ítem 12 de la Fase 2: distingue si el instrumento lo cumplimenta el
// profesor del centro o el tutor de empresa (fase dual/FCT) — mismo campo
// origen que RF Ideas/propuesta-motor-calificacion-2026-08-16.md propone.
const ORIGENES = [
  { id: "centro", label: "Centro educativo" },
  { id: "empresa", label: "Empresa (FCT / dual)" },
];

// Ítem 30 de la Fase 2: procedimiento JEG. "Recuperación" (R1/R2/R3/RF, según
// el periodo Ev1-EvFO elegido arriba) salta el CE y pondera directo en el
// RA, sustituyendo la nota ordinaria de ese RA. "Extraordinaria" (EvFE) es
// lo mismo pero se mantiene en una hoja de resultados aparte.
const PROCEDIMIENTOS = [
  { id: "ordinario", label: "Ordinario (vía CE normal)" },
  { id: "recuperacion", label: "Recuperación (R1-RF, directo a RA)" },
  { id: "extraordinaria", label: "Extraordinaria — EvFE (hoja aparte)" },
];

export function JegModeloTab() {
  const { moduleData, cursoData, updateDataFrame, updateCursoData } = useAppStore();
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_indicadores = (moduleData as any)?.df_indicadores || [];
  const df_instr = (moduleData as any)?.df_instr || [];
  const df_calificaciones = (cursoData as any)?.df_calificaciones || [];
  const df_al = cursoData?.df_al || [];
  const activos = df_al.filter(isAlumnoActivo);

  const [selectedAlId, setSelectedAlId] = useState<string>(activos[0]?.ID || "");
  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };

  const ceOptions = df_ce.filter((ce: any) => ce.id_ce).map((ce: any) => ({ id: ce.id_ce, label: ce.id_ce }));
  const indicadorOptions = df_indicadores.map((ind: any) => ({ id: ind.id_indicador, label: `${ind.id_indicador} — ${ind.descripcion || "(sin descripción)"}` }));

  // --- Indicadores ---
  const addIndicador = (id_ce: string) => {
    const n = df_indicadores.filter((i: any) => i.id_ce === id_ce).length + 1;
    const nuevo = { id_indicador: `${id_ce}-IND${n}`, id_ce, descripcion: "", peso: 1, is_basico: false };
    updateDataFrame("df_indicadores" as any, [...df_indicadores, nuevo]);
  };
  const updateIndicador = (id_indicador: string, field: string, value: any) => {
    updateDataFrame("df_indicadores" as any, df_indicadores.map((i: any) => i.id_indicador === id_indicador ? { ...i, [field]: value } : i));
  };
  const removeIndicador = (id_indicador: string) => {
    updateDataFrame("df_indicadores" as any, df_indicadores.filter((i: any) => i.id_indicador !== id_indicador));
    // Limpieza: también se sueltan las calificaciones huérfanas de ese indicador
    updateCursoData("df_calificaciones" as any, df_calificaciones.filter((c: any) => c.id_indicador !== id_indicador));
  };

  // --- Instrumentos ---
  const addInstrumento = () => {
    const nuevo = {
      id_instrumento: `INSTR${df_instr.length + 1}`,
      titulo: "",
      tipo: "rubrica",
      escala: "continua_10",
      evaluacion: "Ev1",
      agente: "heteroevaluacion",
      peso_global: 1,
      indicadores_vinculados: [],
      origen: "centro",
      procedimiento: "ordinario",
    };
    updateDataFrame("df_instr" as any, [...df_instr, nuevo]);
  };
  const updateInstrumento = (id_instrumento: string, field: string, value: any) => {
    updateDataFrame("df_instr" as any, df_instr.map((i: any) => i.id_instrumento === id_instrumento ? { ...i, [field]: value } : i));
  };
  const removeInstrumento = (id_instrumento: string) => {
    updateDataFrame("df_instr" as any, df_instr.filter((i: any) => i.id_instrumento !== id_instrumento));
    updateCursoData("df_calificaciones" as any, df_calificaciones.filter((c: any) => c.id_instrumento !== id_instrumento));
  };

  // --- Calificaciones (por alumno seleccionado) ---
  const getValor = (id_instrumento: string, id_indicador: string): number | null => {
    const c = df_calificaciones.find((c: any) => c.id_alumno === selectedAlId && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador);
    return c ? c.valor : null;
  };
  const setValor = (id_instrumento: string, id_indicador: string, valor: number | null) => {
    const idx = df_calificaciones.findIndex((c: any) => c.id_alumno === selectedAlId && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador);
    const next = [...df_calificaciones];
    if (idx >= 0) {
      next[idx] = { ...next[idx], valor };
    } else {
      next.push({
        id_calificacion: `CAL-${selectedAlId}-${id_instrumento}-${id_indicador}`,
        id_alumno: selectedAlId,
        id_instrumento,
        id_indicador,
        valor,
      });
    }
    updateCursoData("df_calificaciones" as any, next);
  };

  const resultado = selectedAlId
    ? calcularNotasJEG(selectedAlId, df_calificaciones, df_indicadores, df_instr, df_ce, df_ra, config_redondeo)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-body text-foreground/90">
        <strong>Modelo JEG (experimental).</strong> Nivel Indicador→CE→RA→Módulo del autor real de PD+
        (Javier Edo Gual) — convive con la matriz CE/instrumento de las pestañas de trimestre, no la
        sustituye. Los boletines y el resto de la app todavía usan el motor CE/RA de siempre.
      </div>

      {/* Indicadores por CE */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <Target className="w-5 h-5 text-purple-400" /> Indicadores por Criterio de Evaluación
        </h2>
        {ceOptions.length === 0 ? (
          <p className="text-body text-muted">Primero añade Criterios de evaluación en Currículo → Ponderación RA y CE.</p>
        ) : (
          <div className="space-y-4">
            {ceOptions.map((ce: any) => {
              const inds = df_indicadores.filter((i: any) => i.id_ce === ce.id);
              return (
                <div key={ce.id} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-info">{ce.id}</span>
                    <button onClick={() => addIndicador(ce.id)} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
                      <Plus className="w-3.5 h-3.5" /> Añadir indicador
                    </button>
                  </div>
                  {inds.length === 0 ? (
                    <p className="text-caption text-muted italic">Sin indicadores todavía.</p>
                  ) : (
                    <div className="space-y-2">
                      {inds.map((ind: any) => (
                        <div key={ind.id_indicador} className="flex items-center gap-2">
                          <span className="text-caption font-mono text-muted w-24 shrink-0 truncate">{ind.id_indicador}</span>
                          <input
                            type="text"
                            value={ind.descripcion || ""}
                            onChange={(e) => updateIndicador(ind.id_indicador, "descripcion", e.target.value)}
                            placeholder="Descripción del indicador"
                            className="flex-1 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-accent focus:outline-none"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={ind.peso ?? 1}
                            onChange={(e) => updateIndicador(ind.id_indicador, "peso", Number(e.target.value) || 0)}
                            title="Peso relativo dentro del CE"
                            className="w-20 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body text-center focus:border-accent focus:outline-none"
                          />
                          <label className="flex items-center gap-1 text-caption text-muted shrink-0">
                            <input type="checkbox" checked={!!ind.is_basico} onChange={(e) => updateIndicador(ind.id_indicador, "is_basico", e.target.checked)} />
                            Básico
                          </label>
                          <button onClick={() => removeIndicador(ind.id_indicador)} className="text-danger hover:text-danger p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instrumentos JEG */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <ClipboardList className="w-5 h-5 text-purple-400" /> Instrumentos (modelo JEG)
          </h2>
          <button onClick={addInstrumento} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
            <Plus className="w-3.5 h-3.5" /> Añadir instrumento
          </button>
        </div>
        {df_instr.length === 0 ? (
          <p className="text-body text-muted">Sin instrumentos JEG todavía.</p>
        ) : (
          <div className="space-y-3">
            {df_instr.map((instr: any) => (
              <div key={instr.id_instrumento} className="border border-white/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-mono text-muted w-20 shrink-0">{instr.id_instrumento}</span>
                  <input
                    type="text"
                    value={instr.titulo || ""}
                    onChange={(e) => updateInstrumento(instr.id_instrumento, "titulo", e.target.value)}
                    placeholder="Título del instrumento"
                    className="flex-1 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-accent focus:outline-none"
                  />
                  <button onClick={() => removeInstrumento(instr.id_instrumento)} className="text-danger hover:text-danger p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <select value={instr.tipo} onChange={(e) => updateInstrumento(instr.id_instrumento, "tipo", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {TIPOS_INSTRUMENTO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <select value={instr.escala} onChange={(e) => updateInstrumento(instr.id_instrumento, "escala", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {ESCALAS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <select value={instr.evaluacion} onChange={(e) => updateInstrumento(instr.id_instrumento, "evaluacion", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {PERIODOS_EVALUACION.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                  <select value={instr.agente} onChange={(e) => updateInstrumento(instr.id_instrumento, "agente", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {AGENTES.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                  <select value={instr.origen || "centro"} onChange={(e) => updateInstrumento(instr.id_instrumento, "origen", e.target.value)} title="Ítem 12: quién cumplimenta este instrumento" className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {ORIGENES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                  <select value={instr.procedimiento || "ordinario"} onChange={(e) => updateInstrumento(instr.id_instrumento, "procedimiento", e.target.value)} title="Ítem 30: procedimiento JEG (ordinario/recuperación/extraordinaria)" className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {PROCEDIMIENTOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-caption text-muted shrink-0">Peso global</span>
                  <input
                    type="number" step="0.1"
                    value={instr.peso_global ?? 1}
                    onChange={(e) => updateInstrumento(instr.id_instrumento, "peso_global", Number(e.target.value) || 0)}
                    className="w-20 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption text-center focus:border-accent focus:outline-none"
                  />
                  <span className="text-caption text-muted shrink-0 ml-2">Indicadores vinculados</span>
                  <div className="flex-1">
                    <MultiSelectDropdown
                      options={indicadorOptions}
                      selectedIds={instr.indicadores_vinculados || []}
                      onChange={(ids) => updateInstrumento(instr.id_instrumento, "indicadores_vinculados", ids)}
                      placeholder="Selecciona indicadores..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calificaciones por alumno + resultado */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-purple-400" /> Calificaciones por indicador
          </h2>
          <select value={selectedAlId} onChange={(e) => setSelectedAlId(e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1.5 text-foreground text-body focus:border-accent focus:outline-none">
            {activos.map((al: any) => <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre}</option>)}
          </select>
        </div>

        {df_instr.length === 0 ? (
          <p className="text-body text-muted">Añade instrumentos y vincúlalos a indicadores primero.</p>
        ) : (
          <div className="space-y-2 mb-6">
            {df_instr.map((instr: any) => (
              (instr.indicadores_vinculados || []).map((id_ind: string) => {
                const ind = df_indicadores.find((i: any) => i.id_indicador === id_ind);
                if (!ind) return null;
                const valor = getValor(instr.id_instrumento, id_ind);
                return (
                  <div key={`${instr.id_instrumento}-${id_ind}`} className="flex items-center gap-3">
                    <span className="text-caption text-muted flex-1 truncate">
                      <span className="font-mono text-accent">{instr.id_instrumento}</span> · {instr.titulo || "(sin título)"}
                      {instr.procedimiento && instr.procedimiento !== "ordinario" && (
                        <span className={`ml-1.5 text-caption px-1.5 rounded ${instr.procedimiento === "recuperacion" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {instr.procedimiento === "recuperacion" ? `Rec. (${instr.evaluacion})` : "EvFE"}
                        </span>
                      )}
                      {" → "}<span className="font-mono text-info">{id_ind}</span> {ind.descripcion}
                    </span>
                    <input
                      type="number" min={0} max={10} step={0.1}
                      value={valor ?? ""}
                      onChange={(e) => setValor(instr.id_instrumento, id_ind, e.target.value === "" ? null : Number(e.target.value))}
                      placeholder="-"
                      className="w-20 bg-background/50 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-center font-mono focus:border-accent focus:outline-none"
                    />
                  </div>
                );
              })
            ))}
          </div>
        )}

        {resultado && (
          <div className="border-t border-white/10 pt-4 space-y-6">
            <div>
              <h3 className="text-body font-bold text-foreground mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" /> Evaluación ordinaria {'+'} recuperación (R1-RF) — {activos.find((a: any) => a.ID === selectedAlId)?.Apellidos}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {Object.entries(resultado.notas_ra).map(([ra_id, nota]) => {
                  const esRecuperado = resultado.notas_ra_ordinario[ra_id] !== nota;
                  return (
                    <div key={ra_id} className="bg-background/30 border border-white/5 rounded-lg p-3 text-center">
                      <div className="text-caption text-muted mb-1 flex items-center justify-center gap-1">
                        {ra_id}
                        {esRecuperado && <span className="text-caption px-1.5 rounded bg-amber-500/20 text-amber-400" title="Sustituida por recuperación">Rec.</span>}
                      </div>
                      <div className="font-mono font-bold text-foreground">{nota !== null ? nota.toFixed(2) : "Sin evaluar"}</div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-caption text-muted mb-1">Nota final (Motor JEG)</div>
                <div className="text-heading font-black text-purple-300">{resultado.nota_final !== null ? resultado.nota_final.toFixed(2) : "Sin evaluar"}</div>
              </div>
            </div>

            <div>
              <h3 className="text-body font-bold text-foreground mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" /> Hoja aparte: evaluación final extraordinaria (EvFE)
              </h3>
              <p className="text-caption text-muted mb-3">Segunda convocatoria — nunca se mezcla con la nota ordinaria de arriba. Un RA sin intento en EvFE hereda el resultado de la fila anterior.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {Object.entries(resultado.notas_ra_extraordinaria).map(([ra_id, nota]) => (
                  <div key={ra_id} className="bg-background/30 border border-white/5 rounded-lg p-3 text-center">
                    <div className="text-caption text-muted mb-1">{ra_id}</div>
                    <div className="font-mono font-bold text-foreground">{nota !== null ? nota.toFixed(2) : "Sin evaluar"}</div>
                  </div>
                ))}
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-center">
                <div className="text-caption text-muted mb-1">Nota final extraordinaria (EvFE)</div>
                <div className="text-heading font-black text-rose-300">{resultado.nota_final_extraordinaria !== null ? resultado.nota_final_extraordinaria.toFixed(2) : "Sin evaluar"}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
