import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Mail, Phone, MapPin, Download } from 'lucide-react';
import { APK_BUILDS, downloadApk } from '../utils/apk';
import { useI18n } from '../i18n/LanguageContext';

interface FooterProps {
  onOpenAgentModal: () => void;
  onOpenLandlordConsole: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAgentModal,
  onOpenLandlordConsole,
}) => {
  const { t } = useI18n();
  const stableApk = APK_BUILDS.stable;
  const rcApk = APK_BUILDS.rc;

  return (
    <footer className="bg-[#002044] text-white pt-12 sm:pt-16 pb-28 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-10 pb-10 sm:pb-12 border-b border-white/10">
          {/* Column 1: Brand & Overview */}
          <div className="col-span-2 space-y-4">
            <BrandLogo size="lg" textColor="white" />
            <p className="text-sm text-[#d5e3ff] leading-relaxed max-w-sm">
              {t('footer.about')}
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#d5e3ff]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#ff9827]" />
                <span>{t('footer.address')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ff9827]" />
                <span>contact@findndap.com • legal@findndap.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ff9827]" />
                <span>+237 670 00 99 22 {t('footer.phoneNote')}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Landlords */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff9827]">
              {t('footer.landlordSolutions')}
            </h4>
            <ul className="space-y-0.5 sm:space-y-2 text-[13px] sm:text-xs text-[#d5e3ff]">
              <li>
                <button
                  onClick={onOpenLandlordConsole}
                  className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors"
                >
                  {t('footer.liveConsole')}
                </button>
              </li>
              <li>
                <a href="#features" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.momoCollection')}
                </a>
              </li>
              <li>
                <a href="#features" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.bulkSms')}
                </a>
              </li>
              <li>
                <a href="#features" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.maintenance')}
                </a>
              </li>
              <li>
                <a href="#features" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.pricing')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Certified Agents */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff9827]">
              {t('footer.agentPortal')}
            </h4>
            <ul className="space-y-0.5 sm:space-y-2 text-[13px] sm:text-xs text-[#d5e3ff]">
              <li>
                <button
                  onClick={onOpenAgentModal}
                  className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors"
                >
                  {t('footer.registerAgent')}
                </button>
              </li>
              <li>
                <a href="#agent-portal" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.tfVerification')}
                </a>
              </li>
              <li>
                <a href="#agent-portal" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.registrationStudio')}
                </a>
              </li>
              <li>
                <a href="#agent-portal" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.fraudPolicy')}
                </a>
              </li>
              <li>
                <a href="#agent-portal" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.commissionPayouts')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff9827]">
              {t('footer.developerHub')}
            </h4>
            <ul className="space-y-0.5 sm:space-y-2 text-[13px] sm:text-xs text-[#d5e3ff]">
              <li>
                <button
                  type="button"
                  onClick={() => downloadApk(stableApk)}
                  disabled={!stableApk}
                  aria-disabled={!stableApk}
                  className={`transition-colors flex items-start gap-1.5 text-left py-1.5 sm:py-0 font-semibold text-[#ff9827] ${
                    stableApk ? 'hover:text-white' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    {stableApk
                      ? stableApk.version
                        ? t('footer.stagingApkVersion', { version: stableApk.version })
                        : t('footer.stagingApk')
                      : t('footer.stagingApkUnavailable')}
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => downloadApk(rcApk)}
                  disabled={!rcApk}
                  aria-disabled={!rcApk}
                  className={`transition-colors text-left py-1.5 sm:py-0 ${rcApk ? 'hover:text-white' : 'opacity-50 cursor-not-allowed'}`}
                >
                  {rcApk
                    ? rcApk.version
                      ? t('footer.releaseCandidateVersion', { version: rcApk.version })
                      : t('footer.releaseCandidate')
                    : t('footer.releaseCandidateUnavailable')}
                </button>
              </li>
              <li>
                <a href="#developer-sandbox" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.momoSandbox')}
                </a>
              </li>
              <li>
                <a href="#developer-sandbox" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.orangeEndpoints')}
                </a>
              </li>
              <li>
                <a href="#developer-sandbox" className="inline-block py-1.5 sm:py-0 text-left hover:text-white transition-colors">
                  {t('footer.pipeline')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & regulatory notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#d5e3ff]/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {t('footer.compliance')}
            </span>
          </div>
          <div>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </div>
    </footer>
  );
};
