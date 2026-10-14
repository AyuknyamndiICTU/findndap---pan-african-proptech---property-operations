import React, { useState, useRef, MouseEvent } from 'react';
import { ShieldCheck, Crosshair, Radio, MapPin, Zap, CheckCircle2 } from 'lucide-react';

interface CadastralNode {
  id: string;
  name: string;
  city: string;
  coords: string;
  tfNumber: string;
  units: number;
  x: number; // percentage in radar
  y: number; // percentage in radar
  status: 'active' | 'synced' | 'pending';
}

const NODES: CadastralNode[] = [
  {
    id: 'node-1',
    name: 'Résidence Le Cristal',
    city: 'Douala (Bonanjo)',
    coords: '4.0511° N, 9.7679° E',
    tfNumber: 'TF-DLA/2024/77812',
    units: 14,
    x: 35,
    y: 42,
    status: 'synced',
  },
  {
    id: 'node-2',
    name: 'Les Terrasses d’Akwa',
    city: 'Douala (Akwa)',
    coords: '4.0545° N, 9.7042° E',
    tfNumber: 'TF-DLA/2023/55419',
    units: 8,
    x: 68,
    y: 30,
    status: 'synced',
  },
  {
    id: 'node-3',
    name: 'Complexe Immobilier Bastos',
    city: 'Yaoundé (Bastos)',
    coords: '3.8833° N, 11.5167° E',
    tfNumber: 'TF-YDE/2024/99104',
    units: 22,
    x: 62,
    y: 72,
    status: 'synced',
  },
  {
    id: 'node-4',
    name: 'Villas Ocean View',
    city: 'Kribi (Ngoye)',
    coords: '2.9378° N, 9.9077° E',
    tfNumber: 'TF-KRB/2025/11028',
    units: 6,
    x: 24,
    y: 80,
    status: 'active',
  },
];

export const CadastralRadarHologram: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<CadastralNode>(NODES[0]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 18, y: x * 18 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl p-6 bg-gradient-to-b from-[#002044] via-[#001733] to-[#0a0f1d] text-white overflow-hidden shadow-2xl border border-white/15 preserve-3d transition-all duration-300 group cursor-crosshair"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 futuristic-grid-dark opacity-30 pointer-events-none" />

      {/* Holographic Radial Gradient Glow */}
      <div className="absolute inset-0 bg-radial from-[#ff9827]/15 via-transparent to-transparent pointer-events-none" />

      {/* Header telemetry */}
      <div className="relative z-20 flex items-center justify-between pb-4 border-b border-white/10 mb-4 preserve-3d">
        <div className="flex items-center gap-2.5" style={{ transform: 'translateZ(20px)' }}>
          <div className="w-8 h-8 rounded-xl bg-[#ff9827]/20 border border-[#ff9827]/50 flex items-center justify-center text-[#ff9827]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-[#ff9827] uppercase flex items-center gap-1.5">
              <span>Cadastral Radar 3D HUD</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[11px] text-[#a8c8fe] font-mono">
              MINDCAF Land Registry Satellite Link
            </div>
          </div>
        </div>

        <div
          className="px-3 py-1 rounded-full bg-[#0f3563] border border-white/15 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm"
          style={{ transform: 'translateZ(25px)' }}
        >
          <Crosshair className="w-3 h-3 text-[#ff9827]" />
          <span>SATELLITE SYNC: 99.8%</span>
        </div>
      </div>

      {/* Main Radar Screen Visual */}
      <div className="relative h-64 w-full flex items-center justify-center my-2 preserve-3d">
        {/* Radar Concentric Rings */}
        <div className="absolute w-56 h-56 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-44 h-44 rounded-full border border-white/15 border-dashed flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-[#ff9827]/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff9827] shadow-[0_0_12px_#ff9827]" />
              </div>
            </div>
          </div>
        </div>

        {/* Crosshair Axes */}
        <div className="absolute w-56 h-[1px] bg-white/15" />
        <div className="absolute h-56 w-[1px] bg-white/15" />

        {/* Rotating Radar Scanner Beam */}
        <div className="absolute w-56 h-56 rounded-full overflow-hidden pointer-events-none">
          <div
            className="w-full h-full origin-center animate-radar"
            style={{
              background: 'conic-gradient(from 0deg, rgba(255, 152, 39, 0.35) 0deg, rgba(255, 152, 39, 0) 60deg, transparent 360deg)',
            }}
          />
        </div>

        {/* Interactive Cadastral Nodes on Radar */}
        {NODES.map((node) => {
          const isSelected = activeNode.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setActiveNode(node)}
              onMouseEnter={() => setActiveNode(node)}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: `translate(-50%, -50%) translateZ(${isSelected ? 35 : 15}px)`,
              }}
              className={`absolute z-30 transition-all duration-300 group/node focus:outline-none ${
                isSelected ? 'scale-125' : 'hover:scale-110 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Outer pulse ring */}
              <span
                className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                  isSelected ? 'bg-[#ff9827]' : 'bg-emerald-400'
                }`}
              />
              {/* Core Beacon */}
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#ff9827] shadow-[0_0_15px_#ff9827]'
                    : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                }`}
              />
              {/* Node City Label floating */}
              <span
                className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono transition-opacity ${
                  isSelected
                    ? 'bg-[#002044] text-[#ff9827] border border-[#ff9827]/60 font-bold opacity-100 shadow-md'
                    : 'bg-black/60 text-white/80 opacity-0 group-hover/node:opacity-100'
                }`}
              >
                {node.city.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry Card for Selected Property */}
      <div
        className="relative z-20 mt-2 p-3.5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md preserve-3d"
        style={{ transform: 'translateZ(25px)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <MapPin className="w-3.5 h-3.5 text-[#ff9827]" />
              <span>{activeNode.name}</span>
            </div>
            <div className="text-[11px] font-mono text-[#a8c8fe] mt-0.5">
              {activeNode.city} • <span className="text-[#ff9827]">{activeNode.coords}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#d5e3ff]">
            Titre Foncier: <span className="text-white font-bold">{activeNode.tfNumber}</span>
          </span>
          <span className="text-[#ff9827] font-bold">
            {activeNode.units} Units Active
          </span>
        </div>
      </div>
    </div>
  );
};
