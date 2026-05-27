import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-foreground/80 mb-2">{label}</label>}
      <select 
        className={`w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
