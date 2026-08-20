"use client";
import React, { useState } from "react";
import { AlertOctagon, Plus, FileDown, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const REFERENCIAS_FIJAS = [
  { id: "Nota_Final_FO", label: "Nota final (evaluación ordinaria)" },
  { id: "Nota_Final_FE", label: "Nota final (evaluación extraordinaria)" },
];

export function ReclamacionesTab() {
  const { moduleData, cursoData, updateCursoData } = useAppStore();
  const { t } = useTranslation();
  const df_al = cursoData?.df_al || [];
  const df_act = moduleData?.df_act || [];
  const df_reclamaciones = cursoData?.df_reclamaciones || [];
  const historial_calificaciones = cursoData?.historial_calificaciones || [];

  const [formOpen, setFormOpen] = useState(false);
  const [alumnoId, setAlumnoId] = useState("");
  const [referencia, setReferencia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [resolviendoId, setResolviendoId] = useState<string | null>(null);
  const [resolucionTexto, setResolucionTexto] = useState("");
  const [generando, setGenerando] = useState<string | null>(null);

  const nombrePorId: Record<string, string> = {};
  df_al.forEach((al: any) => { nombrePorId[al.ID] = `${al.Apellidos || ""}, ${al.Nombre || ""}`.trim(); });

  const referenciasDisponibles = [
    ...REFERENCIAS_FIJAS.map(r => ({ id: r.id, label: t(`checks.evaluacion.referencia_${r.id.toLowerCase()}`, {defaultValue: r.label}) })),
    ...df_act.filter((a: any) => a.id_act).map((a: any) => ({ id: a.id_act, label: `${a.id_act} — ${a.desc_act || ""}` })),
  ];

  const handleCrear = () => {
    if (!alumnoId || !referencia || !motivo.trim()) {
      toast.error(t('toasts.reclamaciones.faltanCampos', {defaultValue: "Rellena alumno, referencia y motivo."}));
      return;
    }
    const nueva = {
      id: `REC-${Date.now()}`,
      alumno_id: alumnoId,
      referencia,
      fecha_reclamacion: new Date().toISOString(),
      motivo: motivo.trim(),
      estado: "pendiente" as const,
    };
    updateCursoData("df_reclamaciones", [...df_reclamaciones, nueva]);
    setFormOpen(false);
    setAlumnoId(""); setReferencia(""); setMotivo("");
    toast.success(t('toasts.reclamaciones.registrada', {defaultValue: "Reclamación registrada."}));
  };

  const handleResolver = (id: string) => {
    if (!resolucionTexto.trim()) {
      toast.error(t('toasts.reclamaciones.faltaResolucion', {defaultValue: "Escribe cómo se ha resuelto."}));
      return;
    }
    const updated = df_reclamaciones.map((r: any) =>
      r.id === id ? { ...r, estado: "resuelta", resolucion: resolucionTexto.trim(), fecha_resolucion: new Date().toISOString() } : r
    );
    updateCursoData("df_reclamaciones", updated);
    setResolviendoId(null);
    setResolucionTexto("");
    toast.success(t('toasts.reclamaciones.resuelta', {defaultValue: "Reclamación marcada como resuelta."}));
  };

  const handleGenerarJustificante = async (reclamacion: any) => {
    setGenerando(reclamacion.id);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf?type=reclamacion_notas&al_id=${reclamacion.alumno_id}&item_id=${reclamacion.id}&file_format=docx`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curso_data: cursoData || {}, module_data: moduleData || {} }),
      });
      if (!response.ok) throw new Error("Error generando el justificante");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `Reclamacion_${reclamacion.alumno_id}_${reclamacion.id}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.reclamaciones.errorJustificante', {defaultValue: "Error al generar el justificante."}));
    } finally {
      setGenerando(null);
    }
  };

  const evidenciaPara = (alumno_id: string, referencia: string) =>
    historial_calificaciones.filter((h: any) => h.alumno_id === alumno_id && h.campo === referencia);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <Card className="p-6 border-t-4 border-t-danger">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-subheading font-bold flex items-center gap-2 text-foreground">
            <AlertOctagon className="w-[1.2em] h-[1.2em]" /> Reclamaciones de nota
          </h2>
          <Button onClick={() => setFormOpen(o => !o)} className="bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30 gap-2">
            <Plus className="w-4 h-4" /> {t('botones.reclamaciones.nuevaReclamacion', {defaultValue: 'Nueva reclamación'})}
          </Button>
        </div>

        {formOpen && (
          <div className="mb-6 p-4 rounded-xl border border-[var(--glass-border)] bg-foreground/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-caption font-semibold text-muted mb-1 block">Alumno</label>
                <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)} className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground">
                  <option value="">Selecciona...</option>
                  {df_al.map((al: any) => <option key={al.ID} value={al.ID}>{al.Apellidos}, {al.Nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-caption font-semibold text-muted mb-1 block">Nota reclamada</label>
                <select value={referencia} onChange={e => setReferencia(e.target.value)} className="w-full bg-background border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground">
                  <option value="">Selecciona...</option>
                  {referenciasDisponibles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-caption font-semibold text-muted mb-1 block">Motivo de la reclamación</label>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)} className="w-full h-24 bg-background border border-[var(--glass-border)] rounded-lg p-3 text-foreground" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCrear} className="bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30">
                {t('botones.reclamaciones.registrarReclamacion', {defaultValue: 'Registrar reclamación'})}
              </Button>
            </div>
          </div>
        )}

        {df_reclamaciones.length === 0 ? (
          <p className="text-body text-muted text-center py-8">Todavía no hay ninguna reclamación registrada.</p>
        ) : (
          <div className="space-y-3">
            {[...df_reclamaciones].sort((a: any, b: any) => (a.fecha_reclamacion < b.fecha_reclamacion ? 1 : -1)).map((r: any) => {
              const evidencia = evidenciaPara(r.alumno_id, r.referencia);
              return (
                <div key={r.id} className="p-4 rounded-xl border border-[var(--glass-border)] bg-foreground/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{nombrePorId[r.alumno_id] || r.alumno_id}</span>
                        <span className="text-caption text-muted font-mono">{r.referencia}</span>
                        <span className={`text-caption px-2 py-0.5 rounded-full font-semibold ${r.estado === "resuelta" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                          {r.estado === "resuelta" ? "Resuelta" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-caption text-muted mt-1">{new Date(r.fecha_reclamacion).toLocaleString("es-ES")}</p>
                      <p className="text-body text-foreground mt-2">{r.motivo}</p>
                      {evidencia.length > 0 && (
                        <p className="text-caption text-info mt-1">{evidencia.length} cambio(s) registrados en el histórico para esta nota.</p>
                      )}
                      {r.estado === "resuelta" && (
                        <div className="mt-2 p-2 rounded-lg bg-success/5 border border-success/20">
                          <p className="text-caption font-semibold text-success">Resolución ({r.fecha_resolucion && new Date(r.fecha_resolucion).toLocaleDateString("es-ES")})</p>
                          <p className="text-body text-foreground">{r.resolucion}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        onClick={() => handleGenerarJustificante(r)}
                        disabled={generando === r.id}
                        className="text-caption bg-info/10 hover:bg-info/20 text-info border border-info/30 gap-2"
                      >
                        <FileDown className="w-3.5 h-3.5" /> {generando === r.id ? t('common.generando', {defaultValue: 'Generando...'}) : t('botones.reclamaciones.justificante', {defaultValue: 'Justificante'})}
                      </Button>
                      {r.estado === "pendiente" && resolviendoId !== r.id && (
                        <Button
                          onClick={() => { setResolviendoId(r.id); setResolucionTexto(""); }}
                          className="text-caption bg-success/10 hover:bg-success/20 text-success border border-success/30 gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t('botones.reclamaciones.resolver', {defaultValue: 'Resolver'})}
                        </Button>
                      )}
                    </div>
                  </div>
                  {resolviendoId === r.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--glass-border)] space-y-2">
                      <textarea
                        value={resolucionTexto}
                        onChange={e => setResolucionTexto(e.target.value)}
                        placeholder={t('placeholders.reclamaciones.comoSeHaResuelto', {defaultValue: 'Cómo se ha resuelto la reclamación...'})}
                        className="w-full h-20 bg-background border border-[var(--glass-border)] rounded-lg p-3 text-foreground"
                      />
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => setResolviendoId(null)} className="text-caption bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)]">
                          {t('common.cancelar', {defaultValue: 'Cancelar'})}
                        </Button>
                        <Button onClick={() => handleResolver(r.id)} className="text-caption bg-success/20 hover:bg-success/30 text-success border border-success/30">
                          {t('botones.reclamaciones.confirmarResolucion', {defaultValue: 'Confirmar resolución'})}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
