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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        <main className="flex-1 p-8 content-area overflow-y-auto scrollbar-hide">
          <MotionWrapper className="space-y-4 pb-12">
            
            {/* Header */}
            <div>
              <h1 className="text-[1.3rem] font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <span className="inline-flex"><User className="w-[1.2em] h-[1.2em] mr-1" /></span> Perfil y configuración
              </h1>
              <p className="text-muted mt-2 text-lg">
                Personaliza la apariencia, el idioma y las opciones de accesibilidad de la aplicación.
              </p>
            </div>

            {/* Main Settings Card */}
            <Card className="p-8 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl mt-6 space-y-8">
              
              {/* Aspecto */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sun className="w-5 h-5 text-accent" /> Aspecto
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

              <hr className="border-[var(--glass-border)]" />

              {/* Idioma */}
              <section className="space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" /> Idioma
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

              <hr className="border-[var(--glass-border)]" />

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
                  <div className="space-y-3 pt-2">
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
              </section>

            </Card>
          </MotionWrapper>
        </main>
      </div>
    </div>
  );
}
