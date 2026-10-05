"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

interface InfoTipProps {
  children: React.ReactNode;
  label?: string;
  align?: "left" | "right";
}

// Icono "i" con cartelito explicativo: se muestra al pasar el ratón o al
// enfocar con teclado, y también se abre/cierra al pulsar (táctil). Se cierra
// con Escape o al pulsar fuera. A diferencia de <Tooltip>, el texto puede ser
// largo (varias líneas). El cartelito va en un portal con posición fija: así
// no lo recorta ninguna tarjeta con `overflow` oculto.
export function InfoTip({ children, label = "Más información", align = "left" }: InfoTipProps) {
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const visible = pinned || hover;

  const WIDTH = 288; // w-72
  const viewportWidth = () => window.innerWidth || document.documentElement.clientWidth || 1280;

  useEffect(() => {
    if (!visible) return;
    const place = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const width = Math.min(WIDTH, viewportWidth() * 0.8);
      let left = align === "right" ? r.right - width : r.left;
      left = Math.max(8, Math.min(left, viewportWidth() - width - 8));
      setPos({ top: r.bottom + 8, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [visible, align]);

  useEffect(() => {
    if (!pinned) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || tipRef.current?.contains(target)) return;
      setPinned(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-describedby={visible ? id : undefined}
        aria-expanded={visible}
        onClick={() => setPinned((p) => !p)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="text-muted hover:text-accent focus:text-accent transition-colors rounded-full"
      >
        <Info className="w-[1.1em] h-[1.1em]" />
      </button>
      {visible && pos && typeof document !== "undefined" &&
        createPortal(
          <span
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.min(WIDTH, viewportWidth() * 0.8) }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="z-[100] block px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-background shadow-xl text-caption font-normal text-foreground/90 leading-snug text-left whitespace-normal"
          >
            {children}
          </span>,
          document.body,
        )}
    </span>
  );
}
