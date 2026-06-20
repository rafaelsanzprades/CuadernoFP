"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ACCENT_COLORS = [
  { name: "Verde Cuaderno", value: "#14a085" },
  { name: "Azul Institucional", value: "#3b82f6" },
  { name: "Morado Discord", value: "#8b5cf6" },
  { name: "Naranja Atardecer", value: "#f97316" },
  { name: "Rosa Chicle", value: "#ec4899" },
  { name: "Gris Carbón", value: "#475569" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState("#14a085");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedAccent = localStorage.getItem("cuaderno-accent-color");
    if (savedAccent) {
      setAccent(savedAccent);
      document.documentElement.style.setProperty("--accent-color", savedAccent);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAccentChange = (color: string) => {
    setAccent(color);
    localStorage.setItem("cuaderno-accent-color", color);
    document.documentElement.style.setProperty("--accent-color", color);
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/10 transition-colors w-full group"
        title="Ajustes de Apariencia"
      >
        <Palette className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 p-4 glass-card border-[var(--glass-border)] z-50 rounded-xl shadow-xl bg-background/95 backdrop-blur-xl">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 text-foreground">Modo de Visualización</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={`flex gap-2 justify-start ${theme === "light" ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  <Sun className="w-4 h-4" /> Claro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={`flex gap-2 justify-start ${theme === "dark" ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  <Moon className="w-4 h-4" /> Oscuro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("oled")}
                  className={`flex gap-2 justify-start ${theme === "oled" ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  <Monitor className="w-4 h-4" /> OLED
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme("system")}
                  className={`flex gap-2 justify-start ${theme === "system" ? "border-accent text-accent bg-accent/10" : ""}`}
                >
                  <Monitor className="w-4 h-4" /> Auto
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2 text-foreground">Color de Acento</h4>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleAccentChange(color.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${accent === color.value ? "scale-125 border-foreground" : "border-transparent hover:scale-110"}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
