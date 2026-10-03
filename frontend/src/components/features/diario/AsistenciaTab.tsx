"use client";
import { BarChart2, ClipboardEdit, Settings, Users, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { AttendanceGrid } from "@/components/features/diario/AttendanceGrid";
import { AttendanceAccumulated } from "@/components/features/diario/AttendanceAccumulated";
import { AlertaAbandonoTab } from "@/components/features/diario/AlertaAbandonoTab";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// Hoy / Acumulado trimestral / Alertas de abandono: antes pestañas internas
// (switcher), ahora bloques apilados con su SectionHeading + índice en la
// cabecera de Seguimiento (petición de Rafael, 2026-10-02). Las alertas
// vinieron de Alumnado (2026-09-20): son un indicador automático
// (asistencia+notas reales, Indicador 1.5 del Sistema Estatal), no algo
// ligado al rol de tutor/a.
export function AsistenciaTab() {
  const { t } = useTranslation();
  const { activeModuleId, cursoData } = useAppStore();

  if (!activeModuleId || !cursoData) {
    return (
      <EmptyState
        icon={Users}
        title={t('tooltips.diario.ningunCursoActivo', {defaultValue: 'Ningún curso activo'})}
        description={
          <>
            Para pasar lista necesitas tener un Curso activo con alumnado matriculados.
          </>
        }
        action={
          <Link href="/inicio?tab=datos" className="glass-button bg-accent/10 text-accent hover:bg-accent/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
            Ir a Inicio <Settings className="w-5 h-5" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <SectionHeading id="asistencia-hoy" icon={ClipboardEdit} scrollMt="260px">
          {t('checks.diario.hoy', {defaultValue: 'Hoy'})}
        </SectionHeading>
        <AttendanceGrid />
      </div>

      <div className="space-y-3">
        <SectionHeading id="asistencia-acumulado" icon={BarChart2} scrollMt="260px">
          {t('checks.diario.acumuladoTrimestral', {defaultValue: 'Acumulado trimestral'})}
        </SectionHeading>
        <AttendanceAccumulated />
      </div>

      <div className="space-y-3">
        <SectionHeading id="asistencia-alertas" icon={AlertTriangle} scrollMt="260px">
          {t('checks.diario.alertasAbandono', {defaultValue: 'Alertas de abandono'})}
        </SectionHeading>
        <AlertaAbandonoTab />
      </div>
    </div>
  );
}
