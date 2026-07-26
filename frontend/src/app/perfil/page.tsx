"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TabSync } from "@/components/ui/TabSync";
import { Sun, Moon, Globe, Type, Contrast, ZapOff, Volume2, Check, User, Info, Shield, Building2, Lock, CheckCircle, Activity, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAccessibility } from "@/hooks/useAccessibility";

export default function PerfilPage() {
  const {
    theme,
    setTheme,
    currentLang,
    changeLanguage,
    fontSizeScale,
    changeFontSize,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
    ttsEnabled,
    toggleTts,
    LANGUAGES
  } = useAccessibility();

  const TABS = [
    { id: "aspecto", label: <span className="flex items-center gap-2"><Sun className="w-4 h-4 shrink-0" /> Aspecto</span>, cleanLabel: "Aspecto" },
    { id: "idioma", label: <span className="flex items-center gap-2"><Globe className="w-4 h-4 shrink-0" /> Idioma</span>, cleanLabel: "Idioma" },
    { id: "accesibilidad", label: <span className="flex items-center gap-2"><Type className="w-4 h-4 shrink-0" /> Accesibilidad</span>, cleanLabel: "Accesibilidad" },
    { id: "seguridad", label: <span className="flex items-center gap-2"><Shield className="w-4 h-4 shrink-0" /> Seguridad</span>, cleanLabel: "Seguridad" },
  ];

  const [activeTab, setActiveTab] = useState("aspecto");
  const activeTabCleanLabel = TABS.find(t => t.id === activeTab)?.cleanLabel;

  return (
    <div className="flex min-h-screen bg-background">
      <TabSync activeTab={activeTab} setActiveTab={setActiveTab} />
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header breadcrumbSuffix={activeTabCleanLabel} />
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Perfil y configuración
              </h1>
              <p className="text-muted mt-2 text-sm">
                Personaliza la apariencia, el idioma y las opciones de accesibilidad de la aplicación.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 max-w-full">
                {TABS.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {(() => {
              const infoMap: Record<string, { desc: string }> = {
                'aspecto': { desc: 'Configuración visual, modo claro u oscuro.' },
                'idioma': { desc: 'Selección del idioma preferido para toda la interfaz.' },
                'accesibilidad': { desc: 'Ajustes avanzados de tamaño, contraste y asistencias cognitivas para facilitar el uso.' },
                'seguridad': { desc: 'Opciones de privacidad, encriptación y control de datos.' },
              };
              const info = infoMap[activeTab];
              if (!info) return null;
              
              return (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
                  <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted">{info.desc}</p>
                  </div>
                </div>
              );
            })()}

            {/* Main Settings Card */}
            <Card className="p-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl space-y-8">
              
              {/* Aspecto */}
              {activeTab === "aspecto" && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sun className="w-5 h-5 text-accent" /> Configuración de aspecto
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Button
                      variant={theme === "light" ? "primary" : "ghost"}
                      size="lg"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="w-5 h-5" /> Claro
                    </Button>
                    <Button
                      variant={theme === "dark" ? "primary" : "ghost"}
                      size="lg"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="w-5 h-5" /> Oscuro
                    </Button>
                  </div>
                </section>
              )}

              {/* Idioma */}
              {activeTab === "idioma" && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent" /> Selección de idioma
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {LANGUAGES.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={currentLang.code === lang.code ? "primary" : "ghost"}
                        size="md"
                        onClick={() => changeLanguage(lang.code)}
                      >
                        {lang.label}
                      </Button>
                    ))}
                  </div>
                </section>
              )}

              {/* Accesibilidad */}
              {activeTab === "accesibilidad" && (
                <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Type className="w-5 h-5 text-accent" /> Opciones de accesibilidad
                  </h2>
                  
                  <div className="space-y-6 max-w-xl">
                    {/* Tamaño de letra */}
                    <div>
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                        Tamaño del texto
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={fontSizeScale === 100 ? "primary" : "ghost"}
                          size="md"
                          onClick={() => changeFontSize(100)}
                        >
                          Normal
                        </Button>
                        <Button
                          variant={fontSizeScale === 115 ? "primary" : "ghost"}
                          size="md"
                          onClick={() => changeFontSize(115)}
                        >
                          Grande
                        </Button>
                        <Button
                          variant={fontSizeScale === 130 ? "primary" : "ghost"}
                          size="md"
                          onClick={() => changeFontSize(130)}
                        >
                          Extra
                        </Button>
                      </div>
                    </div>

                    {/* Opciones adicionales */}
                    <div>
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                        Controles visuales y cognitivos
                      </label>
                      <div className="space-y-3">
                        <Button
                          variant={highContrast ? "primary" : "ghost"}
                          size="lg"
                          onClick={toggleHighContrast}
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-3">
                            <Contrast className="w-5 h-5 text-accent" /> Alto contraste
                          </span>
                          {highContrast && <Check className="w-5 h-5 text-accent" />}
                        </Button>

                        <Button
                          variant={reduceMotion ? "primary" : "ghost"}
                          size="lg"
                          onClick={toggleReduceMotion}
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-3">
                            <ZapOff className="w-5 h-5 text-accent" /> Reducir animaciones
                          </span>
                          {reduceMotion && <Check className="w-5 h-5 text-accent" />}
                        </Button>

                        <Button
                          variant={ttsEnabled ? "primary" : "ghost"}
                          size="lg"
                          onClick={toggleTts}
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-3">
                            <Volume2 className="w-5 h-5 text-accent" /> Lector en voz alta
                          </span>
                          {ttsEnabled && <Check className="w-5 h-5 text-accent" />}
                        </Button>
                      </div>
                    </div>

                    {/* Typography Scale info */}
                    <div className="pt-6 border-t border-[var(--glass-border)] mt-8 max-w-2xl">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-4">
                        Sistema Tipográfico Unificado
                      </label>
                      <div className="overflow-x-auto rounded-xl border border-[var(--glass-border)] bg-background/30">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[var(--glass-bg)] border-b border-[var(--glass-border)] text-muted">
                            <tr>
                              <th className="p-3 font-semibold">Clase</th>
                              <th className="p-3 font-semibold">Tamaño</th>
                              <th className="p-3 font-semibold">Uso Estandarizado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--glass-border)]">
                            <tr className="hover:bg-white/5">
                              <td className="p-3"><code className="px-1.5 py-0.5 rounded bg-foreground/10 text-xs">text-xs</code></td>
                              <td className="p-3">12px</td>
                              <td className="p-3 text-muted">Badges, etiquetas, metadatos y notas al pie.</td>
                            </tr>
                            <tr className="hover:bg-white/5">
                              <td className="p-3"><code className="px-1.5 py-0.5 rounded bg-foreground/10 text-sm">text-sm</code></td>
                              <td className="p-3">14px</td>
                              <td className="p-3 text-muted">Texto principal, tablas, botones y menús.</td>
                            </tr>
                            <tr className="hover:bg-white/5">
                              <td className="p-3"><code className="px-1.5 py-0.5 rounded bg-foreground/10 text-lg">text-lg</code></td>
                              <td className="p-3">18px</td>
                              <td className="p-3 text-muted">Subtítulos, tarjetas y cabeceras de sección.</td>
                            </tr>
                            <tr className="hover:bg-white/5">
                              <td className="p-3"><code className="px-1.5 py-0.5 rounded bg-foreground/10 text-2xl">text-2xl</code></td>
                              <td className="p-3">24px</td>
                              <td className="p-3 text-muted">Títulos principales (H1) y números de dashboard.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </section>
              )}

              {/* Seguridad */}
              {activeTab === "seguridad" && (
                <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Tu privacidad por diseño</h2>
                      <p className="text-muted mt-1 text-sm">Cómo garantizamos que tus datos reales son 100% tuyos.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-accent"/> 1. El servidor es ciego</h3>
                      <p className="text-muted leading-relaxed text-sm">Nuestra base de datos en la nube <strong>jamás</strong> almacena datos de tus alumnos, tus programaciones, ni nada que crees. El servidor web solo existe para enviarte los Catálogos Oficiales (BOE/BOCAA). Eres invisible para nuestro backend.</p>
                    </div>

                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Lock className="w-5 h-5 text-accent"/> 2. Cifrado local avanzado AES-256</h3>
                      <p className="text-muted leading-relaxed mb-4 text-sm">Puedes activar la encriptación local. Antes de que cualquier archivo se guarde en tu disco duro o nube, se cifra usando tu clave maestra dentro de tu navegador.</p>
                      
                      <div className="bg-surface border border-border p-4 rounded-lg">
                        <label className="block text-sm font-medium text-foreground mb-2">Establecer clave de seguridad (no se guarda en ningún sitio)</label>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm" 
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
                      <p className="text-muted leading-relaxed text-sm">Hemos implementado una política estricta de seguridad de contenido (CSP) para bloquear scripts maliciosos de terceros.</p>
                    </div>

                    <div className="p-5 bg-background rounded-xl border border-border/50">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-accent"/> 4. Servidor blindado y siempre disponible</h3>
                      <p className="text-muted leading-relaxed text-sm">Nuestro servidor backend incorpora <strong>Rate Limiting</strong>, garantizando que siempre tendrás acceso al catálogo oficial de módulos.</p>
                    </div>
                  </div>
                </section>
              )}

            </Card>
          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
