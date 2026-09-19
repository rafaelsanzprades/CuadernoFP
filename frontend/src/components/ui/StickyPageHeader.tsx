import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StickyPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

/** Título + descripción + barra de pestañas de una página, fijos arriba del
 * área de contenido mientras se hace scroll -- reemplaza el <PageHeader/> +
 * <Tabs/> sueltos que antes se desplazaban junto al resto del contenido.
 * Requiere que el <main> contenedor NO tenga su propio padding (p-8): este
 * componente pone su padding horizontal para que "sticky top-0" quede a ras
 * del borde superior del área con scroll, sin hueco. */
export function StickyPageHeader({ icon: Icon, title, description, children }: StickyPageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-[var(--glass-border)] px-8 pt-4 pb-3 shadow-sm">
      <h1 className="text-subheading font-bold tracking-tight flex items-center gap-2.5 text-foreground">
        <Icon className="w-6 h-6 text-accent shrink-0" />
        {title}
      </h1>
      <p className="text-caption text-muted mt-1 mb-3 hidden sm:block">{description}</p>
      {children}
    </div>
  );
}
