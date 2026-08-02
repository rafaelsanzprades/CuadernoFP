"use client";
import { Activity, AlertTriangle, ArrowRight, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, Check, CheckCircle, ClipboardList, FileText, GraduationCap, HeartHandshake, Layers, Users, Wrench, XCircle, Send, ListChecks, Info, Shield, Lightbulb, Map, MessageCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { navGroups } from "@/config/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { TabSync } from "@/components/ui/TabSync";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { AIWizardModal } from "@/components/features/ai/AIWizardModal";
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// ── Tipos ─────────────────────────────────────────────────────────────────
type CheckStatus = "ok" | "warning" | "empty";

interface CheckItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  href: string;
  hrefLabel: string;
  status: CheckStatus;
  lines: string[];
  actionHref?: string;
  actionLabel?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function pct(n: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function sumPesos(arr: { peso_ra?: string | number; peso_ce?: string | number }[], field: "peso_ra" | "peso_ce") {
  return arr.reduce((acc, item) => acc + (parseFloat(String(item[field] ?? 0)) || 0), 0);
}

function StatusBadge({ status }: { status: CheckStatus }) {
  if (status === "ok")
    return <Badge variant="success" className="bg-success/10 text-success border-success/30 shrink-0">Correcto</Badge>;
  if (status === "warning")
    return <Badge variant="warning" className="bg-warning/10 text-warning border-warning/30 shrink-0">Advertencia</Badge>;
  return <Badge variant="default" className="bg-danger/10 text-danger border-danger/30 shrink-0">Sin datos</Badge>;
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle className="w-5 h-5 text-success shrink-0" />;
  if (status === "warning") return <AlertTriangle className="w-5 h-5 text-warning shrink-0" />;
  return <XCircle className="w-5 h-5 text-danger shrink-0" />;
}

function CheckCard({ item }: { item: CheckItem }) {
  return (
    <Card className="p-5 border border-white/5 rounded-2xl bg-foreground/5 shadow h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-3 flex-1 mb-3">
          <div className="mt-0.5 text-muted">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-body leading-tight">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            {/* Detail lines */}
            <ul className="space-y-0.5">
              {item.lines.map((line, i) => (
                <li key={i} className="text-body text-muted flex items-start gap-1.5">
                  <span className="text-foreground/40 font-bold px-1 mt-0.5">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex flex-wrap justify-end gap-2 pt-3 mt-auto border-t border-white/5">
          <Link
            href={item.href}
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent hover:underline"
          >
            Ir a {item.hrefLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {item.actionHref && item.actionLabel && (
            <Link
              href={item.actionHref}
              className="inline-flex items-center gap-1.5 text-caption font-semibold px-3 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
            >
              {item.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────
export default function InicioPage() {
  const { moduleData, cursoData, globalData, activeModuleId, activeCursoId } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("bienvenida");
  const { t } = useTranslation();
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // ── Comprobaciones Programación didáctica ────────────────────────────
  const m = moduleData;

  const udCount = m?.df_ud?.length ?? 0;
  const udHoras = (m?.df_ud ?? []).reduce((a: number, u: any) => a + (parseFloat(String(u.horas_ud ?? 0)) || 0), 0);
  const moduloHoras = parseFloat(String(m?.info_modulo?.h_boa ?? 0)) || 0;
  const horasDiff = Math.abs(udHoras - moduloHoras);

  const raCount = m?.df_ra?.length ?? 0;
  const raPesoSum = sumPesos(m?.df_ra ?? [], "peso_ra");

  const ceList = m?.df_ce ?? [];
  const ceCount = ceList.length;
  const ceHuerfanos = ceList.filter((ce: any) => {
    if (!ce.id_ra) return true;
    return !(m?.df_ra ?? []).some((ra: any) => ra.id_ra === ce.id_ra);
  }).length;

  const instrCount = m?.df_instr?.length ?? 0;
  const indsList = m?.df_indicadores ?? [];
  const indCount = indsList.length;
  const indSinCE = indsList.filter((ind: any) => {
    return !ceList.some((ce: any) => ind.id_ce === ce.id_ce);
  }).length;

  const tareasCount = m?.df_tareas?.length ?? 0;
  const tareasSinRA = (m?.df_tareas ?? []).filter((t: any) => {
    if (!t.RA_Asociados) return true;
    if ((m?.df_ra ?? []).length === 0) return true;
    return false;
  }).length;

  const sesionesCount = m?.df_sesiones?.length ?? 0;
  const sesionesSinUD = (m?.df_sesiones ?? []).filter((s: any) => {
    if (!s.id_ud) return true;
    return !(m?.df_ud ?? []).some((ud: any) => ud.id_ud === s.id_ud);
  }).length;

  const tieneHorario = !!(cursoData?.horario && Object.keys(cursoData.horario).length > 0);
  const tieneFechas = !!(cursoData?.info_fechas && Object.keys(cursoData.info_fechas).length > 0);
  const tieneContexto = !!(m?.config_contexto && Object.keys(m.config_contexto).length > 0);

  // ── Comprobaciones de campos que usan los generadores PD+ (JEG) / pd= / pd- ──
  const infoMod: Record<string, any> = m?.info_modulo || {};
  const cc: Record<string, any> = m?.config_contexto || {};
  const identificacionFaltan = ["centro", "profesorado", "familia"].filter(k => !infoMod[k]);

  const modData: Record<string, any> = m || {};
  const NARRATIVOS_PDPLUS: { key: string; label: string; source: Record<string, any> }[] = [
    { key: "entorno_geografico", label: "Entorno geográfico", source: cc },
    { key: "entorno_socioeconomico", label: "Entorno socioeconómico", source: cc },
    { key: "contexto_escolar", label: "Contexto escolar", source: cc },
    { key: "contingencia_profesor", label: "Contingencia (profesorado)", source: cc },
    { key: "contingencia_alumnado", label: "Contingencia (alumnado)", source: cc },
    { key: "textos_pd_bibliografia", label: "Bibliografía", source: modData },
    { key: "textos_pd_publicidad", label: "Publicidad", source: modData },
  ];
  const narrativosRellenos = NARRATIVOS_PDPLUS.filter(f => !!f.source[f.key]).length;
  const narrativosFaltan = NARRATIVOS_PDPLUS.filter(f => !f.source[f.key]).map(f => f.label);

  const moduleChecks: CheckItem[] = [
    {
      id: "modulo",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Módulo didáctico",
      href: "/contexto?tab=presentacion",
      hrefLabel: "Contexto",
      status: !m ? "empty" : "ok",
      lines: !m
        ? ["Sin datos de programación cargados"]
        : [
          `Módulo activo: ${activeModuleId}`,
          `Horas semanales: ${m.info_modulo?.h_sem || "-"} h`,
          `Horas BOA: ${m.info_modulo?.h_boa || "-"} h`,
        ],
      actionHref: !m ? "/contexto?tab=presentacion" : undefined,
      actionLabel: !m ? "Configurar módulo" : undefined,
    },
    {
      id: "ud",
      icon: <Layers className="w-5 h-5" />,
      title: "Unidades didácticas (UD)",
      href: "/curriculo?tab=unidades",
      hrefLabel: "Currículo",
      status: udCount === 0 ? "empty" : horasDiff > 2 ? "warning" : "ok",
      lines: udCount === 0
        ? ["No hay UD definidas"]
        : [
          `${udCount} UD definidas`,
          `Horas declaradas: ${udHoras} / ${moduloHoras || "-"} h del módulo`,
          horasDiff > 2 ? `Diferencia de ${horasDiff} h` : "Horas cuadran correctamente",
        ],
      actionHref: udCount === 0 ? "/curriculo?tab=unidades" : undefined,
      actionLabel: udCount === 0 ? "Añadir primera UD" : undefined,
    },
    {
      id: "ra",
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Resultados de aprendizaje (RA)",
      href: "/curriculo?tab=ponderacion-ra-ce",
      hrefLabel: "Currículo",
      status: raCount === 0 ? "empty" : Math.abs(raPesoSum - 100) > 1 ? "warning" : "ok",
      lines: raCount === 0
        ? ["No hay RA definidos"]
        : [
          `${raCount} RA definidos`,
          `Suma de pesos: ${raPesoSum.toFixed(1)}% ${Math.abs(raPesoSum - 100) > 1 ? "(⚠️ no suman 100%)" : "(✅)"}`,
        ],
      actionHref: raCount === 0 ? "/curriculo?tab=ponderacion-ra-ce" : undefined,
      actionLabel: raCount === 0 ? "Añadir primer RA" : undefined,
    },
    {
      id: "ce",
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Criterios de evaluación (CE)",
      href: "/curriculo?tab=ponderacion-ra-ce",
      hrefLabel: "Currículo",
      status: ceCount === 0 ? "empty" : ceHuerfanos > 0 ? "warning" : "ok",
      lines: ceCount === 0
        ? ["No hay CE definidos"]
        : [
          `${ceCount} CE definidos`,
          ceHuerfanos > 0 ? `${ceHuerfanos} CE sin RA asignado` : "Todos los CE tienen RA",
        ],
      actionHref: ceHuerfanos > 0 ? "/curriculo?tab=ponderacion-ra-ce" : undefined,
      actionLabel: ceHuerfanos > 0 ? "Revisar asignaciones" : undefined,
    },
    {
      id: "instr",
      icon: <Wrench className="w-5 h-5" />,
      title: "Instrumentos e Indicadores",
      href: "/calificaciones?tab=matriz",
      hrefLabel: "Calificaciones",
      status: (instrCount === 0 || indCount === 0) ? "empty" : indSinCE > 0 ? "warning" : "ok",
      lines: (instrCount === 0 || indCount === 0)
        ? ["No hay instrumentos o indicadores"]
        : [
          `${instrCount} instrumentos y ${indCount} indicadores`,
          indSinCE > 0 ? `${indSinCE} indicadores sin CE asociado` : "Todos los indicadores evalúan algún CE",
        ],
      actionHref: (instrCount === 0 || indCount === 0) ? "/archivos?tab=autores" : undefined,
      actionLabel: (instrCount === 0 || indCount === 0) ? "Importar de un editorial" : undefined,
    },
    {
      id: "tareas",
      icon: <FileText className="w-5 h-5" />,
      title: "Tareas competenciales",
      href: "/curriculo?tab=tareas",
      hrefLabel: "Currículo",
      status: tareasCount === 0 ? "empty" : tareasSinRA > 0 ? "warning" : "ok",
      lines: tareasCount === 0
        ? ["No hay tareas definidas"]
        : [
          `${tareasCount} tareas definidas`,
          tareasSinRA > 0 ? `${tareasSinRA} tareas sin RA asociado` : "Todas las tareas tienen RA",
        ],
      actionHref: tareasCount === 0 ? "/curriculo?tab=tareas" : undefined,
      actionLabel: tareasCount === 0 ? "Crear primera tarea" : undefined,
    },
    {
      id: "sesiones",
      icon: <CalendarDays className="w-5 h-5" />,
      title: "Sesiones de clase",
      href: "/curriculo?tab=unidades",
      hrefLabel: "Currículo",
      status: sesionesCount === 0 ? "empty" : sesionesSinUD > 0 ? "warning" : "ok",
      lines: sesionesCount === 0
        ? ["No hay sesiones planificadas"]
        : [
          `${sesionesCount} sesiones planificadas`,
          sesionesSinUD > 0 ? `${sesionesSinUD} sesiones sin UD asignada` : "Todas las sesiones tienen UD",
        ],
      actionHref: sesionesCount === 0 ? "/curriculo?tab=unidades" : undefined,
      actionLabel: sesionesCount === 0 ? "Planificar sesiones" : undefined,
    },
    {
      id: "contexto",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Contexto del módulo",
      href: "/contexto?tab=entorno",
      hrefLabel: "Contexto",
      status: tieneContexto ? "ok" : "empty",
      lines: tieneContexto
        ? ["Contexto del aula configurado"]
        : ["Sin descripción de contexto ni configuración de aula"],
      actionHref: !tieneContexto ? "/contexto?tab=entorno" : undefined,
      actionLabel: !tieneContexto ? "Añadir contexto" : undefined,
    },
    {
      id: "dual",
      icon: <Building2 className="w-5 h-5" />,
      title: "FP Dual",
      href: "/contexto?tab=presentacion",
      hrefLabel: "Contexto",
      status: (m?.dual_regimen && m.dual_regimen !== "ninguno") ? "ok" : "empty",
      lines: (m?.dual_regimen && m.dual_regimen !== "ninguno")
        ? [`Régimen: Dual ${m.dual_regimen === 'general' ? 'General' : 'Intensivo'}`]
        : ["Régimen tradicional (sin FP Dual configurada)"],
      actionHref: "/contexto?tab=presentacion",
      actionLabel: "Configurar FP Dual",
    },
    {
      id: "eqavet",
      icon: <Shield className="w-5 h-5" />,
      title: "Calidad EQAVET",
      href: "/mejora?tab=eqavet",
      hrefLabel: "Mejora",
      status: (m?.eqavet_evaluacion && Object.keys(m.eqavet_evaluacion).length > 0) ? "ok" : "empty",
      lines: (m?.eqavet_evaluacion && Object.keys(m.eqavet_evaluacion).length > 0)
        ? [`${Object.keys(m.eqavet_evaluacion).length} indicadores EQAVET valorados`]
        : ["Sin indicadores EQAVET valorados"],
      actionHref: "/mejora?tab=eqavet",
      actionLabel: "Valorar calidad",
    },
    {
      id: "identificacion-pd",
      icon: <FileText className="w-5 h-5" />,
      title: "Identificación (para PD+/pd=/pd-)",
      href: "/contexto?tab=presentacion",
      hrefLabel: "Contexto",
      status: !m ? "empty" : identificacionFaltan.length === 0 ? "ok" : identificacionFaltan.length < 3 ? "warning" : "empty",
      lines: !m
        ? ["Sin datos de programación cargados"]
        : identificacionFaltan.length === 0
          ? ["Centro, profesorado y familia profesional configurados"]
          : [`Faltan: ${identificacionFaltan.join(", ")}`, "Estos campos rellenan la portada de los 3 modelos de PD"],
      actionHref: identificacionFaltan.length > 0 ? "/contexto?tab=presentacion" : undefined,
      actionLabel: identificacionFaltan.length > 0 ? "Completar identificación" : undefined,
    },
    {
      id: "narrativos-pd",
      icon: <FileText className="w-5 h-5" />,
      title: "Textos narrativos (PD+/JEG)",
      href: "/contexto?tab=entorno",
      hrefLabel: "Contexto",
      status: !m ? "empty" : narrativosRellenos === NARRATIVOS_PDPLUS.length ? "ok" : narrativosRellenos > 0 ? "warning" : "empty",
      lines: !m
        ? ["Sin datos de programación cargados"]
        : [
          `${narrativosRellenos} / ${NARRATIVOS_PDPLUS.length} textos redactados`,
          narrativosFaltan.length > 0 ? `Faltan: ${narrativosFaltan.join(", ")}` : "Todos los textos narrativos están redactados",
        ],
      actionHref: narrativosFaltan.length > 0 ? "/contexto?tab=entorno" : undefined,
      actionLabel: narrativosFaltan.length > 0 ? "Redactar textos" : undefined,
    }
  ];

  // ── Comprobaciones Curso activo ──────────────────────────────────────
  const c = cursoData;

  const alumnosCount = c?.df_al?.length ?? 0;
  const alumnosIncompletos = (c?.df_al ?? []).filter((a: any) => !a.Nombre || !a.Apellidos).length;
  const sgmtCount = Object.keys(c?.daily_ledger ?? {}).length;
  const tutoriaEntradas = Object.keys(c?.tutoria_ledger ?? {}).length;
  const planoCount = Object.keys(c?.plano_clase ?? {}).length;

  const evalCount = c?.df_eval?.length ?? 0;
  const evalTotal = alumnosCount;

  const courseChecks: CheckItem[] = [
    {
      id: "calendario",
      icon: <CalendarDays className="w-5 h-5" />,
      title: "Calendario académico",
      href: "/calendario",
      hrefLabel: "Calendario",
      status: !tieneHorario && !tieneFechas ? "empty" : (!tieneHorario || !tieneFechas) ? "warning" : "ok",
      lines: [
        tieneHorario ? "Horario semanal definido" : "Sin horario semanal",
        tieneFechas ? "Fechas de evaluación configuradas" : "Sin fechas de evaluación",
      ],
      actionHref: !tieneHorario ? "/calendario" : undefined,
      actionLabel: !tieneHorario ? "Configurar calendario" : undefined,
    },
    {
      id: "alumnado",
      icon: <Users className="w-5 h-5" />,
      title: "Alumnado",
      href: "/alumnado",
      hrefLabel: "Alumnado",
      status: alumnosCount === 0 ? "empty" : alumnosIncompletos > 0 ? "warning" : "ok",
      lines: alumnosCount === 0
        ? ["No hay alumnado registrado"]
        : [
          `${alumnosCount} alumnos registrados`,
          alumnosIncompletos > 0 ? `${alumnosIncompletos} registros incompletos (sin nombre/apellidos)` : "Todos los registros completos",
        ],
      actionHref: alumnosCount === 0 ? "/alumnado" : undefined,
      actionLabel: alumnosCount === 0 ? "Añadir alumnado" : undefined,
    },
    {
      id: "seguimiento",
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Diario de aula",
      href: "/seguimiento?tab=clases",
      hrefLabel: "Seguimiento",
      status: sgmtCount === 0 ? "empty" : "ok",
      lines: sgmtCount === 0
        ? ["Sin entradas en el diario de aula"]
        : [`${sgmtCount} sesiones registradas en el diario`],
      actionHref: sgmtCount === 0 ? "/seguimiento?tab=clases" : undefined,
      actionLabel: sgmtCount === 0 ? "Registrar primera sesión" : undefined,
    },
    {
      id: "evaluaciones",
      icon: <BarChart2 className="w-5 h-5" />,
      title: "Calificaciones",
      href: "/calificaciones",
      hrefLabel: "Calificaciones",
      status: evalCount === 0 ? "empty" : evalTotal > 0 && evalCount < evalTotal ? "warning" : "ok",
      lines: evalCount === 0
        ? ["Sin calificaciones introducidas"]
        : [
          `${evalCount} alumnos con registro de ${evalTotal > 0 ? evalTotal : "?"} posibles (${pct(evalCount, evalTotal)})`,
          evalTotal > 0 && evalCount < evalTotal
            ? `Faltan ${evalTotal - evalCount} alumnos por evaluar`
            : "Todos los alumnos tienen registros de calificación",
        ],
      actionHref: evalCount === 0 ? "/calificaciones" : undefined,
      actionLabel: evalCount === 0 ? "Ir a calificaciones" : undefined,
    },
    {
      id: "tutoria",
      icon: <HeartHandshake className="w-5 h-5" />,
      title: "Tutoría y alertas",
      href: "/seguimiento?tab=tutoria",
      hrefLabel: "Seguimiento",
      status: tutoriaEntradas === 0 ? "empty" : "ok",
      lines: tutoriaEntradas === 0
        ? ["Sin entradas de tutoría o alertas registradas"]
        : [`${tutoriaEntradas} entradas de tutoría registradas`],
      actionHref: tutoriaEntradas === 0 ? "/seguimiento?tab=tutoria" : undefined,
      actionLabel: tutoriaEntradas === 0 ? "Registrar tutoría" : undefined,
    },
    {
      id: "plano",
      icon: <Users className="w-5 h-5" />,
      title: "Plano de clase",
      href: "/alumnado?tab=plano",
      hrefLabel: "Alumnado",
      status: planoCount === 0 ? "empty" : "ok",
      lines: planoCount === 0
        ? ["No hay alumnos ubicados en el plano"]
        : [`${planoCount} alumnos ubicados en el aula visual`],
      actionHref: planoCount === 0 ? "/alumnado?tab=plano" : undefined,
      actionLabel: planoCount === 0 ? "Diseñar aula" : undefined,
    },
  ];

  const allChecks = [...moduleChecks, ...courseChecks];
  const okCount = allChecks.filter(chk => chk.status === "ok").length;
  const warnCount = allChecks.filter(chk => chk.status === "warning").length;
  const emptyCount = allChecks.filter(chk => chk.status === "empty").length;

  const TABS = [
    { id: "bienvenida", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.bienvenida')}</>, cleanLabel: t('tabs.bienvenida') },
    { id: "verificacion", label: <><span className="inline-flex"><ListChecks className="w-[1.2em] h-[1.2em] mr-1" /></span> Verificación</>, cleanLabel: "Verificación" },
    { id: "contribuciones", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Contribuciones</>, cleanLabel: "Contribuciones" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    bienvenida: 'Panel de control de acceso rápido a todas las herramientas.',
    verificacion: 'Panel de salud y coherencia de los datos de tu cuaderno.',
    contribuciones: 'Comunidad de Telegram y listado de personas que contribuyen activamente al proyecto.',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <AIWizardModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSuccess={(data) => {
          console.log("Datos recibidos de la IA:", data);
          toast.success("Estructura guardada.");
        }}
      />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">


            <PageHeader icon={Activity} title={t('inicio.title')} description={t('inicio.subtitle')} />

            {/* Pestañas de Navegación */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="max-w-full">
                  {TABS.map(tab => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <TabInfoBox description={TAB_DESCRIPTIONS[activeTab] || 'Gestión de ' + activeTab} />

            
            {/* ── CONTENIDO: BIENVENIDA ──────────────────────────────── */}
            {activeTab === "bienvenida" && (
              <div className="animate-in fade-in duration-500 w-full">

          <div className="w-full space-y-12 pb-12">

            {/* Accesos a las demás pestañas de Inicio */}
            <Card className="p-6 border border-[var(--glass-border)] bg-[var(--glass-bg)]">
              <h2 className="text-subheading font-bold text-foreground mb-4">Ayuda y recursos de Inicio</h2>
              <div className="flex flex-col divide-y divide-[var(--glass-border)]">
                {TABS.filter(tab => tab.id !== "bienvenida").map(tab => (
                  <Link
                    key={tab.id}
                    href={`/inicio?tab=${tab.id}`}
                    className="flex items-center justify-between py-3 text-body font-semibold text-foreground hover:text-accent transition-colors group"
                  >
                    <span className="flex items-center gap-2">{tab.label}</span>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* Menus Grid */}
            <div className="space-y-12">
              {navGroups.map((group, groupIdx) => (
                <MotionWrapper key={group.title} delay={groupIdx * 0.1}>
                  <div className="space-y-3">
                    <h2 className="text-subheading font-bold text-foreground flex items-center gap-3">
                      {group.title.replace(/\s*\[.*\]$/, '')}
                    </h2>
                    {group.sectionDescription && (
                      <p className="text-muted text-body max-w-4xl pb-4 border-b border-[var(--glass-border)]">
                        {group.sectionDescription}
                      </p>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((item, itemIdx) => (
                        <Link key={item.href} href={item.href} className="block group">
                          <Card className="h-full p-5 flex flex-col gap-3 border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="text-heading group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-8 h-8" strokeWidth={1.5} />
                              </div>
                              <h3 className="font-bold text-body text-foreground group-hover:text-accent transition-colors leading-tight">
                                {item.label}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-body text-muted mt-auto">
                                {item.description}
                              </p>
                            )}
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                </MotionWrapper>
              ))}
            </div>

          </div>
        
              </div>
            )}

            {/* ── CONTENIDO: VERIFICACIÓN ──────────────────────────────── */}
            {activeTab === "verificacion" && (
              <div className="space-y-4 animate-in fade-in duration-500 w-full">

                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 border border-success/30 bg-success/10 rounded-2xl text-center">
                    <CheckCircle className="w-7 h-7 text-success mx-auto mb-1" />
                    <div className="text-heading font-extrabold text-success">{okCount}</div>
                    <div className="text-caption text-muted mt-0.5">Correctos</div>
                  </Card>
                  <Card className="p-4 border border-warning/30 bg-warning/10 rounded-2xl text-center">
                    <AlertTriangle className="w-7 h-7 text-warning mx-auto mb-1" />
                    <div className="text-heading font-extrabold text-warning">{warnCount}</div>
                    <div className="text-caption text-muted mt-0.5">Advertencias</div>
                  </Card>
                  <Card className="p-4 border border-danger/30 bg-danger/10 rounded-2xl text-center">
                    <XCircle className="w-7 h-7 text-danger mx-auto mb-1" />
                    <div className="text-heading font-extrabold text-danger">{emptyCount}</div>
                    <div className="text-caption text-muted mt-0.5">Sin datos</div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
                    <h2 className="text-body font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      Programación didáctica
                    </h2>
                    <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1 text-caption text-muted">
                      Programación activa: <span className="font-semibold text-foreground">{activeModuleId || "-"}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {moduleChecks.map(item => (
                      <CheckCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
                    <h2 className="text-body font-bold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Curso activo
                    </h2>
                    <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1 text-caption text-muted">
                      Curso Activo: <span className="font-semibold text-foreground">{activeCursoId || "-"}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {courseChecks.map(item => (
                      <CheckCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTENIDO: CONTRIBUCIONES ──────────────────────────────────────── */}
            {activeTab === "contribuciones" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-5 p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl shadow-sm mb-8">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#229ED9]/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-[#229ED9]" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-body font-bold text-foreground">Grupo oficial de Telegram</h3>
                      <p className="text-body text-muted leading-tight mt-1">
                        Grupo oficial de desarrollo y testeo de la App web gratuita de Cuaderno FP. Sube tus sugerencias, reporta bugs o colabora aportando el currículo oficial de tu Comunidad Autónoma.
                      </p>
                    </div>
                    <a
                      href="https://t.me/cuadernofp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-5 py-2.5 rounded-lg bg-[#229ED9] text-white font-medium hover:bg-[#229ED9]/90 transition-colors flex items-center gap-2 text-body"
                    >
                      <Send className="w-4 h-4" />
                      Unirme al grupo en Telegram
                    </a>
                  </div>

                  <h3 className="text-heading font-bold text-foreground border-b border-[var(--glass-border)] pb-2">Contribuidores por Comunidad Autónoma</h3>
                  <p className="text-muted mb-4">
                    Mención especial al profesorado que está ayudando a mejorar y a integrar los currículos de las Comunidades Autónomas
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias",
                      "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña", "Ceuta",
                      "Comunidad Valenciana", "Extremadura", "Galicia", "La Rioja", "Madrid",
                      "Melilla", "Murcia", "Navarra", "País Vasco"
                    ].map((comunidad) => (
                      <div key={comunidad} className="p-4 rounded-xl border border-[var(--glass-border)] bg-background/50 flex flex-col gap-2 transition-all hover:bg-background/80">
                        <div className="flex items-center gap-2 border-b border-[var(--glass-border)] pb-2 mb-1">
                          <Map className="w-5 h-5 text-accent" />
                          <span className="font-bold text-foreground">{comunidad}</span>
                        </div>
                        <ul className="text-body text-muted space-y-1.5 pl-2">
                          {comunidad === "Aragón" ? (
                            <li className="flex items-center gap-2 text-foreground"><Users className="w-4 h-4 text-accent" /> Jose Javier García</li>
                          ) : (
                            <li className="flex items-center gap-2 italic opacity-60"><Users className="w-4 h-4 text-muted-foreground" /> ¡Anímate a contribuir!</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            </MotionWrapper>
        </div>
      </div>
    </div>
      );
}

