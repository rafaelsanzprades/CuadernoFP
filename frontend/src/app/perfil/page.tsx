"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TabSync } from "@/components/ui/TabSync";
import { Sun, Moon, Globe, Type, Contrast, ZapOff, Volume2, Check, User, Info } from "lucide-react";
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
              <p className="text-muted mt-2 text-base">
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
