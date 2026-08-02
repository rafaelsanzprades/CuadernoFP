"use client";
import { Activity, AlertTriangle, ArrowRight, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, Check, CheckCircle, ClipboardList, FileText, GraduationCap, HeartHandshake, Layers, Users, Wrench, XCircle, ChevronDown, Mail, Send, ListChecks, Info, Shield, Lock, Lightbulb, Map, ExternalLink, MessageCircle } from "lucide-react";
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
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { AIWizardModal } from "@/components/features/ai/AIWizardModal";
import { AISettingsPanel } from "@/components/features/ai/AISettingsPanel";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TabAcronimos } from "@/components/features/catalogo/TabAcronimos";

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
      { q: "¿Qué diferencia hay entre 'Programación' y 'Curso'?", a: "Es un concepto vital: La 'Programación' es tu molde teórico; contiene la ley pura (Resultados de aprendizaje, Criterios de evaluación) y tus Unidades didácticas (reutilizable año tras año). El 'Curso' es la instancia real; representa a un grupo concreto de alumnado de carne y hueso en un año escolar específico, con sus notas y ausencias." },
      { q: "¿Qué pasa si borro los datos o la caché de mi navegador?", a: "Si borras la caché profunda del navegador sin haber exportado tus datos previamente, perderás tu trabajo. Por eso es vital usar el botón de 'Exportar' tu progreso a un archivo .json periódicamente para mantener copias de seguridad locales." },
      { q: "¿Puedo trabajar desde varios ordenadores?", a: "Sí. Para transferir tu entorno entre el ordenador del instituto y tu portátil personal, solo tienes que 'Exportar' tu progreso en el ordenador A y darle a 'Importar' en el ordenador B." }
    ]
  },
  {
    group: "2. Paso 1: La programación didáctica",
    items: [
      { q: "¿Tengo que meter a mano todos los RA y CE del BOE?", a: "¡No! El sistema cuenta con un Catálogo oficial que importa automáticamente la normativa legal (Resultados de aprendizaje y Criterios) de tu módulo. Solo tienes que elegir tu Grado y tu Ciclo Formativo en la sección inicial de Catálogo y el sistema lo hace por ti." },
      { q: "¿Qué significa que los RA no suman 100% en las verificaciones?", a: "Para que la evaluación continua matemática funcione, cada Resultado de Aprendizaje (RA) debe tener un 'peso' o importancia. La suma total de los pesos de todos los RA de un módulo debe ser exactamente 100%. Debes ajustar esto en Programación > Currículo > pestaña 'RA y CE'." },
      { q: "¿Cómo configuro las horas que el alumnado pasa en la empresa (FP Dual)?", a: "En Programación > Metodología > bloque 'FP Dual', debes elegir si tu régimen es General o Intensivo. A continuación, usa los deslizadores para repartir el porcentaje de cada Resultado de Aprendizaje entre el Centro Educativo y la Empresa." },
      { q: "¿Para qué sirve el apartado EQAVET?", a: "Sirve para integrar el ciclo de mejora continua europeo en tu programación. Lo encontrarás como un bloque dentro de Metodología. A final de curso, autoevalúas los indicadores de calidad y anotas tus propuestas de mejora para el próximo año." }
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
      { q: "¿Cómo paso lista o registro faltas de asistencia?", a: "En la sección de Seguimiento tienes la pestaña 'Asistencia'. Verás a todo tu alumnado y con un solo clic en su cuadrícula puedes alternar entre Falta, Retraso o Falta Justificada." },
      { q: "¿Cómo evalúo una tarea o examen concreto?", a: "Ve a la sección 'Calificaciones' > pestaña 'Matriz' para introducir notas enteras (1 al 10, sin decimales) cruzando Indicadores/Instrumentos con el alumnado." },
      { q: "¿Cómo se calcula exactamente la nota final del trimestre?", a: "El sistema cruza las calificaciones que pones en los Instrumentos con el peso del Indicador (Evaluación > bloque Indicadores), que a su vez alimenta el peso del Criterio de Evaluación (CE) y finalmente el Resultado de Aprendizaje (RA). Todo en tiempo real." }
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

// Sub-pestañas reales de cada página, por ruta base — usado por el Mapa web.
// Mantener sincronizado con el array TABS de cada page.tsx (no hay una fuente única
// de verdad todavía; si se añade/renombra una pestaña, actualizar aquí también).
const PAGE_TABS: Record<string, { id: string; label: string }[]> = {
  "/contexto": [
    { id: "presentacion", label: "Presentación" },
    { id: "entorno", label: "Entorno" },
    { id: "planes", label: "Planes" },
    { id: "procedimientos", label: "Procedimientos" },
  ],
  "/curriculo": [
    { id: "ponderacion-ra-ce", label: "Ponderación RA-CE" },
    { id: "tareas", label: "Tareas" },
    { id: "unidades", label: "Unidades (UD)" },
    { id: "relacion-ra-ud", label: "Relación RA-UD" },
    { id: "contribucion-og", label: "Contribución OG" },
  ],
  "/metodologia": [
    { id: "metodologia", label: "Metodología" },
    { id: "evaluacion", label: "Evaluación" },
    { id: "diversidad", label: "Diversidad" },
    { id: "contingencia", label: "Contingencia" },
    { id: "transversales", label: "Transversales" },
  ],
  "/instrumentos": [
    { id: "resumen", label: "Resumen" },
    { id: "tri1", label: "1º trimestre" },
    { id: "tri2", label: "2º trimestre" },
    { id: "tri3", label: "3º trimestre" },
  ],
  "/calendario": [
    { id: "fechas", label: "Fechas y horarios" },
    { id: "eventos", label: "Eventos y festivos" },
    { id: "actividades", label: "Actividades complementarias" },
    { id: "visual", label: "Calendario visual" },
  ],
  "/alumnado": [
    { id: "listado", label: "Listado" },
    { id: "plano", label: "Plano del aula" },
    { id: "contexto", label: "Contexto del grupo" },
  ],
  "/seguimiento": [
    { id: "clases", label: "Clases" },
    { id: "tutoria", label: "Tutoría" },
    { id: "asistencia", label: "Asistencia" },
    { id: "abandono", label: "Alerta abandono" },
  ],
  "/calificaciones": [
    { id: "resumen", label: "Resumen" },
    { id: "estadisticas", label: "Estadísticas" },
    { id: "matriz", label: "Matriz (Excel)" },
    { id: "detalle", label: "Por alumnado" },
    { id: "grupal", label: "Informe grupal" },
    { id: "individual", label: "Informe individual" },
  ],
  "/normativa": [
    { id: "ccaa", label: "CCAA" },
    { id: "bibliografia", label: "Bibliografía" },
    { id: "legislacion", label: "Legislación" },
    { id: "curriculos", label: "Currículos" },
  ],
  "/mejora": [
    { id: "eqavet", label: "EQAVET" },
    { id: "propuestas", label: "Propuestas" },
  ],
  "/archivos": [
    { id: "datos", label: "Datos" },
    { id: "nube", label: "Nube" },
    { id: "autores", label: "Autores" },
    { id: "seguridad", label: "Seguridad" },
    { id: "asistente-ia", label: "Asistente IA" },
  ],
  "/catalogo": [
    { id: "familias", label: "Familias" },
    { id: "titulos", label: "Títulos" },
    { id: "modulos", label: "Módulos" },
    { id: "ra-ce", label: "RA → CE" },
    { id: "ecp-incual", label: "ECP INCUAL" },
  ],
  "/magia": [
    { id: "programacion", label: "Generar programación" },
    { id: "guia", label: "Guía PD" },
    { id: "comparativa", label: "Comparativa" },
    { id: "utilidades", label: "Utilidades" },
    { id: "curso", label: "Curso" },
  ],
};

// ── Página Principal ──────────────────────────────────────────────────────
export default function InicioPage() {
  const { moduleData, cursoData, globalData, activeModuleId, activeCursoId } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>("bienvenida");
  const { t } = useTranslation();
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [guiaContent, setGuiaContent] = useState<string>("");
  const [isLoadingGuia, setIsLoadingGuia] = useState(false);
  const [ideasContent, setIdeasContent] = useState<string>("");
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (activeTab === "ideas" && !ideasContent && !isLoadingIdeas) {
      setIsLoadingIdeas(true);
      fetch('/Ideas.md')
        .then(res => res.text())
        .then(text => {
          setIdeasContent(text);
          setIsLoadingIdeas(false);
        })
        .catch(err => {
          console.error(err);
          setIdeasContent("Error cargando las ideas.");
          setIsLoadingIdeas(false);
        });
    }
  }, [activeTab, ideasContent, isLoadingIdeas]);

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
    { id: "guia", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.guia')}</>, cleanLabel: t('tabs.guia') },
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.faq')}</>, cleanLabel: t('tabs.faq') },
    { id: "acronimos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Acrónimos</>, cleanLabel: "Acrónimos" },
    { id: "mapa", label: <><span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> Mapa web</>, cleanLabel: "Mapa web" },
    { id: "contribuciones", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> Contribuciones</>, cleanLabel: "Contribuciones" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    bienvenida: 'Panel de control de acceso rápido a todas las herramientas.',
    verificacion: 'Panel de salud y coherencia de los datos de tu cuaderno.',
    guia: 'Manuales y guías paso a paso para configurar tu entorno.',
    faq: 'Respuestas a las preguntas más frecuentes del profesorado.',
    acronimos: 'Glosario de siglas, acrónimos y conceptos de Formación Profesional.',
    mapa: 'Esquema jerárquico de todas las secciones y utilidades de la aplicación.',
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

            {/* ── CONTENIDO: GUÍA PASO A PASO ───────────────────────────── */}
            {activeTab === "guia" && (
              <div className="space-y-6 animate-in fade-in duration-500 w-full">
                
                {/* Secuencia Lógica Propuesta */}
                <Card glow className="p-8 mb-6">
                  <div className="space-y-4">
                  <h2 className="text-subheading font-bold text-foreground flex items-center gap-3">
                    <Layers className="w-6 h-6 text-accent" /> Secuencia natural de la programación (PD+ / JEG)
                  </h2>
                  <p className="text-muted text-body pb-4 border-b border-[var(--glass-border)]">
                    Los 9 pasos siguen el propio índice del documento oficial que genera Magia (modelo PD+/JEG,
                    CIFPA — el más completo de los tres). El modelo pd= (BOA Aragón) y pd- (mínima) usan un
                    subconjunto de estos mismos datos, así que rellenarlos en este orden también los deja listos.
                    Cada apartado enlaza directamente a la pestaña donde se rellena.
                  </p>

                  {/* Contenedor del Diagrama */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

                    {/* Paso 1 */}
                    <Card className="p-4 bg-accent/5 border border-accent/20 shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-accent/50 group-hover:bg-accent transition-colors"></div>
                      <h3 className="font-bold text-accent mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-caption">1</span> Identificación y contexto
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 1 del PD+: identificación, marco normativo y contextualización.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/contexto?tab=presentacion" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-accent/70 shrink-0"/>Identificación del módulo</Link></li>
                        <li><Link href="/contexto?tab=entorno" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-accent/70 shrink-0"/>Contextualización (geo/socio/escolar)</Link></li>
                        <li><Link href="/alumnado?tab=contexto" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-accent/70 shrink-0"/>Características del alumnado</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 2 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">2</span> Desarrollo curricular
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 2: RA, CE, contenidos y unidades didácticas.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/curriculo?tab=ponderacion-ra-ce" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>RA y CE (ponderación)</Link></li>
                        <li><Link href="/curriculo?tab=unidades" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Unidades didácticas (UD)</Link></li>
                        <li><Link href="/curriculo?tab=relacion-ra-ud" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Relación RA-UD</Link></li>
                        <li><Link href="/curriculo?tab=contribucion-og" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Contribución a los OG</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 3 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">3</span> FEOE / FP Dual
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 2.9: formación en empresa u organismo equiparado.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/contexto?tab=planes" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Organización y seguimiento FEOE</Link></li>
                        <li><Link href="/curriculo?tab=ponderacion-ra-ce" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>RA marcados como dualizables</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 4 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">4</span> Metodología didáctica
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 3: principios, estrategias, recursos y agrupamientos.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/metodologia?tab=metodologia" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Principios, estrategias y ABP/ABR</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 5 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">5</span> Evaluación y calificación
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 4: instrumentos, criterios de calificación y ponderación.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/contexto?tab=procedimientos" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Procedimiento de evaluación</Link></li>
                        <li><Link href="/instrumentos?tab=resumen" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Instrumentos e indicadores</Link></li>
                        <li><Link href="/calificaciones?tab=matriz" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Matriz de calificaciones</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 6 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">6</span> Inclusión
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 5: medidas de respuesta educativa para la inclusión.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/metodologia?tab=diversidad" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Medidas de inclusión y ACNEAE</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 7 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">7</span> Actividades complementarias
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 6: actividades complementarias y extraescolares.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/calendario?tab=actividades" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Actividades complementarias</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 8 */}
                    <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                      <h3 className="font-bold text-foreground mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-caption">8</span> Contingencia y publicidad
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Cap. 7-8: plan de contingencia y publicidad de la programación.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/metodologia?tab=contingencia" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Plan de contingencia</Link></li>
                        <li><Link href="/contexto?tab=entorno" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-foreground/40 shrink-0"/>Bibliografía y publicidad</Link></li>
                      </ul>
                    </Card>

                    {/* Paso 9 */}
                    <Card className="p-4 bg-success/5 border border-success/20 shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-success/50 group-hover:bg-success transition-colors"></div>
                      <h3 className="font-bold text-success mb-1 text-body flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-caption">9</span> Magia: generar el documento
                      </h3>
                      <p className="text-caption text-muted/60 mb-3">Comprueba antes en Inicio → Verificación que todo esté listo.</p>
                      <ul className="text-caption text-muted/80 space-y-2 font-medium">
                        <li><Link href="/magia?tab=programacion" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-success/70 shrink-0"/>Generar PD+ (JEG), pd= (BOA) o pd-</Link></li>
                        <li><Link href="/inicio?tab=verificacion" className="flex items-center gap-1.5 hover:text-accent transition-colors"><Check className="w-3.5 h-3.5 text-success/70 shrink-0"/>Verificar antes de generar</Link></li>
                      </ul>
                    </Card>

                  </div>
                </div>
              </Card>

                <Card glow className="p-8">
                  {isLoadingGuia && !guiaContent ? (
                    <div className="flex justify-center p-8 text-muted">Cargando guía...</div>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-heading font-extrabold text-foreground mb-6 pb-2 border-b border-white/10" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-subheading font-bold text-accent mt-8 mb-4 flex items-center gap-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-subheading font-bold text-foreground mt-6 mb-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-muted leading-relaxed mb-4" {...props} />,
                          ul: ({node, className, ...props}) => <ul className={`list-none space-y-3 mb-6 ml-4 ${className || ''}`} {...props} />,
                          ol: ({node, className, ...props}: any) => <ol className={`list-decimal space-y-3 mb-6 ml-6 ${className || ''}`} {...props} />,
                          li: ({node, ...props}) => <li className="text-body text-muted leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                          a: ({node, ...props}) => <a className="text-accent hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
                          code: ({node, ...props}: any) => <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-body font-mono" {...props} />,
                          pre: ({node, ...props}: any) => <pre className="block bg-foreground/5 p-4 rounded-xl text-body font-mono overflow-x-auto mb-4 border border-white/5 text-muted" {...props} />,
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
                    <h2 className="text-subheading font-bold mb-4 text-accent border-b border-white/5 pb-2">
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

            {/* ── CONTENIDO: ACRONIMOS ──────────────────────────────────────── */}
            {activeTab === "acronimos" && (
              <div className="animate-in fade-in duration-500 w-full">
                <TabAcronimos />
              </div>
            )}

            {/* ── CONTENIDO: MAPA WEB ──────────────────────────────────────── */}
            {activeTab === "mapa" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <section className="space-y-3">
                  <h2 className="text-subheading font-bold text-foreground border-b border-[var(--glass-border)] pb-2">
                    Mapa de la aplicación (sitemap)
                  </h2>
                  <p className="text-body text-foreground/80 leading-relaxed">
                    Estructura organizativa de Cuaderno FP. Se genera a partir de la configuración real de
                    navegación (<code className="text-caption bg-foreground/10 px-1 rounded">config/navigation.ts</code>),
                    así que no puede quedarse desactualizado como su versión anterior.
                  </p>
                  <div className="bg-info/5 border border-info/20 rounded-xl p-4 text-body text-muted leading-relaxed">
                    <strong className="text-foreground">¿Es adecuado el agrupamiento actual?</strong> En general
                    sí: separa con claridad lo reutilizable (<em>Programación</em>: Contexto/Currículo/
                    Metodología/Instrumentos), lo específico del año (<em>Curso</em>: Calendario/Alumnado/
                    Seguimiento/Calificaciones) y lo transversal (<em>Grupo</em>: Archivos/Catálogo/Magia — Magia
                    genera documentos a partir de ambos, por eso no encaja solo en uno de los dos anteriores).
                    La única costura visible es <em>Normativa</em> dentro de <em>Anexos</em>: es una tabla de
                    consulta como Catálogo, no un "anexo" de la programación — encajaría igual de bien en
                    <em> Grupo</em>. <em>Mejora</em> (EQAVET) sí es un anexo genuino: es la reflexión de cierre de
                    curso, no algo que se rellene mientras se programa.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                    {/* GENERAL: páginas fuera de navGroups */}
                    <div className="space-y-6">
                      <h3 className="font-extrabold text-subheading border-b-2 border-accent pb-2 text-foreground">General</h3>
                      <ul className="space-y-4 text-body">
                        {[
                          { href: "/inicio", label: "Inicio", tabs: TABS.map(t => ({ id: t.id, label: t.cleanLabel })) },
                          { href: "/agenda", label: "Agenda", tabs: [{ id: "actual", label: "Actual" }, { id: "planificacion", label: "Planificación" }] },
                          { href: "/informes", label: "Informes", tabs: [{ id: "curso", label: "Curso" }] },
                          { href: "/legal", label: "Legal", tabs: [{ id: "aviso", label: "Aviso legal" }, { id: "privacidad", label: "Privacidad" }, { id: "cookies", label: "Cookies" }, { id: "accesibilidad", label: "Accesibilidad" }] },
                        ].map(page => (
                          <li key={page.href}>
                            <Link href={page.href} className="text-foreground hover:text-accent font-bold flex items-center gap-2 transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> {page.label}
                            </Link>
                            <div className="pl-5 mt-1.5 grid grid-cols-1 gap-1 text-muted border-l-2 border-[var(--glass-border)] ml-1">
                              {page.tabs.map(tab => (
                                <Link key={tab.id} href={`${page.href}?tab=${tab.id}`} className="hover:text-accent transition-colors block py-0.5">— {tab.label}</Link>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Columnas dinámicas: una por cada grupo real de navigation.ts */}
                    {navGroups.map(group => (
                      <div key={group.title} className="space-y-6">
                        <h3 className="font-extrabold text-subheading border-b-2 border-accent pb-2 text-foreground">
                          {group.title.replace(/\s*\[.*\]$/, '')}
                        </h3>
                        <ul className="space-y-4 text-body">
                          {group.items.map(item => {
                            const basePath = item.href.split('?')[0];
                            const tabs = PAGE_TABS[basePath] || [];
                            return (
                              <li key={item.href}>
                                <Link href={basePath} className="text-foreground hover:text-accent font-bold flex items-center gap-2 transition-colors">
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> {item.label}
                                </Link>
                                {tabs.length > 0 && (
                                  <div className="pl-5 mt-1.5 grid grid-cols-1 gap-1 text-muted border-l-2 border-[var(--glass-border)] ml-1">
                                    {tabs.map(tab => (
                                      <Link key={tab.id} href={`${basePath}?tab=${tab.id}`} className="hover:text-accent transition-colors block py-0.5">— {tab.label}</Link>
                                    ))}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
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

