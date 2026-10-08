"use client";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { useTranslation } from "react-i18next";
import { useResumenAsistencia } from "./useResumenAsistencia";

// Faltas acumuladas por trimestre de todo el grupo, con el semáforo de pérdida
// de evaluación continua (PdEvC). Es la tabla que tenía AttendanceAccumulated,
// recuperada en Sesiones -> Abandono (2026-10-08).
export function AcumuladoTrimestralTab() {
  const { t } = useTranslation();
  const { cursoData } = useAppStore();
  const { resumenAlumno, limiteFaltas, p_ev_pct } = useResumenAsistencia();
  const alumnos = (cursoData?.df_al || []).filter(isAlumnoActivo);

  return (
    <div className="glass-card p-4 space-y-3">
      <p className="text-caption text-muted">
        {t('campos.diario.acumuladoNota', { defaultValue: 'Límite de PdEvC: {{limite}} faltas ({{pct}}% de las horas del módulo).', limite: limiteFaltas, pct: p_ev_pct })}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body">
          <thead>
            <tr className="border-b border-[var(--glass-border)] text-muted text-caption ">
              <th className="p-2">{t('campos.diario.acumAlumno', { defaultValue: 'Alumno/a' })}</th>
              <th className="p-2 text-center">1T</th>
              <th className="p-2 text-center">2T</th>
              <th className="p-2 text-center">3T</th>
              <th className="p-2 text-center">{t('campos.diario.acumTotal', { defaultValue: 'Total' })}</th>
              <th className="p-2 text-center">{t('campos.diario.acumRetrasos', { defaultValue: 'Retrasos' })}</th>
              <th className="p-2">{t('campos.diario.acumEstadoPdevc', { defaultValue: 'Estado PdEvC' })}</th>
              <th className="p-2 min-w-[140px]">{t('campos.diario.acumProgreso', { defaultValue: 'Progreso' })}</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((al: any) => {
              const id = al.ID;
              const r = resumenAlumno(id);
              return (
                <tr key={id} className="border-b border-[var(--glass-border)]/50">
                  <td className="p-2 font-medium">{`${al.Apellidos || ""}, ${al.Nombre || ""}`.trim()}</td>
                  <td className="p-2 text-center">{r.t1}</td>
                  <td className="p-2 text-center">{r.t2}</td>
                  <td className="p-2 text-center">{r.t3}</td>
                  <td className="p-2 text-center font-semibold">{r.total}</td>
                  <td className="p-2 text-center">{r.retrasos}</td>
                  <td className="p-2"><span className={`px-2 py-0.5 rounded text-caption font-semibold ${r.estado.color}`}>{r.estado.text}</span></td>
                  <td className="p-2"><div className="h-2 rounded bg-foreground/10 overflow-hidden"><div className="h-full bg-warning" style={{ width: `${r.progreso}%` }} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
