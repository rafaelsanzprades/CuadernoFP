"use client";
import React from "react";
import { Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { resolveDescRa } from "@/services/catalogCache";
import { useDynamicPlanning } from "@/hooks/useDynamicPlanning";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotas, DEFAULT_CONFIG_REDONDEO } from "@/utils/calificaciones";
import { useTranslation } from "react-i18next";

export function ProgresoRaTab() {
  const { t } = useTranslation();
  const { activeModuleId, moduleData, cursoData } = useAppStore();
  const { planningLedger } = useDynamicPlanning();

  const df_al = cursoData?.df_al || [];
  const df_eval = cursoData?.df_eval || [];
  const df_ra = moduleData?.df_ra || [];
  const df_ce = moduleData?.df_ce || [];
  const df_act = moduleData?.df_act || [];
  const df_ud = moduleData?.df_ud || [];
  const df_pr = moduleData?.df_pr || [];
  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };
  const info_fechas = cursoData?.info_fechas || {};
  const planning_ledger = planningLedger || {};

  const df_evaluable = [...df_al].filter(isAlumnoActivo);

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
      tris: tris_found.size > 0 ? Array.from(tris_found) : ["1T", "2T", "3T"],
      uds: uds_found,
      prs: prs_found
    };
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="glass-card p-6 border-t-4 border-t-emerald-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
          <span><span className="inline-flex"><Target className="w-[1.2em] h-[1.2em] mr-1" /></span></span> Resumen de resultados de aprendizaje por trimestres
        </h2>
        <div className="space-y-5">
          {Object.keys(ra_info).map(ra_id => {
            const info = ra_info[ra_id];
            const r_data = ra_to_tri[ra_id];
            const tris = r_data.tris;

            const notasAlumnado: number[] = [];
            df_evaluable.forEach((al: any) => {
              const evalData = df_eval.find((e: any) => e.ID === al.ID);
              if (!evalData) return;
              // Motor A (Indicador->CE->RA->Módulo) — ver utils/calificaciones.ts. Sustituye al
              // cálculo por trimestre (Motor B, nunca alimentado: 1T_Nota/2T_Nota/3T_Nota no los
              // escribe nada del frontend, decisión C de la Fase 2).
              const nota_ra = calcularNotas(evalData, df_ra, df_ce, df_act, config_redondeo).notas_ra[ra_id];
              if (nota_ra !== null && nota_ra !== undefined) notasAlumnado.push(nota_ra);
            });

            const minN = notasAlumnado.length > 0 ? Math.min(...notasAlumnado) : 0;
            const maxN = notasAlumnado.length > 0 ? Math.max(...notasAlumnado) : 0;
            const avgN = notasAlumnado.length > 0 ? notasAlumnado.reduce((a, b) => a + b, 0) / notasAlumnado.length : 0;

            const getColor = (v: number) => v >= 9 ? '#1abc9c' : v >= 7 ? '#2ecc71' : v >= 5 ? '#f39c12' : '#e74c3c';

            return (
              <div key={ra_id} className="bg-foreground/5 rounded-lg border border-[var(--glass-border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{ra_id}</span>
                    <span className="text-caption text-muted">({info.pond.toFixed(1)}%)</span>
                    <span className="text-body text-muted truncate max-w-md">{info.desc}</span>
                  </div>
                  <div className="flex items-center gap-4 text-caption">
                    <span className="text-muted">Trimestres: {tris.join(', ')}</span>
                  </div>
                </div>

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
                    title={t('tooltips.evaluacion.minValor', {valor: minN.toFixed(1), defaultValue: `Mín: ${minN.toFixed(1)}`})}
                  />
                  {/* Mean marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 shadow-lg"
                    style={{
                      left: `calc(${(avgN / 10) * 100}% - 10px)`,
                      borderColor: getColor(avgN),
                      backgroundColor: getColor(avgN),
                    }}
                    title={t('tooltips.evaluacion.mediaValor', {valor: avgN.toFixed(1), defaultValue: `Media: ${avgN.toFixed(1)}`})}
                  />
                  {/* Max marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-success bg-success/10"
                    style={{ left: `calc(${(maxN / 10) * 100}% - 6px)` }}
                    title={t('tooltips.evaluacion.maxValor', {valor: maxN.toFixed(1), defaultValue: `Máx: ${maxN.toFixed(1)}`})}
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-2 text-caption">
                  <span className="text-muted/80">0</span>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-danger/10 border border-danger inline-block" />
                      <span className="text-danger font-mono">{minN.toFixed(1)}</span>
                      <span className="text-muted">Mín</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: getColor(avgN) }} />
                      <span className="font-bold font-mono" style={{ color: getColor(avgN) }}>{avgN.toFixed(1)}</span>
                      <span className="text-muted">Media</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-success/10 border border-success inline-block" />
                      <span className="text-success font-mono">{maxN.toFixed(1)}</span>
                      <span className="text-muted">Máx</span>
                    </span>
                  </div>
                  <span className="text-muted/80">10</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
