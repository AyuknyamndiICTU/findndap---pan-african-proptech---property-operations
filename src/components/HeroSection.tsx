import React, { useState, useRef, MouseEvent } from 'react';
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Lock,
  ArrowUpRight,
  Activity,
  Radio,
  Sparkles,
  MapPin,
  TrendingUp,
  Cpu,
  Eye,
  Zap,
  Globe
} from 'lucide-react';
import { APK_BUILDS, downloadApk } from '../utils/apk';
import { formatXaf } from '../utils/format';
import { BrandLogo } from './BrandLogo';
import { Building, DashboardStats, FinancialRecord } from '../types';
import { FuturisticTiltCard } from './FuturisticTiltCard';
import { CadastralRadarHologram, formatCoordinates, getCityCoordinates } from './CadastralRadarHologram';
import { FloatingHolographicBadge } from './FloatingHolographicBadge';
import { GlowingPortalRing } from './GlowingPortalRing';
import { useI18n } from '../i18n/LanguageContext';

interface HeroSectionProps {
  onRegisterAgentClick: () => void;
  onOpenLandlordConsole: () => void;
  stats?: DashboardStats | null;
  themeMode?: 'dark' | 'light';
  activeTab?: 'console' | 'radar';
  onTabChange?: (tab: 'console' | 'radar') => void;
  buildings?: Building[];
  transactions?: FinancialRecord[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterAgentClick,
  onOpenLandlordConsole,
  stats,
  themeMode = 'light',
  activeTab: controlledActiveTab,
  onTabChange,
  buildings = [],
  transactions = [],
}) => {
  const { t, locale } = useI18n();
  const num = (value: number) => value.toLocaleString(locale);
  const sectionRef = useRef<HTMLElement>(null);
  const [internalActiveTab, setInternalActiveTab] = useState<'console' | 'radar'>('console');
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const handleTabToggle = (tab: 'console' | 'radar') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const [ambientLight, setAmbientLight] = useState({ x: 50, y: 30, opacity: 0.15 });
  const [normMouse, setNormMouse] = useState({ x: 0, y: 0 });

  // Ambient mouse motion detection for atmospheric lighting and 3D parallax
  const handleSectionMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setAmbientLight({ x: xPct, y: yPct, opacity: 0.28 });

    const nx = (rect.width ? (e.clientX - rect.left) / rect.width : 0.5) * 2 - 1;
    const ny = (rect.height ? (e.clientY - rect.top) / rect.height : 0.5) * 2 - 1;
    setNormMouse({ x: nx, y: ny });
  };

  const isDark = themeMode === 'dark';

  const apkBuild = APK_BUILDS.stable;
  // Lists arrive newest-first from the API.
  const featuredBuilding = buildings[0];
  const latestSettlement = transactions.find((tx) => tx.status === 'Completed');
  const featuredCity = featuredBuilding ? getCityCoordinates(featuredBuilding.city) : null;
  const collectionBarPercent = stats ? Math.min(100, Math.max(0, stats.collectionRatePercent || 0)) : 0;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      className={`relative overflow-hidden pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 md:px-8 lg:px-12 transition-colors duration-700 ${
        isDark ? 'bg-[#050b14] text-white' : 'bg-[#faf8ff] text-[#131b2e]'
      }`}
    >
      {/* Background Interactive Cyber Grid */}
      <div
        className={`absolute inset-0 pointer-events-none -z-20 ${
          isDark ? 'futuristic-grid-dark opacity-35' : 'futuristic-grid opacity-40'
        }`}
      />

      {/* Massive Stylized Typographic Watermark (Inspired by Zenith, CSWatch & Vibram from Video) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-full text-center overflow-hidden -z-10">
        <div
          className={`text-[100px] sm:text-[160px] lg:text-[230px] font-black tracking-tighter leading-none transition-colors duration-700 font-display ${
            isDark ? 'text-outline-stroke-dark opacity-30' : 'text-outline-stroke-light opacity-35'
          }`}
        >
          FINDNDAP
        </div>
        <div className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-[#ff9827] uppercase opacity-65 -mt-2 sm:-mt-8 font-bold">
          {t('hero.watermarkTagline')}
        </div>
      </div>

      {/* Dynamic Cursor-Tracked Ambient Spotlight (Atmospheric Light from video) */}
      <div
        className="pointer-events-none absolute -inset-20 blur-3xl transition-all duration-300 -z-10"
        style={{
          background: `radial-gradient(750px circle at ${ambientLight.x}% ${ambientLight.y}%, rgba(255, 152, 39, ${
            isDark ? ambientLight.opacity * 1.3 : ambientLight.opacity
          }), ${isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(0, 32, 68, 0.08)'} 45%, transparent 80%)`,
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
          {/* Left Column: Headline, Copy, Interactive Telemetry & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Cadastral Trust Network Badge with Futuristic Beacon */}
            <div
              className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full backdrop-blur-md mb-5 sm:mb-6 shadow-xs border transition-transform hover:scale-105 duration-300 ${
                isDark
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/90 text-[#002044] border-[#d5e3ff]'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff9827] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff9827]" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                {t('hero.badge')}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff9827]" />
            </div>

            {/* Main Hero Title */}
            <h1
              className={`text-[2rem] leading-[1.1] sm:text-5xl sm:leading-[1.12] lg:text-[54px] font-extrabold tracking-tight mb-4 sm:mb-5 ${
                isDark ? 'text-white' : 'text-[#002044]'
              }`}
            >
              {t('hero.titleMain')}{' '}
              <span className="relative inline-block text-[#ff9827]">
                {t('hero.titleAccent')}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-2 text-[#ff9827]/40"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p
              className={`text-base sm:text-lg max-w-2xl mb-6 sm:mb-8 leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-[#43474f]'
              }`}
            >
              {t('hero.subtitle')}
            </p>

            {/* Dual CTAs with 3D Hover Depth */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto mb-6 sm:mb-8">
              <button
                onClick={onRegisterAgentClick}
                className="group relative overflow-hidden flex flex-col px-6 py-3.5 bg-gradient-to-r from-[#ff9827] to-[#e68316] hover:from-[#e68316] hover:to-[#8e4f00] text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-orange-500/25 text-left border border-white/20"
              >
                {/* Shimmer light sweep */}
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-45 group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold tracking-wide">{t('hero.registerAgent')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
                <span className="relative z-10 text-xs opacity-90 font-normal mt-0.5">
                  {t('hero.registerAgentSub')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => downloadApk(apkBuild)}
                disabled={!apkBuild}
                aria-disabled={!apkBuild}
                className={`group relative overflow-hidden flex items-center justify-center gap-3 px-6 py-3.5 bg-[#0f3563] text-white rounded-2xl shadow-md transition-all duration-300 border border-white/15 ${
                  apkBuild ? 'hover:bg-[#002044] hover:scale-[1.03]' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <Smartphone className="w-5 h-5 text-[#ff9827] group-hover:rotate-12 transition-transform" aria-hidden="true" />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold leading-tight">
                    {apkBuild ? t('hero.downloadApk') : t('hero.apkUnavailable')}
                  </span>
                  {apkBuild?.version && (
                    <span className="text-[11px] text-[#c9e6ff] font-normal">v{apkBuild.version}</span>
                  )}
                </div>
              </button>
            </div>

            {/* Payment & Settlement Gateway Ticker + Interactive HUD Switch */}
            <div
              className={`w-full flex flex-wrap items-center justify-between gap-4 pt-2 border-t ${
                isDark ? 'border-white/15' : 'border-[#002044]/10'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider mr-1 ${
                    isDark ? 'text-gray-400' : 'text-[#747780]'
                  }`}
                >
                  {t('hero.settlement')}
                </span>
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-bold text-[#131b2e] flex items-center gap-1.5 border border-[#d5e3ff] shadow-2xs hover:scale-105 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse" />
                  MTN MoMo
                </span>
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-bold text-[#131b2e] flex items-center gap-1.5 border border-[#d5e3ff] shadow-2xs hover:scale-105 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse" />
                  Orange Money
                </span>
                <span className="px-2.5 py-1 bg-white rounded-lg text-xs font-bold text-[#131b2e] flex items-center gap-1.5 border border-[#d5e3ff] shadow-2xs">
                  <Lock className="w-3 h-3 text-[#002044]" />
                  {t('hero.escrowLock')}
                </span>
              </div>

              {/* View Mode Toggle: Interactive 3D Mobile vs 3D Cadastral Radar */}
              <div
                className={`inline-flex items-center p-1 rounded-xl border ${
                  isDark
                    ? 'bg-white/10 border-white/15'
                    : 'bg-[#eaedff] border-[#d5e3ff]'
                }`}
              >
                <button
                  type="button"
                  aria-pressed={activeTab === 'console'}
                  onClick={() => handleTabToggle('console')}
                  className={`px-3 py-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'console'
                      ? 'bg-[#002044] text-white shadow-xs'
                      : isDark
                      ? 'text-gray-300 hover:text-white'
                      : 'text-[#43474f] hover:text-[#002044]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#ff9827]" />
                  <span>{t('hero.mobileHub')}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={activeTab === 'radar'}
                  onClick={() => handleTabToggle('radar')}
                  className={`px-3 py-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'radar'
                      ? 'bg-[#002044] text-white shadow-xs'
                      : isDark
                      ? 'text-gray-300 hover:text-white'
                      : 'text-[#43474f] hover:text-[#002044]'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-[#ff9827] animate-pulse" />
                  <span>{t('hero.radarHud')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Perspective Tilt Card with Breaking Holographic Badges */}
          <div className="lg:col-span-5 relative perspective-1500 flex flex-col items-center pt-4">
            {/* Glowing Neon Portal Ring (Video: Zenith sound sphere & Water Bottle portal) */}
            <GlowingPortalRing />

            {/* Airborne Levitation Container (Video floating cards) */}
            <div className="w-full relative animate-levitate preserve-3d">
              {/* FLOATING HOLOGRAPHIC BADGES (Breaking outer card borders with 3D parallax) */}
              {activeTab === 'console' && (
                <>
                  {/* Floating Chip 1: Cadastral Title Foncier of the newest building (Top-Left Outward Float) */}
                  {featuredBuilding?.cadastreNumber && (
                  <FloatingHolographicBadge
                    className="-top-5 -left-6 z-40 hidden sm:block"
                    depth={60}
                    delay="0s"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-emerald-700 uppercase leading-none">
                          {t('hero.tfSync')}
                        </div>
                        <div className="text-xs font-bold text-[#002044] font-mono mt-0.5">
                          {featuredBuilding.cadastreNumber}
                        </div>
                      </div>
                    </div>
                  </FloatingHolographicBadge>
                  )}

                  {/* Floating Chip 2: Latest completed MoMo settlement (Bottom-Right Outward Float) */}
                  {latestSettlement && (
                  <FloatingHolographicBadge
                    className="-bottom-6 -right-6 z-40 hidden sm:block"
                    depth={70}
                    delay="1.5s"
                    reverse
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#ff9827]/10 border border-[#ff9827]/30 flex items-center justify-center text-[#ff9827]">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-[#ff9827] uppercase leading-none">
                          {t('hero.momoSettled')}
                        </div>
                        <div className="text-xs font-bold text-[#002044] font-mono mt-0.5">
                          {t('hero.reconciledAmount', { amount: formatXaf(latestSettlement.amountXAF, locale) })}
                        </div>
                      </div>
                    </div>
                  </FloatingHolographicBadge>
                  )}

                  {/* Floating Chip 3: GPS of the newest building's city (Middle-Right Float) */}
                  {featuredCity && (
                  <FloatingHolographicBadge
                    className="top-1/3 -right-8 z-40 hidden lg:block"
                    depth={50}
                    delay="0.8s"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#002044]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{t('hero.gps', { coords: formatCoordinates(featuredCity.lat, featuredCity.lng) })}</span>
                    </div>
                  </FloatingHolographicBadge>
                  )}
                </>
              )}

              {/* TAB 1: 3D Perspective Mobile Console with HUD Corners & Glare */}
              {activeTab === 'console' && (
                <FuturisticTiltCard
                  onClick={onOpenLandlordConsole}
                  ariaLabel={t('hero.openConsole')}
                  maxTilt={12}
                  perspective={1200}
                  glareOpacity={0.28}
                  borderLaser={true}
                  hudCorners={true}
                  className="group cursor-pointer rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-[#002044]/10 transition-all hover:shadow-[0_25px_60px_rgba(0,32,68,0.25)]"
                >
                  {/* Click prompt overlay with neon accent */}
                  <div className="absolute top-3 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 bg-[#002044] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-[#ff9827]/50">
                    <Sparkles className="w-3 h-3 text-[#ff9827] animate-spin" />
                    <span>{t('hero.launchConsole')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#ff9827]" />
                  </div>

                  {/* Simulated Smartphone Status Bar */}
                  <div className="flex justify-between items-center px-1 mb-3 text-[10px] font-mono text-[#747780]">
                    <span>{t('hero.statusBarTime')}</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t('hero.charged')}
                    </span>
                  </div>

                  {/* App Header simulation */}
                  <div className="flex items-center justify-between gap-2 pb-3.5 mb-3 sm:mb-4 bg-gradient-to-r from-[#f2f3ff] to-[#eaedff] p-3 sm:p-3.5 rounded-2xl border border-[#eaedff]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#002044] flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform">
                        <BrandLogo size="sm" showText={false} />
                      </div>
                      <div>
                        <div className="text-base font-bold text-[#002044] leading-tight truncate">{t('hero.appName')}</div>
                        <div className="text-[11px] font-bold text-[#ff9827] flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-500 animate-ping" />
                          {t('hero.liveCenter')}
                        </div>
                      </div>
                    </div>
                    <span className="hidden min-[400px]:inline-block shrink-0 px-2.5 py-1 rounded-full bg-[#002044] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {t('hero.hq')}
                    </span>
                  </div>

                  {/* Live Stats Bento Grid inside Mockup */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                    <div className="min-w-0 p-3 sm:p-3.5 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col justify-between group-hover:border-[#ff9827]/30 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[#43474f]">
                        <span className="text-xs font-semibold">{t('hero.activeBuildings')}</span>
                        <span className="text-[10px] font-bold font-mono text-[#002044] bg-white px-1.5 py-0.5 rounded shadow-2xs">
                          {t('hero.tfSynced')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xl sm:text-2xl font-extrabold text-[#002044] tracking-tight break-words">
                          {stats ? t('hero.properties', { count: num(stats.totalBuildings) }) : '—'}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {stats ? t('hero.unitsTotal', { count: num(stats.totalUnits) }) : t('hero.awaitingData')}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 p-3 sm:p-3.5 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] flex flex-col justify-between group-hover:border-[#ff9827]/30 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[#43474f]">
                        <span className="text-xs font-semibold">{t('hero.occupancy')}</span>
                        <span className="text-[10px] font-bold font-mono text-[#ff9827] bg-white px-1.5 py-0.5 rounded shadow-2xs">
                          {t('hero.live')}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xl sm:text-2xl font-extrabold text-[#ff9827] tracking-tight">
                          {stats ? t('hero.percent', { value: num(stats.occupancyRate) }) : '—'}
                        </div>
                        <span className="text-[11px] font-bold text-[#002044]">
                          {stats ? t('hero.collected', { percent: num(stats.collectionRatePercent) }) : t('hero.automatedLedger')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rent Flow / Automated Ledger Box */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#002044] to-[#0f3563] text-white mb-3 sm:mb-4 relative overflow-hidden shadow-inner border border-white/10">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#d5e3ff] flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-[#ff9827] animate-pulse" />
                          {t('hero.ledgerTitle')}
                        </span>
                        <div className="text-lg sm:text-xl font-extrabold mt-0.5 font-mono">
                          {stats ? formatXaf(stats.collectedRevenueXAF, locale) : '— XAF'}
                        </div>
                      </div>
                      <span className="hidden min-[400px]:inline-block shrink-0 px-2.5 py-0.5 rounded-md bg-[#ff9827] text-white text-[10px] font-bold font-mono shadow-xs">
                        {t('hero.instantPayout')}
                      </span>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden mt-2 p-[1px]">
                      <div
                        className="bg-gradient-to-r from-[#ff9827] to-amber-300 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_#ff9827]"
                        style={{
                          width: `${collectionBarPercent}%`
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs mt-2 text-[#d5e3ff] font-mono">
                      <span>{stats ? t('hero.reconciled', { count: num(stats.collectedUnitsCount) }) : t('hero.reconciledEmpty')}</span>
                      <span className="text-amber-300 font-semibold">
                        {stats ? t('hero.inArrears', { count: num(stats.pendingArrearsUnitsCount) }) : t('hero.inArrearsEmpty')}
                      </span>
                    </div>
                  </div>

                  {/* Fast Maintenance Resolution Metric */}
                  <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#eaedff] border border-[#d5e3ff]/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-white flex items-center justify-center text-[#002044] shadow-xs">
                        <Wrench className="w-4 h-4 text-[#ff9827]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#002044] block">{t('hero.maintenance')}</span>
                        <span className="text-[11px] text-[#43474f]">
                          {stats ? t('hero.activeWorkOrders', { count: num(stats.activeTicketsCount) }) : t('hero.photoVerification')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm sm:text-base font-bold text-[#002044] font-mono whitespace-nowrap">
                        {stats ? t('hero.fixed', { count: num(stats.resolvedTicketsCount) }) : '—'}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase font-mono">
                        {t('hero.sla')}
                      </span>
                    </div>
                  </div>
                </FuturisticTiltCard>
              )}

              {/* TAB 2: 3D Cadastral Radar Hologram HUD */}
              {activeTab === 'radar' && (
                <div className="relative">
                  <CadastralRadarHologram buildings={buildings} />
                </div>
              )}
            </div>

            {/* Airborne Ground Levitation Shadow (Video: Zenith & Water bottle floating illusion) */}
            <div className="w-[75%] sm:w-[82%] h-7 -mt-2 rounded-full bg-[#002044]/35 dark:bg-black/60 filter blur-xl animate-levitate-shadow pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};
