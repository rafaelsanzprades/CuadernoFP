import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';

interface NarrativeFieldProps {
  id: string; // the key in moduleData (textos_pd_* fields belong to Programación)
  title: string;
  description: string;
}

export function NarrativeField({ id, title, description }: NarrativeFieldProps) {
  const { moduleData, updateModuleData } = useAppStore();
  const value = moduleData?.[id as keyof typeof moduleData] || '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateModuleData(id as any, e.target.value);
  };

  return (
    <Card className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl flex flex-col gap-3 mb-6 shadow-sm hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-subheading font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-body text-muted-foreground mt-1">{description}</p>
      </div>
      <textarea 
        value={value as string} 
        onChange={handleChange}
        className="w-full min-h-[160px] p-4 rounded-md bg-background/50 border border-input text-body resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--text-primary)]"
        placeholder={`Escribe aquí sobre: ${title.toLowerCase()}...`}
      />
    </Card>
  );
}
