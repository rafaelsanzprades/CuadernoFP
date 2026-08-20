import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from 'react-i18next';

interface NarrativeFieldProps {
  id: string; // the key in moduleData (textos_pd_* fields belong to Programación)
  title: string;
  description: string;
}

export function NarrativeField({ id, title, description }: NarrativeFieldProps) {
  const { t } = useTranslation();
  const { moduleData, updateModuleData } = useAppStore();
  const value = moduleData?.[id as keyof typeof moduleData] || '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateModuleData(id as any, e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-body font-semibold text-foreground">{title}</h3>
        <p className="text-caption text-muted mt-0.5">{description}</p>
      </div>
      <textarea
        value={value as string}
        onChange={handleChange}
        className="w-full min-h-[160px] p-4 rounded-md bg-foreground/15 border border-[var(--glass-border)] text-body resize-y focus:outline-none focus:border-info text-foreground"
        placeholder={t('placeholders.comun.escribeSobre', {tema: title.toLowerCase(), defaultValue: `Escribe aquí sobre: ${title.toLowerCase()}...`})}
      />
    </div>
  );
}
