import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  let variantStyle = "";
  
  switch (variant) {
    case 'success':
      variantStyle = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      break;
    case 'danger':
      variantStyle = "bg-red-500/20 text-red-400 border-red-500/30";
      break;
    case 'warning':
      variantStyle = "bg-amber-500/20 text-amber-400 border-amber-500/30";
      break;
    case 'info':
      variantStyle = "bg-blue-500/20 text-blue-300 border-blue-500/30";
      break;
    case 'default':
      variantStyle = "bg-foreground/10 text-foreground/80 border-[var(--glass-border)]";
      break;
  }

  return (
    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wide border flex items-center gap-1 w-fit ${variantStyle} ${className}`} {...props}>
      {children}
    </span>
  );
}
