import React, { useState, useEffect, useRef } from 'react';
import { BrandLogo } from './BrandLogo';
import { AgentKYC } from '../types';
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
  Info
} from 'lucide-react';
import { downloadFindNdapApk } from '../utils/apkGenerator';

interface NavbarProps {
  agentKYC: AgentKYC;
  onToggleAgentMode: () => void;
  onOpenBuildingModal: () => void;
  onOpenLandlordConsole: () => void;
  onOpenAgentModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  agentKYC,
  onToggleAgentMode,
  onOpenBuildingModal,
  onOpenLandlordConsole,
  onOpenAgentModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'solutions' | 'features' | 'developer' | 'agent' | null>(null);
  const [language, setLanguage] = useState<'EN' | 'FR'>('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
            <span>MOMO &amp; ORANGE GATEWAY ONLINE</span>
          </div>

          {/* Regulatory & Cadastral Notice */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-white/70">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff9827]" />
            <span>CEMAC &amp; OHADA Compliant Leases • Titre Foncier (TF) Verification Engine</span>
          </span>
        </div>

        {/* Top Right Quick Actions: Currency, Lang Switcher & Instant APK download */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-[10px]">
            <span className="text-[#ff9827] font-bold">XAF</span>
            <span className="text-white/40">|</span>
            <span>FCFA (Central Africa)</span>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-white/10 rounded-md p-0.5 border border-white/15 text-[10px] font-bold">
            <button
              onClick={() => setLanguage('EN')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'EN' ? 'bg-[#ff9827] text-white' : 'text-white/70 hover:text-white'
              }`}
              title="English (Official)"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('FR')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'FR' ? 'bg-[#ff9827] text-white' : 'text-white/70 hover:text-white'
              }`}
              title="Français (Officiel)"
            >
              FR
            </button>
          </div>

          {/* Instant Staging APK trigger */}
          <button
            onClick={() => downloadFindNdapApk('1.4.2')}
            className="hidden lg:inline-flex items-center gap-1.5 bg-[#ff9827]/20 hover:bg-[#ff9827]/30 text-[#ffb05c] hover:text-white border border-[#ff9827]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-xs"
            title="Direct Download FindNdap Android APK v1.4.2"
          >
            <Download className="w-3 h-3" />
            <span>Staging APK v1.4.2</span>
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
                  <span>Solutions</span>
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
                      <span>Ecosystem Workflows</span>
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
                          <span>For Property Owners &amp; Landlords</span>
                          <ArrowUpRight className="w-3 h-3 text-[#ff9827] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-[#5b6375] leading-snug mt-0.5">
                          Automate MoMo collection, broadcast bulk SMS rent notices, and resolve maintenance tickets.
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
                          <span>For Certified Brokers &amp; Agents</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Accredited</span>
                        </div>
                        <p className="text-[11px] text-[#5b6375] leading-snug mt-0.5">
                          Verify Titre Foncier cadastral records, publish verified buildings, and earn secure commissions.
                        </p>
                      </div>
                    </a>

                    <div className="bg-[#eaedff]/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#002044] animate-pulse" />
                        <span className="font-semibold text-[#002044]">Try Live Landlord Simulator</span>
                      </div>
                      <button
                        onClick={() => {
                          closeDropdown();
                          onOpenLandlordConsole();
                        }}
                        className="bg-[#002044] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg hover:bg-[#0f3563] transition-colors"
                      >
                        Launch
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
                  <span>Features</span>
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
                        <span>Automated MoMo Collection</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        Instant MTN &amp; Orange Money ledger sync with zero manual reconciliation.
                      </p>
                    </a>

                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Cadastral Titre Foncier</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        Zero-fraud cadastral parcel lookup certified against land registry records.
                      </p>
                    </a>

                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span>Direct Bulk SMS</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        Send rent reminders and maintenance bulletins directly to tenant phones.
                      </p>
                    </a>

                    <a
                      href="#features"
                      onClick={closeDropdown}
                      className="p-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5 flex flex-col gap-1.5 group"
                    >
                      <div className="flex items-center gap-2 text-[#002044] font-bold text-xs">
                        <Wrench className="w-4 h-4 text-amber-600" />
                        <span>Maintenance Triage</span>
                      </div>
                      <p className="text-[11px] text-[#5b6375] leading-tight">
                        4-stage work-order dispatch pipeline with vendor quotes and photos.
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
                Agent Certification
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
                    <span>Developer Hub</span>
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
                      Integration Sandbox &amp; Testing
                    </div>

                    <a
                      href="#developer-hub"
                      onClick={closeDropdown}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] transition-all border border-[#002044]/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <Activity className="w-4 h-4 text-[#ff9827]" />
                        <div>
                          <div className="text-xs font-bold text-[#002044]">MoMo Webhook Simulator</div>
                          <div className="text-[11px] text-[#5b6375]">Test payment payload callbacks</div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#747780]" />
                    </a>

                    <div className="p-3 rounded-xl bg-[#001733] text-white flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold flex items-center gap-1.5 text-[#ff9827]">
                          <Download className="w-3.5 h-3.5" />
                          <span>Android Staging APK</span>
                        </div>
                        <div className="text-[10px] text-white/70">v1.4.2 • Build 142 • Signed Package</div>
                      </div>
                      <button
                        onClick={() => {
                          closeDropdown();
                          downloadFindNdapApk('1.4.2');
                        }}
                        className="bg-[#ff9827] hover:bg-[#8e4f00] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                      >
                        Download
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
              title="Launch Live Landlord Mobile Operations Console"
            >
              <div className="w-5 h-5 rounded-lg bg-[#ff9827] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span>Landlord Console</span>
              <span className="flex items-center gap-1 bg-white/20 text-[#d5e3ff] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live</span>
              </span>
            </button>

            {/* 2. Certified Agent Identity Pill & Interactive Role Switcher */}
            <div className="relative">
              {agentKYC.isCertified ? (
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300/80 p-1 pl-2 rounded-xl shadow-xs">
                  <button
                    onClick={() => handleDropdownToggle('agent')}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950 transition-colors pr-1"
                    title="Certified Agent Details"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="max-w-[90px] truncate">{agentKYC.fullName.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-emerald-700" />
                  </button>

                  <button
                    id="navbar-register-building-btn"
                    onClick={onOpenBuildingModal}
                    className="inline-flex items-center gap-1 bg-[#002044] hover:bg-[#0f3563] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-xs"
                    title="Only accredited certified agents can register properties"
                  >
                    <Building2 className="w-3 h-3 text-[#ff9827]" />
                    <span>+ Building</span>
                  </button>
                </div>
              ) : (
                <button
                  id="navbar-toggle-agent-mode-btn"
                  onClick={onToggleAgentMode}
                  className="flex items-center gap-1.5 bg-[#eaedff] hover:bg-[#dbe2ff] text-[#002044] text-xs font-bold px-3 py-2 rounded-xl border border-[#c3c6d0]/60 transition-all hover:scale-[1.01]"
                  title="Click to simulate Certified Agent login"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#ff9827]" />
                  <span>Agent Demo Sign In</span>
                </button>
              )}

              {/* Agent Profile & Verification Popover */}
              {activeDropdown === 'agent' && (
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-2xl border border-[#002044]/15 p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="flex items-center justify-between border-b border-[#002044]/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        alt="Agent Béatrice Mengue"
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-[#002044]">{agentKYC.fullName}</div>
                        <div className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Accredited Cadastral Broker</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#faf8ff] rounded-xl p-2.5 space-y-1.5 text-[11px] border border-[#002044]/5">
                    <div className="flex justify-between">
                      <span className="text-[#5b6375]">Accreditation ID:</span>
                      <span className="font-mono font-bold text-[#002044]">{agentKYC.licenseId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5b6375]">Jurisdiction:</span>
                      <span className="font-semibold text-[#002044]">{agentKYC.city}, Littoral/Centre</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5b6375]">MoMo Payout:</span>
                      <span className="font-semibold text-emerald-700">{agentKYC.momoNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5b6375]">Cadastral Clearance:</span>
                      <span className="font-bold text-[#ff9827]">Level 3 (TF Direct Sync)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        closeDropdown();
                        onOpenBuildingModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#002044] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#0f3563] transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#ff9827]" />
                      <span>Register New Building Now</span>
                    </button>

                    <button
                      onClick={() => {
                        closeDropdown();
                        onToggleAgentMode();
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#faf8ff] hover:bg-[#eaedff] text-[#5b6375] hover:text-[#002044] text-[11px] font-semibold transition-colors border border-[#002044]/10"
                    >
                      Toggle to Unverified Visitor Mode
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Primary Registration Action Button */}
            <button
              id="navbar-register-agent-btn"
              onClick={onOpenAgentModal}
              className="inline-flex items-center justify-center font-extrabold text-xs bg-[#ff9827] text-white hover:bg-[#8e4f00] px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Certified</span>
            </button>
          </div>

          {/* Mobile Right Controls: Landlord Console Quick Button + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenLandlordConsole}
              className="p-2 rounded-xl bg-[#002044] text-white flex items-center gap-1.5 text-xs font-bold"
              title="Open Landlord Console"
            >
              <Smartphone className="w-4 h-4 text-[#ff9827]" />
              <span className="hidden sm:inline">Console</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-[#eaedff] text-[#002044] hover:bg-[#dbe2ff] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-[#002044]/15 px-6 py-6 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-200">
          {/* Agent Status Pill for Mobile */}
          <div className="bg-[#faf8ff] p-3 rounded-2xl border border-[#002044]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  agentKYC.isCertified ? 'bg-emerald-600 text-white' : 'bg-[#002044] text-[#ff9827]'
                }`}
              >
                {agentKYC.isCertified ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#002044]">
                  {agentKYC.isCertified ? agentKYC.fullName : 'Guest Visitor'}
                </div>
                <div className="text-[10px] text-[#5b6375]">
                  {agentKYC.isCertified ? 'Accredited Broker (TF Verified)' : 'Uncertified Mode'}
                </div>
              </div>
            </div>

            <button
              onClick={onToggleAgentMode}
              className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#eaedff] text-[#002044] hover:bg-[#dbe2ff] transition-colors"
            >
              {agentKYC.isCertified ? 'Switch Mode' : 'Simulate Login'}
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
                <span>Landlord Solutions</span>
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
                <span>Agent Certification &amp; Portal</span>
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
                <span>Ecosystem Features</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#747780]" />
            </a>

            <a
              href="#developer-hub"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl hover:bg-[#eaedff] flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Developer Hub &amp; APK</span>
              </div>
              <span className="text-[10px] bg-[#ff9827]/20 text-[#8e4f00] font-bold px-2 py-0.5 rounded-full">
                v1.4.2
              </span>
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
              <span>Launch Live Landlord Operations Console</span>
            </button>

            {agentKYC.isCertified && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBuildingModal();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#002044] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Building2 className="w-4 h-4 text-[#ff9827]" />
                <span>+ Register Building Studio</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAgentModal();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#ff9827] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#8e4f00]"
            >
              <span>Register as Certified Agent</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                downloadFindNdapApk('1.4.2');
              }}
              className="w-full py-2 px-4 rounded-xl bg-[#eaedff] hover:bg-[#dbe2ff] text-[#002044] font-bold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#ff9827]" />
              <span>Download Staging APK (.apk)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
