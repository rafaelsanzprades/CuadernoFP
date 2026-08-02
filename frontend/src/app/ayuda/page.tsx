"use client";
import { BookOpen, Info, Map, Layers, Check, ChevronDown } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { navGroups } from "@/config/navigation";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { TabSync } from "@/components/ui/TabSync";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { TabAcronimos } from "@/components/features/catalogo/TabAcronimos";

// ── Mapa de pestañas por página real (misma fuente que usaba /inicio) ──────
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
  "/ayuda": [
    { id: "guia", label: "Guía" },
    { id: "faq", label: "FAQ" },
    { id: "acronimos", label: "Acrónimos" },
    { id: "mapa", label: "Mapa web" },
  ],
  "/legal": [
    { id: "aviso", label: "Aviso legal" },
    { id: "privacidad", label: "Privacidad" },
    { id: "cookies", label: "Cookies" },
    { id: "accesibilidad", label: "Accesibilidad" },
  ],
};

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
      { q: "¿Puedo generar boletines automáticos para los alumnos?", a: "Sí. Desde la pestaña 'Curso' de Magia puedes generar boletines en PDF masivos para toda la clase o resúmenes individuales hiperdetallados que justifican la nota en base a cada Criterio de Evaluación conseguido." }
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

export default function AyudaPage() {
  const [activeTab, setActiveTab] = useState<string>("guia");
  const [guiaContent, setGuiaContent] = useState<string>("");
  const [isLoadingGuia, setIsLoadingGuia] = useState(false);

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

  const TABS = [
    { id: "guia", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Guía</>, cleanLabel: "Guía" },
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> FAQ</>, cleanLabel: "FAQ" },
    { id: "acronimos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> Acrónimos</>, cleanLabel: "Acrónimos" },
    { id: "mapa", label: <><span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> Mapa web</>, cleanLabel: "Mapa web" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    guia: 'Manuales y guías paso a paso para configurar tu entorno.',
    faq: 'Respuestas a las preguntas más frecuentes del profesorado.',
    acronimos: 'Glosario de siglas, acrónimos y conceptos de Formación Profesional.',
    mapa: 'Esquema jerárquico de todas las secciones y utilidades de la aplicación.',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">

            <PageHeader icon={Info} title="Ayuda" description="Guías, preguntas frecuentes, glosario y mapa de la aplicación." />

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
                    <strong className="text-foreground">¿Es adecuado el agrupamiento actual?</strong> Sí: separa
                    con claridad lo reutilizable (<em>Programación</em>: Contexto/Currículo/Metodología/
                    Instrumentos), lo específico del año (<em>Curso</em>: Calendario/Alumnado/Seguimiento/
                    Calificaciones), lo transversal (<em>Grupo</em>: Archivos/Catálogo/Normativa/Magia — datos
                    de consulta y generación de documentos) y el cierre/consulta (<em>Anexos</em>: Mejora/Ayuda/
                    Legal — reflexión de calidad, documentación y aspectos legales, nada que se rellene mientras
                    se programa).
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                    {/* GENERAL: páginas fuera de navGroups */}
                    <div className="space-y-6">
                      <h3 className="font-extrabold text-subheading border-b-2 border-accent pb-2 text-foreground">General</h3>
                      <ul className="space-y-4 text-body">
                        {[
                          { href: "/inicio", label: "Inicio", tabs: [{ id: "bienvenida", label: "Bienvenida" }, { id: "verificacion", label: "Verificación" }, { id: "contribuciones", label: "Contribuciones" }] },
                          { href: "/agenda", label: "Agenda", tabs: [{ id: "actual", label: "Actual" }, { id: "planificacion", label: "Planificación" }] },
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

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
