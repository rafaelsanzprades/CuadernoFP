import React, { useState, MouseEvent } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: 'top' | 'left' | 'none';
  accentColor?: string;
  glow?: boolean;
}

export function Card({ children, className = '', accent = 'none', accentColor, glow = false, ...props }: CardProps) {
  const accentClass = accent === 'top' ? 'border-t-4 border-t-accent' :
    accent === 'left' ? 'border-l-4 border-l-accent' : '';

  const customAccent = accentColor && accent !== 'none'
    ? { borderTopColor: accent === 'top' ? accentColor : undefined,
        borderLeftColor: accent === 'left' ? accentColor : undefined }
    : {};

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!glow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className={`relative glass-card overflow-hidden ${accentClass} ${glow ? 'group' : ''} ${className}`}
      style={Object.keys(customAccent).length ? customAccent : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      {glow && isHovering && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent-color), transparent 40%)`,
            opacity: 0.15
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
