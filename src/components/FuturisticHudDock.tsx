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
import { APK_BUILDS, downloadApk } from '../utils/apk';
import { useI18n } from '../i18n/LanguageContext';

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
  const { t } = useI18n();
  const [isMinimized, setIsMinimized] = useState(false);
  const apkBuild = APK_BUILDS.stable;
  const apkLabel = apkBuild
    ? apkBuild.version
      ? t('hud.apkLabelVersion', { version: apkBuild.version })
      : t('hud.apkLabel')
    : t('hud.apkUnavailable');
  const themeLabel = themeMode === 'dark' ? t('hud.switchToLight') : t('hud.switchToDark');

  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-max max-w-[calc(100vw-1rem)] pointer-events-auto transition-all duration-300">
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff9827]/40 via-[#38bdf8]/30 to-[#002044]/40 blur-md opacity-70 pointer-events-none" />

      {/* Main Glassmorphic Dock Container */}
      <div className="relative flex items-center gap-0.5 sm:gap-2 px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#001733]/90 backdrop-blur-2xl border border-white/20 text-white shadow-[0_12px_40px_rgba(0,32,68,0.4)]">
        {/* Reticle / System Status Label (desktop only; phones keep the dock to icons) */}
        <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-white/15">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9827] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff9827]" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase leading-none">
              FINDNDAP OS
            </span>
            <span className="text-[9px] font-mono text-[#a8c8fe] leading-none mt-0.5 hidden md:block">
              {t('hud.status')}
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
            aria-label={t('hud.showMobileHub')}
            aria-pressed={activeHeroTab === 'console'}
            title={t('hud.mobileHub')}
            className={`w-10 h-10 sm:w-auto sm:h-auto justify-center sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'console'
                ? 'bg-[#ff9827] text-white shadow-sm'
                : 'text-[#d5e3ff] hover:text-white hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('hud.mobileHub')}</span>
          </button>

          <button
            onClick={() => {
              if (onSwitchToRadar) onSwitchToRadar();
              const hero = document.querySelector('section');
              if (hero) hero.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label={t('hud.showRadar')}
            aria-pressed={activeHeroTab === 'radar'}
            title={t('hud.radar')}
            className={`w-10 h-10 sm:w-auto sm:h-auto justify-center sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeHeroTab === 'radar'
                ? 'bg-[#ff9827] text-white shadow-sm'
                : 'text-[#d5e3ff] hover:text-white hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
            <span className="hidden sm:inline">{t('hud.radar')}</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-white/15 hidden sm:block" aria-hidden="true" />

        {/* Fast Action: Landlord Operations */}
        <button
          onClick={onOpenLandlordConsole}
          aria-label={t('hud.openConsole')}
          title={t('hud.consoleTitle')}
          className="w-10 h-10 sm:w-auto sm:h-auto justify-center sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-bold text-[#d5e3ff] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-[#38bdf8]" aria-hidden="true" />
          <span className="hidden md:inline">{t('hud.console')}</span>
        </button>

        {/* Fast Action: Agent KYC */}
        <button
          onClick={onOpenAgentModal}
          aria-label={t('hud.openKyc')}
          title={t('hud.kycTitle')}
          className="w-10 h-10 sm:w-auto sm:h-auto justify-center sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-bold text-[#d5e3ff] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span className="hidden lg:inline">{t('hud.kyc')}</span>
        </button>

        {/* Fast Action: 1-Click APK Download */}
        <button
          type="button"
          onClick={() => downloadApk(apkBuild)}
          disabled={!apkBuild}
          aria-disabled={!apkBuild}
          aria-label={apkLabel}
          title={apkLabel}
          className={`w-10 h-10 sm:w-auto sm:h-auto justify-center sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-bold bg-[#0f3563] text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-sm ${
            apkBuild ? 'hover:bg-[#1a4b87]' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
          <span className="hidden sm:inline">
            {apkBuild
              ? apkBuild.version
                ? t('hud.apkShortVersion', { version: apkBuild.version })
                : t('hud.apkShort')
              : t('hud.apkUnavailable')}
          </span>
        </button>

        {/* Atmosphere Mode Toggle: Cyber Dark vs Titanium Light */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center sm:p-1.5 rounded-full hover:bg-white/10 text-[#d5e3ff] hover:text-[#ff9827] transition-all sm:ml-1"
            aria-label={themeLabel}
            title={themeLabel}
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#ff9827]" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-[#38bdf8]" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
