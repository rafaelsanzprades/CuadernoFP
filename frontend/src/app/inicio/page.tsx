"use client";
import { Activity, AlertTriangle, ArrowRight, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, Check, CheckCircle, ClipboardList, FileText, GraduationCap, HeartHandshake, Layers, Users, Wrench, XCircle, ChevronDown, Mail, Send, ListChecks, Info, Shield, Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { navGroups } from "@/config/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { TabSync } from "@/components/ui/TabSync";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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
              <h3 className="font-bold text-foreground text-sm leading-tight">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            {/* Detail lines */}
            <ul className="space-y-0.5">
              {item.lines.map((line, i) => (
                <li key={i} className="text-sm text-muted flex items-start gap-1.5">
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            Ir a {item.hrefLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {item.actionHref && item.actionLabel && (
            <Link
              href={item.actionHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
            >
              {item.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Componentes de Inicio ──────────────────────────────────────────────────
function AccordionItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  return (
    <details className="group glass-card rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden mb-3 border border-white/5">
      <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50">
        <span>{question}</span>
        <span className="transition duration-300 group-open:-rotate-180 text-muted">
          <ChevronDown className="w-5 h-5" />
        </span>
      </summary>
      <div className="p-4 pt-0 text-muted leading-relaxed border-t border-white/5 mt-1 bg-foreground/5">
        {answer}
      </div>
    </details>
  );
}

const FAQS = [
  {
    group: "1. Conceptos previos y seguridad",
    items: [
      { q: "¿Qué es la arquitectura Híbrida (Local-First + Cloud)?", a: "Utilizamos una arquitectura moderna. Tus datos de trabajo (alumnos, notas) se procesan localmente en tu navegador garantizando total privacidad y velocidad. Las operaciones pesadas (generación de informes PDF o conexión con Inteligencia Artificial) se apoyan de forma segura en un servidor central." },
      { q: "¿Dónde se guardan mis datos?", a: "Los datos de tu Programación y tus Cursos residen en tu propio navegador (IndexedDB). Tú tienes el control absoluto sobre ellos. Por seguridad, te recomendamos usar frecuentemente la exportación de archivos (BYOC) desde la pestaña Archivos." },
      { q: "¿Qué diferencia hay entre 'Programación' y 'Curso'?", a: "Es un concepto vital: La 'Programación' es tu molde teórico; contiene la ley pura (Resultados de Aprendizaje, Criterios de Evaluación) y tus Unidades didácticas (reutilizable año tras año). El 'Curso' es la instancia real; representa a un grupo concreto de alumnado de carne y hueso en un año escolar específico, con sus notas y ausencias." },
      { q: "¿Qué pasa si borro los datos o la caché de mi navegador?", a: "Si borras la caché profunda del navegador sin haber exportado tus datos previamente, perderás tu trabajo. Por eso es vital usar el botón de 'Exportar' tu progreso a un archivo .json periódicamente para mantener copias de seguridad locales." },
      { q: "¿Puedo trabajar desde varios ordenadores?", a: "Sí. Para transferir tu entorno entre el ordenador del instituto y tu portátil personal, solo tienes que 'Exportar' tu progreso en el ordenador A y darle a 'Importar' en el ordenador B." }
    ]
  },
  {
    group: "2. Paso 1: La programación didáctica",
    items: [
      { q: "¿Tengo que meter a mano todos los RA y CE del BOE?", a: "¡No! El sistema cuenta con un Catálogo oficial que importa automáticamente la normativa legal (Resultados de Aprendizaje y Criterios) de tu módulo. Solo tienes que elegir tu Grado y tu Ciclo Formativo en la sección inicial de Catálogo y el sistema lo hace por ti." },
      { q: "¿Qué significa que los RA no suman 100% en las verificaciones?", a: "Para que la evaluación continua matemática funcione, cada Resultado de Aprendizaje (RA) debe tener un 'peso' o importancia. La suma total de los pesos de todos los RA de un módulo debe ser exactamente 100%. Debes ajustar esto en la pestaña 'Matrices'." }
    ]
  },
  {
    group: "3. Paso 3: Creación del curso y alumnado",
    items: [
      { q: "¿Puedo importar alumnado desde plataformas como Seneca, Rayuela o un Excel?", a: "Sí. En la sección de 'Alumnado' puedes importar un archivo CSV (Excel) con tu lista de clase. Alternativamente, la tabla inteligente te permite copiar y pegar celdas masivamente, igual que si fuera una hoja de cálculo." },
      { q: "¿Qué nivel de seguridad tienen mis datos de los alumnos?", a: "Tus archivos locales no salen nunca hacia nuestro servidor si no quieres (usando 'Guardar en Local'). Si eliges guardarlos en Google Drive o OneDrive, el archivo es transmitido directamente entre tu navegador y los servidores de Microsoft/Google. Puedes activar el cifrado local para que el archivo sea absolutamente ilegible sin tu clave maestra." },
      { q: "¿Está la aplicación protegida contra hackeos o caídas?", a: "Sí. El frontend incluye una Política de Seguridad de Contenido (CSP) que bloquea ataques de inyección de código (XSS) para proteger tus datos locales. Además, nuestro servidor cuenta con 'Rate Limiting' (limitación de peticiones) que previene ataques de denegación de servicio (DDoS) para garantizar que los catálogos oficiales siempre estén disponibles cuando los necesites." },
      { q: "¿Cómo distribuyo físicamente al alumnado en el aula?", a: "Dentro de 'Alumnado' encontrarás una pestaña de 'Plano de clase'. Es una pizarra visual e interactiva donde puedes arrastrar y soltar a los estudiantes a sus respectivos pupitres para tener el diseño exacto de tu clase." },
      { q: "¿Cómo uso el sistema de Alertas de Abandono?", a: "El panel de prevención temprana te permite registrar llamadas a las familias, partes disciplinarios o derivaciones al departamento de orientación para alumnado con riesgo de abandono escolar." }
    ]
  },
  {
    group: "4. Paso 5: El día a día y la evaluación",
    items: [
      { q: "¿Qué es el 'Diario de aula'?", a: "Es tu cuaderno de bitácora diario. Te permite anotar lo que ocurre en cada sesión real de clase: qué UD has impartido, si ha habido incidencias o marcar días 'Sin docencia' (como huelgas o claustros) para que no cuenten en tu progreso." },
      { q: "¿Cómo paso lista o registro faltas de asistencia?", a: "En la sección de Diario tienes un 'Control de Asistencia'. Verás a todo tu alumnado y con un solo clic en su cuadrícula puedes alternar entre Falta, Retraso o Falta Justificada." },
      { q: "¿Cómo evalúo una tarea o examen concreto?", a: "Ve a la sección 'Evaluación' para introducir notas numéricas rápidas cruzando tareas con alumnado. También puedes hacerlo de forma más minuciosa entrando en la Ficha Individual de el alumnado dentro de 'Alumnado'." },
      { q: "¿Cómo se calcula exactamente la nota final del trimestre?", a: "El sistema cruza las calificaciones que pones con el 'peso' que le diste a los Instrumentos de Evaluación (ej. 70% Examen, 30% Tareas) y el 'peso' global de cada Resultado de Aprendizaje (RA). Todo el cálculo se hace en tiempo real." }
    ]
  },
  {
    group: "5. Descargas y documentos oficiales",
    items: [
      { q: "¿Puedo generar boletines automáticos para los alumnos?", a: "Sí. Desde la sección de 'Descargas' puedes generar boletines en PDF masivos para toda la clase o resúmenes individuales hiperdetallados que justifican la nota en base a cada Criterio de Evaluación conseguido." }
    ]
  },

  {
    group: "7. Soporte técnico",
    items: [
      { q: "¿Qué pasa si las gráficas de mi panel de control no cargan?", a: "Comprueba en la barra lateral que has activado el 'Modo Reales' y tienes seleccionado tu Grupo. Las gráficas necesitan saber a qué alumnado y a qué programación apuntan para poder analizar los datos." },
      { q: "¿Se puede usar Cuaderno FP en el móvil?", a: "El diseño es responsivo y se adapta, pero por la densidad de información (tablas masivas de evaluación y matrices curriculares), te recomendamos encarecidamente utilizarlo en pantallas de ordenador o tabletas grandes." },
      { q: "La app va muy lenta o he detectado un error extraño", a: "Intenta recargar la página completamente (F5 o Ctrl+R). Si el error sigue apareciendo, exporta tus datos (.json) inmediatamente para ponerlos a salvo y ponte en contacto con el soporte detallando los pasos para reproducir tu problema." }
    ]
  }
];

// ── Página Principal ──────────────────────────────────────────────────────
export default function InicioPage() {
  const { moduleData, cursoData, globalData, activeModuleId, activeCursoId } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("bienvenida");
  const { t } = useTranslation();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [guiaContent, setGuiaContent] = useState<string>("");
  const [isLoadingGuia, setIsLoadingGuia] = useState(false);useEffect(() => {
    if (activeTab === "guia" && !guiaContent && !isLoadingGuia) {
      setIsLoadingGuia(true);
      fetch('/Guia.md')
        .then(res => res.text())
        .then(text => {
          setGuiaContent(text);
          setIsLoadingGuia(false);
        })
        .catch(err => {
          console.error(err);
          setGuiaContent("Error cargando la guía.");
          setIsLoadingGuia(false);
        });
    }
  }, [activeTab, guiaContent, isLoadingGuia]);

  // ── Comprobaciones Programación didáctica ────────────────────────────
  const m = moduleData;

  const udCount = m?.df_ud?.length ?? 0;
  const udHoras = (m?.df_ud ?? []).reduce((a: number, u: any) => a + (parseFloat(String(u.horas_ud ?? 0)) || 0), 0);
  const moduloHoras = parseFloat(String(m?.info_modulo?.horas_totales ?? 0)) || 0;
  const horasDiff = Math.abs(udHoras - moduloHoras);

  const raCount = m?.df_ra?.length ?? 0;
  const raPesoSum = sumPesos(m?.df_ra ?? [], "peso_ra");

  const ceList = m?.df_ce ?? [];
  const ceCount = ceList.length;
  const ceHuerfanos = ceList.filter((ce: any) => {
    if (!ce.id_ra) return true;
    return !(m?.df_ra ?? []).some((ra: any) => ra.id_ra === ce.id_ra);
  }).length;
  const ceSinUD = ceList.filter((ce: any) => {
    if (!ce.id_ud) return true;
    return !(m?.df_ud ?? []).some((ud: any) => ud.id_ud === ce.id_ud);
  }).length;

  const actCount = m?.df_act?.length ?? 0;
  const actsSinCE = (m?.df_act ?? []).filter((act: any) => {
    return !ceList.some((ce: any) => act[ce.id_ce] === true);
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

  const moduleChecks: CheckItem[] = [
    {
      id: "modulo",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Módulo didáctico",
      href: "/modulo",
      hrefLabel: "Módulo didáctico",
      status: !m ? "empty" : "ok",
      lines: !m
        ? ["Sin datos de programación cargados"]
        : [
          `Módulo activo: ${activeModuleId}`,
          `Horas semanales: ${m.info_modulo?.h_sem || "-"} h`,
          `Horas BOA: ${m.info_modulo?.h_boa || "-"} h`,
        ],
      actionHref: !m ? "/modulo" : undefined,
      actionLabel: !m ? "Configurar módulo" : undefined,
    },
    {
      id: "ud",
      icon: <Layers className="w-5 h-5" />,
      title: "Unidades didácticas (UD)",
      href: "/matrices",
      hrefLabel: "Matrices OG→RA→CE→UD/T",
      status: udCount === 0 ? "empty" : horasDiff > 2 ? "warning" : "ok",
      lines: udCount === 0
        ? ["No hay UD definidas"]
        : [
          `${udCount} UD definidas`,
          `Horas declaradas: ${udHoras} / ${moduloHoras || "-"} h del módulo`,
          horasDiff > 2 ? `Diferencia de ${horasDiff} h` : "Horas cuadran correctamente",
        ],
      actionHref: udCount === 0 ? "/matrices" : undefined,
      actionLabel: udCount === 0 ? "Añadir primera UD" : undefined,
    },
    {
      id: "ra",
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Resultados de aprendizaje (RA)",
      href: "/matrices",
      hrefLabel: "Matrices OG→RA→CE→UD/T",
      status: raCount === 0 ? "empty" : Math.abs(raPesoSum - 100) > 1 ? "warning" : "ok",
      lines: raCount === 0
        ? ["No hay RA definidos"]
        : [
          `${raCount} RA definidos`,
          `Suma de pesos: ${raPesoSum.toFixed(1)}% ${Math.abs(raPesoSum - 100) > 1 ? "(⚠️ no suman 100%)" : "(✅)"}`,
        ],
      actionHref: raCount === 0 ? "/matrices" : undefined,
      actionLabel: raCount === 0 ? "Añadir primer RA" : undefined,
    },
    {
      id: "ce",
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Criterios de evaluación (CE)",
      href: "/matrices",
      hrefLabel: "Matrices OG→RA→CE→UD/T",
      status: ceCount === 0 ? "empty" : (ceHuerfanos > 0 || ceSinUD > 0) ? "warning" : "ok",
      lines: ceCount === 0
        ? ["No hay CE definidos"]
        : [
          `${ceCount} CE definidos`,
          ceHuerfanos > 0 ? `${ceHuerfanos} CE sin RA asignado` : "Todos los CE tienen RA",
          ceSinUD > 0 ? `${ceSinUD} CE sin UD asignada` : "Todos los CE tienen UD",
        ],
      actionHref: (ceHuerfanos > 0 || ceSinUD > 0) ? "/matrices" : undefined,
      actionLabel: (ceHuerfanos > 0 || ceSinUD > 0) ? "Revisar asignaciones" : undefined,
    },
    {
      id: "instr",
      icon: <Wrench className="w-5 h-5" />,
      title: "Instrumentos de evaluación",
      href: "/instrumentos",
      hrefLabel: "Instrumentos de evaluación",
      status: actCount === 0 ? "empty" : actsSinCE > 0 ? "warning" : "ok",
      lines: actCount === 0
        ? ["No hay instrumentos definidos"]
        : [
          `${actCount} instrumentos/actividades definidos`,
          actsSinCE > 0 ? `${actsSinCE} instrumentos sin CE asociado` : "Todos los instrumentos evalúan algún CE",
        ],
      actionHref: actCount === 0 ? "/instrumentos" : undefined,
      actionLabel: actCount === 0 ? "Añadir instrumento" : undefined,
    },
    {
      id: "tareas",
      icon: <FileText className="w-5 h-5" />,
      title: "Tareas y actividades",
      href: "/programacion",
      hrefLabel: "Programación de aula",
      status: tareasCount === 0 ? "empty" : tareasSinRA > 0 ? "warning" : "ok",
      lines: tareasCount === 0
        ? ["No hay tareas definidas"]
        : [
          `${tareasCount} tareas definidas`,
          tareasSinRA > 0 ? `${tareasSinRA} tareas sin RA asociado` : "Todas las tareas tienen RA",
        ],
      actionHref: tareasCount === 0 ? "/programacion" : undefined,
      actionLabel: tareasCount === 0 ? "Crear primera tarea" : undefined,
    },
    {
      id: "sesiones",
      icon: <CalendarDays className="w-5 h-5" />,
      title: "Sesiones de clase",
      href: "/programacion",
      hrefLabel: "Programación de aula",
      status: sesionesCount === 0 ? "empty" : sesionesSinUD > 0 ? "warning" : "ok",
      lines: sesionesCount === 0
        ? ["No hay sesiones planificadas"]
        : [
          `${sesionesCount} sesiones planificadas`,
          sesionesSinUD > 0 ? `${sesionesSinUD} sesiones sin UD asignada` : "Todas las sesiones tienen UD",
        ],
      actionHref: sesionesCount === 0 ? "/programacion" : undefined,
      actionLabel: sesionesCount === 0 ? "Planificar sesiones" : undefined,
    },
    {
      id: "contexto",
      icon: <BookOpen className="w-5 h-5" />,
      title: "Contexto del módulo",
      href: "/modulo",
      hrefLabel: "Módulo didáctico",
      status: tieneContexto ? "ok" : "empty",
      lines: tieneContexto
        ? ["Contexto del aula configurado"]
        : ["Sin descripción de contexto ni configuración de aula"],
      actionHref: !tieneContexto ? "/modulo" : undefined,
      actionLabel: !tieneContexto ? "Añadir contexto" : undefined,
    },
  ];

  // ── Comprobaciones Curso activo ──────────────────────────────────────
  const c = cursoData;

  const alumnosCount = c?.df_al?.length ?? 0;
  const alumnosIncompletos = (c?.df_al ?? []).filter((a: any) => !a.Nombre || !a.Apellidos).length;
  const sgmtCount = Object.keys(c?.daily_ledger ?? {}).length;
  const tieneFeoe = (globalData?.crm_empresas?.length ?? 0) > 0;
  const empresasCount = globalData?.crm_empresas?.length ?? 0;
  const alumnosAsignados = (globalData?.crm_empresas ?? []).reduce((a: number, e: any) => a + (e.alumnado_asignados?.length ?? 0), 0);
  const tieneProfesional = !!(c?.profesional_ledger && Object.keys(c.profesional_ledger).length > 0);
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
      hrefLabel: "Calendario académico",
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
      title: "Alumnado y tutoría",
      href: "/alumnado",
      hrefLabel: "Alumnado y tutoría",
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
      href: "/seguimiento",
      hrefLabel: "Diario de aula",
      status: sgmtCount === 0 ? "empty" : "ok",
      lines: sgmtCount === 0
        ? ["Sin entradas en el diario de aula"]
        : [`${sgmtCount} sesiones registradas en el diario`],
      actionHref: sgmtCount === 0 ? "/seguimiento" : undefined,
      actionLabel: sgmtCount === 0 ? "Registrar primera sesión" : undefined,
    },
    {
      id: "evaluaciones",
      icon: <BarChart2 className="w-5 h-5" />,
      title: "Evaluación (Progreso)",
      href: "/progreso",
      hrefLabel: "Evaluación",
      status: evalCount === 0 ? "empty" : evalTotal > 0 && evalCount < evalTotal ? "warning" : "ok",
      lines: evalCount === 0
        ? ["Sin calificaciones introducidas"]
        : [
          `${evalCount} alumnos con registro de ${evalTotal > 0 ? evalTotal : "?"} posibles (${pct(evalCount, evalTotal)})`,
          evalTotal > 0 && evalCount < evalTotal
            ? `Faltan ${evalTotal - evalCount} alumnos por evaluar`
            : "Todos los alumnos tienen registros de calificación",
        ],
      actionHref: evalCount === 0 ? "/progreso" : undefined,
      actionLabel: evalCount === 0 ? "Ir a calificaciones" : undefined,
    },

    {
      id: "tutoria",
      icon: <HeartHandshake className="w-5 h-5" />,
      title: "Tutoría y alertas",
      href: "/alumnado",
      hrefLabel: "Alumnado y tutoría",
      status: tutoriaEntradas === 0 ? "empty" : "ok",
      lines: tutoriaEntradas === 0
        ? ["Sin entradas de tutoría o alertas registradas"]
        : [`${tutoriaEntradas} entradas de tutoría registradas`],
      actionHref: tutoriaEntradas === 0 ? "/alumnado" : undefined,
      actionLabel: tutoriaEntradas === 0 ? "Registrar tutoría" : undefined,
    },
    {
      id: "plano",
      icon: <Users className="w-5 h-5" />,
      title: "Plano de clase",
      href: "/alumnado",
      hrefLabel: "Plano de clase",
      status: planoCount === 0 ? "empty" : "ok",
      lines: planoCount === 0
        ? ["No hay alumnos ubicados en el plano"]
        : [`${planoCount} alumnos ubicados en el aula visual`],
      actionHref: planoCount === 0 ? "/alumnado" : undefined,
      actionLabel: planoCount === 0 ? "Diseñar aula" : undefined,
    },
  ];

  const allChecks = [...moduleChecks, ...courseChecks];
  const okCount = allChecks.filter(c => c.status === "ok").length;
  const warnCount = allChecks.filter(c => c.status === "warning").length;
  const emptyCount = allChecks.filter(c => c.status === "empty").length;

  const TABS = [
    { id: "bienvenida", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.bienvenida')}</>, cleanLabel: t('tabs.bienvenida') },
    { id: "seguridad", label: <><span className="inline-flex"><Shield className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.seguridad')}</>, cleanLabel: t('tabs.seguridad') },
    { id: "asistente", label: <><span className="inline-flex"><Sparkles className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.asistente')}</>, cleanLabel: t('tabs.asistente') },
    { id: "verificacion", label: <><span className="inline-flex"><ListChecks className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.verificacion')}</>, cleanLabel: t('tabs.verificacion') },
    { id: "guia", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.guia')}</>, cleanLabel: t('tabs.guia') },
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.faq')}</>, cleanLabel: t('tabs.faq') },
    { id: "contacto", label: <><span className="inline-flex"><Mail className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.contacto')}</>, cleanLabel: t('tabs.contacto') },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

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


            {/* Título de la página */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-accent" /> {t('inicio.title')}
              </h1>
              <p className="text-muted mt-2 text-base">{t('inicio.subtitle')}</p>
            </div>

            {/* Pestañas de Navegación */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
                    {(() => {
                const infoMap: Record<string, {title: string, desc: string}> = {
          'bienvenida': {
                    'title': 'Bienvenida',
                    'desc': 'Panel de control de acceso rápido a todas las herramientas.'
          },
          'seguridad': {
                    'title': 'Seguridad y privacidad',
                    'desc': 'Infórmate de cómo protegemos celosamente tus datos.'
          },
          'asistente': {
                    'title': 'Asistente IA',
                    'desc': 'Asistente virtual potenciado con IA para resolver tus dudas.'
          },
          'verificacion': {
                    'title': 'Verificación',
                    'desc': 'Panel de salud y coherencia de los datos de tu cuaderno.'
          },
          'guia': {
                    'title': 'Guía',
                    'desc': 'Manuales y guías paso a paso para configurar tu entorno.'
          },
          'faq': {
                    'title': 'FAQ',
                    'desc': 'Respuestas a las preguntas más frecuentes de el profesorado.'
          },
          'contacto': {
                    'title': 'Contacto',
                    'desc': 'Ponte en contacto para sugerencias o soporte.'
          }
};
                const info = infoMap[activeTab] || { title: 'Herramienta operativa', desc: 'Gestión de ' + activeTab };
                return (
    <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                    <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                    <div>
                      <p className="text-sm text-muted">{info.desc}</p>
                    </div>
                  </div>
                );
              })()}

            
            {/* ── CONTENIDO: BIENVENIDA ──────────────────────────────── */}
            {activeTab === "bienvenida" && (
              <div className="animate-in fade-in duration-500 w-full">
                
          <div className="w-full space-y-12 pb-12">


            {/* Menus Grid */}
            <div className="space-y-12">
              {navGroups.map((group, groupIdx) => (
                <MotionWrapper key={group.title} delay={groupIdx * 0.1}>
                  <div className="space-y-3">
                    {group.title !== 'General' && (
                      <>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                          {group.title}
                        </h2>
                        {group.sectionDescription && (
                          <p className="text-muted text-base max-w-4xl pb-4 border-b border-[var(--glass-border)]">
                            {group.sectionDescription}
                          </p>
                        )}
                      </>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.items.map((item, itemIdx) => (
                        <Link key={item.href} href={item.href} className="block group">
                          <Card className="h-full p-5 flex flex-col gap-3 border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-8 h-8" strokeWidth={1.5} />
                              </div>
                              <h3 className="font-bold text-base text-foreground group-hover:text-accent transition-colors leading-tight">
                                {item.label}
                              </h3>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted mt-auto">
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

            {/* ── CONTENIDO: ASISTENTE IA ──────────────────────────────── */}
            {/* ── CONTENIDO: SEGURIDAD ──────────────────────────────── */}
            {activeTab === "seguridad" && (
              <MotionWrapper delay={0.1} className="space-y-8 animate-fade-in">
                <Card className="p-8 bg-surface border-border hover:border-accent/30 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Shield className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Tu privacidad por diseño</h2>
                      <p className="text-muted mt-1 text-lg">Cómo garantizamos que tus datos reales son 100% tuyos.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-accent"/> 1. El servidor es ciego</h3>
                      <p className="text-muted leading-relaxed">Nuestra base de datos en la nube <strong>jamás</strong> almacena datos de tus alumnos, tus programaciones, ni nada que crees. El servidor web solo existe para enviarte los Catálogos Oficiales (BOE/BOCAA). Eres invisible para nuestro backend.</p>
                    </div>

                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Lock className="w-5 h-5 text-accent"/> 2. Cifrado local avanzado AES-256</h3>
                      <p className="text-muted leading-relaxed mb-4">Puedes activar la encriptación local. Antes de que cualquier archivo (`.fpp` o `.fpc`) se guarde en tu disco duro o se envíe a Google Drive/OneDrive, se cifra usando tu clave maestra dentro de tu propio navegador. Sin esa clave, el archivo es matemáticamente indescifrable.</p>
                      
                      <div className="bg-surface border border-border p-4 rounded-lg">
                        <label className="block text-sm font-medium text-foreground mb-2">Establecer clave de seguridad (no se guarda en ningún sitio)</label>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" 
                            placeholder="Introduce tu clave maestra..."
                            value={useAppStore.getState().encryptionKey || ""}
                            onChange={(e) => useAppStore.getState().setEncryptionKey(e.target.value || null)}
                          />
                        </div>
                        <p className="text-xs text-muted mt-2"><AlertTriangle className="w-3 h-3 inline mr-1 text-warning"/> Si olvidas esta clave y guardas un archivo, no podremos ayudarte a recuperarlo.</p>
                      </div>
                    </div>

                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-accent"/> 3. Defensa contra ataques en el navegador</h3>
                      <p className="text-muted leading-relaxed">Hemos implementado una política estricta de seguridad de contenido (CSP). Esto bloquea cualquier script malicioso de terceros que intentara inyectarse en la página para robar tus notas temporales almacenadas en la memoria del navegador. Toda la comunicación está limitada y verificada.</p>
                    </div>

                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-accent"/> 4. Servidor blindado y siempre disponible</h3>
                      <p className="text-muted leading-relaxed">Nuestro servidor backend incorpora un sistema de <strong>Rate Limiting</strong> (limitador de velocidad). Esto significa que si recibe un aluvión de miles de peticiones repentinas (un ataque DDoS o un fallo externo), bloquea temporalmente al atacante, garantizando que el servidor nunca se sature ni se caiga. Así, siempre tendrás acceso al catálogo oficial de módulos cuando lo necesites.</p>
                    </div>
                  </div>
                </Card>
              </MotionWrapper>
            )}

            {activeTab === "asistente" && (
              <div className="space-y-4 animate-in fade-in duration-500 w-full max-w-6xl mx-auto">
                <div className="flex justify-center">
                  <Button
                    onClick={() => setAiModalOpen(true)}
                    className="text-base font-semibold flex items-center justify-center gap-3 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 px-8 py-6 h-auto rounded-xl transition-all relative overflow-hidden w-full max-w-lg"
                  >
                    <Sparkles className="w-6 h-6 text-accent shrink-0" />
                    <span className="flex-1 text-left">Crear nueva programación con IA (PDF)</span>
                    <span className="flex items-center gap-1 bg-warning/20 text-warning px-2 py-1 rounded text-[10px] font-bold uppercase border border-warning/30 shrink-0"><AlertTriangle className="w-3 h-3" /> Beta</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <AISettingsPanel />
                  </div>

                  <div className="flex flex-col gap-4 p-6 rounded-2xl bg-info/5 border border-info/20 text-foreground">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-info" /> ¿Cómo obtengo mi API Key?
                    </h3>
                    <p className="text-muted text-sm">
                      CuadernoFP utiliza un modelo "Bring Your Own Key" (Trae tu propia clave) para garantizar que tus datos no pasan por servidores intermedios y mantener la herramienta 100% gratuita.
                    </p>

                    <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground/90 font-medium">
                      <li>
                        Entra en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a>.
                      </li>
                      <li>
                        Inicia sesión con tu cuenta de Google habitual.
                      </li>
                      <li>
                        Pulsa el botón azul <strong>"Create API key"</strong>.
                      </li>
                      <li>
                        Copia la larga cadena de texto (tu clave secreta) y pégala en la caja de la izquierda.
                      </li>
                    </ol>

                    <div className="mt-auto pt-4 flex items-start gap-3 text-sm text-warning/80 bg-warning/5 p-4 rounded-xl border border-warning/10">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <p>
                        <strong>Importante:</strong> Esta clave es personal e intransferible. Da acceso al motor de IA usando tu cupo gratuito de desarrollador de Google.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTENIDO: VERIFICACIÓN ──────────────────────────────── */}
            {activeTab === "verificacion" && (
              <div className="space-y-4 animate-in fade-in duration-500">


                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 border border-success/30 bg-success/10 rounded-2xl text-center">
                    <CheckCircle className="w-7 h-7 text-success mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-success">{okCount}</div>
                    <div className="text-xs text-muted mt-0.5">Correctos</div>
                  </Card>
                  <Card className="p-4 border border-warning/30 bg-warning/10 rounded-2xl text-center">
                    <AlertTriangle className="w-7 h-7 text-warning mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-warning">{warnCount}</div>
                    <div className="text-xs text-muted mt-0.5">Advertencias</div>
                  </Card>
                  <Card className="p-4 border border-danger/30 bg-danger/10 rounded-2xl text-center">
                    <XCircle className="w-7 h-7 text-danger mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-danger">{emptyCount}</div>
                    <div className="text-xs text-muted mt-0.5">Sin datos</div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-2">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-accent" />
                      Programación didáctica
                    </h2>
                    <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1 text-xs text-muted">
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
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Curso activo
                    </h2>
                    <span className="bg-foreground/5 border border-white/5 rounded-lg px-3 py-1 text-xs text-muted">
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

            {/* ── CONTENIDO: GUÍA PASO A PASO ───────────────────────────── */}
            {activeTab === "guia" && (
              <div className="space-y-3 animate-in fade-in duration-500 w-full">
                <Card glow className="p-8">
                  {isLoadingGuia && !guiaContent ? (
                    <div className="flex justify-center p-8 text-muted">Cargando guía...</div>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold text-foreground mb-6 pb-2 border-b border-white/10" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-accent mt-8 mb-4 flex items-center gap-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-bold text-foreground mt-6 mb-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-muted leading-relaxed mb-4" {...props} />,
                          ul: ({node, className, ...props}) => <ul className={`list-none space-y-3 mb-6 ml-4 ${className || ''}`} {...props} />,
                          ol: ({node, className, ...props}: any) => <ol className={`list-decimal space-y-3 mb-6 ml-6 ${className || ''}`} {...props} />,
                          li: ({node, ...props}) => <li className="text-sm text-muted leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                          a: ({node, ...props}) => <a className="text-accent hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
                          code: ({node, ...props}: any) => <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
                          pre: ({node, ...props}: any) => <pre className="block bg-foreground/5 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-4 border border-white/5 text-muted" {...props} />,
                          hr: ({node, ...props}) => <hr className="border-white/10 my-8" {...props} />,
                        }}
                      >
                        {guiaContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ── CONTENIDO: FAQ ────────────────────────────────────────── */}
            {activeTab === "faq" && (
              <div className="space-y-10 animate-in fade-in duration-500 w-full">
                {FAQS.map((faqGroup, idx) => (
                  <div key={idx}>
                    <h2 className="text-xl font-bold mb-4 text-accent border-b border-white/5 pb-2">
                      {faqGroup.group}
                    </h2>
                    <div className="space-y-1">
                      {faqGroup.items.map((item, i) => (
                        <AccordionItem key={i} question={item.q} answer={item.a} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

                      {/* ── CONTENIDO: CONTACTO ────────────────────────────────────────── */}
            {activeTab === "contacto" && (
              <div className="space-y-6 animate-in fade-in duration-500 w-full">
                <Card className="p-8 border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Mail className="w-32 h-32" />
                  </div>
                  <h2 className="text-3xl font-extrabold mb-4 text-foreground">¡Hola!</h2>
                  <p className="text-muted text-base mb-6 leading-relaxed">
                    Espero que <strong>Cuaderno FP</strong> te esté resultando de gran utilidad para simplificar tu trabajo docente. 
                    He desarrollado esta herramienta con mucho cariño para aportar valor a nuestra comunidad educativa de Formación Profesional.
                  </p>
                  
                  

                  <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <Send className="w-5 h-5 text-accent" /> Envíame un mensaje rápido
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Asunto</label>
                      <input 
                        id="contacto-asunto"
                        type="text" 
                        placeholder="Ej: Sugerencia para la agenda..." 
                        className="w-full bg-foreground/5 border border-[var(--glass-border)] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Mensaje</label>
                      <textarea 
                        id="contacto-mensaje"
                        rows={4} 
                        placeholder="Escribe aquí tu mensaje..." 
                        className="w-full bg-foreground/5 border border-[var(--glass-border)] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                      ></textarea>
                    </div>
                    <button 
                      onClick={() => {
                        const asunto = (document.getElementById('contacto-asunto') as HTMLInputElement)?.value || '';
                        const mensaje = (document.getElementById('contacto-mensaje') as HTMLTextAreaElement)?.value || '';
                        window.location.href = `mailto:rafaelsanzprades@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0d7377] text-white rounded-lg font-semibold hover:bg-[#0a5c5f] transition-colors shadow-lg hover:shadow-[#0d7377]/20"
                    >
                      <Send className="w-4 h-4" /> Enviar mensaje
                    </button>
                  </div>
                </Card>
              </div>
            )}

            </MotionWrapper>
        </div>
      </div>
    </div>
      );
}

