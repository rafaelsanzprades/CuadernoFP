"use client";

import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "ba", label: "Balear" },
  { code: "ca", label: "Català" },
  { code: "es", label: "Español" },
  { code: "eu", label: "Euskara" },
  { code: "gl", label: "Galego" },
  { code: "va", label: "Valencià" },
  { code: "en", label: "English" }
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES.find((l) => l.code === "es")!;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-md text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
        title="Cambiar idioma"
        aria-label="Cambiar idioma"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline-block">{currentLang.code.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-32 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg shadow-xl overflow-hidden z-50 backdrop-blur-xl"
          >
            <div className="py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-center px-3 py-2 text-xs flex items-center justify-center gap-2 hover:bg-foreground/10 transition-colors ${
                    i18n.language === lang.code ? "bg-accent/10 text-accent font-semibold" : "text-[var(--text-primary)]"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
