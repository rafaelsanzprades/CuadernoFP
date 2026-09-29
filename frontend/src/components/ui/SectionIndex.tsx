"use client";
import { useTranslation } from "react-i18next";

/* ──────────────────────────────────────────────────────────────
   Mini-índice reutilizable con anclas internas -- estilo validado
   primero en /legal, luego reutilizado en /normativa: un único
   cajón (borde en el `nav`) engloba todas las pastillas, que van
   siempre en texto blanco y sin borde propio (el cajón ya delimita
   el bloque, un borde por pastilla es redundante). Vive normalmente
   dentro de un StickyPageHeader, justo debajo de la descripción de
   la pestaña activa, así que queda fijo mientras se hace scroll.
   ────────────────────────────────────────────────────────────── */
// bare: prueba (2026-09-28, /inicio?tab=bienvenida) -- sin el cajón global;
// en su lugar, cada pastilla lleva su propio marquito blanco fino.
export function SectionIndex({ items, bare = false }: { items: { id: string; label: string }[]; bare?: boolean }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <nav
      aria-label={t('aria.comun.indiceSecciones', {defaultValue: 'Índice de secciones'})}
      className={`flex flex-wrap gap-2 mt-3 ${bare ? "" : "p-3 rounded-xl bg-background/40 backdrop-blur-md border border-[var(--glass-border)]"}`}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`text-caption font-medium px-3 py-1.5 rounded-lg text-white hover:bg-white/10 transition-colors ${bare ? "border border-white/20" : ""}`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
