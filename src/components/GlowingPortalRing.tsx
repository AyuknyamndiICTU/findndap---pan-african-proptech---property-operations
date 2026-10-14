import React from 'react';

interface GlowingPortalRingProps {
  className?: string;
  size?: number; // default 520
}

export const GlowingPortalRing: React.FC<GlowingPortalRingProps> = ({
  className = '',
  size = 520,
}) => {
  return (
    <div
      className={`pointer-events-none absolute -inset-10 m-auto flex items-center justify-center -z-10 preserve-3d select-none ${className}`}
      style={{
        transform: 'translateZ(-40px)',
      }}
    >
      {/* Outer Luminous Atmospheric Aura */}
      <div className="absolute w-[95%] h-[95%] rounded-full bg-radial from-[#38bdf8]/20 via-[#ff9827]/15 to-transparent blur-3xl animate-portal-pulse" />

      {/* SVG Futuristic Portal Ring & Laser Orbit Track */}
      <svg
        className="w-full h-full max-w-[620px] max-h-[620px] overflow-visible"
        viewBox="0 0 500 500"
      >
        <defs>
          <linearGradient id="portal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ff9827" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>
          <filter id="portal-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Fine Telemetry Ring with High-Tech Dash Marks */}
        <circle
          cx="250"
          cy="250"
          r="235"
          fill="none"
          stroke="rgba(255, 152, 39, 0.25)"
          strokeWidth="1"
          strokeDasharray="4 8"
          className="animate-spin"
          style={{ animationDuration: '60s' }}
        />

        {/* Main Glowing Neon Energy Arc Ring */}
        <circle
          cx="250"
          cy="250"
          r="220"
          fill="none"
          stroke="url(#portal-gradient)"
          strokeWidth="2.5"
          filter="url(#portal-glow)"
          strokeDasharray="180 40 90 30"
          className="animate-spin"
          style={{ animationDuration: '24s' }}
        />

        {/* Inner Counter-Rotating Hairline Ring */}
        <circle
          cx="250"
          cy="250"
          r="205"
          fill="none"
          stroke="rgba(56, 189, 248, 0.35)"
          strokeWidth="1"
          strokeDasharray="12 12"
          className="animate-spin"
          style={{ animationDuration: '36s', animationDirection: 'reverse' }}
        />

        {/* Revolving Orbit Beacon (Like in Zenith Sound Sphere from Video) */}
        <g className="animate-spin" style={{ animationDuration: '12s', transformOrigin: '250px 250px' }}>
          <circle cx="250" cy="30" r="5" fill="#ff9827" filter="url(#portal-glow)" />
          <circle cx="250" cy="30" r="2.5" fill="#ffffff" />
        </g>
        <g className="animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse', transformOrigin: '250px 250px' }}>
          <circle cx="250" cy="455" r="4" fill="#38bdf8" filter="url(#portal-glow)" />
          <circle cx="250" cy="455" r="2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
