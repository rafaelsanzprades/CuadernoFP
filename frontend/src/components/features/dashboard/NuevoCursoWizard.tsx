"use client";
import React, { useState } from "react";
import { Rocket, Copy, Calendar, Users, FolderOpen, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { useAppStore } from "@/store/useAppStore";
import { fileManager } from "@/services/fileManager";
import { parseAlumnadoCSV } from "@/utils/alumnado";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface NuevoCursoWizardProps {
  onClose: () => void;
}

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const FECHA_CAMPOS: { field: string; label: string }[] = [
  { field: "ini_curso", label: "Inicio de curso" },
  { field: "ini_1t", label: "Inicio 1T" },
  { field: "fin_1t", label: "Fin 1T" },
  { field: "ini_2t", label: "Inicio 2T" },
  { field: "fin_2t", label: "Fin 2T" },
  { field: "ini_3t", label: "Inicio 3T" },
  { field: "fin_3t", label: "Fin 3T" },
  { field: "fin_curso", label: "Fin de curso" },
];

// Desplaza una fecha ISO (YYYY-MM-DD) un número de años — sirve de punto de
// partida razonable para el curso nuevo (mismo calendario, año siguiente),
// editable después por el profesor.
function shiftYear(iso: string | undefined, years: number): string {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso + "T12:00:00");
  if (isNaN(d.getTime())) return "";
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function NuevoCursoWizard({ onClose }: NuevoCursoWizardProps) {
  const { cursoData, moduleData, activeModuleId } = useAppStore();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [cursoAcademico, setCursoAcademico] = useState("");
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [clonarProgramacion, setClonarProgramacion] = useState(false);

  const [fechas, setFechas] = useState<Record<string, string>>(() => {
    const prev = (cursoData?.info_fechas || {}) as Record<string, any>;
    const out: Record<string, string> = {};
    FECHA_CAMPOS.forEach(({ field }) => {
      out[field] = shiftYear(typeof prev[field] === "string" ? prev[field] : "", 1);
    });
    return out;
  });
  const [horario, setHorario] = useState<Record<string, number>>(() => {
    const prev = (cursoData?.horario || {}) as Record<string, any>;
    const out: Record<string, number> = {};
    DIAS.forEach(d => { out[d] = Number(prev[d]) || 0; });
    return out;
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewCount, setCsvPreviewCount] = useState<number | null>(null);

  const canContinueStep1 = cursoAcademico.trim() !== "" && nombreGrupo.trim() !== "";

  const handleCsvSelected = async (file: File | null) => {
    setCsvFile(file);
    setCsvPreviewCount(null);
    if (!file) return;
    const text = await file.text();
    const { importedCount, error } = parseAlumnadoCSV(text, []);
    if (error) {
      toast.error(error);
      setCsvFile(null);
    } else {
      setCsvPreviewCount(importedCount);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (clonarProgramacion) {
        const ok = await fileManager.cloneProgramacion(cursoAcademico.replace(/\s+/g, ""));
        if (!ok) {
          toast.error(t('toasts.nuevoCurso.errorClonar', {defaultValue: "No se pudo clonar la programación."}));
          setLoading(false);
          return;
        }
      }

      const cursoOk = await fileManager.createNewCurso(nombreGrupo, cursoAcademico);
      if (!cursoOk) {
        toast.error(t('toasts.nuevoCurso.errorCrearCurso', {defaultValue: "No se pudo crear el curso nuevo."}));
        setLoading(false);
        return;
      }

      const store = useAppStore.getState();
      const nuevoCursoData: any = { ...(store.cursoData || {}) };
      nuevoCursoData.info_fechas = fechas;
      nuevoCursoData.horario = horario;

      if (csvFile) {
        const text = await csvFile.text();
        const { alumnos, error } = parseAlumnadoCSV(text, []);
        if (!error) nuevoCursoData.df_al = alumnos;
      }

      store.setCursoData(nuevoCursoData);

      toast.success(t('toasts.nuevoCurso.creado', {nombreGrupo, cursoAcademico, defaultValue: 'Curso "{{nombreGrupo}}" ({{cursoAcademico}}) creado a partir de la programación.'}));
      onClose();
    } catch (e) {
      console.error("Error en el asistente de nuevo curso", e);
      toast.error(t('toasts.nuevoCurso.errorGenerico', {defaultValue: "Ha ocurrido un error creando el nuevo curso."}));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <MotionWrapper className="w-full max-w-2xl">
        <Card className="p-8 shadow-2xl border-t-4 border-t-info bg-card/95 backdrop-blur-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
            title={t('common.cerrar', {defaultValue: 'Cerrar'})}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8">
            <h2 className="text-heading font-extrabold text-foreground mb-2 flex items-center gap-3">
              <Rocket className="w-[1.2em] h-[1.2em] text-info" /> {t('campos.dashboard.nuevoCursoTitulo', {defaultValue: 'Nuevo curso a partir de esta programación'})}
            </h2>
            <p className="text-body text-muted">
              {t('campos.dashboard.reutilizarPrefijo', {defaultValue: 'Reutiliza'})} <span className="font-semibold text-foreground">{activeModuleId || t('campos.dashboard.estaProgramacionFallback', {defaultValue: 'esta programación'})}</span> {t('campos.dashboard.reutilizarSufijo', {defaultValue: 'para un curso académico nuevo, sin partir de cero.'})}
            </p>
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-info" : "bg-foreground/10"}`} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-body font-bold text-foreground mb-2">{t('campos.dashboard.cursoAcademico', {defaultValue: 'Curso académico'})}</label>
                <Input value={cursoAcademico} onChange={(e) => setCursoAcademico(e.target.value)} placeholder={t('placeholders.archivos.ejCursoAcademico2', {defaultValue: 'Ej: 2026-27'})} />
              </div>
              <div>
                <label className="block text-body font-bold text-foreground mb-2">{t('campos.dashboard.nombreGrupo', {defaultValue: 'Nombre del grupo'})}</label>
                <Input value={nombreGrupo} onChange={(e) => setNombreGrupo(e.target.value)} placeholder={t('placeholders.dashboard.ejNombreGrupo', {defaultValue: 'Ej: 1A-GM 0237-ICTVE'})} />
              </div>
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--glass-border)] bg-foreground/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clonarProgramacion}
                  onChange={(e) => setClonarProgramacion(e.target.checked)}
                  className="mt-1 accent-info"
                />
                <span>
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <Copy className="w-4 h-4" /> {t('campos.dashboard.clonarProgramacion', {defaultValue: 'Clonar esta programación'})}
                  </span>
                  <span className="block text-caption text-muted mt-1">
                    {t('campos.dashboard.clonarProgramacionAyuda', {defaultValue: 'Crea una copia independiente para editarla sin afectar al original. Si lo dejas desmarcado, el curso nuevo comparte el mismo fichero de programación.'})}
                  </span>
                </span>
              </label>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(2)} disabled={!canContinueStep1} className="bg-info/20 hover:bg-info/30 text-info border border-info/30">
                  {t('common.siguiente', {defaultValue: 'Siguiente'})} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-subheading font-bold text-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t('campos.dashboard.fechasCurso', {defaultValue: 'Fechas del curso'})}
                </h3>
                <p className="text-caption text-muted mb-3">
                  {t('campos.dashboard.fechasCursoAyuda', {defaultValue: 'Precargadas un año después del curso actual — ajústalas si no coinciden.'})}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {FECHA_CAMPOS.map(({ field, label }) => (
                    <div key={field}>
                      <label className="text-caption font-semibold text-foreground mb-1 block">{t(`checks.dashboard.fechaCampo_${field}`, {defaultValue: label})}</label>
                      <DatePicker value={fechas[field]} onChange={(v) => setFechas(f => ({ ...f, [field]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-subheading font-bold text-foreground mb-3">{t('campos.dashboard.horarioSemanal', {defaultValue: 'Horario semanal'})}</h3>
                <div className="grid grid-cols-5 gap-3">
                  {DIAS.map(day => (
                    <div key={day}>
                      <label className="text-caption text-foreground mb-1 block text-center font-bold">{day}</label>
                      <input
                        type="number" min={0} max={8}
                        value={horario[day]}
                        onChange={(e) => setHorario(h => ({ ...h, [day]: Number(e.target.value) || 0 }))}
                        className="w-full text-center bg-background border border-[var(--glass-border)] rounded-lg px-2 py-2 text-foreground focus:border-info focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button onClick={() => setStep(1)} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)]">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.atras', {defaultValue: 'Atrás'})}
                </Button>
                <Button onClick={() => setStep(3)} className="bg-info/20 hover:bg-info/30 text-info border border-info/30">
                  {t('common.siguiente', {defaultValue: 'Siguiente'})} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-subheading font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> {t('campos.dashboard.alumnadoOpcional', {defaultValue: 'Alumnado (opcional)'})}
                </h3>
                <p className="text-caption text-muted mb-3">
                  {t('campos.dashboard.alumnadoCsvAyuda', {defaultValue: 'Importa un CSV con columnas Nombre/Apellidos (y opcionalmente correo) para arrancar la matrícula ya poblada, o sáltalo y añádelo después en Alumnado.'})}
                </p>
                <label className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--glass-border)] hover:border-info/50 cursor-pointer transition-colors">
                  <FolderOpen className="w-5 h-5 text-info" />
                  <span className="text-body text-foreground">
                    {csvFile ? csvFile.name : t('botones.dashboard.seleccionarCsvAlumnado', {defaultValue: 'Seleccionar CSV de alumnado'})}
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleCsvSelected(e.target.files?.[0] || null)}
                  />
                </label>
                {csvPreviewCount !== null && (
                  <p className="text-caption text-success mt-2">{t('campos.dashboard.estudiantesDetectados', {count: csvPreviewCount, defaultValue: `${csvPreviewCount} estudiantes detectados.`})}</p>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <Button onClick={() => setStep(2)} className="bg-foreground/5 hover:bg-foreground/10 text-muted border border-[var(--glass-border)]" disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.atras', {defaultValue: 'Atrás'})}
                </Button>
                <Button onClick={handleFinish} disabled={loading} className="bg-info/20 hover:bg-info/30 text-info border border-info/30">
                  <Rocket className="w-4 h-4 mr-2" /> {loading ? t('botones.dashboard.creandoCurso', {defaultValue: 'Creando curso...'}) : t('botones.dashboard.crearCurso', {defaultValue: 'Crear curso'})}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </MotionWrapper>
    </div>
  );
}
