"use client";
import { BookOpen, ChevronDown, Compass, Info, MessageCircle, Map, Send, Users } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Button } from "@/components/ui/Button";
import { TabSync } from "@/components/ui/TabSync";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { StickyPageHeader } from "@/components/ui/StickyPageHeader";
import { TabInfoBox } from "@/components/ui/TabInfoBox";
import { TabAcronimos } from "@/components/features/catalogo/TabAcronimos";
import { GuiaTab } from "@/components/features/ayuda/GuiaTab";
import { useOnboardingTour } from "@/components/features/onboarding/TourGuide";

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

const getFaqs = (t: (key: string, opts?: any) => string) => [
  {
    group: t('campos.ayuda.faq.grupo1.titulo', {defaultValue: '1. Conceptos previos y seguridad'}),
    items: [
      { q: t('campos.ayuda.faq.grupo1.q1', {defaultValue: '¿Qué es la arquitectura Híbrida (Local-First + Cloud)?'}), a: t('campos.ayuda.faq.grupo1.a1', {defaultValue: 'Se utiliza una arquitectura moderna. Tus datos de trabajo (alumnado, notas) se procesan localmente en tu navegador, garantizando total privacidad y velocidad. Las operaciones pesadas (generación de informes PDF o conexión con Inteligencia Artificial) se apoyan de forma segura en un servidor central.'}) },
      { q: t('campos.ayuda.faq.grupo1.q2', {defaultValue: '¿Dónde se guardan mis datos?'}), a: t('campos.ayuda.faq.grupo1.a2', {defaultValue: 'Los datos de tu Programación y tus Cursos residen en tu propio navegador (IndexedDB). Tú tienes el control absoluto sobre ellos. Por seguridad, se recomienda usar frecuentemente la exportación de archivos (BYOC) desde la pestaña Archivos.'}) },
      { q: t('campos.ayuda.faq.grupo1.q3', {defaultValue: "¿Qué diferencia hay entre 'Programación' y 'Curso'?"}), a: t('campos.ayuda.faq.grupo1.a3', {defaultValue: "Es un concepto vital: La 'Programación' es tu molde teórico; contiene la ley pura (Resultados de aprendizaje, Criterios de evaluación) y tus Unidades didácticas (reutilizable año tras año). El 'Curso' es la instancia real; representa a un grupo concreto de alumnado de carne y hueso en un año escolar específico, con sus notas y ausencias."}) },
      { q: t('campos.ayuda.faq.grupo1.q4', {defaultValue: '¿Qué pasa si borro los datos o la caché de mi navegador?'}), a: t('campos.ayuda.faq.grupo1.a4', {defaultValue: "Si borras la caché profunda del navegador sin haber exportado tus datos previamente, perderás tu trabajo. Por eso es vital usar el botón de 'Exportar' tu progreso a un archivo .json periódicamente para mantener copias de seguridad locales."}) },
      { q: t('campos.ayuda.faq.grupo1.q5', {defaultValue: '¿Puedo trabajar desde varios ordenadores?'}), a: t('campos.ayuda.faq.grupo1.a5', {defaultValue: "Sí. Para transferir tu entorno entre el ordenador del instituto y tu portátil personal, solo tienes que 'Exportar' tu progreso en el ordenador A y darle a 'Importar' en el ordenador B."}) }
    ]
  },
  {
    group: t('campos.ayuda.faq.grupo2.titulo', {defaultValue: '2. Paso 1: La programación didáctica'}),
    items: [
      { q: t('campos.ayuda.faq.grupo2.q1', {defaultValue: '¿Tengo que meter a mano todos los RA y CE del BOE?'}), a: t('campos.ayuda.faq.grupo2.a1', {defaultValue: '¡No! El sistema cuenta con un Catálogo oficial que importa automáticamente la normativa legal (Resultados de aprendizaje y Criterios) de tu módulo. Solo tienes que elegir tu Grado y tu Ciclo Formativo en la sección inicial de Catálogo y el sistema lo hace por ti.'}) },
      { q: t('campos.ayuda.faq.grupo2.q2', {defaultValue: '¿Qué significa que los RA no suman 100% en las verificaciones?'}), a: t('campos.ayuda.faq.grupo2.a2', {defaultValue: "Para que la evaluación continua matemática funcione, cada Resultado de Aprendizaje (RA) debe tener un 'peso' o importancia. La suma total de los pesos de todos los RA de un módulo debe ser exactamente 100%. Debes ajustar esto en Programación > Currículo > pestaña 'RA y CE'."}) },
      { q: t('campos.ayuda.faq.grupo2.q3', {defaultValue: '¿Cómo configuro las horas que el alumnado pasa en la empresa (FP Dual)?'}), a: t('campos.ayuda.faq.grupo2.a3', {defaultValue: "En Programación > Contexto > pestaña 'Identificación', elige si tu régimen es Dual General, Dual Intensivo o Ninguno. Después, en Programación > Contexto > pestaña 'FEOE y régimen dual' describes cómo se organiza y se hace el seguimiento de esa formación en empresa. Para marcar qué Resultados de Aprendizaje concretos son duales, ve a Programación > Currículo > pestaña 'RA y CE'."}) },
      { q: t('campos.ayuda.faq.grupo2.q4', {defaultValue: '¿Para qué sirve el apartado EQAVET?'}), a: t('campos.ayuda.faq.grupo2.a4', {defaultValue: "Sirve para integrar el ciclo de mejora continua europeo en tu programación. Lo encontrarás en 'Calificación' > pestaña 'Mejora'. A final de curso, autoevalúas los indicadores de calidad y anotas tus propuestas de mejora para el próximo año. La rúbrica de autoevaluación docente sigue el modelo DOCENTIA de ANECA (ver aneca.es/docentia), adaptado a la práctica en FP."}) },
      { q: t('campos.ayuda.faq.grupo2.q5', {defaultValue: '¿Qué diferencia hay entre actividades complementarias y extraescolares?'}), a: t('campos.ayuda.faq.grupo2.a5', {defaultValue: 'Son legalmente distintas: las complementarias son en horario lectivo, están ligadas al currículo y son evaluables — forman parte de tu programación didáctica. Las extraescolares son fuera de horario, voluntarias y nunca evaluables — van en la PGA del centro, no en la PD; en Metodología > Transversales puedes anotarlas igualmente como referencia, pero no cuentan en la programación.'}) },
      { q: t('campos.ayuda.faq.grupo2.q6', {defaultValue: '¿Qué diferencia hay entre instrumento de evaluación e instrumento de calificación?'}), a: t('campos.ayuda.faq.grupo2.a6', {defaultValue: 'Por cada Criterio de Evaluación (CE) hay dos cosas distintas: el instrumento de evaluación es la actividad que genera la evidencia (una prueba objetiva, una tarea, una defensa oral...), y el instrumento de calificación es lo que puntúa esa evidencia (una rúbrica, una escala, una lista de cotejo...). En Instrumentos puedes codificar ambos por separado al configurar cada instrumento.'}) }
    ]
  },
  {
    group: t('campos.ayuda.faq.grupo3.titulo', {defaultValue: '3. Paso 3: Creación del curso y alumnado'}),
    items: [
      { q: t('campos.ayuda.faq.grupo3.q1', {defaultValue: '¿Puedo importar alumnado desde plataformas como Seneca, Rayuela o un Excel?'}), a: t('campos.ayuda.faq.grupo3.a1', {defaultValue: "Sí. En la sección de 'Alumnado' puedes importar un archivo CSV (Excel) con tu lista de clase. Alternativamente, la tabla inteligente te permite copiar y pegar celdas masivamente, igual que si fuera una hoja de cálculo."}) },
      { q: t('campos.ayuda.faq.grupo3.q2', {defaultValue: '¿Qué nivel de seguridad tienen los datos de mi alumnado?'}), a: t('campos.ayuda.faq.grupo3.a2', {defaultValue: "Tus archivos locales no salen nunca hacia nuestro servidor si no quieres (usando 'Guardar en Local'). Si eliges guardarlos en Google Drive o OneDrive, el archivo es transmitido directamente entre tu navegador y los servidores de Microsoft/Google. Puedes activar el cifrado local para que el archivo sea absolutamente ilegible sin tu clave maestra."}) },
      { q: t('campos.ayuda.faq.grupo3.q3', {defaultValue: '¿Está la aplicación protegida contra hackeos o caídas?'}), a: t('campos.ayuda.faq.grupo3.a3', {defaultValue: "Sí. El frontend incluye una Política de Seguridad de Contenido (CSP) que bloquea ataques de inyección de código (XSS) para proteger tus datos locales. Además, nuestro servidor cuenta con 'Rate Limiting' (limitación de peticiones) que previene ataques de denegación de servicio (DDoS) para garantizar que los catálogos oficiales siempre estén disponibles cuando los necesites."}) },
      { q: t('campos.ayuda.faq.grupo3.q4', {defaultValue: '¿Cómo distribuyo físicamente al alumnado en el aula?'}), a: t('campos.ayuda.faq.grupo3.a4', {defaultValue: "Dentro de 'Alumnado' encontrarás una pestaña de 'Plano de clase'. Es una pizarra visual e interactiva donde puedes arrastrar y soltar a los estudiantes a sus respectivos pupitres para tener el diseño exacto de tu clase."}) },
      { q: t('campos.ayuda.faq.grupo3.q5', {defaultValue: '¿Cómo uso el sistema de Alertas de Abandono?'}), a: t('campos.ayuda.faq.grupo3.a5', {defaultValue: 'El panel de prevención temprana te permite registrar llamadas a las familias, partes disciplinarios o derivaciones al departamento de orientación para alumnado con riesgo de abandono escolar.'}) }
    ]
  },
  {
    group: t('campos.ayuda.faq.grupo4.titulo', {defaultValue: '4. Paso 5: El día a día y la evaluación'}),
    items: [
      { q: t('campos.ayuda.faq.grupo4.q1', {defaultValue: "¿Qué es el 'Diario de aula'?"}), a: t('campos.ayuda.faq.grupo4.a1', {defaultValue: "Es tu cuaderno de bitácora diario. Te permite anotar lo que ocurre en cada sesión real de clase: qué UD has impartido, si ha habido incidencias o marcar días 'Sin docencia' (como huelgas o claustros) para que no cuenten en tu progreso."}) },
      { q: t('campos.ayuda.faq.grupo4.q2', {defaultValue: "¿Cómo se calcula la previsión de 'Planificación mensual'?"}), a: t('campos.ayuda.faq.grupo4.a2', {defaultValue: 'Se calcula día a día con el calendario de festivos y el horario semanal que ya tienes registrados en la app — no es una estimación proporcional, es un cálculo exacto con esos datos. Cambiará si el calendario oficial del curso o la distribución definitiva del horario todavía no están completos.'}) },
      { q: t('campos.ayuda.faq.grupo4.q3', {defaultValue: '¿Cómo paso lista o registro faltas de asistencia?'}), a: t('campos.ayuda.faq.grupo4.a3', {defaultValue: "En la sección de Seguimiento tienes la pestaña 'Asistencia'. Verás a todo tu alumnado y con un solo clic en su cuadrícula puedes alternar entre Falta, Retraso o Falta Justificada."}) },
      { q: t('campos.ayuda.faq.grupo4.q4', {defaultValue: '¿Cómo evalúo una tarea o examen concreto?'}), a: t('campos.ayuda.faq.grupo4.a4', {defaultValue: "Ve a la sección 'Seguimiento' > pestaña 'Detalle por alumnado' para introducir la nota de cada actividad, por alumno/a. La nota final se recalcula automáticamente a partir de los pesos de RA y CE."}) },
      { q: t('campos.ayuda.faq.grupo4.q5', {defaultValue: '¿Cómo se calcula exactamente la nota final del trimestre?'}), a: t('campos.ayuda.faq.grupo4.a5', {defaultValue: 'El sistema cruza las calificaciones que pones en los Instrumentos con el peso del Indicador (Evaluación > bloque Indicadores), que a su vez alimenta el peso del Criterio de Evaluación (CE) y finalmente el Resultado de Aprendizaje (RA). Todo en tiempo real.'}) },
      { q: t('campos.ayuda.faq.grupo4.q6', {defaultValue: '¿Qué significan los colores (morado, verde azulado, naranja) en la agenda y el calendario visual?'}), a: t('campos.ayuda.faq.grupo4.a6', {defaultValue: 'Los colores del fondo indican el trimestre (evaluación) al que pertenece cada actividad o fecha: 1er trimestre (morado/malva), 2º trimestre (teal/verde azulado) y 3er trimestre (naranja/ámbar) — deliberadamente sin rojo ni azul, esos tonos están reservados a Festivo y Evento.'}) }
    ]
  },
  {
    group: t('campos.ayuda.faq.grupo5.titulo', {defaultValue: '5. Descargas y documentos oficiales'}),
    items: [
      { q: t('campos.ayuda.faq.grupo5.q1', {defaultValue: '¿Puedo generar boletines automáticos para el alumnado?'}), a: t('campos.ayuda.faq.grupo5.a1', {defaultValue: "Sí. Desde la pestaña 'Curso' de Magia puedes generar boletines en PDF masivos para toda la clase o resúmenes individuales hiperdetallados que justifican la nota en base a cada Criterio de Evaluación conseguido."}) }
    ]
  },
  {
    group: t('campos.ayuda.faq.grupo7.titulo', {defaultValue: '7. Soporte técnico'}),
    items: [
      { q: t('campos.ayuda.faq.grupo7.q1', {defaultValue: '¿Qué pasa si las gráficas de mi panel de control no cargan?'}), a: t('campos.ayuda.faq.grupo7.a1', {defaultValue: "Comprueba en la barra lateral que has activado el 'Modo Reales' y tienes seleccionado tu Grupo. Las gráficas necesitan saber a qué alumnado y a qué programación apuntan para poder analizar los datos."}) },
      { q: t('campos.ayuda.faq.grupo7.q2', {defaultValue: '¿Se puede usar Cuaderno FP en el móvil?'}), a: t('campos.ayuda.faq.grupo7.a2', {defaultValue: 'El diseño es responsivo y se adapta, pero por la densidad de información (tablas masivas de evaluación y matrices curriculares), te recomendamos encarecidamente utilizarlo en pantallas de ordenador o tabletas grandes.'}) },
      { q: t('campos.ayuda.faq.grupo7.q3', {defaultValue: 'La app va muy lenta o he detectado un error extraño'}), a: t('campos.ayuda.faq.grupo7.a3', {defaultValue: 'Intenta recargar la página completamente (F5 o Ctrl+R). Si el error sigue apareciendo, exporta tus datos (.json) inmediatamente para ponerlos a salvo y ponte en contacto con el soporte detallando los pasos para reproducir tu problema.'}) }
    ]
  }
];

export default function AyudaPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("guia");
  const FAQS = useMemo(() => getFaqs(t), [t]);
  const { startTour } = useOnboardingTour();

  const TABS = [
    { id: "guia", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.magia.guia.label', {defaultValue: 'Guía'})}</>, cleanLabel: t('tabs.magia.guia.label', {defaultValue: 'Guía'}) },
    { id: "faq", label: <><span className="inline-flex"><Info className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.faq.label', {defaultValue: 'FAQ'})}</>, cleanLabel: t('tabs.ayuda.faq.label', {defaultValue: 'FAQ'}) },
    { id: "acronimos", label: <><span className="inline-flex"><BookOpen className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.ayuda.acronimos.label', {defaultValue: 'Acrónimos'})}</>, cleanLabel: t('tabs.ayuda.acronimos.label', {defaultValue: 'Acrónimos'}) },
    { id: "contribuciones", label: <><span className="inline-flex"><Users className="w-[1.2em] h-[1.2em] mr-1" /></span> {t('tabs.inicio.contribuciones.label', {defaultValue: 'Contribuciones'})}</>, cleanLabel: t('tabs.inicio.contribuciones.label', {defaultValue: 'Contribuciones'}) },
  ];

  const activeTabCleanLabel = TABS.find(tab => tab.id === activeTab)?.cleanLabel;

  const TAB_DESCRIPTIONS: Record<string, string> = {
    guia: t('tabs.magia.guia.desc', {defaultValue: 'Guía de inicio y prompt para IA: qué datos pedir al docente y dónde colocarlos en la app.'}),
    faq: t('tabs.ayuda.faq.desc', {defaultValue: 'Respuestas a las preguntas más frecuentes del profesorado.'}),
    acronimos: t('tabs.ayuda.acronimos.desc', {defaultValue: 'Glosario de siglas, acrónimos y conceptos de Formación Profesional.'}),
    contribuciones: t('tabs.inicio.contribuciones.desc', {defaultValue: 'Comunidad de Telegram y listado de personas que contribuyen activamente al proyecto.'}),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <StickyPageHeader icon={Info} title={t('nav.ayuda', { defaultValue: 'Ayuda' })} description={t('pages.ayuda_desc', { defaultValue: 'Guía de inicio, FAQ, acrónimos y contribuciones de la comunidad.' })}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </StickyPageHeader>

          <MotionWrapper className="space-y-4 px-8 pt-4 pb-12">
            <TabInfoBox
              description={TAB_DESCRIPTIONS[activeTab] || t('campos.comun.gestionDe', {activeTab, defaultValue: 'Gestión de {{activeTab}}'})}
              action={activeTab === "guia" ? (
                <Button variant="primary" size="sm" onClick={startTour}>
                  <Compass className="w-4 h-4" />
                  {t('campos.ayuda.iniciarRecorrido', {defaultValue: 'Iniciar recorrido guiado'})}
                </Button>
              ) : undefined}
            />

            {/* ── CONTENIDO: GUÍA ────────────────────────────────────── */}
            {activeTab === "guia" && (
              <GuiaTab />
            )}

            {/* ── CONTENIDO: FAQ ────────────────────────────────────────── */}
            {activeTab === "faq" && (
              <div className="space-y-10 animate-in fade-in duration-500 w-full">
                {FAQS.map((faqGroup, idx) => (
                  <div key={faqGroup.group || idx}>
                    <h2 className="text-subheading font-bold mb-4 text-accent border-b border-white/5 pb-2">
                      {faqGroup.group}
                    </h2>
                    <div className="space-y-1">
                      {faqGroup.items.map((item, i) => (
                        <AccordionItem key={item.q || i} question={item.q} answer={item.a} />
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

            {/* ── CONTENIDO: CONTRIBUCIONES ──────────────────────────────────────── */}
            {activeTab === "contribuciones" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-5 p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl shadow-sm mb-8">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#229ED9]/10 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-[#229ED9]" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-body font-bold text-foreground">{t('campos.inicio.grupoTelegramTitulo', {defaultValue: 'Grupo oficial de Telegram'})}</h3>
                      <p className="text-body text-muted leading-tight mt-1">
                        {t('campos.inicio.grupoTelegramDesc', {defaultValue: 'Grupo oficial de desarrollo y testeo de la App web gratuita de Cuaderno FP. Sube tus sugerencias, reporta bugs o colabora aportando el currículo oficial de tu Comunidad Autónoma.'})}
                      </p>
                    </div>
                    <a
                      href="https://t.me/cuadernofp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 px-5 py-2.5 rounded-lg bg-[#229ED9] text-white font-medium hover:bg-[#229ED9]/90 transition-colors flex items-center gap-2 text-body"
                    >
                      <Send className="w-4 h-4" />
                      {t('botones.inicio.unirseTelegram', {defaultValue: 'Unirme al grupo en Telegram'})}
                    </a>
                  </div>

                  <h3 className="text-heading font-bold text-foreground border-b border-[var(--glass-border)] pb-2">{t('campos.inicio.contribuidoresCcaaTitulo', {defaultValue: 'Contribuidores por Comunidad Autónoma'})}</h3>
                  <p className="text-muted mb-4">
                    {t('campos.inicio.contribuidoresCcaaDesc', {defaultValue: 'Mención especial al profesorado que está ayudando a mejorar y a integrar los currículos de las Comunidades Autónomas'})}
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
                            <li className="flex items-center gap-2 italic opacity-60"><Users className="w-4 h-4 text-muted-foreground" /> {t('campos.inicio.animateAContribuir', {defaultValue: '¡Anímate a contribuir!'})}</li>
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
