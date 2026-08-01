import { Info } from "lucide-react";

interface TabInfoBoxProps {
  description: string;
}

export function TabInfoBox({ description }: TabInfoBoxProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
      <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}
