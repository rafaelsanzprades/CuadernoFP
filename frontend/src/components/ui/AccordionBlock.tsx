import React from "react";
import { ChevronDown } from "lucide-react";

interface AccordionBlockProps {
  title: string | React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

export function AccordionBlock({ 
  title, 
  icon, 
  children, 
  defaultOpen = false, 
  className,
  badge 
}: AccordionBlockProps) {
  return (
    <details 
      className={[
        "group rounded-xl border border-border/50 bg-surface/50 overflow-hidden [&_summary::-webkit-details-marker]:hidden mb-4 shadow-sm",
        className
      ].filter(Boolean).join(" ")}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center justify-between p-4 md:p-5 font-bold text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 select-none">
        <div className="flex items-center gap-3">
          {icon && <span className="text-accent">{icon}</span>}
          <span className="text-caption">{title}</span>
          {badge && <span className="ml-2">{badge}</span>}
        </div>
        <span className="transition-transform duration-300 group-open:-rotate-180 text-muted">
          <ChevronDown className="w-5 h-5" />
        </span>
      </summary>
      <div className="p-4 md:p-5 pt-2 text-muted leading-relaxed border-t border-border/50 bg-background/30 animate-in slide-in-from-top-2 fade-in duration-300">
        {children}
      </div>
    </details>
  );
}
