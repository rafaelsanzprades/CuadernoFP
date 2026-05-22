import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>}
      <select 
        className={`w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
