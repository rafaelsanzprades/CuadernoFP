"use client";
import React, { useState } from "react";
import { Layers, Plus, Trash2, Target, ClipboardList, Sparkles, Grid3x3 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotasJEG, DEFAULT_CONFIG_REDONDEO, repartoIgualitario, filtrarPorGev, GRUPOS_EVALUACION_DEFECTO } from "@/utils/calificaciones";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useTranslation } from "react-i18next";

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
// profesor del centro o el tutor de empresa (fase dual/FEOE) — mismo campo
// origen que RF Ideas/propuesta-motor-calificacion-2026-08-16.md propone.
const ORIGENES = [
  { id: "centro", label: "Centro educativo" },
  { id: "empresa", label: "Empresa (FEOE / dual)" },
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
  const { t } = useTranslation();
  const { moduleData, cursoData, updateDataFrame, updateCursoData, updateModuleData } = useAppStore();
  const df_ce = moduleData?.df_ce || [];
  const df_ra = moduleData?.df_ra || [];
  const df_indicadores = moduleData?.df_indicadores || [];
  const df_instr = moduleData?.df_instr || [];
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const df_al = cursoData?.df_al || [];
  const activos = df_al.filter(isAlumnoActivo);
  const gruposEvaluacion: { id: string; nombre: string }[] =
    (moduleData?.grupos_evaluacion?.length ? moduleData.grupos_evaluacion : GRUPOS_EVALUACION_DEFECTO);
  const [nuevoGev, setNuevoGev] = useState("");
  const addGrupoEvaluacion = () => {
    const nombre = nuevoGev.trim();
    if (!nombre) return;
    const id = nombre.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!id || gruposEvaluacion.some((g) => g.id === id)) return;
    updateModuleData("grupos_evaluacion", [...gruposEvaluacion, { id, nombre }]);
    setNuevoGev("");
  };

  const [selectedAlId, setSelectedAlId] = useState<string>(activos[0]?.ID || "");
  const selectedAl = activos.find((a: any) => a.ID === selectedAlId);
  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };

  const ceOptions = df_ce.filter((ce: any) => ce.id_ce).map((ce: any) => ({ id: ce.id_ce, label: ce.id_ce }));
  const indicadorOptions = df_indicadores.map((ind: any) => ({ id: ind.id_indicador, label: `${ind.id_indicador} — ${ind.descripcion || "(sin descripción)"}` }));

  // --- Indicadores ---
  const addIndicador = (id_ce: string) => {
    const n = df_indicadores.filter((i: any) => i.id_ce === id_ce).length + 1;
    const nuevo = { id_indicador: `${id_ce}-IND${n}`, id_ce, descripcion: "", peso: 0, is_basico: false };
    const next = [...df_indicadores, nuevo];
    const idsDeEsteCe = next.filter((i: any) => i.id_ce === id_ce).map((i: any) => i.id_indicador);
    const repartos = repartoIgualitario(idsDeEsteCe.length);
    updateDataFrame("df_indicadores", next.map((i: any) => {
      const idx = idsDeEsteCe.indexOf(i.id_indicador);
      return idx === -1 ? i : { ...i, peso: repartos[idx] };
    }));
  };
  const updateIndicador = (id_indicador: string, field: string, value: any) => {
    updateDataFrame("df_indicadores", df_indicadores.map((i: any) => i.id_indicador === id_indicador ? { ...i, [field]: value } : i));
  };
  const removeIndicador = (id_indicador: string) => {
    const removed = df_indicadores.find((i: any) => i.id_indicador === id_indicador);
    const next = df_indicadores.filter((i: any) => i.id_indicador !== id_indicador);
    const idsDeEsteCe = removed ? next.filter((i: any) => i.id_ce === removed.id_ce).map((i: any) => i.id_indicador) : [];
    const repartos = repartoIgualitario(idsDeEsteCe.length);
    updateDataFrame("df_indicadores", next.map((i: any) => {
      const idx = idsDeEsteCe.indexOf(i.id_indicador);
      return idx === -1 ? i : { ...i, peso: repartos[idx] };
    }));
    // Limpieza: también se sueltan las calificaciones huérfanas de ese indicador
    updateCursoData("df_calificaciones", df_calificaciones.filter((c: any) => c.id_indicador !== id_indicador));
  };
  // Ítem 42, punto 2/3: mismo patrón "debe sumar 100%" + reparto automático que
  // ya usan peso_ra/peso_ce en curriculo/page.tsx, aplicado a Indicador.peso
  // dentro de cada CE (el cálculo real no exige que sumen 100 — es una media
  // ponderada que se autonormaliza — pero mantiene los pesos legibles como %).
  const dividirPesosIndicadores = (id_ce: string) => {
    const idsDeEsteCe = df_indicadores.filter((i: any) => i.id_ce === id_ce).map((i: any) => i.id_indicador);
    const repartos = repartoIgualitario(idsDeEsteCe.length);
    updateDataFrame("df_indicadores", df_indicadores.map((i: any) => {
      const idx = idsDeEsteCe.indexOf(i.id_indicador);
      return idx === -1 ? i : { ...i, peso: repartos[idx] };
    }));
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
    updateDataFrame("df_instr", [...df_instr, nuevo]);
  };
  const updateInstrumento = (id_instrumento: string, field: string, value: any) => {
    updateDataFrame("df_instr", df_instr.map((i: any) => i.id_instrumento === id_instrumento ? { ...i, [field]: value } : i));
  };
  const removeInstrumento = (id_instrumento: string) => {
    updateDataFrame("df_instr", df_instr.filter((i: any) => i.id_instrumento !== id_instrumento));
    updateCursoData("df_calificaciones", df_calificaciones.filter((c: any) => c.id_instrumento !== id_instrumento));
  };

  // --- Calificaciones (por alumno seleccionado) ---
  const getValor = (id_instrumento: string, id_indicador: string): number | null => {
    const c = df_calificaciones.find((c: any) => c.id_alumno === selectedAlId && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador);
    return c ? c.valor : null;
  };
  const setValor = (id_instrumento: string, id_indicador: string, valor: number | null) => {
    const idx = df_calificaciones.findIndex((c: any) => c.id_alumno === selectedAlId && c.id_instrumento === id_instrumento && c.id_indicador === id_indicador);
    const next = [...df_calificaciones];
    // timestamp: cuándo se puso/tocó esta nota por última vez -- lo lee el
    // Expediente del alumnado (línea temporal de evidencias) para ubicar la
    // calificación en el tiempo; antes no se rellenaba nunca.
    if (idx >= 0) {
      next[idx] = { ...next[idx], valor, timestamp: Date.now() };
    } else {
      next.push({
        id_calificacion: `CAL-${selectedAlId}-${id_instrumento}-${id_indicador}`,
        id_alumno: selectedAlId,
        id_instrumento,
        id_indicador,
        valor,
        timestamp: Date.now(),
      });
    }
    updateCursoData("df_calificaciones", next);
  };

  const resultado = selectedAlId
    ? calcularNotasJEG(selectedAlId, filtrarPorGev(df_calificaciones, df_instr, selectedAl?.gev), df_indicadores, df_instr, df_ce, df_ra, config_redondeo)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-body text-foreground/90">
        <strong>{t('campos.instrumentos.modeloJegTitulo', {defaultValue: 'Modelo JEG.'})}</strong> {t('campos.instrumentos.modeloJegDesc', {defaultValue: 'Nivel Instrumento→Indicador→CE→RA→Módulo del autor real de PD+ (Javier Edo Gual) — es el motor de calificación real de la app (boletines, PDF y actas incluidos). En el uso normal no hace falta tocar nada aquí: al marcar una actividad sobre un CE en Instrumentos, el Indicador correspondiente se crea y se reparte el peso solo. Esta pantalla es para quien quiera ajustar ese reparto a mano (varios indicadores por CE, pesos distintos) o revisar qué se ha generado automáticamente.'})}
      </div>

      {/* Indicadores por CE */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <Target className="w-5 h-5 text-purple-400" /> {t('campos.instrumentos.indicadoresPorCeTitulo', {defaultValue: 'Indicadores por Criterio de Evaluación'})}
        </h2>
        {ceOptions.length === 0 ? (
          <p className="text-body text-muted">{t('campos.instrumentos.primeroAnadeCriterios', {defaultValue: 'Primero añade Criterios de evaluación en Currículo → Ponderación RA y CE.'})}</p>
        ) : (
          <div className="space-y-4">
            {ceOptions.map((ce: any) => {
              const inds = df_indicadores.filter((i: any) => i.id_ce === ce.id);
              const sumaPesos = inds.reduce((s: number, i: any) => s + (Number(i.peso) || 0), 0);
              const sumaOk = inds.length === 0 || sumaPesos === 100;
              return (
                <div key={ce.id} className="border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-info">{ce.id}</span>
                      {inds.length > 0 && (
                        <span className={`text-caption font-semibold px-2 py-0.5 rounded-full ${sumaOk ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                          {t('campos.instrumentos.sumaPesos', { pct: sumaPesos, defaultValue: 'Suma: {{pct}}%' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {inds.length > 1 && (
                        <button onClick={() => dividirPesosIndicadores(ce.id)} className="text-caption text-muted hover:text-foreground flex items-center gap-1 font-semibold">
                          {t('botones.instrumentos.dividirPorcentajes', { defaultValue: 'Dividir porcentajes' })}
                        </button>
                      )}
                      <button onClick={() => addIndicador(ce.id)} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
                        <Plus className="w-3.5 h-3.5" /> {t('botones.instrumentos.anadirIndicador', {defaultValue: 'Añadir indicador'})}
                      </button>
                    </div>
                  </div>
                  {inds.length === 0 ? (
                    <p className="text-caption text-muted italic">{t('campos.instrumentos.sinIndicadoresTodavia', {defaultValue: 'Sin indicadores todavía.'})}</p>
                  ) : (
                    <div className="space-y-2">
                      {inds.map((ind: any) => (
                        <div key={ind.id_indicador} className="flex items-center gap-2">
                          <span className="text-caption font-mono text-muted w-24 shrink-0 truncate">{ind.id_indicador}</span>
                          <input
                            type="text"
                            value={ind.descripcion || ""}
                            onChange={(e) => updateIndicador(ind.id_indicador, "descripcion", e.target.value)}
                            placeholder={t('placeholders.instrumentos.descripcionIndicador', {defaultValue: 'Descripción del indicador'})}
                            className="flex-1 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-accent focus:outline-none"
                          />
                          <div className="relative w-20 shrink-0">
                            <input
                              type="number"
                              step="1"
                              value={ind.peso ?? 0}
                              onChange={(e) => updateIndicador(ind.id_indicador, "peso", Math.round(Number(e.target.value)) || 0)}
                              title={t('tooltips.instrumentos.pesoRelativoCe', {defaultValue: 'Peso dentro del CE — entre todos los indicadores de este CE deben sumar 100%.'})}
                              className="w-full bg-foreground/15 border border-[var(--glass-border)] rounded pl-2 pr-4 py-1 text-foreground text-body text-center focus:border-accent focus:outline-none"
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted text-caption pointer-events-none">%</span>
                          </div>
                          <label className="flex items-center gap-1 text-caption text-muted shrink-0">
                            <input type="checkbox" checked={!!ind.is_basico} onChange={(e) => updateIndicador(ind.id_indicador, "is_basico", e.target.checked)} />
                            {t('checks.instrumentos.basico', {defaultValue: 'Básico'})}
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

      {/* Grupos de evaluación (GEv) */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-1">
          <Grid3x3 className="w-5 h-5 text-purple-400" /> {t('campos.instrumentos.gruposEvaluacionTitulo', {defaultValue: 'Grupos de evaluación (GEv)'})}
        </h2>
        <p className="text-caption text-muted mb-3">
          {t('campos.instrumentos.gruposEvaluacionDesc', {defaultValue: 'Subgrupos de alumnado (p.ej. pérdida de evaluación continua): un instrumento marcado con un GEv solo cuenta para el alumnado de ese mismo grupo. Asigna el GEv de cada alumno en Alumnado → Matrícula.'})}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {gruposEvaluacion.map((g) => (
            <span key={g.id} className="text-caption font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">{g.nombre}</span>
          ))}
          <input
            type="text"
            value={nuevoGev}
            onChange={(e) => setNuevoGev(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addGrupoEvaluacion(); }}
            placeholder={t('campos.instrumentos.nuevoGrupoPlaceholder', {defaultValue: 'Nuevo grupo...'})}
            className="w-32 bg-foreground/15 border border-[var(--glass-border)] rounded-full px-3 py-1 text-caption text-foreground focus:border-accent focus:outline-none"
          />
          <button onClick={addGrupoEvaluacion} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
            <Plus className="w-3.5 h-3.5" /> {t('botones.instrumentos.anadir', {defaultValue: 'Añadir'})}
          </button>
        </div>
      </div>

      {/* Instrumentos JEG */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <ClipboardList className="w-5 h-5 text-purple-400" /> {t('campos.instrumentos.instrumentosModeloJegTitulo', {defaultValue: 'Instrumentos (modelo JEG)'})}
          </h2>
          <button onClick={addInstrumento} className="text-caption text-accent hover:text-accent/80 flex items-center gap-1 font-semibold">
            <Plus className="w-3.5 h-3.5" /> {t('botones.instrumentos.anadirInstrumento', {defaultValue: 'Añadir instrumento'})}
          </button>
        </div>
        {df_instr.length === 0 ? (
          <p className="text-body text-muted">{t('campos.instrumentos.sinInstrumentosJegTodavia', {defaultValue: 'Sin instrumentos JEG todavía.'})}</p>
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
                    placeholder={t('placeholders.instrumentos.tituloInstrumento', {defaultValue: 'Título del instrumento'})}
                    className="flex-1 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-body focus:border-accent focus:outline-none"
                  />
                  <button onClick={() => removeInstrumento(instr.id_instrumento)} className="text-danger hover:text-danger p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                  <select value={instr.tipo} onChange={(e) => updateInstrumento(instr.id_instrumento, "tipo", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {TIPOS_INSTRUMENTO.map((tipo) => <option key={tipo.id} value={tipo.id}>{t(`checks.instrumentos.tipo_${tipo.id}`, {defaultValue: tipo.label})}</option>)}
                  </select>
                  <select value={instr.escala} onChange={(e) => updateInstrumento(instr.id_instrumento, "escala", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {ESCALAS.map((s) => <option key={s.id} value={s.id}>{t(`checks.instrumentos.escala_${s.id}`, {defaultValue: s.label})}</option>)}
                  </select>
                  <select value={instr.evaluacion} onChange={(e) => updateInstrumento(instr.id_instrumento, "evaluacion", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {PERIODOS_EVALUACION.map((p) => <option key={p.id} value={p.id}>{t(`checks.instrumentos.periodo_${p.id}`, {defaultValue: p.label})}</option>)}
                  </select>
                  <select value={instr.agente} onChange={(e) => updateInstrumento(instr.id_instrumento, "agente", e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {AGENTES.map((a) => <option key={a.id} value={a.id}>{t(`checks.instrumentos.agente_${a.id}`, {defaultValue: a.label})}</option>)}
                  </select>
                  <select value={instr.origen || "centro"} onChange={(e) => updateInstrumento(instr.id_instrumento, "origen", e.target.value)} title={t('tooltips.instrumentos.item12Origen', {defaultValue: 'Ítem 12: quién cumplimenta este instrumento'})} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {ORIGENES.map((o) => <option key={o.id} value={o.id}>{t(`checks.instrumentos.origen_${o.id}`, {defaultValue: o.label})}</option>)}
                  </select>
                  <select value={instr.procedimiento || "ordinario"} onChange={(e) => updateInstrumento(instr.id_instrumento, "procedimiento", e.target.value)} title={t('tooltips.instrumentos.item30Procedimiento', {defaultValue: 'Ítem 30: procedimiento JEG (ordinario/recuperación/extraordinaria)'})} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {PROCEDIMIENTOS.map((p) => <option key={p.id} value={p.id}>{t(`checks.instrumentos.procedimiento_${p.id}`, {defaultValue: p.label})}</option>)}
                  </select>
                  <select value={instr.gev || "general"} onChange={(e) => updateInstrumento(instr.id_instrumento, "gev", e.target.value)} title={t('tooltips.instrumentos.gevSoloCuentaGrupo', {defaultValue: 'Grupo de evaluación (GEv): solo cuenta para alumnado de este mismo grupo'})} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption focus:border-accent focus:outline-none">
                    {gruposEvaluacion.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-caption text-muted shrink-0">{t('campos.instrumentos.pesoGlobalLabel', {defaultValue: 'Peso global'})}</span>
                  <input
                    type="number" step="0.1"
                    value={instr.peso_global ?? 1}
                    onChange={(e) => updateInstrumento(instr.id_instrumento, "peso_global", Number(e.target.value) || 0)}
                    className="w-20 bg-foreground/15 border border-[var(--glass-border)] rounded px-2 py-1 text-foreground text-caption text-center focus:border-accent focus:outline-none"
                  />
                  <span className="text-caption text-muted shrink-0 ml-2">{t('campos.instrumentos.indicadoresVinculadosLabel', {defaultValue: 'Indicadores vinculados'})}</span>
                  <div className="flex-1">
                    <MultiSelectDropdown
                      options={indicadorOptions}
                      selectedIds={instr.indicadores_vinculados || []}
                      onChange={(ids) => updateInstrumento(instr.id_instrumento, "indicadores_vinculados", ids)}
                      placeholder={t('placeholders.instrumentos.seleccionaIndicadores', {defaultValue: 'Selecciona indicadores...'})}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matriz de cobertura CE x Instrumento (Ítem 42, punto 4): en el modelo
          JEG un instrumento no enlaza con un CE directamente sino a través de
          sus Indicadores — esta tabla resuelve esa cadena para responder de
          un vistazo "¿qué CE no tiene ningún instrumento que lo evalúe
          todavía?", igual que la matriz CE×instrumento que vimos en la app de
          referencia del Ítem 43, pero adaptada a nuestra cadena real
          Instrumento→Indicador→CE en vez de Instrumento→CE directo. */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-4">
          <Grid3x3 className="w-5 h-5 text-purple-400" /> {t('campos.instrumentos.matrizCoberturaTitulo', { defaultValue: 'Matriz de cobertura CE × Instrumento' })}
        </h2>
        {ceOptions.length === 0 || df_instr.length === 0 ? (
          <p className="text-body text-muted">{t('campos.instrumentos.matrizCoberturaSinDatos', { defaultValue: 'Añade Criterios de evaluación e Instrumentos para ver aquí qué CE quedan sin ningún instrumento que los evalúe.' })}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-caption border-collapse">
              <thead>
                <tr className="border-b border-[var(--glass-border)] text-muted">
                  <th className="p-2 sticky left-0 bg-foreground/5 z-10">{t('tablas.instrumentos.criterio', { defaultValue: 'CE' })}</th>
                  {df_instr.map((instr: any) => (
                    <th key={instr.id_instrumento} className="p-2 text-center font-mono" title={instr.titulo || instr.id_instrumento}>{instr.id_instrumento}</th>
                  ))}
                  <th className="p-2 text-center">{t('tablas.instrumentos.cobertura', { defaultValue: 'Cobertura' })}</th>
                </tr>
              </thead>
              <tbody>
                {ceOptions.map((ce: any) => {
                  const indsDeEsteCe = df_indicadores.filter((i: any) => i.id_ce === ce.id).map((i: any) => i.id_indicador);
                  const instrumentosQueCubren = df_instr.filter((instr: any) => (instr.indicadores_vinculados || []).some((id: string) => indsDeEsteCe.includes(id)));
                  const cubierto = instrumentosQueCubren.length > 0;
                  return (
                    <tr key={ce.id} className={`border-b border-white/5 ${!cubierto ? 'bg-danger/10' : ''}`}>
                      <td className="p-2 font-mono font-bold sticky left-0 bg-background/60 text-info">{ce.id}</td>
                      {df_instr.map((instr: any) => {
                        const marca = (instr.indicadores_vinculados || []).some((id: string) => indsDeEsteCe.includes(id));
                        return <td key={instr.id_instrumento} className="p-2 text-center">{marca ? <span className="text-success font-bold">✓</span> : ''}</td>;
                      })}
                      <td className="p-2 text-center">
                        {cubierto
                          ? <span className="text-success">{t('campos.instrumentos.nInstrumentos', { count: instrumentosQueCubren.length, defaultValue: '{{count}} instr.' })}</span>
                          : <span className="text-danger font-semibold">{t('campos.instrumentos.sinCobertura', { defaultValue: 'Sin cobertura' })}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calificaciones por alumno + resultado */}
      <div className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-purple-400" /> {t('campos.instrumentos.calificacionesPorIndicadorTitulo', {defaultValue: 'Calificaciones por indicador'})}
          </h2>
          <select value={selectedAlId} onChange={(e) => setSelectedAlId(e.target.value)} className="bg-foreground/15 border border-[var(--glass-border)] rounded px-3 py-1.5 text-foreground text-body focus:border-accent focus:outline-none">
            {activos.map((al: any) => <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre}</option>)}
          </select>
        </div>

        {df_instr.length === 0 ? (
          <p className="text-body text-muted">{t('campos.instrumentos.anadeInstrumentosVinculaPrimero', {defaultValue: 'Añade instrumentos y vincúlalos a indicadores primero.'})}</p>
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
                      <span className="font-mono text-accent">{instr.id_instrumento}</span> · {instr.titulo || t('campos.instrumentos.sinTitulo', {defaultValue: '(sin título)'})}
                      {instr.procedimiento && instr.procedimiento !== "ordinario" && (
                        <span className={`ml-1.5 text-caption px-1.5 rounded ${instr.procedimiento === "recuperacion" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {instr.procedimiento === "recuperacion" ? t('campos.instrumentos.recEvaluacion', {evaluacion: instr.evaluacion, defaultValue: 'Rec. ({{evaluacion}})'}) : t('campos.instrumentos.evfe', {defaultValue: 'EvFE'})}
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
                <Layers className="w-4 h-4 text-purple-400" /> {t('campos.instrumentos.evaluacionOrdinariaRecuperacion', {apellidos: activos.find((a: any) => a.ID === selectedAlId)?.Apellidos, defaultValue: 'Evaluación ordinaria + recuperación (R1-RF) — {{apellidos}}'})}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {Object.entries(resultado.notas_ra).map(([ra_id, nota]) => {
                  const esRecuperado = resultado.notas_ra_ordinario[ra_id] !== nota;
                  return (
                    <div key={ra_id} className="bg-background/30 border border-white/5 rounded-lg p-3 text-center">
                      <div className="text-caption text-muted mb-1 flex items-center justify-center gap-1">
                        {ra_id}
                        {esRecuperado && <span className="text-caption px-1.5 rounded bg-amber-500/20 text-amber-400" title={t('tooltips.instrumentos.sustituidaPorRecuperacion', {defaultValue: 'Sustituida por recuperación'})}>{t('campos.instrumentos.rec', {defaultValue: 'Rec.'})}</span>}
                      </div>
                      <div className="font-mono font-bold text-foreground">{nota !== null ? nota.toFixed(2) : t('campos.instrumentos.sinEvaluar', {defaultValue: 'Sin evaluar'})}</div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-caption text-muted mb-1">{t('campos.instrumentos.notaFinalMotorJeg', {defaultValue: 'Nota final (Motor JEG)'})}</div>
                <div className="text-heading font-black text-purple-300">{resultado.nota_final !== null ? resultado.nota_final.toFixed(1) : t('campos.instrumentos.sinEvaluar', {defaultValue: 'Sin evaluar'})}</div>
              </div>
            </div>

            <div>
              <h3 className="text-body font-bold text-foreground mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-400" /> {t('campos.instrumentos.hojaAparteEvfeTitulo', {defaultValue: 'Hoja aparte: evaluación final extraordinaria (EvFE)'})}
              </h3>
              <p className="text-caption text-muted mb-3">{t('campos.instrumentos.hojaAparteEvfeDesc', {defaultValue: 'Segunda convocatoria — nunca se mezcla con la nota ordinaria de arriba. Un RA sin intento en EvFE hereda el resultado de la fila anterior.'})}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {Object.entries(resultado.notas_ra_extraordinaria).map(([ra_id, nota]) => (
                  <div key={ra_id} className="bg-background/30 border border-white/5 rounded-lg p-3 text-center">
                    <div className="text-caption text-muted mb-1">{ra_id}</div>
                    <div className="font-mono font-bold text-foreground">{nota !== null ? nota.toFixed(2) : t('campos.instrumentos.sinEvaluar', {defaultValue: 'Sin evaluar'})}</div>
                  </div>
                ))}
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-center">
                <div className="text-caption text-muted mb-1">{t('campos.instrumentos.notaFinalExtraordinariaLabel', {defaultValue: 'Nota final extraordinaria (EvFE)'})}</div>
                <div className="text-heading font-black text-rose-300">{resultado.nota_final_extraordinaria !== null ? resultado.nota_final_extraordinaria.toFixed(1) : t('campos.instrumentos.sinEvaluar', {defaultValue: 'Sin evaluar'})}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
