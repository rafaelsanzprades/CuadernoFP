import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
}

export function Button({ children, className = '', variant = 'primary', ...props }: ButtonProps) {
  const baseStyle = "font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30";
      break;
    case 'secondary':
      variantStyle = "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30";
      break;
    case 'danger':
      variantStyle = "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30";
      break;
    case 'success':
      variantStyle = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30";
      break;
    case 'ghost':
      variantStyle = "bg-transparent shadow-none border-none hover:bg-foreground/5 text-muted hover:text-foreground";
      break;
  }

  return (
    <button className={`glass-button ${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
}
