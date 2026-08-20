"use client";
import { BookOpen, Info, Map, ChevronDown } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { navGroups } from "@/config/navigation";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { TabSync } from "@/components/ui/TabSync";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { TabAcronimos } from "@/components/features/catalogo/TabAcronimos";
import { TabDocumentos } from "@/components/features/ayuda/TabDocumentos";

// ── Mapa de pestañas por página real (misma fuente que usaba /inicio) ──────
const PAGE_TABS: Record<string, { id: string; label: string }[]> = {
  "/inicio": [
    { id: "bienvenida", label: "Bienvenida" },
    { id: "verificacion", label: "Verificación" },
    { id: "contribuciones", label: "Contribuciones" },
    { id: "mejora", label: "Mejora" },
  ],
  "/contexto": [
    { id: "identificacion", label: "Identificación" },
    { id: "contextualizacion", label: "Contextualización" },
    { id: "dual", label: "Dual FEOE" },
    { id: "criterios", label: "Evaluación y calificación" },
  ],
  "/curriculo": [
    { id: "contribucion-ra-og", label: "Contribución RA en OG" },
    { id: "ponderacion-ra-ce", label: "Ponderación RA y CE" },
    { id: "unidades", label: "Unidades didácticas" },
    { id: "competenciales", label: "Tareas competenciales" },
  ],
  "/metodologia": [
    { id: "metodologia", label: "Metodología e inclusión" },
    { id: "recursos", label: "Recursos" },
    { id: "contingencia", label: "Plan de contingencia" },
    { id: "transversales", label: "Transversales, competencias y actividades" },
  ],
  "/instrumentos": [
    { id: "resumen", label: "Resumen" },
    { id: "tri1", label: "1er trimestre" },
    { id: "tri2", label: "2º trimestre" },
    { id: "tri3", label: "3er trimestre" },
  ],
  "/calendario": [
    { id: "fechas", label: "Fechas y horario" },
    { id: "feoe", label: "Periodo FEOE" },
    { id: "eventos", label: "Eventos y festivos" },
    { id: "actividades", label: "Actividades extraescolares" },
  ],
  "/agenda": [
    { id: "actual", label: "Actual" },
    { id: "planificacion", label: "Planificación" },
    { id: "progreso-ra-ud", label: "Previsión RA y UD" },
    { id: "mensual", label: "Mensual" },
  ],
  "/alumnado": [
    { id: "matricula", label: "Matrícula" },
    { id: "plano", label: "Plano de clase" },
    { id: "tutoria", label: "Tutoría y alertas" },
    { id: "perfil", label: "Perfil del grupo" },
  ],
  "/seguimiento": [
    { id: "clases", label: "Clases" },
    { id: "asistencia", label: "Asistencia" },
    { id: "progreso-ra-ud", label: "Progreso de RA y UD" },
    { id: "detalle", label: "Detalle por alumnado" },
  ],
  "/calificaciones": [
    { id: "resumen", label: "Resumen" },
    { id: "estadisticas", label: "Estadísticas" },
    { id: "grupal", label: "Grupal" },
    { id: "individual", label: "Individual" },
  ],
  "/normativa": [
    { id: "autonomias", label: "Autonomías" },
    { id: "bibliografia", label: "Bibliografía" },
    { id: "legislacion", label: "Legislación" },
    { id: "ecp-incual", label: "ECP INCUAL" },
  ],
  "/archivos": [
    { id: "datos", label: "Datos" },
    { id: "nube", label: "Nube" },
    { id: "seguridad", label: "Seguridad" },
    { id: "asistente-ia", label: "Asistente IA" },
  ],
  "/catalogo": [
    { id: "familias", label: "Familias" },
    { id: "titulos", label: "Títulos" },
    { id: "modulos", label: "Módulos" },
    { id: "ra-ce", label: "RA → CE" },
  ],
  "/magia": [
    { id: "comunidades", label: "Comunidades" },
    { id: "guia", label: "Guía" },
    { id: "programacion", label: "Programación" },
    { id: "curso", label: "Curso" },
  ],
  "/equivalencias": [
    { id: "comparativa", label: "Comparativa" },
    { id: "pd-", label: "APP → PD- (Resumen)" },
    { id: "pd=", label: "APP → PD= (Simplificada)" },
    { id: "pd+", label: "APP → PD+ (Detallada JEG)" },
  ],
  "/ayuda": [
    { id: "faq", label: "FAQ" },
    { id: "acronimos", label: "Acrónimos" },
    { id: "mapa", label: "Mapa web" },
    { id: "documentos", label: "Documentos" },
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
      { q: "¿Cómo configuro las horas que el alumnado pasa en la empresa (FP Dual)?", a: "En Programación > Contexto > pestaña 'Identificación', elige si tu régimen es Dual General, Dual Intensivo o Ninguno. Después, en Programación > Contexto > pestaña 'FEOE y régimen dual' describes cómo se organiza y se hace el seguimiento de esa formación en empresa. Para marcar qué Resultados de Aprendizaje concretos son duales, ve a Programación > Currículo > pestaña 'RA y CE'." },
      { q: "¿Para qué sirve el apartado EQAVET?", a: "Sirve para integrar el ciclo de mejora continua europeo en tu programación. Lo encontrarás en 'Inicio' > pestaña 'Mejora'. A final de curso, autoevalúas los indicadores de calidad y anotas tus propuestas de mejora para el próximo año. La rúbrica de autoevaluación docente sigue el modelo DOCENTIA de ANECA (ver aneca.es/docentia), adaptado a la práctica en FP." },
      { q: "¿Qué diferencia hay entre actividades complementarias y extraescolares?", a: "Son legalmente distintas: las complementarias son en horario lectivo, están ligadas al currículo y son evaluables — forman parte de tu programación didáctica. Las extraescolares son fuera de horario, voluntarias y nunca evaluables — van en la PGA del centro, no en la PD; en Metodología > Transversales puedes anotarlas igualmente como referencia, pero no cuentan en la programación." },
      { q: "¿Qué diferencia hay entre instrumento de evaluación e instrumento de calificación?", a: "Por cada Criterio de Evaluación (CE) hay dos cosas distintas: el instrumento de evaluación es la actividad que genera la evidencia (una prueba objetiva, una tarea, una defensa oral...), y el instrumento de calificación es lo que puntúa esa evidencia (una rúbrica, una escala, una lista de cotejo...). En Instrumentos puedes codificar ambos por separado al configurar cada instrumento." }
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
      { q: "¿Cómo se calcula la previsión de 'Planificación mensual'?", a: "Se calcula día a día con el calendario de festivos y el horario semanal que ya tienes registrados en la app — no es una estimación proporcional, es un cálculo exacto con esos datos. Cambiará si el calendario oficial del curso o la distribución definitiva del horario todavía no están completos." },
      { q: "¿Cómo paso lista o registro faltas de asistencia?", a: "En la sección de Seguimiento tienes la pestaña 'Asistencia'. Verás a todo tu alumnado y con un solo clic en su cuadrícula puedes alternar entre Falta, Retraso o Falta Justificada." },
      { q: "¿Cómo evalúo una tarea o examen concreto?", a: "Ve a la sección 'Seguimiento' > pestaña 'Detalle por alumnado' para introducir la nota de cada actividad, por alumno. La nota final se recalcula automáticamente a partir de los pesos de RA y CE." },
      { q: "¿Cómo se calcula exactamente la nota final del trimestre?", a: "El sistema cruza las calificaciones que pones en los Instrumentos con el peso del Indicador (Evaluación > bloque Indicadores), que a su vez alimenta el peso del Criterio de Evaluación (CE) y finalmente el Resultado de Aprendizaje (RA). Todo en tiempo real." },
      { q: "¿Qué significan los colores (morado, verde azulado, naranja) en la agenda y el calendario visual?", a: "Los colores del fondo indican el trimestre (evaluación) al que pertenece cada actividad o fecha: 1er trimestre (morado/malva), 2º trimestre (teal/verde azulado) y 3er trimestre (naranja/ámbar) — deliberadamente sin rojo ni azul, esos tonos están reservados a Festivo y Evento." }
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("faq");

  const TABS = [
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.faq.label', {defaultValue: 'FAQ'})}</>, cleanLabel: t('tabs.ayuda.faq.label', {defaultValue: 'FAQ'}) },
    { id: "acronimos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.acronimos.label', {defaultValue: 'Acrónimos'})}</>, cleanLabel: t('tabs.ayuda.acronimos.label', {defaultValue: 'Acrónimos'}) },
    { id: "mapa", label: <><span className="inline-flex"><Map className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.mapa.label', {defaultValue: 'Mapa web'})}</>, cleanLabel: t('tabs.ayuda.mapa.label', {defaultValue: 'Mapa web'}) },
    { id: "documentos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.documentos.label', {defaultValue: 'Documentos'})}</>, cleanLabel: t('tabs.ayuda.documentos.label', {defaultValue: 'Documentos'}) },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    faq: t('tabs.ayuda.faq.desc', {defaultValue: 'Respuestas a las preguntas más frecuentes del profesorado.'}),
    acronimos: t('tabs.ayuda.acronimos.desc', {defaultValue: 'Glosario de siglas, acrónimos y conceptos de Formación Profesional.'}),
    mapa: t('tabs.ayuda.mapa.desc', {defaultValue: 'Esquema jerárquico de todas las secciones y utilidades de la aplicación.'}),
    documentos: t('tabs.ayuda.documentos.desc', {defaultValue: 'Disposiciones normativas que fijan las enseñanzas mínimas de cada título.'})
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">

            <PageHeader icon={Info} title={t('nav.ayuda', { defaultValue: 'Ayuda' })} description={t('pages.ayuda_desc', { defaultValue: 'Guías, preguntas frecuentes, glosario y mapa de la aplicación.' })} />

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
                    Calificaciones) y lo transversal (<em>Grupo</em>: Agenda/Archivo/Normativa/Catálogo — vista
                    diaria y datos de consulta). Ayuda, Equivalencia y MagIA viven como accesos directos junto
                    a Inicio (fuera de estos tres grupos, de consulta puntual) y Mejora se fusionó como pestaña
                    dentro de Inicio.
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                    {/* Cuaderno FP: páginas fuera de navGroups */}
                    <div className="space-y-6">
                      <h3 className="font-extrabold text-subheading border-b-2 border-accent pb-2 text-foreground">Cuaderno FP</h3>
                      <ul className="space-y-4 text-body">
                        {[
                          { href: "/inicio", label: "Inicio", tabs: PAGE_TABS["/inicio"] },
                          { href: "/ayuda", label: "Ayuda", tabs: PAGE_TABS["/ayuda"] },
                          { href: "/equivalencias", label: "Equivalencia", tabs: PAGE_TABS["/equivalencias"] },
                          { href: "/magia", label: "MagIA", tabs: PAGE_TABS["/magia"] },
                          { href: "/legal", label: "Legal", tabs: PAGE_TABS["/legal"] },
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
                                      <Link key={tab.id} href={`${basePath}?tab=${tab.id}`} className="hover:text-accent transition-colors block py-0.5">— {t(`checks.ayuda.mapa_${basePath.slice(1)}_${tab.id.replace(/[^a-z0-9]/gi, '_')}`, {defaultValue: tab.label})}</Link>
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

            {/* ── CONTENIDO: DOCUMENTOS ────────────────────────────────────── */}
            {activeTab === "documentos" && (
              <TabDocumentos />
            )}

          </MotionWrapper>
        </div>
      </div>
    </div>
  );
}
