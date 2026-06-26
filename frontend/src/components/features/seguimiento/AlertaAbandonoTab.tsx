"use client";
import { AlertTriangle, TrendingDown, Users, Calendar, Info, CheckCircle2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";

/**
 * TAB "Alerta abandono" en /seguimiento
 * Detecta alumnos en riesgo de abandono según Indicador 1.5 del Sistema Estatal:
 * "Porcentaje de alumnado matriculado que abandona en los dos meses posteriores al inicio"
 *
 * Criterios de alerta:
 * - <3 asistencias en las primeras 2 semanas
 * - Faltas reiteradas (>30% de faltas)
 * - Sin evaluación positiva en ningún RA
 */

interface AlumnoAlerta {
  id: string;
  nombre: string;
  riesgo: "alto" | "medio" | "bajo";
  motivo: string;
  faltas: number;
  totalSesiones: number;
  pctAsistencia: number;
}

export function AlertaAbandonoTab() {
  const { cursoData } = useAppStore();

  const alumnos = (cursoData as any)?.df_al || [];
  const asistencia = (cursoData as any)?.asistencia || {};
  const calificaciones = (cursoData as any)?.calificaciones || {};

  const alertas = useMemo<AlumnoAlerta[]>(() => {
    if (!alumnos.length) return [];

    return alumnos
      .filter((a: any) => a.Estado !== "Baja")
      .map((alumno: any) => {
        const id = alumno.id;
        const asistAlumno = asistencia[id] || {};
        const totalSesiones = Object.keys(asistAlumno).length;
        const faltas = Object.values(asistAlumno).filter((v: any) => v === false || v === "F" || v === "falta").length;
        const pctAsistencia = totalSesiones > 0 ? ((totalSesiones - faltas) / totalSesiones) * 100 : 100;

        const califAlumno = calificaciones[id] || {};
        const tieneAlgunaNotaPositiva = Object.values(califAlumno).some((v: any) => typeof v === "number" && v >= 5);

        let riesgo: "alto" | "medio" | "bajo" = "bajo";
        let motivo = "";

        if (totalSesiones <= 10 && faltas >= 7) {
          riesgo = "alto";
          motivo = `${faltas} faltas en las primeras ${totalSesiones} sesiones (posible abandono temprano)`;
        } else if (pctAsistencia < 70) {
          riesgo = "alto";
          motivo = `Solo ${pctAsistencia.toFixed(0)}% de asistencia (${faltas} faltas de ${totalSesiones})`;
        } else if (pctAsistencia < 85) {
          riesgo = "medio";
          motivo = `${pctAsistencia.toFixed(0)}% de asistencia - requiere seguimiento`;
        } else if (!tieneAlgunaNotaPositiva && totalSesiones > 20) {
          riesgo = "medio";
          motivo = "Sin evaluación positiva en ningún RA";
        }

        return {
          id,
          nombre: `${alumno.Apellido1 || ""} ${alumno.Apellido2 || ""}, ${alumno.Nombre || ""}`.trim(),
          riesgo,
          motivo,
          faltas,
          totalSesiones,
          pctAsistencia,
        };
      })
      .filter((a: AlumnoAlerta) => a.riesgo !== "bajo")
      .sort((a: AlumnoAlerta, b: AlumnoAlerta) => (a.riesgo === "alto" ? -1 : 1));
  }, [alumnos, asistencia, calificaciones]);

  const stats = useMemo(() => {
    const total = alumnos.filter((a: any) => a.Estado !== "Baja").length;
    const alto = alertas.filter((a) => a.riesgo === "alto").length;
    const medio = alertas.filter((a) => a.riesgo === "medio").length;
    return { total, alto, medio, tasa: total > 0 ? ((alto / total) * 100).toFixed(1) : "0" };
  }, [alumnos, alertas]);

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Alerta temprana de abandono - Indicador 1.5</p>
          <p className="text-sm text-muted mt-1">
            Detección de alumnos en riesgo de abandono según el Sistema Estatal de Indicadores.
            Criterio: &lt;3 asistencias en primeras 2 semanas, &gt;30% faltas, o sin evaluación positiva.
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted">Alumnado activo</p>
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-xs text-muted">Riesgo alto</p>
            <p className="text-lg font-bold text-red-500">{stats.alto}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-xs text-muted">Riesgo medio</p>
            <p className="text-lg font-bold text-amber-500">{stats.medio}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted">Tasa abandono estimada</p>
            <p className="text-lg font-bold text-accent">{stats.tasa}%</p>
          </div>
        </Card>
      </div>

      {/* Lista de alertas */}
      {alertas.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Sin alertas de abandono</p>
          <p className="text-xs text-muted mt-1">Todos los alumnos activos están dentro de los parámetros normales.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((alumno) => (
            <Card
              key={alumno.id}
              className={`p-4 border-l-4 ${
                alumno.riesgo === "alto"
                  ? "border-l-red-500 bg-red-500/5"
                  : "border-l-amber-500 bg-amber-500/5"
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {alumno.riesgo === "alto" ? (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-foreground">{alumno.nombre}</p>
                    <p className="text-xs text-muted">{alumno.motivo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {alumno.totalSesiones} sesiones
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> {alumno.pctAsistencia.toFixed(0)}% asistencia
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      alumno.riesgo === "alto"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-amber-500/20 text-amber-500"
                    }`}
                  >
                    {alumno.riesgo === "alto" ? "RIESGO ALTO" : "RIESGO MEDIO"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

