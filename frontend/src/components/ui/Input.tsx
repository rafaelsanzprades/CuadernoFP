import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-foreground/80 mb-2">{label}</label>}
      <input 
        className={`w-full bg-foreground/10 border border-[var(--glass-border)] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-blue-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
