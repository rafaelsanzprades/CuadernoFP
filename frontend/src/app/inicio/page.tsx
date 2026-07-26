"use client";
import { Activity, AlertTriangle, ArrowRight, BarChart2, BookOpen, Briefcase, Building2, CalendarDays, Check, CheckCircle, ClipboardList, FileText, GraduationCap, HeartHandshake, Layers, Users, Wrench, XCircle, ChevronDown, Mail, Send, ListChecks, Info, Shield, Lock, Lightbulb } from "lucide-react";
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
import { useMounted } from "@/hooks/useMounted";
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

// ── Página Principal ──────────────────────────────────────────────────────
export default function InicioPage() {
  const { moduleData, cursoData, globalData, activeModuleId, activeCursoId } = useAppStore();
  const isMounted = useMounted();
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



  const TABS = [
    { id: "bienvenida", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.bienvenida')}</>, cleanLabel: t('tabs.bienvenida') },
    { id: "guia", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.guia')}</>, cleanLabel: t('tabs.guia') },
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.faq')}</>, cleanLabel: t('tabs.faq') },
    { id: "acronimos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Acrónimos</>, cleanLabel: "Acrónimos" },
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
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-accent" /> {t('inicio.title')}
              </h1>
              <p className="text-muted mt-2 text-sm">{t('inicio.subtitle')}</p>
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
          'guia': {
                    'title': 'Guía',
                    'desc': 'Manuales y guías paso a paso para configurar tu entorno.'
          },
          'faq': {
                    'title': 'FAQ',
                    'desc': 'Respuestas a las preguntas más frecuentes de el profesorado.'
          },
          'acronimos': {
                    'title': 'Acrónimos',
                    'desc': 'Glosario de siglas, acrónimos y conceptos de Formación Profesional.'
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

            {/* Secuencia Lógica Propuesta */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                <Layers className="w-6 h-6 text-accent" /> Secuencia Lógica de Programación
              </h2>
              <p className="text-muted text-sm pb-4 border-b border-[var(--glass-border)]">
                Flujo de trabajo estructurado basado en la Programación Didáctica oficial. Avanza de izquierda a derecha para completar el diseño del módulo.
              </p>
              
              {/* Contenedor del Diagrama */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
                
                {/* Paso 1 */}
                <Card className="p-4 bg-accent/5 border border-accent/20 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent/50 group-hover:bg-accent transition-colors"></div>
                  <h3 className="font-bold text-accent mb-3 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-xs">1</span> Contexto
                  </h3>
                  <ul className="text-xs text-muted/80 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-accent/70 shrink-0"/>Identificación</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-accent/70 shrink-0"/>Contexto del Aula</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-accent/70 shrink-0"/>Planes y Contingencia</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-accent/70 shrink-0"/>Inclusión y Diversidad</li>
                  </ul>
                </Card>

                {/* Paso 2 */}
                <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                  <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs">2</span> Currículo
                  </h3>
                  <ul className="text-xs text-muted/80 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>RA y CE</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Definición UDs</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Relación RA-UD</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Contribuciones (OG)</li>
                  </ul>
                </Card>

                {/* Paso 3 */}
                <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                  <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs">3</span> Metodología
                  </h3>
                  <ul className="text-xs text-muted/80 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Principios/Estrategias</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Materiales/Recursos</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Empresa / FEOE</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Calidad EQAVET</li>
                  </ul>
                </Card>

                {/* Paso 4 */}
                <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                  <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs">4</span> Evaluación
                  </h3>
                  <ul className="text-xs text-muted/80 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Instrumentos</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Indicadores/Rúbricas</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Normativa</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Ponderación</li>
                  </ul>
                </Card>

                {/* Paso 5 */}
                <Card className="p-4 bg-foreground/5 border border-[var(--glass-border)] shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-foreground/20 group-hover:bg-foreground/50 transition-colors"></div>
                  <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-xs">5</span> Aula
                  </h3>
                  <ul className="text-xs text-muted/80 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Temporalización (Gantt)</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Desarrollo de UDs</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Tareas</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-foreground/40 shrink-0"/>Calendario</li>
                  </ul>
                </Card>

                {/* Paso 6 */}
                <Card className="p-4 bg-success/5 border border-success/20 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-success/50 group-hover:bg-success transition-colors"></div>
                  <h3 className="font-bold text-success mb-3 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-xs">6</span> Magia
                  </h3>
                  <ul className="text-xs text-muted/80 space-y-2 font-medium">
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-success/70 shrink-0"/>Generación PDF</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-success/70 shrink-0"/>Guía para Defensa</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-success/70 shrink-0"/>Comparativa</li>
                    <li className="flex items-start gap-1.5"><Check className="w-3.5 h-3.5 mt-0.5 text-success/70 shrink-0"/>Publicidad (Burocracia)</li>
                  </ul>
                </Card>

              </div>
            </div>


            {/* Menus Grid */}
            <div className="space-y-12">
              {navGroups.map((group, groupIdx) => (
                <MotionWrapper key={group.title} delay={groupIdx * 0.1}>
                  <div className="space-y-3">
                    {group.title !== 'General' && (
                      <>
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
                          {group.title.includes('[Código del módulo]') ? (
                            isMounted && activeModuleId ? (
                              <>Programación <span className="text-accent">{activeModuleId.split('-')[0]} {moduleData?.info_modulo?.acronym || ''}</span></>
                            ) : (
                              group.title
                            )
                          ) : group.title.includes('[Año]') ? (
                            isMounted && activeCursoId ? (
                              <>Curso <span className="text-accent">{activeCursoId}</span></>
                            ) : (
                              group.title
                            )
                          ) : (
                            group.title
                          )}
                        </h2>
                        {group.sectionDescription && (
                          <p className="text-muted text-sm max-w-4xl pb-4 border-b border-[var(--glass-border)]">
                            {group.sectionDescription}
                          </p>
                        )}
                      </>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map((item, itemIdx) => (
                        <Link key={item.href} href={item.href} className="block group">
                          <Card className="h-full p-5 flex flex-col gap-3 border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-accent/5 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="w-8 h-8" strokeWidth={1.5} />
                              </div>
                              <h3 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors leading-tight">
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
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-accent mt-8 mb-4 flex items-center gap-2" {...props} />,
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
                    <h2 className="text-lg font-bold mb-4 text-accent border-b border-white/5 pb-2">
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

            </MotionWrapper>
        </div>
      </div>
    </div>
      );
}

