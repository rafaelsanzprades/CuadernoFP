"use client";
import {
  Scale,
  Shield,
  ShieldCheck,
  ExternalLink,
  Info,
  Cookie,
  Accessibility,
  FileText,
  Eye,
} from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { TabSync } from "@/components/ui/TabSync";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

/* ──────────────────────────────────────────────────────────────
   Mini-índice con anclas internas
   ────────────────────────────────────────────────────────────── */
function SectionIndex({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav
      aria-label="Índice de secciones"
      className="flex flex-wrap gap-2 mb-6 p-3 rounded-xl bg-background/40 backdrop-blur-md border border-[var(--glass-border)]"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent/5 text-accent hover:bg-accent/15 border border-accent/20 transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────
   Título de sección con ancla
   ────────────────────────────────────────────────────────────── */
function SectionHeading({
  id,
  number,
  children,
}: {
  id: string;
  number: number;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-lg font-bold text-foreground border-b border-[var(--glass-border)] pb-2 scroll-mt-24"
    >
      {number}. {children}
    </h2>
  );
}

/* ══════════════════════════════════════════════════════════════
   PÁGINA LEGAL
   ══════════════════════════════════════════════════════════════ */
export default function LegalPage() {
  const [activeTab, setActiveTab] = useState("aviso");

  const TABS = [
    { id: "aviso", label: <><FileText className="w-[1.2em] h-[1.2em] mr-1" /> Aviso legal</>, cleanLabel: "Aviso legal" },
    { id: "privacidad", label: <><Shield className="w-[1.2em] h-[1.2em] mr-1" /> Privacidad</>, cleanLabel: "Privacidad" },
    { id: "cookies", label: <><Cookie className="w-[1.2em] h-[1.2em] mr-1" /> Cookies</>, cleanLabel: "Cookies" },
    { id: "accesibilidad", label: <><Accessibility className="w-[1.2em] h-[1.2em] mr-1" /> Accesibilidad</>, cleanLabel: "Accesibilidad" },
  ];

  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background relative">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />

        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide">
          <div className="w-full space-y-4 pb-12">

            {/* Título */}
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Scale className="w-[1.2em] h-[1.2em] mr-1 text-accent" /> Legal
              </h1>
              <p className="text-muted mt-2 text-lg">Aviso legal, privacidad, cookies, licencias y accesibilidad.</p>
            </div>

            {/* Pestañas */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-2 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Info contextual */}
            {(() => {
              const infoMap: Record<string, { desc: string }> = {
                'aviso': { desc: 'Datos del titular, condiciones de uso, propiedad intelectual (LPI) y LSSI-CE.' },
                'privacidad': { desc: 'Política de privacidad, RGPD, responsable del tratamiento y modelo local-first.' },
                'cookies': { desc: 'Uso de localStorage e IndexedDB. Sin cookies de rastreo ni analíticas de terceros.' },
                'accesibilidad': { desc: 'Declaración de accesibilidad digital según RD 1112/2018 y compromiso WCAG 2.1 AA.' },
              };
              const info = infoMap[activeTab] || { desc: 'Información legal.' };
              return (
                <div className='flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6'>
                  <Info className='w-5 h-5 text-accent mt-0.5 shrink-0' />
                  <div>
                    <p className="text-sm text-muted">{info.desc}</p>
                  </div>
                </div>
              );
            })()}

            {/* ═══════════════════════════════════════════════════
                TAB — AVISO LEGAL
                ═══════════════════════════════════════════════════ */}
            {activeTab === "aviso" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <SectionIndex
                  items={[
                    { id: "aviso-titular", label: "1. Datos del titular" },
                    { id: "aviso-condiciones", label: "2. Condiciones de uso" },
                    { id: "aviso-propiedad", label: "3. Propiedad intelectual" },
                    { id: "aviso-licencias", label: "4. Licencias" },
                    { id: "aviso-resumen", label: "5. Resumen práctico" },
                  ]}
                />

                {/* 1. Datos del titular */}
                <section className="space-y-3">
                  <SectionHeading id="aviso-titular" number={1}>
                    Datos del Titular
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se exponen los siguientes datos identificativos:
                  </p>
                  <div className="text-sm text-muted space-y-1 mt-2">
                    <p><strong>Titular:</strong> Rafael Sanz Prades</p>
                    <p><strong>Contacto:</strong> <a href="mailto:rafaelsanzprades@gmail.com" className="text-info hover:underline">rafaelsanzprades@gmail.com</a></p>
                    <p><strong>Sitio Web:</strong> <a href="https://cuadernofp.web.app/" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">https://cuadernofp.web.app/</a></p>
                    <p><strong>Actividad:</strong> Herramienta de productividad docente para ciclos formativos de Formación Profesional.</p>
                  </div>
                </section>

                {/* 2. Condiciones de uso */}
                <section className="space-y-3">
                  <SectionHeading id="aviso-condiciones" number={2}>
                    Condiciones de Uso
                  </SectionHeading>
                  <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
                    <p>
                      El acceso y uso de este sitio web atribuye la condición de <strong>Usuario</strong> e implica la aceptación plena de todas las condiciones incluidas en este Aviso Legal.
                    </p>
                    <p>
                      El Usuario se compromete a hacer un uso adecuado de los contenidos y herramientas ofrecidos, conforme a la ley, la buena fe y el orden público. Queda prohibido:
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1 text-muted">
                      <li>Utilizar la aplicación con fines ilícitos o que perjudiquen a terceros.</li>
                      <li>Realizar ingeniería inversa, descompilar o extraer el código fuente salvo en los términos permitidos por la licencia GNU GPLv3.</li>
                      <li>Suplantar la identidad del titular o introducir datos falsos deliberadamente.</li>
                    </ul>
                  </div>
                </section>

                {/* 3. Propiedad intelectual */}
                <section className="space-y-3">
                  <SectionHeading id="aviso-propiedad" number={3}>
                    Propiedad Intelectual (LPI)
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Todos los contenidos del sitio web —incluyendo textos, imágenes, diseño gráfico, código fuente, logotipos, marcas y cualquier otro elemento susceptible de protección— están sujetos a los derechos de propiedad intelectual e industrial de sus titulares, conforme al Real Decreto Legislativo 1/1996, de 12 de abril (LPI).
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    El código fuente se distribuye bajo licencia <strong>GNU GPLv3</strong> y los materiales didácticos bajo <strong>CC BY-NC-SA 4.0</strong> (ver sección 4). Fuera de estos términos, queda prohibida la reproducción, distribución, comunicación pública o transformación sin autorización expresa.
                  </p>
                </section>

                {/* 4. Licencias */}
                <section className="space-y-4">
                  <SectionHeading id="aviso-licencias" number={4}>
                    Licencias
                  </SectionHeading>

                  {/* 4a. Software */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-foreground">4a. Código Fuente — GNU GPLv3</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      El código fuente de esta aplicación es de código abierto y se distribuye bajo los términos de la <strong>Licencia Pública General de GNU versión 3 (GNU GPLv3)</strong>.
                    </p>
                    <div className="space-y-2 text-sm text-foreground/80">
                      <h4 className="font-semibold text-foreground">¿Qué implica?</h4>
                      <ul className="list-disc list-inside text-muted space-y-1 ml-2">
                        <li><strong>Usar</strong> y ejecutar la aplicación para cualquier propósito, incluido su uso en cualquier centro educativo.</li>
                        <li><strong>Estudiar</strong> cómo funciona el código y modificarlo para adaptarlo a tus necesidades.</li>
                        <li><strong>Distribuir</strong> copias del código original o de versiones modificadas.</li>
                      </ul>
                    </div>
                    <div className="flex gap-3 text-sm mt-3">
                      <span className="text-info mt-1"><ShieldCheck className="w-5 h-5" /></span>
                      <div>
                        <strong className="block text-foreground mb-1">Copyleft: Compartir Igual</strong>
                        <p className="text-foreground/80">
                          Si modificas este código y publicas o distribuyes una nueva versión, <strong>estás obligado/a a publicarla bajo la misma licencia GNU GPLv3</strong> y facilitar su código fuente.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://github.com/rafaelsanzprades/CuadernoFP/blob/main/LICENSE.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-info/10 text-info border border-info/30 hover:bg-info/20 font-semibold rounded-lg transition-all text-sm mt-2"
                    >
                      Ver licencia completa en GitHub
                      <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* 4b. Contenido */}
                  <div className="space-y-3 mt-6">
                    <h3 className="text-base font-bold text-foreground">4b. Contenido y Materiales — CC BY-NC-SA 4.0</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Los textos, guías, estructura visual de la interfaz, logotipos y materiales de ayuda están protegidos bajo <strong>Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0)</strong>.
                    </p>
                    <ul className="list-disc list-inside text-muted space-y-1 ml-2 text-sm">
                      <li><strong>Atribución (BY):</strong> Reconocer la autoría original (Rafael Sanz Prades) y enlazar a la licencia.</li>
                      <li><strong>No Comercial (NC):</strong> No usar con fines comerciales o lucrativos.</li>
                      <li><strong>Compartir Igual (SA):</strong> Los derivados deben distribuirse bajo la misma licencia.</li>
                    </ul>
                  </div>
                </section>

                {/* 5. Resumen práctico */}
                <section className="space-y-4">
                  <SectionHeading id="aviso-resumen" number={5}>
                    Resumen Práctico para el Profesorado
                  </SectionHeading>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-foreground/90 border-b border-[var(--glass-border)]">
                      <tr>
                        <th className="py-3 font-semibold w-1/2 pr-4">Lo que SÍ PUEDES hacer</th>
                        <th className="py-3 font-semibold w-1/2 pl-4">Lo que NO PUEDES hacer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)] text-foreground/80">
                      <tr>
                        <td className="py-3 pr-4"><span className="text-success mr-1">✔️</span> Usar la web de forma gratuita con tu alumnado y módulos.</td>
                        <td className="py-3 pl-4"><span className="text-destructive mr-1">❌</span> Vender el acceso a esta plataforma o derivados.</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><span className="text-success mr-1">✔️</span> Sugerir mejoras o adaptar el código para tu centro.</td>
                        <td className="py-3 pl-4"><span className="text-destructive mr-1">❌</span> Apropiarte del trabajo y cerrar su código.</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4"><span className="text-success mr-1">✔️</span> Compartir la herramienta con el profesorado.</td>
                        <td className="py-3 pl-4"><span className="text-destructive mr-1">❌</span> Usar el diseño, código o textos para productos de pago.</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════
                TAB — PRIVACIDAD Y RGPD
                ═══════════════════════════════════════════════════ */}
            {activeTab === "privacidad" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <SectionIndex
                  items={[
                    { id: "priv-modelo", label: "1. Modelo local-first" },
                    { id: "priv-responsable", label: "2. Responsable RGPD" },
                    { id: "priv-datos", label: "3. ¿Dónde se guardan los datos?" },
                    { id: "priv-derechos", label: "4. Derechos ARCO" },
                    { id: "priv-seguridad", label: "5. Seguridad" },
                    { id: "priv-base-legal", label: "6. Base legal" },
                  ]}
                />

                {/* 1. Modelo local-first */}
                <section className="space-y-3">
                  <SectionHeading id="priv-modelo" number={1}>
                    Modelo de Privacidad Local-First
                  </SectionHeading>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-success mt-1"><Shield className="w-5 h-5" /></span>
                    <div>
                      <strong className="block mb-1 text-foreground">Privacidad absoluta por diseño</strong>
                      <span className="text-sm text-foreground/80">
                        Esta aplicación ha sido diseñada bajo el principio de <strong>privacidad absoluta</strong>. Los datos personales de tu alumnado (nombres, calificaciones, tutorías) <strong>no se envían, transmiten ni almacenan en ningún servidor ajeno al control del profesorado</strong>.
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    La aplicación funciona enteramente en el navegador del usuario. No existen cuentas de usuario, no se registran datos personales y no se utilizan servicios de terceros para el tratamiento de información del alumnado.
                  </p>
                </section>

                {/* 2. Responsable RGPD */}
                <section className="space-y-3">
                  <SectionHeading id="priv-responsable" number={2}>
                    Responsable del Tratamiento (RGPD)
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Dado que la aplicación es estática y el procesamiento se realiza localmente en el navegador:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-2 text-sm text-muted">
                    <li>El <strong>Docente</strong> o su <strong>Centro Educativo</strong> actúa como el único <strong>Responsable del Tratamiento</strong> de los datos personales del alumnado.</li>
                    <li>El desarrollador de esta herramienta (Rafael Sanz Prades) <strong>no actúa como Encargado del Tratamiento</strong>, ya que carece de acceso técnico a los datos introducidos.</li>
                  </ul>
                  <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm text-foreground/80">
                    <strong>Importante:</strong> Si usas la sincronización con Google Drive, el tratamiento de datos en la nube se rige por las condiciones de Google Workspace for Education y el acuerdo de tu centro con Google.
                  </div>
                </section>

                {/* 3. ¿Dónde se guardan los datos? */}
                <section className="space-y-3">
                  <SectionHeading id="priv-datos" number={3}>
                    ¿Dónde se Guardan los Datos?
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Los datos se almacenan exclusivamente en las ubicaciones que el docente determine:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-2 text-sm text-muted">
                    <li><strong>Disco local:</strong> En el navegador del usuario (IndexedDB y localStorage) para preferencias y datos de sesión.</li>
                    <li><strong>Archivos exportados:</strong> Formatos <code>.cddp</code> (Programación) y <code>.cddc</code> (Curso) que el docente guarda en su disco duro, USB o nube privada.</li>
                    <li><strong>Google Drive (opcional):</strong> Bajo la cuenta institucional del profesorado, regulada por la Consejería de Educación o Centro Educativo.</li>
                  </ul>
                </section>

                {/* 4. Derechos ARCO */}
                <section className="space-y-3">
                  <SectionHeading id="priv-derechos" number={4}>
                    Derechos del Alumnado (ARCO)
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    El alumnado (o sus tutores legales, en caso de menores) pueden ejercer sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> ante el Responsable del Tratamiento, que es el docente o centro educativo.
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Dado que esta aplicación no almacena datos en servidores externos, el ejercicio de estos derechos se gestiona directamente entre el alumnado y el profesorado, sin intermediación del desarrollador.
                  </p>
                </section>

                {/* 5. Seguridad */}
                <section className="space-y-3">
                  <SectionHeading id="priv-seguridad" number={5}>
                    Seguridad
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Es responsabilidad del profesorado custodiar de manera segura los archivos exportados y el acceso a su cuenta personal de Google/Microsoft. Se recomienda:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-sm text-muted">
                    <li>Proteger el ordenador y dispositivos de almacenamiento con contraseñas seguras y bloqueos automáticos.</li>
                    <li>No compartir archivos <code>.cddp</code> / <code>.cddc</code> por canales inseguros (email sin cifrar, mensajería pública).</li>
                    <li>Revisar periódicamente los permisos de acceso en Google Drive si se usa sincronización.</li>
                  </ul>
                </section>

                {/* 6. Base legal */}
                <section className="space-y-3">
                  <SectionHeading id="priv-base-legal" number={6}>
                    Base Legal y Normativa Aplicable
                  </SectionHeading>
                  <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-muted">
                    <li><strong>RGPD:</strong> Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo.</li>
                    <li><strong>LOPDGDD:</strong> Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales.</li>
                    <li><strong>LSSI-CE:</strong> Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico.</li>
                  </ul>
                </section>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════
                TAB — COOKIES Y ALMACENAMIENTO LOCAL
                ═══════════════════════════════════════════════════ */}
            {activeTab === "cookies" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <SectionIndex
                  items={[
                    { id: "cookies-politica", label: "1. Política de cookies" },
                    { id: "cookies-tecnologias", label: "2. Tecnologías utilizadas" },
                    { id: "cookies-tabla", label: "3. Detalle de almacenamiento" },
                    { id: "cookies-gestion", label: "4. Cómo gestionarlos" },
                  ]}
                />

                {/* 1. Política */}
                <section className="space-y-3">
                  <SectionHeading id="cookies-politica" number={1}>
                    Política de Cookies
                  </SectionHeading>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-success mt-1"><Eye className="w-5 h-5" /></span>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Esta aplicación web <strong>no utiliza cookies de rastreo, publicidad ni analíticas de terceros</strong>. No se instala ningún cookie en tu navegador con fines de seguimiento o perfilado.
                    </p>
                  </div>
                </section>

                {/* 2. Tecnologías */}
                <section className="space-y-3">
                  <SectionHeading id="cookies-tecnologias" number={2}>
                    Tecnologías de Almacenamiento Utilizadas
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Únicamente se utiliza el almacenamiento local del navegador para garantizar una experiencia óptima:
                  </p>
                  <div className="space-y-3 mt-3">
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <h4 className="font-semibold text-foreground text-sm">localStorage</h4>
                      <p className="text-sm text-foreground/80 mt-1">
                        Almacena preferencias visuales del usuario: tema (claro/oscuro), escala de fuente, contraste alto, reducción de movimiento, idioma seleccionado y configuración de accesibilidad. <strong>No contiene datos personales del alumnado.</strong>
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <h4 className="font-semibold text-foreground text-sm">IndexedDB</h4>
                      <p className="text-sm text-foreground/80 mt-1">
                        Base de datos local del navegador utilizada para caché de catálogos oficiales (ciclos formativos, módulos, RA, CE) y datos de sesión. Los datos del alumnado solo se almacenan aquí si el docente trabaja en modo local (sin sincronización).
                      </p>
                    </div>
                  </div>
                </section>

                {/* 3. Tabla detalle */}
                <section className="space-y-3">
                  <SectionHeading id="cookies-tabla" number={3}>
                    Detalle de Almacenamiento Local
                  </SectionHeading>
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="text-foreground/90 border-b border-[var(--glass-border)]">
                      <tr>
                        <th className="py-3 font-semibold">Clave</th>
                        <th className="py-3 font-semibold">Tecnología</th>
                        <th className="py-3 font-semibold">Contenido</th>
                        <th className="py-3 font-semibold">Duración</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--glass-border)] text-foreground/80">
                      <tr>
                        <td className="py-2 font-mono text-xs">theme, a11y-*</td>
                        <td className="py-2">localStorage</td>
                        <td className="py-2">Preferencias de tema y accesibilidad</td>
                        <td className="py-2">Persistente</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">catalogCache</td>
                        <td className="py-2">IndexedDB</td>
                        <td className="py-2">Catálogos oficiales (ciclos, módulos, RA/CE)</td>
                        <td className="py-2">Persistente</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">sessionData</td>
                        <td className="py-2">IndexedDB</td>
                        <td className="py-2">Datos de sesión y configuración de módulo</td>
                        <td className="py-2">Persistente</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                {/* 4. Gestión */}
                <section className="space-y-3">
                  <SectionHeading id="cookies-gestion" number={4}>
                    Cómo Gestionar el Almacenamiento Local
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Puedes eliminar los datos almacenados en cualquier momento desde la configuración de tu navegador:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-1 text-sm text-muted">
                    <li><strong>Chrome:</strong> Configuración → Privacidad → Borrar datos de navegación → Archivos y datos almacenados en caché.</li>
                    <li><strong>Firefox:</strong> Preferencias → Privacidad → Cookies y datos del sitio → Borrar datos.</li>
                    <li><strong>Edge:</strong> Configuración → Privacidad → Borrar datos de navegación → Archivos y datos almacenados en caché.</li>
                  </ul>
                  <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm text-foreground/80">
                    <strong>Nota:</strong> Borrar el almacenamiento local eliminará tus preferencias visuales y la caché de catálogos. Los archivos <code>.cddp</code> / <code>.cddc</code> guardados en disco no se verán afectados.
                  </div>
                </section>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════
                TAB — ACCESIBILIDAD
                ═══════════════════════════════════════════════════ */}
            {activeTab === "accesibilidad" && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <SectionIndex
                  items={[
                    { id: "acc-declaracion", label: "1. Declaración" },
                    { id: "acc-normativa", label: "2. Normativa" },
                    { id: "acc-estado", label: "3. Estado de conformidad" },
                    { id: "acc-medidas", label: "4. Medidas adoptadas" },
                    { id: "acc-excepciones", label: "5. Excepciones" },
                    { id: "acc-contacto", label: "6. Contacto y quejas" },
                  ]}
                />

                {/* 1. Declaración */}
                <section className="space-y-3">
                  <SectionHeading id="acc-declaracion" number={1}>
                    Declaración de Accesibilidad
                  </SectionHeading>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-info mt-1"><Accessibility className="w-5 h-5" /></span>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      <strong>El equipo de Cuaderno FP</strong> se compromete a hacer accesible este sitio web conforme al <strong>Real Decreto 1112/2018, de 7 de septiembre</strong>, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público, así como con la <strong>Directiva (UE) 2016/2102 del Parlamento Europeo y del Consejo</strong>.
                    </p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Esta declaración se aplica a la aplicación web <strong>CuadernoFP</strong> alojada en{" "}
                    <a href="https://cuadernofp.web.app/" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
                      https://cuadernofp.web.app/
                    </a>.
                  </p>
                </section>

                {/* 2. Normativa */}
                <section className="space-y-3">
                  <SectionHeading id="acc-normativa" number={2}>
                    Normativa Aplicable
                  </SectionHeading>
                  <ul className="list-disc list-inside ml-2 space-y-2 text-sm text-muted">
                    <li><strong>Real Decreto 1112/2018</strong>, de 7 de septiembre, sobre accesibilidad de los sitios web y aplicaciones para dispositivos móviles del sector público.</li>
                    <li><strong>Directiva (UE) 2016/2102</strong> del Parlamento Europeo y del Consejo, de 26 de octubre de 2016, sobre la accesibilidad de los sitios web y aplicaciones para dispositivos móviles de los organismos del sector público.</li>
                    <li><strong>EN 301 549 V3.2.1</strong> — Requisitos de accesibilidad TIC compatibles con las WCAG 2.1 nivel AA.</li>
                    <li><strong>WCAG 2.1</strong> — Pautas de Accesibilidad para el Contenido Web del W3C (nivel AA).</li>
                  </ul>
                </section>

                {/* 3. Estado de conformidad */}
                <section className="space-y-3">
                  <SectionHeading id="acc-estado" number={3}>
                    Estado de Conformidad
                  </SectionHeading>
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      Este sitio web es <strong>parcialmente conforme</strong> con el Real Decreto 1112/2018 debido a las excepciones indicadas en la sección 5.
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                      La aplicación incorpora criterios de accesibilidad WCAG 2.1 nivel AA como objetivo de diseño desde su concepción.
                    </p>
                  </div>
                </section>

                {/* 4. Medidas adoptadas */}
                <section className="space-y-3">
                  <SectionHeading id="acc-medidas" number={4}>
                    Medidas de Accesibilidad Adoptadas
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    En esta aplicación se han adoptado las siguientes medidas para facilitar la accesibilidad:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <h4 className="font-semibold text-foreground text-sm">✅ Navegación y estructura</h4>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-sm text-muted">
                        <li>Estructura semántica HTML con encabezados jerárquicos (h1 → h2 → h3).</li>
                        <li>Etiquetas <code>lang="es"</code> en el elemento <code>&lt;html&gt;</code>.</li>
                        <li>Landmarks ARIA: <code>role="navigation"</code>, <code>role="searchbox"</code>, <code>role="tabpanel"</code>.</li>
                        <li><code>aria-label</code> en navegación principal, menú y campo de búsqueda.</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <h4 className="font-semibold text-foreground text-sm">✅ Interacción y controles</h4>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-sm text-muted">
                        <li>Todos los controles interactivos son accesibles por teclado.</li>
                        <li>Indicador de foco visible en elementos interactivos.</li>
                        <li>Contrastes de color que cumplen WCAG 2.1 AA (ratio mínimo 4.5:1 para texto normal).</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <h4 className="font-semibold text-foreground text-sm">✅ Personalización</h4>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-sm text-muted">
                        <li>Selector de tamaño de fuente (escalado 80%–150%).</li>
                        <li>Modo de alto contraste.</li>
                        <li>Reducción de animaciones (respeta <code>prefers-reduced-motion</code>).</li>
                        <li>Soporte de texto a voz (TTS) integrado.</li>
                        <li>Temas claro y oscuro.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 5. Excepciones */}
                <section className="space-y-3">
                  <SectionHeading id="acc-excepciones" number={5}>
                    Excepciones y Contenido No Conforme
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    A continuación se detallan las excepciones al cumplimiento del RD 1112/2018:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-2 space-y-2 text-sm text-muted">
                    <li><strong>Gráficos y diagramas curriculares:</strong> Algunos contenidos visuales (matrices curriculares, gráficos de progreso) pueden no disponer de alternativas textuales completas. Se trabaja para incorporar descripciones accesibles.</li>
                    <li><strong>Contenido de terceros:</strong> Los catálogos oficiales proceden del BOE/BOA y pueden no cumplir todos los criterios WCAG al ser importados.</li>
                    <li><strong>Archivos exportados:</strong> Los documentos PDF generados pueden no ser totalmente accesibles. Se trabaja en mejorar la accesibilidad de las exportaciones.</li>
                  </ul>
                  <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                    Esta declaración fue preparada el <strong>13 de julio de 2026</strong> y se revisará periódicamente.
                  </p>
                </section>

                {/* 6. Contacto y quejas */}
                <section className="space-y-3">
                  <SectionHeading id="acc-contacto" number={6}>
                    Contacto y Solicitud de Información Accesible
                  </SectionHeading>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Si encuentras alguna barrera de accesibilidad o necesitas solicitar información en un formato alternativo, puedes contactar a través de:
                  </p>
                  <div className="text-sm text-muted space-y-1 mt-2">
                    <p><strong>Email:</strong> <a href="mailto:rafaelsanzprades@gmail.com" className="text-info hover:underline">rafaelsanzprades@gmail.com</a></p>
                    <p><strong>GitHub:</strong>{" "}
                      <a href="https://github.com/rafaelsanzprades/CuadernoFP/issues" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
                        Abrir incidencia de accesibilidad
                        <ExternalLink className="inline ml-1 w-3.5 h-3.5" />
                      </a>
                    </p>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-info/5 border border-info/20 text-sm text-foreground/80">
                    <strong>Procedimiento de queja:</strong> Si tras una solicitud de información accesible no has recibido respuesta satisfactoria, puedes presentar una queja ante el{" "}
                    <a href="https://www.mincotur.gob.es/" target="_blank" rel="noopener noreferrer" className="text-info hover:underline">
                      Ministerio de Asuntos Económicos y Transformación Digital
                    </a>{" "}
                    a través de su sede electrónica, conforme al artículo 13 del RD 1112/2018.
                  </div>
                </section>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
