"use client";
import React, { useMemo, useState } from "react";
import { History } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function HistorialCalificacionesTab() {
  const { cursoData } = useAppStore();
  const df_al = cursoData?.df_al || [];
  const historial = cursoData?.historial_calificaciones || [];

  const [filtroAlumno, setFiltroAlumno] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");

  const nombrePorId = useMemo(() => {
    const map: Record<string, string> = {};
    df_al.forEach((al: any) => {
      map[al.ID] = `${al.Apellidos || ""}, ${al.Nombre || ""}`.trim();
    });
    return map;
  }, [df_al]);

  const filtrado = useMemo(() => {
    return [...historial]
      .filter((h: any) => !filtroAlumno || h.alumno_id === filtroAlumno)
      .filter((h: any) => !filtroDesde || h.fecha >= filtroDesde)
      .filter((h: any) => !filtroHasta || h.fecha <= filtroHasta + "T23:59:59")
      .sort((a: any, b: any) => (a.fecha < b.fecha ? 1 : -1));
  }, [historial, filtroAlumno, filtroDesde, filtroHasta]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="p-6 border-t-4 border-t-indigo-500">
        <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground mb-5">
          <History className="w-[1.2em] h-[1.2em]" /> Histórico de cambios de calificación
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-caption font-semibold text-muted mb-1 block">Alumno</label>
            <select
              value={filtroAlumno}
              onChange={(e) => setFiltroAlumno(e.target.value)}
              className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground"
            >
              <option value="">Todos</option>
              {df_al.map((al: any) => (
                <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-caption font-semibold text-muted mb-1 block">Desde</label>
            <input
              type="date"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
              className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-caption font-semibold text-muted mb-1 block">Hasta</label>
            <input
              type="date"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
              className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground"
            />
          </div>
        </div>

        {filtrado.length === 0 ? (
          <p className="text-body text-muted text-center py-8">
            {historial.length === 0
              ? "Todavía no se ha registrado ningún cambio de calificación."
              : "Ningún cambio coincide con el filtro."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body border-collapse">
              <thead>
                <tr className="border-b border-[var(--glass-border)] text-muted">
                  <th className="p-3 font-semibold">Fecha</th>
                  <th className="p-3 font-semibold">Alumno</th>
                  <th className="p-3 font-semibold">Campo</th>
                  <th className="p-3 font-semibold text-center">Anterior</th>
                  <th className="p-3 font-semibold text-center">Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {filtrado.map((h: any, idx: number) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-foreground/5">
                    <td className="p-3 font-mono text-caption">{formatFecha(h.fecha)}</td>
                    <td className="p-3">{nombrePorId[h.alumno_id] || h.alumno_id}</td>
                    <td className="p-3 font-mono text-caption">{h.campo}</td>
                    <td className="p-3 text-center text-muted">{h.valor_anterior ?? "-"}</td>
                    <td className="p-3 text-center font-semibold text-foreground">{h.valor_nuevo ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
