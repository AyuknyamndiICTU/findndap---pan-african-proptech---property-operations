import React, { useState } from 'react';
import {
  Smartphone,
  Radio,
  Download,
  ShieldCheck,
  Zap,
  Moon,
  Sun,
  ChevronUp,
  ChevronDown,
  Terminal,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { downloadFindNdapApk } from '../utils/apkGenerator';

interface FuturisticHudDockProps {
  onOpenLandlordConsole: () => void;
  onOpenAgentModal: () => void;
  onSwitchToRadar?: () => void;
  onSwitchToConsole?: () => void;
  activeHeroTab?: 'console' | 'radar';
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const FuturisticHudDock: React.FC<FuturisticHudDockProps> = ({
  onOpenLandlordConsole,
  onOpenAgentModal,
  onSwitchToRadar,
  onSwitchToConsole,
  activeHeroTab = 'console',
  themeMode = 'light',
  onToggleTheme,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300">
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff9827]/40 via-[#38bdf8]/30 to-[#002044]/40 blur-md opacity-70 pointer-events-none" />

      {/* Main Glassmorphic Dock Container */}
      <div className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#001733]/90 backdrop-blur-2xl border border-white/20 text-white shadow-[0_12px_40px_rgba(0,32,68,0.4)]">
        {/* Reticle / System Status Label */}
        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-white/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9827] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff9827]" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase leading-none">
              FINDNDAP OS
            </span>
            <span className="text-[9px] font-mono text-[#a8c8fe] leading-none mt-0.5 hidden md:block">
              HUD v2.4 • ONLINE
            </span>
          </div>
        </div>

        {/* View Switchers (Console vs Radar HUD) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (onSwitchToConsole) onSwitchToConsole();
              const hero = document.querySelector('section');
              if (hero) hero.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'console'
                ? 'bg-[#ff9827] text-white shadow-sm'
                : 'text-[#d5e3ff] hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile Hub</span>
          </button>

          <button
            onClick={() => {
              if (onSwitchToRadar) onSwitchToRadar();
              const hero = document.querySelector('section');
              if (hero) hero.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'radar'
                ? 'bg-[#ff9827] text-white shadow-sm'
                : 'text-[#d5e3ff] hover:text-white hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">3D Radar</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />

        {/* Fast Action: Landlord Operations */}
        <button
          onClick={onOpenLandlordConsole}
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold text-[#d5e3ff] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="hidden md:inline">Console</span>
        </button>

        {/* Fast Action: Agent KYC */}
        <button
          onClick={onOpenAgentModal}
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold text-[#d5e3ff] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Agent KYC</span>
        </button>

        {/* Fast Action: 1-Click APK Download */}
        <button
          onClick={() => downloadFindNdapApk('1.4.2')}
          className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-[#0f3563] text-white hover:bg-[#1a4b87] border border-white/15 transition-all flex items-center gap-1.5 shadow-sm"
          title="Direct Download FindNdap APK"
        >
          <Download className="w-3.5 h-3.5 text-[#ff9827]" />
          <span className="hidden sm:inline">APK v1.4.2</span>
        </button>

        {/* Atmosphere Mode Toggle: Cyber Dark vs Titanium Light */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#d5e3ff] hover:text-[#ff9827] transition-all ml-1"
            title={`Switch to ${themeMode === 'dark' ? 'Titanium Daylight' : 'Cyber Midnight'} Mode`}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#ff9827]" />
            ) : (
              <Moon className="w-4 h-4 text-[#38bdf8]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
