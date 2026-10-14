import React, { useRef, useState, MouseEvent } from 'react';

interface FuturisticTiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  maxTilt?: number; // max tilt angle in degrees (default 12)
  perspective?: number; // default 1000px
  glareOpacity?: number; // default 0.2
  holographicBorder?: boolean;
  borderLaser?: boolean;
  hudCorners?: boolean;
}

export const FuturisticTiltCard: React.FC<FuturisticTiltCardProps> = ({
  children,
  className = '',
  onClick,
  maxTilt = 10,
  perspective = 1000,
  glareOpacity = 0.25,
  holographicBorder = true,
  borderLaser = false,
  hudCorners = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (-1 to 1)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) * 100;
    const yPct = (mouseY / height) * 100;

    const xOffset = (mouseX - width / 2) / (width / 2);
    const yOffset = (mouseY - height / 2) / (height / 2);

    // Calculate tilt (inverted for natural 3D physics feel)
    const rX = -yOffset * maxTilt;
    const rY = xOffset * maxTilt;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: xPct, y: yPct, opacity: glareOpacity });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setScale(1.02);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setScale(1);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full"
    >
      <div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
          transition: isHovered
            ? 'transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1)'
            : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden preserve-3d will-change-transform ${
          holographicBorder
            ? 'border border-white/20 hover:border-[#ff9827]/60 transition-colors'
            : ''
        } ${className}`}
      >
        {/* Dynamic Specular Spotlight / Glare Following Mouse */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(400px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 152, 39, 0.25), rgba(213, 227, 255, 0.15) 30%, transparent 70%)`,
          }}
        />

        {/* Futuristic Laser Sweep Line on Hover */}
        {borderLaser && isHovered && (
          <div className="pointer-events-none absolute -inset-x-20 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff9827] to-transparent animate-laser z-40 opacity-80" />
        )}

        {/* Ambient Corner Flare */}
        <div
          className={`pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br from-[#ff9827]/20 to-transparent blur-xl transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-30'
          }`}
        />

        {/* Technical HUD Corner Reticles (Zenith style) */}
        {hudCorners && (
          <>
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />
          </>
        )}

        {/* Content with 3D Depth */}
        <div className="relative z-10 w-full h-full preserve-3d">
          {children}
        </div>
      </div>
    </div>
  );
};
