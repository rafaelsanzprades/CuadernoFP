"use client";
import { LucideIcon } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Título de sección reutilizable -- tamaño, blanco, línea fina
   debajo y separación entre apartados (estilo validado primero en
   /legal, con numeración; reutilizado luego en otras páginas con
   icono en vez de número, p.ej. TabComunidades en /normativa). Usa
   `number` para el estilo "1. Texto" o `icon` para el estilo
   "[icono] Texto" -- no combinar ambos.
   ────────────────────────────────────────────────────────────── */
interface SectionHeadingProps {
  id?: string;
  number?: number;
  icon?: LucideIcon;
  scrollMt?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ id, number, icon: Icon, scrollMt, children, className }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      style={scrollMt ? { scrollMarginTop: scrollMt } : undefined}
      className={`text-subheading font-bold text-foreground border-b border-[var(--glass-border)] pb-2 flex items-center gap-2 ${className || ""}`}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span>{number != null ? `${number}. ` : ""}{children}</span>
    </h2>
  );
}
