import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/Card';

interface NarrativeFieldProps {
  id: string; // the key in cursoData or moduleData
  title: string;
  description: string;
}

export function NarrativeField({ id, title, description }: NarrativeFieldProps) {
  const { cursoData, updateCursoData } = useAppStore();
  const value = cursoData?.[id as keyof typeof cursoData] || '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCursoData(id, e.target.value);
  };

  return (
    <Card className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl flex flex-col gap-3 mb-6 shadow-sm hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <textarea 
        value={value as string} 
        onChange={handleChange}
        className="w-full min-h-[160px] p-4 rounded-md bg-background/50 border border-input text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--text-primary)]"
        placeholder={`Escribe aquí sobre: ${title.toLowerCase()}...`}
      />
    </Card>
  );
}
