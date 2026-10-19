import React from 'react';
import {
  Building2,
  Wallet,
  MessageSquare,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Lock,
  Radio,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { FuturisticTiltCard } from './FuturisticTiltCard';
import { useI18n } from '../i18n/LanguageContext';

interface LandlordWorkflowSectionProps {
  onOpenLandlordConsole: (defaultTab?: 'overview' | 'ledger' | 'sms' | 'maintenance' | 'units') => void;
}

export const LandlordWorkflowSection: React.FC<LandlordWorkflowSectionProps> = ({
  onOpenLandlordConsole,
}) => {
  const { t } = useI18n();
  return (
    <section id="landlord-solutions" className="py-14 sm:py-24 px-4 md:px-8 lg:px-12 bg-[#f2f3ff] relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 futuristic-grid opacity-35 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-14 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#d5e3ff] mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#ff9827] animate-ping" />
              <span className="text-[11px] font-bold text-[#8e4f00] uppercase tracking-wider font-mono">
                {t('workflow.eyebrow')}
              </span>
            </div>
            <h2 className="text-[1.75rem] sm:text-4xl lg:text-[40px] font-extrabold text-[#002044] tracking-tight leading-tight">
              {t('workflow.title')}
            </h2>
          </div>
          <p className="text-[#43474f] max-w-md text-base leading-relaxed">
            {t('workflow.intro')}
          </p>
        </div>

        {/* Feature Mosaic: 4 Key Pillars with 3D Tilt & Specular Light */}
        <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 scroll-mt-28">
          {/* Feature 1: Digital Portfolio Onboarding */}
          <FuturisticTiltCard
            onClick={() => onOpenLandlordConsole('units')}
            maxTilt={12}
            borderLaser={true}
            className="group cursor-pointer bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#002044]/5 flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div>
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="w-12 h-12 rounded-2xl bg-[#0f3563] text-white flex items-center justify-center mb-4 sm:mb-5 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform"
              >
                <Building2 className="w-6 h-6 text-[#ff9827]" />
              </div>
              <h3
                style={{ transform: 'translateZ(20px)' }}
                className="text-lg font-bold text-[#002044] mb-2 group-hover:text-[#ff9827] transition-colors"
              >
                {t('workflow.f1Title')}
              </h3>
              <p className="text-sm text-[#43474f] mb-5 sm:mb-6 leading-relaxed">
                {t('workflow.f1Body')}
              </p>
            </div>
            <div
              style={{ transform: 'translateZ(25px)' }}
              className="bg-[#f2f3ff] p-2.5 rounded-xl flex items-center justify-between text-[#002044] text-xs font-bold border border-[#eaedff] group-hover:bg-[#eaedff] transition-colors"
            >
              <span>{t('workflow.f1Tag')}</span>
              <Sliders className="w-3.5 h-3.5 text-[#ff9827]" />
            </div>
          </FuturisticTiltCard>

          {/* Feature 2: Automated MoMo Collection */}
          <FuturisticTiltCard
            onClick={() => onOpenLandlordConsole('ledger')}
            maxTilt={12}
            borderLaser={true}
            className="group cursor-pointer bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#002044]/5 flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div>
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="w-12 h-12 rounded-2xl bg-[#ff9827] text-white flex items-center justify-center mb-4 sm:mb-5 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform"
              >
                <Wallet className="w-6 h-6" />
              </div>
              <h3
                style={{ transform: 'translateZ(20px)' }}
                className="text-lg font-bold text-[#002044] mb-2 group-hover:text-[#ff9827] transition-colors"
              >
                {t('workflow.f2Title')}
              </h3>
              <p className="text-sm text-[#43474f] mb-5 sm:mb-6 leading-relaxed">
                {t('workflow.f2Body')}
              </p>
            </div>
            <div
              style={{ transform: 'translateZ(25px)' }}
              className="bg-[#f2f3ff] p-2.5 rounded-xl flex items-center justify-between text-[#002044] text-xs font-bold border border-[#eaedff] group-hover:bg-[#eaedff] transition-colors"
            >
              <span>{t('workflow.f2Tag')}</span>
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </FuturisticTiltCard>

          {/* Feature 3: Automated SMS Broadcasts */}
          <FuturisticTiltCard
            onClick={() => onOpenLandlordConsole('sms')}
            maxTilt={12}
            borderLaser={true}
            className="group cursor-pointer bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#002044]/5 flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div>
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="w-12 h-12 rounded-2xl bg-[#002044] text-white flex items-center justify-center mb-4 sm:mb-5 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform"
              >
                <MessageSquare className="w-6 h-6 text-[#ffdcc1]" />
              </div>
              <h3
                style={{ transform: 'translateZ(20px)' }}
                className="text-lg font-bold text-[#002044] mb-2 group-hover:text-[#ff9827] transition-colors"
              >
                {t('workflow.f3Title')}
              </h3>
              <p className="text-sm text-[#43474f] mb-5 sm:mb-6 leading-relaxed">
                {t('workflow.f3Body')}
              </p>
            </div>
            <div
              style={{ transform: 'translateZ(25px)' }}
              className="bg-[#f2f3ff] p-2.5 rounded-xl flex items-center justify-between text-[#002044] text-xs font-bold border border-[#eaedff] group-hover:bg-[#eaedff] transition-colors"
            >
              <span>{t('workflow.f3Tag')}</span>
              <Radio className="w-3.5 h-3.5 text-[#002044]" />
            </div>
          </FuturisticTiltCard>

          {/* Feature 4: Centralized Work-Order Hub */}
          <FuturisticTiltCard
            onClick={() => onOpenLandlordConsole('maintenance')}
            maxTilt={12}
            borderLaser={true}
            className="group cursor-pointer bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-[#002044]/5 flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div>
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="w-12 h-12 rounded-2xl bg-[#dae2fd] text-[#002044] flex items-center justify-center mb-4 sm:mb-5 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform"
              >
                <Wrench className="w-6 h-6 text-[#8e4f00]" />
              </div>
              <h3
                style={{ transform: 'translateZ(20px)' }}
                className="text-lg font-bold text-[#002044] mb-2 group-hover:text-[#ff9827] transition-colors"
              >
                {t('workflow.f4Title')}
              </h3>
              <p className="text-sm text-[#43474f] mb-5 sm:mb-6 leading-relaxed">
                {t('workflow.f4Body')}
              </p>
            </div>
            <div
              style={{ transform: 'translateZ(25px)' }}
              className="bg-[#f2f3ff] p-2.5 rounded-xl flex items-center justify-between text-[#002044] text-xs font-bold border border-[#eaedff] group-hover:bg-[#eaedff] transition-colors"
            >
              <span>{t('workflow.f4Tag')}</span>
              <Clock className="w-3.5 h-3.5 text-[#ff9827]" />
            </div>
          </FuturisticTiltCard>
        </div>

        {/* Real-Time Cadastral Showcase Banner with 3D Depth */}
        <FuturisticTiltCard
          maxTilt={6}
          glareOpacity={0.15}
          className="mt-8 sm:mt-14 rounded-3xl bg-white p-4 sm:p-6 md:p-8 shadow-xl border border-[#002044]/10 transition-all hover:shadow-2xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-5 relative">
              <div className="w-full h-52 sm:h-80 rounded-2xl overflow-hidden relative shadow-lg group/img">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDf3WEX1sKc9FkcldI6HjJmX-OpbcplXW1r2hLcq1ooldXoYv_YbrawUjuMlsygNKJ0Kf460FFLoDPgYyNzNJgcB8qfmh8Kg2iFgXi-p-N9wITrUznqZyLK1zRjKEV7_n2SHJZb1InsUvMaY9n_8_yjr0pVgGmaQ36VWoOUrlh9AcHwI3UMW3FbqaxZGrF1f8DHIWv8q1TeqykeD7OkAORRN5mDEKWKglZgTrSHp6FT6xPgduydp3esVw"
                  alt={t('workflow.showcaseAlt')}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-[#002044]/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] font-mono font-bold border border-white/15 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {t('workflow.showcaseAlt')}
                </div>
                <div className="absolute bottom-3 right-3 bg-[#ff9827] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/20 font-mono">
                  {t('workflow.occupancy')}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#8e4f00] uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-[#ff9827]" />
                {t('workflow.registrySynced')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#002044] mb-3 tracking-tight">
                {t('workflow.showcaseTitle')}
              </h3>
              <p className="text-sm sm:text-base text-[#43474f] mb-6 leading-relaxed">
                {t('workflow.showcaseBody')}
              </p>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 sm:gap-4 mb-6">
                <div className="flex items-center justify-between gap-3 min-[420px]:block p-3 sm:p-3.5 bg-[#f2f3ff] rounded-2xl min-[420px]:text-center border border-[#eaedff] transition-transform hover:scale-105">
                  <span className="order-2 min-[420px]:order-none text-xl sm:text-3xl font-extrabold text-[#002044] block font-mono whitespace-nowrap">0%</span>
                  <span className="text-xs min-[420px]:text-[11px] text-[#43474f] font-semibold">{t('workflow.statFraud')}</span>
                </div>
                <div className="flex items-center justify-between gap-3 min-[420px]:block p-3 sm:p-3.5 bg-[#f2f3ff] rounded-2xl min-[420px]:text-center border border-[#eaedff] transition-transform hover:scale-105">
                  <span className="order-2 min-[420px]:order-none text-xl sm:text-3xl font-extrabold text-[#002044] block font-mono whitespace-nowrap">{t('workflow.statLeasesValue')}</span>
                  <span className="text-xs min-[420px]:text-[11px] text-[#43474f] font-semibold">{t('workflow.statLeases')}</span>
                </div>
                <div className="flex items-center justify-between gap-3 min-[420px]:block p-3 sm:p-3.5 bg-[#f2f3ff] rounded-2xl min-[420px]:text-center border border-[#eaedff] transition-transform hover:scale-105">
                  <span className="order-2 min-[420px]:order-none text-xl sm:text-3xl font-extrabold text-[#ff9827] block font-mono whitespace-nowrap">&lt; 15 min</span>
                  <span className="text-xs min-[420px]:text-[11px] text-[#43474f] font-semibold">{t('workflow.statSetup')}</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => onOpenLandlordConsole('overview')}
                  className="group inline-flex items-center gap-2 py-1 text-left text-sm font-bold text-[#0f3563] hover:text-[#ff9827] transition-colors"
                >
                  <span>{t('workflow.explore')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </FuturisticTiltCard>
      </div>
    </section>
  );
};
