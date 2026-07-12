"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, Globe, Moon, Sun, Type, Contrast, ZapOff, Volume2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ca", label: "Català", flag: "🟡" },
  { code: "gl", label: "Galego", flag: "🔵" },
  { code: "eu", label: "Euskara", flag: "🟢" },
  { code: "en", label: "English", flag: "🇬🇧" }
];

export function HeaderSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { i18n, t } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  // Accessibility States
  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Load A11y from local storage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("a11y-font-size");
    if (savedFontSize) {
      const parsed = parseInt(savedFontSize, 10);
      setFontSizeScale(parsed);
      document.documentElement.style.fontSize = `${parsed}%`;
    }

    const savedContrast = localStorage.getItem("a11y-high-contrast") === "true";
    if (savedContrast) {
      setHighContrast(true);
      document.documentElement.classList.add("high-contrast");
    }

    const savedMotion = localStorage.getItem("a11y-reduce-motion") === "true";
    if (savedMotion) {
      setReduceMotion(true);
      document.documentElement.classList.add("reduce-motion");
    }

    const savedTts = localStorage.getItem("a11y-tts") === "true";
    if (savedTts) {
      setTtsEnabled(true);
    }
  }, []);

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

  // Handle TTS
  useEffect(() => {
    if (!ttsEnabled) {
      window.speechSynthesis.cancel();
      return;
    }
    function handleGlobalClick(e: MouseEvent) {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) return;
      const target = e.target as HTMLElement;
      const textElement = target.closest("p, h1, h2, h3, h4, h5, h6, span, button, a, li, label, th, td") as HTMLElement | null;
      if (textElement && textElement.textContent) {
        window.speechSynthesis.cancel();
        const text = textElement.textContent.trim();
        if (text) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "es-ES";
          window.speechSynthesis.speak(utterance);
          const originalOutline = textElement.style.outline;
          textElement.style.outline = "2px solid var(--accent-color)";
          textElement.style.outlineOffset = "2px";
          utterance.onend = () => { textElement.style.outline = originalOutline; };
          utterance.onerror = () => { textElement.style.outline = originalOutline; };
        }
      }
    }
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [ttsEnabled]);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
  };

  const changeFontSize = (scale: number) => {
    setFontSizeScale(scale);
    document.documentElement.style.fontSize = `${scale}%`;
    localStorage.setItem("a11y-font-size", scale.toString());
  };

  const toggleHighContrast = () => {
    const newVal = !highContrast;
    setHighContrast(newVal);
    localStorage.setItem("a11y-high-contrast", newVal.toString());
    if (newVal) document.documentElement.classList.add("high-contrast");
    else document.documentElement.classList.remove("high-contrast");
  };

  const toggleReduceMotion = () => {
    const newVal = !reduceMotion;
    setReduceMotion(newVal);
    localStorage.setItem("a11y-reduce-motion", newVal.toString());
    if (newVal) document.documentElement.classList.add("reduce-motion");
    else document.documentElement.classList.remove("reduce-motion");
  };

  const toggleTts = () => {
    const newVal = !ttsEnabled;
    setTtsEnabled(newVal);
    localStorage.setItem("a11y-tts", newVal.toString());
  };

  const hasActiveA11y = fontSizeScale !== 100 || highContrast || ttsEnabled || reduceMotion;
  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

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
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-accent" /> Aspecto
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                  >
                    <Sun className="w-4 h-4" /> Claro
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                  >
                    <Moon className="w-4 h-4" /> Oscuro
                  </Button>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Language */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" /> Idioma
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <Button
                      key={lang.code}
                      variant="secondary"
                      size="sm"
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex justify-start gap-2 ${currentLang.code === lang.code ? 'bg-accent/20 border-accent text-accent' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
                    >
                      <span>{lang.flag}</span> <span>{lang.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Accessibility */}
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-accent" /> Accesibilidad
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => changeFontSize(100)} className={`text-xs ${fontSizeScale === 100 ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>Normal</Button>
                    <Button variant="secondary" size="sm" onClick={() => changeFontSize(115)} className={`text-sm ${fontSizeScale === 115 ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>Grande</Button>
                    <Button variant="secondary" size="sm" onClick={() => changeFontSize(130)} className={`text-base font-bold ${fontSizeScale === 130 ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>Extra</Button>
                  </div>
                  
                  <Button variant="secondary" size="sm" onClick={toggleHighContrast} className={`w-full flex justify-between ${highContrast ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                    <span className="flex items-center gap-2"><Contrast className="w-4 h-4" /> Alto Contraste</span>
                    {highContrast && <Check className="w-4 h-4" />}
                  </Button>
                  
                  <Button variant="secondary" size="sm" onClick={toggleReduceMotion} className={`w-full flex justify-between ${reduceMotion ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                    <span className="flex items-center gap-2"><ZapOff className="w-4 h-4" /> Reducir Animaciones</span>
                    {reduceMotion && <Check className="w-4 h-4" />}
                  </Button>

                  <Button variant="secondary" size="sm" onClick={toggleTts} className={`w-full flex justify-between ${ttsEnabled ? "bg-accent/20 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}>
                    <span className="flex items-center gap-2"><Volume2 className="w-4 h-4" /> Lector en voz alta</span>
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
