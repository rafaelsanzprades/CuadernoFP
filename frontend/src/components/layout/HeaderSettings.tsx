"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Globe, Moon, Sun, Type, Contrast, ZapOff, Volume2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const LANGUAGES = [
  { code: "ba", label: "Balear" },
  { code: "ca", label: "Català" },
  { code: "es", label: "Español" },
  { code: "eu", label: "Euskara" },
  { code: "gl", label: "Galego" },
  { code: "va", label: "Valencià" },
  { code: "en", label: "English" }
];

import { useAccessibility } from "@/hooks/useAccessibility";

export function HeaderSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    hasActiveA11y,
    LANGUAGES
  } = useAccessibility();

  const { t } = useTranslation();

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/10 transition-colors relative"
        title={t('header.settings', { defaultValue: 'Configuración' })}
      >
        <Settings className="w-5 h-5" />
        {hasActiveA11y && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 p-5 z-50 rounded-xl shadow-2xl border border-white/10"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.98)", color: "#f8fafc" }}
          >
            <div className="space-y-6">
              
              {/* Theme */}
              <div>
                <h4 className="font-semibold text-body mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-accent" /> Aspecto
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                  >
                    <Sun className="w-4 h-4" /> {t('botones.header.claro', {defaultValue: 'Claro'})}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                  >
                    <Moon className="w-4 h-4" /> {t('botones.header.oscuro', {defaultValue: 'Oscuro'})}
                  </Button>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Language */}
              <div>
                <h4 className="font-semibold text-body mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" /> Idioma
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="secondary"
                      size="sm"
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex justify-center gap-2 ${currentLang.code === lang.code ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                    >
                      <span>{lang.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Accessibility */}
              <div>
                <h4 className="font-semibold text-body mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-accent" /> Accesibilidad
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => changeFontSize(100)} className={`text-caption ${fontSizeScale === 100 ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>{t('botones.header.normal', {defaultValue: 'Normal'})}</Button>
                    <Button variant="secondary" size="sm" onClick={() => changeFontSize(115)} className={`text-body ${fontSizeScale === 115 ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>{t('botones.header.grande', {defaultValue: 'Grande'})}</Button>
                    <Button variant="secondary" size="sm" onClick={() => changeFontSize(130)} className={`text-body font-bold ${fontSizeScale === 130 ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>{t('botones.header.extra', {defaultValue: 'Extra'})}</Button>
                  </div>

                  <Button variant="secondary" size="sm" onClick={toggleHighContrast} className={`w-full flex justify-between ${highContrast ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                    <span className="flex items-center gap-2"><Contrast className="w-4 h-4" /> {t('botones.header.altoContraste', {defaultValue: 'Alto contraste'})}</span>
                    {highContrast && <Check className="w-4 h-4" />}
                  </Button>

                  <Button variant="secondary" size="sm" onClick={toggleReduceMotion} className={`w-full flex justify-between ${reduceMotion ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                    <span className="flex items-center gap-2"><ZapOff className="w-4 h-4" /> {t('botones.header.reducirAnimaciones', {defaultValue: 'Reducir animaciones'})}</span>
                    {reduceMotion && <Check className="w-4 h-4" />}
                  </Button>

                  <Button variant="secondary" size="sm" onClick={toggleTts} className={`w-full flex justify-between ${ttsEnabled ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                    <span className="flex items-center gap-2"><Volume2 className="w-4 h-4" /> {t('botones.header.lectorVoz', {defaultValue: 'Lector en voz alta'})}</span>
                    {ttsEnabled && <Check className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
