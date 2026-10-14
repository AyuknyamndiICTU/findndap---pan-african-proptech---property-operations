import React from 'react';

interface FloatingHolographicBadgeProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // translateZ in px
  delay?: string; // animation delay
  reverse?: boolean;
}

export const FloatingHolographicBadge: React.FC<FloatingHolographicBadgeProps> = ({
  children,
  className = '',
  depth = 40,
  delay = '0s',
  reverse = false,
}) => {
  return (
    <div
      style={{
        transform: `translateZ(${depth}px)`,
        animationDelay: delay,
      }}
      className={`absolute z-30 pointer-events-auto backdrop-blur-md shadow-2xl preserve-3d transition-transform hover:scale-105 duration-300 ${
        reverse ? 'animate-float-drift-reverse' : 'animate-float-drift'
      } ${className}`}
    >
      {/* Specular glass sheen */}
      <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br from-white/95 via-white/85 to-[#eaedff]/90 p-3 shadow-[0_8px_32px_rgba(0,32,68,0.18)]">
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 pointer-events-none" />
        {children}
      </div>
    </div>
  );
};
