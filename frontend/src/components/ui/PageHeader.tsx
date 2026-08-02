import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <h1 className="text-heading font-bold tracking-tight flex items-center gap-3 text-foreground">
        <Icon className="w-8 h-8 text-accent shrink-0" />
        {title}
      </h1>
      <p className="text-body text-muted mt-2">{description}</p>
    </div>
  );
}
