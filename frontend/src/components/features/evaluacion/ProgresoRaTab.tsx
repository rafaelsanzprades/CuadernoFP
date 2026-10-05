"use client";
import React, { useMemo } from "react";
import { CheckCircle2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { resolveDescRa } from "@/services/catalogCache";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotasJEG, DEFAULT_CONFIG_REDONDEO, filtrarPorGev } from "@/utils/calificaciones";
import { getSimulatedToday } from "@/utils/planningGenerator";
import { useTranslation } from "react-i18next";

export function ProgresoRaTab() {
  const { t } = useTranslation();
  const { activeModuleId, moduleData, cursoData, dataSource } = useAppStore();
  const { planningLedger, planningLedgerDmy } = useDynamicPlanning();

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_ra = moduleData?.df_ra || [];
  const df_ce = moduleData?.df_ce || [];
  const df_act = moduleData?.df_act || [];
  const df_ud = moduleData?.df_ud || [];
  const df_pr = moduleData?.df_pr || [];
  // Motor JEG, modo automático (Ítem 42 punto 6) -- ver DetalleAlumnadoTab.tsx.
  const df_instr = moduleData?.df_instr || [];
  const df_indicadores = moduleData?.df_indicadores || [];
  const df_calificaciones = cursoData?.df_calificaciones || [];
  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };
  const info_fechas = cursoData?.info_fechas || {};
  // dd/mm/aaaa para la proyección por trimestres; el estado de las UD usa la ISO.
  const planning_ledger = planningLedgerDmy || {};

  const df_evaluable = [...df_al].filter(isAlumnoActivo);

  // Estado de cada UD según la planificación: Completada / En curso /
  // Pendiente respecto a "hoy" (en DEMO, la fecha simulada del 2 de mayo, como
  // en el resto de la app). Antes vivía en TabRelacionRaUd (Progreso de RA
  // según las UD), fundido aquí el 2026-10-05.
  const udStatus = useMemo(() => {
    const rangos: Record<string, { start: string; end: string }> = {};
    Object.entries(planningLedger || {}).forEach(([iso, uds]) => {
      (uds as string[]).forEach((ud) => {
        if (!rangos[ud]) rangos[ud] = { start: iso, end: iso };
        if (iso < rangos[ud].start) rangos[ud].start = iso;
        if (iso > rangos[ud].end) rangos[ud].end = iso;
      });
    });
    const hoy = dataSource === "demo" && cursoData ? getSimulatedToday(cursoData) : new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    const hoyIso = `${hoy.getFullYear()}-${p(hoy.getMonth() + 1)}-${p(hoy.getDate())}`;
    const out: Record<string, "Completada" | "En curso" | "Pendiente"> = {};
    df_ud.forEach((ud: any) => {
      const r = rangos[ud.id_ud];
      out[ud.id_ud] = !r ? "Pendiente" : hoyIso > r.end ? "Completada" : hoyIso >= r.start ? "En curso" : "Pendiente";
    });
    return out;
  }, [planningLedger, df_ud, dataSource, cursoData]);
  const ESTADO_UD = {
    Completada: { clase: "text-success bg-success/10 border-success/20", icono: <CheckCircle2 className="w-3 h-3" /> },
    "En curso": { clase: "text-info bg-info/10 border-info/20", icono: <Clock className="w-3 h-3" /> },
    Pendiente: { clase: "text-muted bg-foreground/5 border-foreground/10", icono: <CalendarIcon className="w-3 h-3" /> },
  } as const;
  const horasUd = (ud: any) => Number(ud.duracion || ud.horas_ud || ud.Horas || 0);


  const uds_por_tri: Record<string, Set<string>> = { "1T": new Set(), "2T": new Set(), "3T": new Set() };

  const mapTrimestre = (ini_key: string, fin_key: string, t_key: string) => {
    const ini_str = info_fechas[ini_key];
    const fin_str = info_fechas[fin_key];
    if (!ini_str || !fin_str) return;

    const ini = new Date(ini_str);
    const fin = new Date(fin_str);
    let curr = new Date(ini);

    while (curr <= fin) {
      const dateStr = curr.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const uds = planning_ledger[dateStr] || [];
      uds.forEach((ud: string) => uds_por_tri[t_key].add(ud));
      curr.setDate(curr.getDate() + 1);
    }
  };

  mapTrimestre("ini_1t", "fin_1t", "1T");
  mapTrimestre("ini_2t", "fin_2t", "2T");
  mapTrimestre("ini_3t", "fin_3t", "3T");

  const ra_to_tri: Record<string, any> = {};
  const ra_info: Record<string, any> = {};

  df_ra.forEach((ra: any) => {
    const ra_id = String(ra.id_ra);
    ra_info[ra_id] = {
      pond: Number(ra.peso_ra) || 0,
      desc: resolveDescRa(activeModuleId, ra)
    };

    const tris_found = new Set<string>();
    const uds_found: string[] = [];
    const prs_found: string[] = [];

    df_ud.forEach((ud: any) => {
      if (Number(ud[ra_id]) > 0) {
        const uid = String(ud.id_ud);
        uds_found.push(uid);
        ["1T", "2T", "3T"].forEach(t => {
          if (uds_por_tri[t].has(uid)) tris_found.add(t);
        });
      }
    });

    df_pr.forEach((pr: any) => {
      if (Number(pr[ra_id]) > 0) {
        prs_found.push(String(pr.ID));
      }
    });

    ra_to_tri[ra_id] = {
      tris: Array.from(tris_found).sort(), // vacío = UD sin planificar
      uds: uds_found,
      prs: prs_found
    };
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-emerald-500">
        <div className="flex flex-wrap items-center justify-end gap-4 text-caption mb-4">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> {t('campos.curriculo.leyendaCompletado', {defaultValue: 'Completado'})}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-info" /> {t('campos.curriculo.leyendaEnCurso', {defaultValue: 'En curso'})}</span>
          <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-muted" /> {t('campos.curriculo.leyendaPendiente', {defaultValue: 'Pendiente'})}</span>
        </div>
        <div className="space-y-5">
          {Object.keys(ra_info).map(ra_id => {
            const info = ra_info[ra_id];
            const r_data = ra_to_tri[ra_id];
            const tris = r_data.tris;

            const notasAlumnado: number[] = [];
            df_evaluable.forEach((al: any) => {
              // Motor JEG, modo automático (Ítem 42 punto 6, ver utils/calificaciones.ts).
              const nota_ra = calcularNotasJEG(al.ID, filtrarPorGev(df_calificaciones, df_instr, al.gev), df_indicadores, df_instr, df_ce, df_ra, config_redondeo).notas_ra[ra_id];
              if (nota_ra !== null && nota_ra !== undefined) notasAlumnado.push(nota_ra);
            });

            const minN = notasAlumnado.length > 0 ? Math.min(...notasAlumnado) : 0;
            const maxN = notasAlumnado.length > 0 ? Math.max(...notasAlumnado) : 0;
            const avgN = notasAlumnado.length > 0 ? notasAlumnado.reduce((a, b) => a + b, 0) / notasAlumnado.length : 0;

            const getColor = (v: number) => v >= 9 ? '#1abc9c' : v >= 7 ? '#2ecc71' : v >= 5 ? '#f39c12' : '#e74c3c';
            // Grado de consecución del RA: se muestra siempre en % sin decimales (la
            // nota interna 0-10 se conserva con toda su precisión para el cálculo,
            // esto solo redondea la etiqueta que ve el profesor).
            const pct = (v: number) => Math.round(v * 10);

            const uds = df_ud.filter((ud: any) => Number(ud[ra_id]) > 0);
            const estados = uds.map((ud: any) => udStatus[ud.id_ud] || "Pendiente");
            const sinDocencia = uds.length > 0 && estados.every((e: string) => e === "Pendiente");
            const totalHoras = uds.reduce((sum: number, ud: any) => sum + horasUd(ud), 0);
            const horasHechas = uds.filter((ud: any) => udStatus[ud.id_ud] === "Completada").reduce((sum: number, ud: any) => sum + horasUd(ud), 0);
            const totalPct = uds.reduce((sum: number, ud: any) => sum + Number(ud[ra_id] || 0), 0);
            const pctHecho = uds.filter((ud: any) => udStatus[ud.id_ud] === "Completada").reduce((sum: number, ud: any) => sum + Number(ud[ra_id] || 0), 0);
            const colorRa = uds.length === 0 ? "border-[var(--glass-border)]" : estados.every((e: string) => e === "Completada") ? "border-success/30" : estados.some((e: string) => e !== "Pendiente") ? "border-info/30" : "border-[var(--glass-border)]";

            return (
              <div key={ra_id} className={`bg-foreground/5 rounded-lg border p-4 ${colorRa}`}>
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-foreground">{ra_id}</span>
                    <span className="text-caption text-muted">({Math.round(info.pond)}%)</span>
                    <span className="text-body text-muted truncate max-w-md">{info.desc}</span>
                  </div>
                  <div className="flex items-center gap-3 text-caption shrink-0">
                    {sinDocencia && <span className="px-2 py-0.5 rounded-full border border-foreground/10 bg-foreground/5 text-muted">{t('campos.curriculo.sinDocenciaTodavia', {defaultValue: 'Sin docencia todavía'})}</span>}
                    <span className="text-muted">Trimestres: {tris.length > 0 ? tris.join(', ') : t('campos.curriculo.sinPlanificar', {defaultValue: 'sin planificar'})}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className={`lg:col-span-3 ${sinDocencia ? "opacity-40" : ""}`}>
                {/* Bar visualization 0-10 */}
                <div className="relative h-8 bg-foreground/20 rounded-full border border-[var(--glass-border)] overflow-hidden">
                  {(() => {
                    const interpolateColor = (val: number) => {
                      const pct = Math.max(0, Math.min(1, val / 10));
                      const stops = [
                        { p: 0, r: 231, g: 76, b: 60 },
                        { p: 0.25, r: 230, g: 126, b: 34 },
                        { p: 0.5, r: 241, g: 196, b: 15 },
                        { p: 0.75, r: 127, g: 190, b: 58 },
                        { p: 1, r: 39, g: 174, b: 96 },
                      ];
                      let i = 0;
                      for (i = 0; i < stops.length - 1; i++) { if (pct <= stops[i + 1].p) break; }
                      const s1 = stops[i], s2 = stops[Math.min(i + 1, stops.length - 1)];
                      const t = s2.p > s1.p ? (pct - s1.p) / (s2.p - s1.p) : 0;
                      const r = Math.round(s1.r + (s2.r - s1.r) * t);
                      const g = Math.round(s1.g + (s2.g - s1.g) * t);
                      const b = Math.round(s1.b + (s2.b - s1.b) * t);
                      return `rgb(${r},${g},${b})`;
                    };
                    return (
                      <div
                        className="absolute top-1 bottom-1 rounded-full"
                        style={{
                          left: `${(minN / 10) * 100}%`,
                          width: `${Math.max(((maxN - minN) / 10) * 100, 0.5)}%`,
                          background: `linear-gradient(to right, ${interpolateColor(minN)}, ${interpolateColor((minN + maxN) / 2)}, ${interpolateColor(maxN)})`,
                          opacity: 0.85,
                        }}
                      />
                    );
                  })()}
                  <div className="absolute top-0 bottom-0 w-px bg-warning/10" style={{ left: '50%' }} />

                  {/* Min marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-danger bg-danger/10"
                    style={{ left: `calc(${(minN / 10) * 100}% - 6px)` }}
                    title={t('tooltips.evaluacion.minValor', {valor: `${pct(minN)}%`, defaultValue: `Mín: ${pct(minN)}%`})}
                  />
                  {/* Mean marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow-lg"
                    style={{
                      left: `calc(${(avgN / 10) * 100}% - 10px)`,
                      borderColor: getColor(avgN),
                      backgroundColor: getColor(avgN),
                    }}
                    title={t('tooltips.evaluacion.mediaValor', {valor: `${pct(avgN)}%`, defaultValue: `Media: ${pct(avgN)}%`})}
                  />
                  {/* Max marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-success bg-success/10"
                    style={{ left: `calc(${(maxN / 10) * 100}% - 6px)` }}
                    title={t('tooltips.evaluacion.maxValor', {valor: `${pct(maxN)}%`, defaultValue: `Máx: ${pct(maxN)}%`})}
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-2 text-caption">
                  <span className="text-muted/80">0%</span>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-danger/10 border border-danger inline-block" />
                      <span className="text-danger font-mono">{pct(minN)}%</span>
                      <span className="text-muted">{t('campos.evaluacion.minAbrev', {defaultValue: 'Mín'})}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: getColor(avgN) }} />
                      <span className="font-bold font-mono" style={{ color: getColor(avgN) }}>{pct(avgN)}%</span>
                      <span className="text-muted">{t('campos.analisis.mediaLegend', {defaultValue: 'Media'})}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-success/10 border border-success inline-block" />
                      <span className="text-success font-mono">{pct(maxN)}%</span>
                      <span className="text-muted">{t('campos.evaluacion.maxAbrev', {defaultValue: 'Máx'})}</span>
                    </span>
                  </div>
                  <span className="text-muted/80">100%</span>
                </div>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  {uds.length > 0 ? (
                    <>
                      <div>
                        <div className="flex justify-between text-caption text-muted mb-1 font-semibold">
                          <span>{t('campos.curriculo.avanceRaLabel', {defaultValue: 'Avance RA'})}</span>
                          <span>{pctHecho}% / {totalPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, (pctHecho / (totalPct || 1)) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-caption text-muted mb-1 font-semibold">
                          <span>{t('campos.curriculo.horasLectivasLabel', {defaultValue: 'Horas lectivas'})}</span>
                          <span>{horasHechas}h / {totalHoras}h</span>
                        </div>
                        <div className="h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (horasHechas / (totalHoras || 1)) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {uds.map((ud: any) => {
                          const st = ESTADO_UD[udStatus[ud.id_ud] || "Pendiente"];
                          return (
                            <span key={ud.id_ud} className={`text-caption inline-flex items-center gap-1.5 border rounded-md px-2 py-1 ${st.clase}`}>
                              {st.icono}
                              <span className="font-semibold">{ud.id_ud}</span>
                              <span className="opacity-70">({horasUd(ud)}h)</span>
                              <span className="font-bold">{ud[ra_id]}%</span>
                            </span>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-caption text-muted italic">{t('campos.curriculo.sinUdsAsignadas', {defaultValue: 'Sin UDs asignadas'})}</div>
                  )}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
