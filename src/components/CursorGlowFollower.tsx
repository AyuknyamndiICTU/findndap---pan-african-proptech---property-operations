import React, { useEffect, useState } from 'react';

export const CursorGlowFollower: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only enable on fine pointer (desktop / mouse) devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') ||
          target.closest('a') ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer');
        setIsPointer(!!isClickable);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999] transition-opacity duration-300"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Outer ambient futuristic glow */}
      <div
        className={`rounded-full blur-2xl transition-all duration-300 ${
          isPointer
            ? 'w-44 h-44 bg-gradient-to-r from-[#ff9827]/35 via-[#002044]/20 to-[#a8c8fe]/30 scale-125'
            : 'w-32 h-32 bg-gradient-to-r from-[#ff9827]/20 via-[#d5e3ff]/20 to-transparent'
        }`}
      />
      {/* Inner precise tech reticle when hovering clickable elements */}
      {isPointer && (
        <div className="absolute inset-0 m-auto w-6 h-6 rounded-full border border-[#ff9827]/70 animate-ping opacity-60 pointer-events-none" />
      )}
    </div>
  );
};
