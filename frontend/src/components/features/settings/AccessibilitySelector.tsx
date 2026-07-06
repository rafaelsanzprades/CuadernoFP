"use client";

import { useEffect, useState, useRef } from "react";
import { Accessibility, Type, Volume2, Contrast, ZapOff, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AccessibilitySelector() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [fontSizeScale, setFontSizeScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Load from local storage
  useEffect(() => {
    setMounted(true);
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

  // Handle click outside to close dropdown
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

  // Handle TTS (Text To Speech) on click
  useEffect(() => {
    if (!ttsEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    function handleGlobalClick(e: MouseEvent) {
      // Don't trigger if clicking inside the accessibility menu itself
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        return;
      }

      const target = e.target as HTMLElement;
      // Find the closest textual element
      const textElement = target.closest("p, h1, h2, h3, h4, h5, h6, span, button, a, li, label, th, td") as HTMLElement | null;
      
      if (textElement && textElement.textContent) {
        // Stop current speech
        window.speechSynthesis.cancel();
        
        const text = textElement.textContent.trim();
        if (text) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "es-ES";
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);

          // Optional: Highlight the element being read
          const originalOutline = textElement.style.outline;
          textElement.style.outline = "2px solid var(--accent-color)";
          textElement.style.outlineOffset = "2px";
          
          utterance.onend = () => {
            textElement.style.outline = originalOutline;
          };
          utterance.onerror = () => {
            textElement.style.outline = originalOutline;
          };
        }
      }
    }

    document.addEventListener("click", handleGlobalClick, { capture: true });
    
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
      window.speechSynthesis.cancel();
    };
  }, [ttsEnabled]);

  const changeFontSize = (scale: number) => {
    setFontSizeScale(scale);
    localStorage.setItem("a11y-font-size", scale.toString());
    document.documentElement.style.fontSize = `${scale}%`;
  };

  const toggleHighContrast = () => {
    const newState = !highContrast;
    setHighContrast(newState);
    localStorage.setItem("a11y-high-contrast", newState.toString());
    if (newState) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  };

  const toggleReduceMotion = () => {
    const newState = !reduceMotion;
    setReduceMotion(newState);
    localStorage.setItem("a11y-reduce-motion", newState.toString());
    if (newState) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  };

  const toggleTts = () => {
    const newState = !ttsEnabled;
    setTtsEnabled(newState);
    localStorage.setItem("a11y-tts", newState.toString());
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/10 transition-colors w-full group relative"
        title="Opciones de Accesibilidad"
      >
        <Accessibility className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {(fontSizeScale !== 100 || highContrast || ttsEnabled || reduceMotion) && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 p-5 glass-card border-[var(--glass-border)] z-50 rounded-xl shadow-xl bg-background/95 backdrop-blur-xl">
          <div className="space-y-5">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
                <Type className="w-4 h-4 text-accent" /> Tamaño de Texto
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changeFontSize(100)}
                  className={`text-xs ${fontSizeScale === 100 ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  Normal
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changeFontSize(115)}
                  className={`text-sm ${fontSizeScale === 115 ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  Grande
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changeFontSize(130)}
                  className={`text-base font-bold ${fontSizeScale === 130 ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  Extra
                </Button>
              </div>
            </div>

            <hr className="border-[var(--glass-border)]" />

            <div>
              <h4 className="font-semibold text-sm mb-3 text-foreground">Asistencias Visuales</h4>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleHighContrast}
                  className={`w-full flex justify-between ${highContrast ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  <span className="flex items-center gap-2"><Contrast className="w-4 h-4" /> Alto Contraste</span>
                  {highContrast && <Check className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleReduceMotion}
                  className={`w-full flex justify-between ${reduceMotion ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  <span className="flex items-center gap-2"><ZapOff className="w-4 h-4" /> Reducir Animaciones</span>
                  {reduceMotion && <Check className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <hr className="border-[var(--glass-border)]" />

            <div>
              <h4 className="font-semibold text-sm mb-3 text-foreground">Lectura en voz alta</h4>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTts}
                className={`w-full flex flex-col items-start gap-1 p-3 h-auto ${ttsEnabled ? "border-accent text-accent bg-accent/10" : ""}`}
              >
                <div className="flex justify-between w-full items-center">
                  <span className="flex items-center gap-2 font-medium">
                    <Volume2 className="w-4 h-4" /> Modo Lector (Click)
                  </span>
                  {ttsEnabled && <Check className="w-4 h-4" />}
                </div>
                <p className="text-[10px] text-muted text-left leading-tight whitespace-normal mt-1 opacity-80 font-normal">
                  Activa esta opción y haz click en cualquier texto de la pantalla para que sea leído en voz alta.
                </p>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
