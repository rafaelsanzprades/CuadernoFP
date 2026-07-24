"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sun, Moon, Globe, Type, Contrast, ZapOff, Volume2, Check, User } from "lucide-react";
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <MotionWrapper className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <User className="w-7 h-7 text-accent" /> Perfil y configuración
              </h1>
              <p className="text-muted mt-1">
                Personaliza la apariencia, el idioma y las opciones de accesibilidad de la aplicación.
              </p>
            </div>

            {/* Main Settings Card */}
            <Card className="p-6 md:p-8 space-y-8 bg-card border border-border/40 shadow-xl rounded-2xl">
              
              {/* Aspecto */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sun className="w-5 h-5 text-accent" /> Aspecto
                </h2>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      theme === "light"
                        ? "bg-accent/20 border-accent text-accent font-bold"
                        : "bg-white/5 border-white/10 text-muted hover:text-foreground hover:bg-white/10"
                    }`}
                  >
                    <Sun className="w-5 h-5" /> Claro
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      theme === "dark"
                        ? "bg-accent/20 border-accent text-accent font-bold"
                        : "bg-white/5 border-white/10 text-muted hover:text-foreground hover:bg-white/10"
                    }`}
                  >
                    <Moon className="w-5 h-5" /> Oscuro
                  </Button>
                </div>
              </section>

              <hr className="border-border/30" />

              {/* Idioma */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" /> Idioma
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="secondary"
                      size="md"
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center justify-center py-2.5 rounded-xl border transition-all ${
                        currentLang.code === lang.code
                          ? "bg-accent/20 border-accent text-accent font-bold"
                          : "bg-white/5 border-white/10 text-muted hover:text-foreground hover:bg-white/10"
                      }`}
                    >
                      <span>{lang.label}</span>
                    </Button>
                  ))}
                </div>
              </section>

              <hr className="border-border/30" />

              {/* Accesibilidad */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Type className="w-5 h-5 text-accent" /> Accesibilidad
                </h2>
                
                <div className="space-y-4 max-w-xl">
                  {/* Tamaño de letra */}
                  <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                      Tamaño del texto
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => changeFontSize(100)}
                        className={`rounded-xl border ${
                          fontSizeScale === 100
                            ? "bg-accent/20 border-accent text-accent font-bold"
                            : "bg-white/5 border-white/10 text-muted hover:text-foreground"
                        }`}
                      >
                        Normal
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => changeFontSize(115)}
                        className={`rounded-xl border ${
                          fontSizeScale === 115
                            ? "bg-accent/20 border-accent text-accent font-bold"
                            : "bg-white/5 border-white/10 text-muted hover:text-foreground"
                        }`}
                      >
                        Grande
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => changeFontSize(130)}
                        className={`rounded-xl border font-bold ${
                          fontSizeScale === 130
                            ? "bg-accent/20 border-accent text-accent"
                            : "bg-white/5 border-white/10 text-muted hover:text-foreground"
                        }`}
                      >
                        Extra
                      </Button>
                    </div>
                  </div>

                  {/* Opciones adicionales */}
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={toggleHighContrast}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border ${
                        highContrast
                          ? "bg-accent/20 border-accent text-accent font-bold"
                          : "bg-white/5 border-white/10 text-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Contrast className="w-5 h-5 text-accent" /> Alto contraste
                      </span>
                      {highContrast && <Check className="w-5 h-5 text-accent" />}
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={toggleReduceMotion}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border ${
                        reduceMotion
                          ? "bg-accent/20 border-accent text-accent font-bold"
                          : "bg-white/5 border-white/10 text-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <ZapOff className="w-5 h-5 text-accent" /> Reducir animaciones
                      </span>
                      {reduceMotion && <Check className="w-5 h-5 text-accent" />}
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={toggleTts}
                      className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border ${
                        ttsEnabled
                          ? "bg-accent/20 border-accent text-accent font-bold"
                          : "bg-white/5 border-white/10 text-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-accent" /> Lector en voz alta
                      </span>
                      {ttsEnabled && <Check className="w-5 h-5 text-accent" />}
                    </Button>
                  </div>
                </div>
              </section>

            </Card>
          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
