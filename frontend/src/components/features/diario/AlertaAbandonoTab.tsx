"use client";
import { AlertTriangle, TrendingDown, Users, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { isAlumnoActivo } from "@/utils/alumnado";
import { calcularNotasJEG, DEFAULT_CONFIG_REDONDEO, filtrarPorGev } from "@/utils/calificaciones";

/**
 * TAB "Alerta abandono" en /diario
 * Detecta alumnos en riesgo de abandono según Indicador 1.5 del Sistema Estatal:
 * "Porcentaje de alumnado matriculado que abandona en los dos meses posteriores al inicio"
 *
 * Criterios de alerta:
 * - <3 asistencias en las primeras 2 semanas
 * - Faltas reiteradas (>30% de faltas)
 * - Sin evaluación positiva en ningún RA
 *
 * Arreglado 2026-09-11: leía `cursoData.asistencia`/`cursoData.calificaciones`
 * -- campos que no existen en el esquema real (siempre `{}`, así que nunca
 * salía ninguna alerta) -- y `alumno.id`/`alumno.Apellido1`/`alumno.Apellido2`,
 * que tampoco existen en AlumnadoSchema (`ID`, `Apellidos`). Ahora usa las
 * mismas fuentes reales que el resto de la app: asistencia de la API
 * (`GET /api/attendance/{activeModuleId}`, igual que AttendanceAccumulated.tsx)
 * y Motor JEG (`calcularNotasJEG`, filtrado por GEv) para las notas.
 */

type AttendanceStatus = "presente" | "falta" | "retraso" | null;
interface AttendanceRecord { student_id: string; date_str: string; status: AttendanceStatus }

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
  const { cursoData, moduleData, activeModuleId } = useAppStore();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!activeModuleId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/${activeModuleId}`)
      .then((res) => res.json())
      .then((data) => setAttendanceData(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching attendance", err));
  }, [activeModuleId]);

  const alumnos = cursoData?.df_al || [];
  const df_ra = moduleData?.df_ra || [];
  const df_ce = moduleData?.df_ce || [];
  const df_instr = (moduleData as any)?.df_instr || [];
  const df_indicadores = (moduleData as any)?.df_indicadores || [];
  const df_calificaciones = (cursoData as any)?.df_calificaciones || [];
  const config_redondeo = { ...DEFAULT_CONFIG_REDONDEO, ...(moduleData?.config_redondeo || {}) };

  const alertas = useMemo<AlumnoAlerta[]>(() => {
    if (!alumnos.length) return [];

    return alumnos
      .filter(isAlumnoActivo)
      .map((alumno: any) => {
        const id = alumno.ID;
        const registros = attendanceData.filter((r) => r.student_id === id);
        const totalSesiones = registros.length;
        const faltas = registros.filter((r) => r.status === "falta").length;
        const pctAsistencia = totalSesiones > 0 ? ((totalSesiones - faltas) / totalSesiones) * 100 : 100;

        const notasCalc = calcularNotasJEG(id, filtrarPorGev(df_calificaciones, df_instr, alumno.gev), df_indicadores, df_instr, df_ce, df_ra, config_redondeo);
        const tieneAlgunaNotaPositiva = Object.values(notasCalc.notas_ra).some((v) => typeof v === "number" && v >= config_redondeo.nota_aprobado);

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
          nombre: `${alumno.Apellidos || ""}, ${alumno.Nombre || ""}`.trim(),
          riesgo,
          motivo,
          faltas,
          totalSesiones,
          pctAsistencia,
        };
      })
      .filter((a: AlumnoAlerta) => a.riesgo !== "bajo")
      .sort((a: AlumnoAlerta, b: AlumnoAlerta) => (a.riesgo === "alto" ? -1 : 1));
  }, [alumnos, attendanceData, df_calificaciones, df_instr, df_indicadores, df_ce, df_ra, config_redondeo]);

  const stats = useMemo(() => {
    const total = alumnos.filter(isAlumnoActivo).length;
    const alto = alertas.filter((a) => a.riesgo === "alto").length;
    const medio = alertas.filter((a) => a.riesgo === "medio").length;
    return { total, alto, medio, tasa: total > 0 ? ((alto / total) * 100).toFixed(1) : "0" };
  }, [alumnos, alertas]);

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <Users className="w-5 h-5 text-accent" />
          <div>
            <p className="text-caption text-muted">Alumnado activo</p>
            <p className="text-subheading font-bold text-foreground">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-caption text-muted">Riesgo alto</p>
            <p className="text-subheading font-bold text-red-500">{stats.alto}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <p className="text-caption text-muted">Riesgo medio</p>
            <p className="text-subheading font-bold text-amber-500">{stats.medio}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-accent" />
          <div>
            <p className="text-caption text-muted">Tasa abandono estimada</p>
            <p className="text-subheading font-bold text-accent">{stats.tasa}%</p>
          </div>
        </Card>
      </div>

      {/* Lista de alertas */}
      {alertas.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-body font-semibold text-foreground">Sin alertas de abandono</p>
          <p className="text-caption text-muted mt-1">Todo el alumnado activo está dentro de los parámetros normales.</p>
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
                    <p className="text-body font-bold text-foreground">{alumno.nombre}</p>
                    <p className="text-caption text-muted">{alumno.motivo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-caption text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {alumno.totalSesiones} sesiones
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> {alumno.pctAsistencia.toFixed(0)}% asistencia
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-caption font-bold ${
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
