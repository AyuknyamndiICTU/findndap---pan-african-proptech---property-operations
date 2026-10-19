import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from './BrandLogo';
import { AgentKYC, AuthUser } from '../types';
import { APK_BUILDS, downloadApk } from '../utils/apk';
import { useI18n } from '../i18n/LanguageContext';
import {
  ShieldCheck,
  UserCheck,
  Smartphone,
  Building2,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Download,
  Activity,
  Layers,
  FileText,
  MessageSquare,
  Wrench,
  Sparkles,
  ArrowUpRight,
  CreditCard,
  QrCode,
  Globe,
  Radio,
  ExternalLink,
  CheckCircle2,
  Info,
  LogIn,
  LogOut,
  Clock
} from 'lucide-react';

interface NavbarProps {
  user: AuthUser | null;
  agentKYC: AgentKYC | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenBuildingModal: () => void;
  onOpenLandlordConsole: () => void;
  onOpenApprovals: () => void;
  onOpenAgentModal: () => void;
}

const initialsOf = (name: string) =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || '?';

export const Navbar: React.FC<NavbarProps> = ({
  user,
  agentKYC,
  onSignIn,
  onSignOut,
  onOpenBuildingModal,
  onOpenLandlordConsole,
  onOpenApprovals,
  onOpenAgentModal,
}) => {
  const { t, lang, setLang } = useI18n();
  const isCertifiedAgent = user?.role === 'agent' && agentKYC?.status === 'certified';
  const displayName = (user?.role === 'agent' && agentKYC?.fullName) || user?.username || '';
  const roleLabel =
    user?.role === 'admin'
      ? t('navbar.roleAdmin')
      : agentKYC?.status === 'certified'
      ? t('navbar.roleCertified')
      : agentKYC?.status === 'in-review'
      ? t('navbar.roleInReview')
      : agentKYC?.status === 'rejected'
      ? t('navbar.roleRejected')
      : t('navbar.roleUnverified');
  const showGetCertified = !(user?.role === 'admin' || isCertifiedAgent);
  const stableApk = APK_BUILDS.stable;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'solutions' | 'features' | 'developer' | 'agent' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const agentMenuRef = useRef<HTMLDivElement>(null);

  // Monitor scroll state for elevation transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideNav = dropdownRef.current?.contains(target);
      const insideAgentMenu = agentMenuRef.current?.contains(target);
      if (!insideNav && !insideAgentMenu) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (menu: 'solutions' | 'features' | 'developer' | 'agent') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdown = () => setActiveDropdown(null);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300">
      {/* 1. TOP TELEMETRY / LIVE NETWORK RIBBON */}
      <div className="bg-[#001733] text-white text-[11px] font-medium border-b border-white/10 px-4 md:px-8 lg:px-12 py-1.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          {/* Live Heartbeat Status */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{t('navbar.gatewayOnline')}</span>
          </div>

          {/* Regulatory & Cadastral Notice */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-white/70">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff9827]" />
            <span>{t('navbar.complianceNotice')}</span>
          </span>
        </div>

        {/* Top Right Quick Actions: Currency, Lang Switcher & Instant APK download */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[10px]">
            <span className="text-[#ff9827] font-bold">XAF</span>
            <span className="text-white/40">|</span>
            <span>{t('navbar.currencyRegion')}</span>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-white/10 rounded-md p-0.5 border border-white/15 text-[10px] font-bold">
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                lang === 'en' ? 'bg-[#ff9827] text-white' : 'text-white/70 hover:text-white'
              }`}
              title={t('navbar.langEnglishTitle')}
              aria-label={t('navbar.langEnglish')}
              aria-pressed={lang === 'en'}
              lang="en"
            >
              EN
            </button>
            <button
              onClick={() => setLang('fr')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                lang === 'fr' ? 'bg-[#ff9827] text-white' : 'text-white/70 hover:text-white'
              }`}
              title={t('navbar.langFrenchTitle')}
              aria-label={t('navbar.langFrench')}
              aria-pressed={lang === 'fr'}
              lang="fr"
            >
              FR
            </button>
          </div>

          {/* Android APK download (only when a real build is configured) */}
          <button
            onClick={() => downloadApk(stableApk)}
            disabled={!stableApk}
            aria-disabled={!stableApk}
            className="hidden lg:inline-flex items-center gap-1.5 bg-[#ff9827]/20 hover:bg-[#ff9827]/30 text-[#ffb05c] hover:text-white border border-[#ff9827]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ff9827]/20"
            title={stableApk ? t('navbar.apkDownloadTitle') : t('navbar.apkUnavailable')}
          >
            <Download className="w-3 h-3" aria-hidden="true" />
            <span>
              {stableApk
                ? stableApk.version
                  ? t('navbar.apkButtonVersion', { version: stableApk.version })
                  : t('navbar.apkButton')
                : t('navbar.apkUnavailable')}
            </span>
          </button>
        </div>
      </div>

      {/* 2. MAIN GLASSMORPHIC NAVBAR */}
      <div
        className={`w-full bg-[#faf8ff]/92 backdrop-blur-xl border-b border-[#002044]/10 transition-all duration-300 ${
          isScrolled
            ? 'shadow-[0_8px_30px_rgba(0,32,68,0.12)] py-2'
            : 'shadow-[0_2px_12px_rgba(0,32,68,0.05)] py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between gap-3">
          {/* Brand & Left Navigation Elements */}
          <div className="flex items-center gap-5 lg:gap-7" ref={dropdownRef}>
            <a href="#" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
              <BrandLogo size="md" />
            </a>

            {/* Desktop Navigation Links with Rich Dropdowns */}
            <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold text-[#303848]">
              {/* Dropdown 1: Solutions */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('solutions')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                    activeDropdown === 'solutions'
                      ? 'bg-[#002044] text-white shadow-xs'
                      : 'hover:bg-[#eaedff] text-[#002044]'
                  }`}
                >
                  <span>{t('navbar.solutions')}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'solutions' ? 'rotate-180 text-[#ff9827]' : 'text-[#747780]'
                    }`}
                  />
                </button>

                {/* Dropdown 1 Popover */}
                {activeDropdown === 'solutions' && (
                  <div className="absolute top-full left-0 mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-[#002044]/15 p-4 grid grid-cols-1 gap-2.5 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#ff9827] px-2 pt-1 flex items-center justify-between">
                      <span>{t('navbar.ecosystemWorkflows')}</span>
                      <span className="text-[#747780] font-normal lowercase">Douala &amp; Yaoundé</span>
                    </div>

                    <a
                      href="#landlord-solutions"
                      onClick={closeDropdown}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8ff] border border-transparent hover:border-[#eaedff] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#002044] text-[#ff9827] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#002044] flex items-center gap-1.5">
                          <span>{t('navbar.forOwners')}</span>
                          <ArrowUpRight className="w-3 h-3 text-[#ff9827] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-[#5b6375] leading-snug mt-0.5">
                          {t('navbar.forOwnersDesc')}
                        </p>
                      </div>
                    </a>

                    <a
                      href="#agent-portal"
                      onClick={closeDropdown}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#faf8ff] border border-transparent hover:border-[#eaedff] transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#ff9827] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#002044] flex items-center gap-1.5">
                          <span>{t('navbar.forAgents')}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">{t('navbar.accredited')}</span>
                        </div>
                        <p className="text-[11px] text-[#5b6375] leading-snug mt-0.5">
                          {t('navbar.forAgentsDesc')}
                        </p>
                      </div>
                    </a>

                    <div className="bg-[#eaedff]/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#002044] animate-pulse" />
                        <span className="font-semibold text-[#002044]">{t('navbar.trySimulator')}</span>
                      </div>
                      <button
                        onClick={() => {
                          closeDropdown();
                          onOpenLandlordConsole();
                        }}
                        className="bg-[#002044] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#0f3563] transition-colors"
                      >
                        {t('navbar.launch')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dropdown 2: Features */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('features')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                    activeDropdown === 'features'
                      ? 'bg-[#002044] text-white shadow-xs'
                      : 'hover:bg-[#eaedff] text-[#002044]'
                  }`}
                >
                  <span>{t('navbar.features')}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'features' ? 'rotate-180 text-[#ff9827]' : 'text-[#747780]'
                    }`}
                  />
                </button>

                {activeDropdown === 'features' && (
                  <div className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-[#002044]/15 p-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 z-50">
                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <CreditCard className="w-4 h-4 text-[#ff9827]" />
                        <span>{t('navbar.featMomo')}</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        {t('navbar.featMomoDesc')}
                      </p>
                    </a>

                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t('navbar.featCadastre')}</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        {t('navbar.featCadastreDesc')}
                      </p>
                    </a>

                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>{t('navbar.featSms')}</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        {t('navbar.featSmsDesc')}
                      </p>
                    </a>

                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <Wrench className="w-4 h-4 text-amber-600" />
                        <span>{t('navbar.featMaintenance')}</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        {t('navbar.featMaintenanceDesc')}
                      </p>
                    </a>
                  </div>
                )}
              </div>

              {/* Link: Agent Certification */}
              <a
                href="#agent-portal"
                className="px-3 py-2 rounded-lg hover:bg-[#eaedff] text-[#002044] transition-colors"
              >
                {t('navbar.agentCertification')}
              </a>

              {/* Dropdown 3: Developer Hub */}
              <div className="relative">
                <button
                  onClick={() => handleDropdownToggle('developer')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                    activeDropdown === 'developer'
                      ? 'bg-[#002044] text-white shadow-xs'
                      : 'hover:bg-[#eaedff] text-[#002044]'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{t('navbar.developerHub')}</span>
                    <span className="bg-[#ff9827]/20 text-[#8e4f00] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      API
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeDropdown === 'developer' ? 'rotate-180 text-[#ff9827]' : 'text-[#747780]'
                    }`}
                  />
                </button>

                {activeDropdown === 'developer' && (
                  <div className="absolute top-full left-0 mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-[#002044]/15 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="text-[10px] font-black uppercase tracking-wider text-[#002044] px-1">
                      {t('navbar.integrationSandbox')}
                    </div>

                    <a
                      href="#developer-sandbox"
                      onClick={closeDropdown}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Activity className="w-4 h-4 text-[#ff9827]" />
                        <div>
                          <div className="text-xs font-bold text-[#002044]">{t('navbar.webhookSimulator')}</div>
                          <div className="text-[11px] text-[#5b6375]">{t('navbar.webhookSimulatorDesc')}</div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#747780]" />
                    </a>

                    <div className="p-3 rounded-xl bg-[#001733] text-white flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold flex items-center gap-1.5 text-[#ff9827]">
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t('navbar.androidApp')}</span>
                        </div>
                        <div className="text-[10px] text-white/70">
                          {stableApk
                            ? stableApk.version
                              ? t('navbar.versionLabel', { version: stableApk.version })
                              : t('navbar.latestBuild')
                            : t('navbar.notAvailableYet')}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          closeDropdown();
                          downloadApk(stableApk);
                        }}
                        disabled={!stableApk}
                        className="bg-[#ff9827] hover:bg-[#8e4f00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('navbar.download')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Center */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* 1. Live Landlord Operations Console Launcher */}
            <button
              id="navbar-landlord-console-btn"
              onClick={onOpenLandlordConsole}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[#002044] to-[#0f3563] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] border border-white/10"
              title={t('navbar.consoleButtonTitle')}
            >
              <div className="w-5 h-5 rounded-lg bg-[#ff9827] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span>{t('navbar.landlordConsole')}</span>
              <span className="flex items-center gap-1 bg-white/20 text-[#d5e3ff] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{t('navbar.live')}</span>
              </span>
            </button>

            {/* 2. Account: sign in, or the signed-in user's menu */}
            <div className="relative" ref={agentMenuRef}>
              {!user ? (
                <button
                  id="navbar-sign-in-btn"
                  onClick={onSignIn}
                  className="flex items-center gap-1.5 bg-[#eaedff] hover:bg-[#dbe2ff] text-[#002044] text-xs font-bold px-3 py-2 rounded-xl border border-[#c3c6d0]/60 transition-all hover:scale-[1.01]"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
                  <span>{t('navbar.signIn')}</span>
                </button>
              ) : (
                <div
                  className={`flex items-center gap-1 p-1 pl-2 rounded-xl shadow-xs border ${
                    isCertifiedAgent || user.role === 'admin'
                      ? 'bg-emerald-50 border-emerald-300/80'
                      : 'bg-amber-50 border-amber-300/80'
                  }`}
                >
                  <button
                    onClick={() => handleDropdownToggle('agent')}
                    aria-haspopup="true"
                    aria-expanded={activeDropdown === 'agent'}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#002044] pr-1"
                    title={t('navbar.account')}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 ${
                        isCertifiedAgent || user.role === 'admin' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    >
                      {initialsOf(displayName)}
                    </span>
                    <span className="max-w-[110px] truncate">{displayName.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3" aria-hidden="true" />
                  </button>

                  {isCertifiedAgent && (
                    <button
                      id="navbar-register-building-btn"
                      onClick={onOpenBuildingModal}
                      className="inline-flex items-center gap-1 bg-[#002044] hover:bg-[#0f3563] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-xs"
                      title={t('navbar.registerBuildingTitle')}
                    >
                      <Building2 className="w-3 h-3 text-[#ff9827]" aria-hidden="true" />
                      <span>{t('navbar.addBuilding')}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Account popover */}
              {user && activeDropdown === 'agent' && (
                <div className="absolute right-0 top-full mt-2 w-[300px] bg-white rounded-2xl shadow-2xl border border-[#002044]/15 p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="flex items-center gap-2.5 border-b border-[#002044]/10 pb-3">
                    <span
                      aria-hidden="true"
                      className={`w-10 h-10 rounded-full text-white text-sm font-black flex items-center justify-center ${
                        isCertifiedAgent || user.role === 'admin' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                    >
                      {initialsOf(displayName)}
                    </span>
                    <div>
                      <div className="text-xs font-extrabold text-[#002044]">{displayName}</div>
                      <div className="text-[10px] text-[#5b6375]">@{user.username}</div>
                      <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                        {isCertifiedAgent || user.role === 'admin' ? (
                          <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" aria-hidden="true" />
                        )}
                        <span className={isCertifiedAgent || user.role === 'admin' ? '' : 'text-amber-800'}>{roleLabel}</span>
                      </div>
                    </div>
                  </div>

                  {isCertifiedAgent && agentKYC && (
                    <div className="bg-[#faf8ff] rounded-xl p-2.5 space-y-1.5 text-[11px] border border-[#002044]/5">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#5b6375]">{t('navbar.badge')}</span>
                        <span className="font-mono font-bold text-[#002044]">{agentKYC.badgeId}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#5b6375]">{t('navbar.license')}</span>
                        <span className="font-mono font-bold text-[#002044]">{agentKYC.licenseId}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#5b6375]">{t('navbar.momoPayout')}</span>
                        <span className="font-semibold text-emerald-700">{agentKYC.momoNumber}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {isCertifiedAgent && (
                      <button
                        onClick={() => {
                          closeDropdown();
                          onOpenBuildingModal();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#002044] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#0f3563] transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
                        <span>{t('navbar.registerNewBuilding')}</span>
                      </button>
                    )}
                    {user.role === 'agent' && !isCertifiedAgent && (
                      <button
                        onClick={() => {
                          closeDropdown();
                          onOpenAgentModal();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#ff9827] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#8e4f00] transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{agentKYC?.status === 'in-review' ? t('navbar.viewApplication') : t('navbar.applyCertification')}</span>
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          closeDropdown();
                          onOpenApprovals();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#002044] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#0f3563] transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
                        <span>{t('navbar.reviewApplications')}</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        closeDropdown();
                        onSignOut();
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] text-[#5b6375] hover:text-[#002044] text-[11px] font-semibold transition-colors border border-[#002044]/10 flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('navbar.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Primary Registration Action Button (hidden once certified, and for administrators) */}
            {showGetCertified && (
              <button
                id="navbar-register-agent-btn"
                onClick={onOpenAgentModal}
                className="inline-flex items-center justify-center font-extrabold text-xs bg-[#ff9827] text-white hover:bg-[#8e4f00] px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t('navbar.getCertified')}</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls: Landlord Console Quick Button + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenLandlordConsole}
              className="p-2 rounded-xl bg-[#002044] text-white flex items-center gap-1.5 text-xs font-bold"
              title={t('navbar.openConsoleTitle')}
            >
              <Smartphone className="w-4 h-4 text-[#ff9827]" />
              <span className="hidden sm:inline">{t('navbar.console')}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#eaedff] text-[#002044] hover:bg-[#dbe2ff] transition-colors"
              aria-label={t('navbar.toggleMenu')}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-[#002044]/15 px-6 py-6 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-200">
          {/* Account status for mobile */}
          <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#002044]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                  !user
                    ? 'bg-[#002044] text-[#ff9827]'
                    : isCertifiedAgent || user.role === 'admin'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {user ? initialsOf(displayName) : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#002044]">{user ? displayName : t('navbar.visitor')}</div>
                <div className="text-[10px] text-[#5b6375]">{user ? roleLabel : t('navbar.notSignedIn')}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (user) onSignOut();
                else onSignIn();
              }}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#eaedff] text-[#002044] hover:bg-[#dbe2ff] transition-colors"
            >
              {user ? t('navbar.signOut') : t('navbar.signIn')}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1 text-sm font-semibold text-[#131b2e]">
            <a
              href="#landlord-solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#eaedff] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#ff9827]" />
                <span>{t('navbar.mobileLandlordSolutions')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#747780]" />
            </a>

            <a
              href="#agent-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#eaedff] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t('navbar.mobileAgentPortal')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#747780]" />
            </a>

            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#eaedff] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#002044]" />
                <span>{t('navbar.mobileEcosystemFeatures')}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#747780]" />
            </a>

            <a
              href="#developer-sandbox"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#eaedff] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{t('navbar.mobileDeveloperHub')}</span>
              </div>
              {stableApk?.version && (
                <span className="text-[10px] bg-[#ff9827]/20 text-[#8e4f00] font-bold px-2 py-0.5 rounded-full">
                  v{stableApk.version}
                </span>
              )}
            </a>
          </div>

          {/* Action CTAs in Mobile Drawer */}
          <div className="pt-2 border-t border-[#002044]/10 space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLandlordConsole();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#002044] to-[#0f3563] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Smartphone className="w-4 h-4 text-[#ff9827]" />
              <span>{t('navbar.mobileLaunchConsole')}</span>
            </button>

            {isCertifiedAgent && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBuildingModal();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#002044] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Building2 className="w-4 h-4 text-[#ff9827]" aria-hidden="true" />
                <span>{t('navbar.mobileRegisterBuilding')}</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenApprovals();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#002044] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#ff9827]" aria-hidden="true" />
                <span>{t('navbar.reviewApplications')}</span>
              </button>
            )}

            {showGetCertified && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAgentModal();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#ff9827] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#8e4f00]"
              >
                <span>{t('navbar.mobileRegisterAgent')}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                downloadApk(stableApk);
              }}
              disabled={!stableApk}
              className="w-full py-2 px-4 rounded-xl bg-[#eaedff] hover:bg-[#dbe2ff] text-[#002044] font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
              <span>{stableApk ? t('navbar.mobileDownloadApk') : t('navbar.mobileApkUnavailable')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
