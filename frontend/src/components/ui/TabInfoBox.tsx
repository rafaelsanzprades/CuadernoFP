import { Info } from "lucide-react";

interface TabInfoBoxProps {
  description: string;
  action?: React.ReactNode;
}

export function TabInfoBox({ description, action }: TabInfoBoxProps) {
  return (
    <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <p className="text-body text-muted">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
