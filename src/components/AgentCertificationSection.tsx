import React, { useEffect, useState } from 'react';
import { AgentKYC, AuthUser } from '../types';
import { KycDocumentUpload } from '../services/api';
import { formatDateTime } from '../utils/format';
import { useI18n, type TranslationKey } from '../i18n/LanguageContext';
import {
  ShieldCheck,
  Scale,
  AlertOctagon,
  UploadCloud,
  CheckCircle2,
  QrCode,
  Building2,
  ArrowRight,
  Clock,
  LogIn,
  XCircle
} from 'lucide-react';

export interface AgentApplication {
  fullName: string;
  agencyName: string;
  licenseId: string;
  city: string;
  momoNumber: string;
  document?: KycDocumentUpload;
}

interface AgentCertificationSectionProps {
  user: AuthUser | null;
  agentKYC: AgentKYC | null;
  onSignIn: () => void;
  /** Resolves to an error message, or null on success. */
  onSubmitApplication: (application: AgentApplication) => Promise<string | null>;
  onOpenBuildingModal: () => void;
  onOpenApprovals: () => void;
}

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const CITY_OPTIONS = [
  'Douala (Littoral, Cameroon)',
  'Yaoundé (Centre, Cameroon)',
  'Bafoussam (West, Cameroon)',
  'Kribi (South, Cameroon)',
  'Limbe (South-West, Cameroon)'
];
// Display labels for the stored city values above (the value sent to the API stays unchanged).
const CITY_LABEL_KEYS: Record<string, TranslationKey> = {
  'Douala (Littoral, Cameroon)': 'agentCert.cityDouala',
  'Yaoundé (Centre, Cameroon)': 'agentCert.cityYaounde',
  'Bafoussam (West, Cameroon)': 'agentCert.cityBafoussam',
  'Kribi (South, Cameroon)': 'agentCert.cityKribi',
  'Limbe (South-West, Cameroon)': 'agentCert.cityLimbe'
};

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const inputClass =
  'w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]';

export const AgentCertificationSection: React.FC<AgentCertificationSectionProps> = ({
  user,
  agentKYC,
  onSignIn,
  onSubmitApplication,
  onOpenBuildingModal,
  onOpenApprovals,
}) => {
  const { t, locale } = useI18n();
  const cityLabel = (city: string) => (CITY_LABEL_KEYS[city] ? t(CITY_LABEL_KEYS[city]) : city);
  const [formData, setFormData] = useState({
    fullName: '',
    agencyName: '',
    licenseId: '',
    city: CITY_OPTIONS[0],
    momoNumber: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [editing, setEditing] = useState(false);

  // Pre-fill the form with what the agent already submitted (for updates and resubmissions).
  useEffect(() => {
    if (agentKYC && agentKYC.status !== 'unverified') {
      setFormData({
        fullName: agentKYC.fullName,
        agencyName: agentKYC.agencyName,
        licenseId: agentKYC.licenseId,
        city: agentKYC.city || CITY_OPTIONS[0],
        momoNumber: agentKYC.momoNumber.replace(/^\+237\s*/, ''),
      });
    }
    setEditing(false);
    setFile(null);
    setAgreed(false);
    setSubmitError(null);
  }, [agentKYC?.userId, agentKYC?.status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setFileError(null);
    if (!picked) return;
    if (!DOCUMENT_TYPES.includes(picked.type)) {
      setFile(null);
      setFileError(t('agentCert.fileTypeError'));
      return;
    }
    if (picked.size > MAX_DOCUMENT_BYTES) {
      setFile(null);
      setFileError(t('agentCert.fileSizeError'));
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!agreed) {
      setSubmitError(t('agentCert.agreeRequired'));
      return;
    }
    if (!file && !agentKYC?.hasDocument) {
      setSubmitError(t('agentCert.documentRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      const document = file
        ? { name: file.name, mimeType: file.type, dataBase64: await readAsBase64(file) }
        : undefined;
      const error = await onSubmitApplication({ ...formData, document });
      if (error) setSubmitError(error);
    } catch {
      setSubmitError(t('agentCert.fileReadError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSignInPrompt = () => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#002044]/10 space-y-4">
      <h3 className="text-lg font-bold text-[#002044]">{t('agentCert.applicationTitle')}</h3>
      <p className="text-sm text-[#43474f]">
        {t('agentCert.signInPrompt')}
      </p>
      <button
        onClick={onSignIn}
        className="py-3 px-5 bg-[#ff9827] hover:bg-[#8e4f00] text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" aria-hidden="true" />
        <span>{t('agentCert.signInToApply')}</span>
      </button>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#002044]/10 space-y-4">
      <h3 className="text-lg font-bold text-[#002044]">{t('agentCert.adminTitle')}</h3>
      <p className="text-sm text-[#43474f]">
        {t('agentCert.adminBody')}
      </p>
      <button
        onClick={onOpenApprovals}
        className="py-3 px-5 bg-[#002044] hover:bg-[#0f3563] text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
      >
        <ShieldCheck className="w-4 h-4 text-[#ff9827]" aria-hidden="true" />
        <span>{t('agentCert.reviewApplications')}</span>
      </button>
    </div>
  );

  const renderCertifiedPass = (kyc: AgentKYC) => (
    <div className="bg-[#faf8ff] rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/30 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#002044]/10">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-xl font-bold text-[#002044]">{t('agentCert.passTitle')}</h3>
            <span className="text-xs text-emerald-800 font-semibold">{t('agentCert.passSubtitle', { badge: kyc.badgeId ?? '' })}</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
          {t('agentCert.passActive')}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#eaedff]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <span className="text-xs text-[#747780] block">{t('agentCert.passName')}</span>
            <span className="text-base font-bold text-[#002044]">{kyc.fullName}</span>
          </div>
          <div>
            <span className="text-xs text-[#747780] block">{t('agentCert.passAgency')}</span>
            <span className="text-base font-bold text-[#002044]">{kyc.agencyName}</span>
          </div>
          <div>
            <span className="text-xs text-[#747780] block">{t('agentCert.passLicense')}</span>
            <span className="text-xs font-mono font-bold text-[#0f3563]">{kyc.licenseId}</span>
          </div>
          <div>
            <span className="text-xs text-[#747780] block">{t('agentCert.passRegion')}</span>
            <span className="text-sm font-semibold text-[#002044]">{cityLabel(kyc.city)}</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
          <p className="text-xs text-emerald-900 font-medium">
            {t('agentCert.passUnlocked')}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenBuildingModal}
        className="w-full py-3.5 px-5 bg-[#002044] hover:bg-[#0f3563] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
      >
        <Building2 className="w-4 h-4 text-[#ff9827]" aria-hidden="true" />
        <span>{t('agentCert.passRegister')}</span>
      </button>
    </div>
  );

  const renderUnderReview = (kyc: AgentKYC) => (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-amber-300 space-y-5">
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-amber-600" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-bold text-[#002044]">{t('agentCert.reviewTitle')}</h3>
          <span className="text-xs text-[#43474f]">{t('agentCert.reviewSubmitted', { date: formatDateTime(kyc.submittedAt, locale) })}</span>
        </div>
      </div>
      <p className="text-sm text-[#43474f]">
        {t('agentCert.reviewBody')}
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[#747780]">{t('agentCert.reviewName')}</dt>
          <dd className="font-bold text-[#002044]">{kyc.fullName}</dd>
        </div>
        <div>
          <dt className="text-[#747780]">{t('agentCert.reviewAgency')}</dt>
          <dd className="font-bold text-[#002044]">{kyc.agencyName}</dd>
        </div>
        <div>
          <dt className="text-[#747780]">{t('agentCert.reviewLicense')}</dt>
          <dd className="font-mono font-bold text-[#002044]">{kyc.licenseId}</dd>
        </div>
        <div>
          <dt className="text-[#747780]">{t('agentCert.reviewDocument')}</dt>
          <dd className="font-bold text-[#002044]">{kyc.documentName}</dd>
        </div>
      </dl>
      <button
        onClick={() => setEditing(true)}
        className="py-2.5 px-4 bg-white border border-[#c3c6d0] text-[#002044] hover:bg-[#f2f3ff] rounded-xl text-xs font-bold"
      >
        {t('agentCert.reviewUpdate')}
      </button>
    </div>
  );

  const renderForm = (kyc: AgentKYC) => (
    <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#002044]/10 relative">
      <div className="flex items-center justify-between pb-4 mb-6 bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff]">
        <div>
          <h3 className="text-lg font-bold text-[#002044]">{t('agentCert.applicationTitle')}</h3>
          <span className="text-xs text-[#43474f]">{t('agentCert.signedInAs', { username: kyc.username ?? '' })}</span>
        </div>
        <span className="px-2.5 py-1 rounded bg-[#ff9827] text-white text-[11px] font-bold">{t('agentCert.kycBadge')}</span>
      </div>

      {kyc.status === 'rejected' && (
        <div role="alert" className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-rose-900">
            <strong>{t('agentCert.rejectedTitle')}</strong>
            {kyc.reviewNote && <p className="mt-0.5">{t('agentCert.rejectedReason', { reason: kyc.reviewNote })}</p>}
            <p className="mt-0.5">{t('agentCert.rejectedFix')}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kyc-name" className="block text-xs font-bold text-[#002044] mb-1">
              {t('agentCert.fullName')}
            </label>
            <input
              id="kyc-name"
              type="text"
              required
              placeholder={t('agentCert.fullNamePlaceholder')}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="kyc-agency" className="block text-xs font-bold text-[#002044] mb-1">
              {t('agentCert.agency')}
            </label>
            <input
              id="kyc-agency"
              type="text"
              required
              placeholder={t('agentCert.agencyPlaceholder')}
              value={formData.agencyName}
              onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kyc-license" className="block text-xs font-bold text-[#002044] mb-1">
              {t('agentCert.license')}
            </label>
            <input
              id="kyc-license"
              type="text"
              required
              placeholder="RC/DLA/2021/B/184"
              value={formData.licenseId}
              onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="kyc-city" className="block text-xs font-bold text-[#002044] mb-1">
              {t('agentCert.city')}
            </label>
            <select
              id="kyc-city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={inputClass}
            >
              {[...new Set([...CITY_OPTIONS, formData.city])].map((c) => (
                <option key={c} value={c}>
                  {cityLabel(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="kyc-momo" className="block text-xs font-bold text-[#002044] mb-1">
            {t('agentCert.momo')}
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl bg-[#eaedff] text-[#43474f] text-xs font-bold border border-r-0 border-[#eaedff]">
              +237
            </span>
            <input
              id="kyc-momo"
              type="tel"
              required
              pattern="\s*6(\s*\d){8}\s*"
              title={t('agentCert.momoTitle')}
              placeholder={t('agentCert.momoPlaceholder')}
              value={formData.momoNumber}
              onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
              className={`${inputClass} rounded-l-none`}
            />
          </div>
        </div>

        {/* Document Upload Area */}
        <div>
          <span className="block text-xs font-bold text-[#002044] mb-1">
            {t('agentCert.document')}
          </span>
          <label className="w-full p-6 rounded-2xl bg-[#f2f3ff] hover:bg-[#eaedff] border-2 border-dashed border-[#c3c6d0] text-center flex flex-col items-center justify-center cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#002044]">
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
            />
            <UploadCloud className="w-8 h-8 text-[#ff9827] mb-2" aria-hidden="true" />
            <span className="text-xs font-bold text-[#002044]">
              {file
                ? t('agentCert.attached', { name: file.name })
                : kyc.hasDocument
                ? t('agentCert.onFile', { name: kyc.documentName ?? '' })
                : t('agentCert.chooseDocument')}
            </span>
            <span className="text-[11px] text-[#747780] mt-1">{t('agentCert.maxSize')}</span>
          </label>
          {fileError && (
            <p role="alert" className="text-xs font-semibold text-rose-700 mt-1">
              {fileError}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-[#ff9827] focus:ring-[#002044] border-[#c3c6d0]"
          />
          <label htmlFor="terms-agree" className="text-xs text-[#43474f] leading-snug cursor-pointer">
            {t('agentCert.terms')}
          </label>
        </div>

        {submitError && (
          <p role="alert" className="text-xs font-semibold text-rose-700">
            {submitError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-[#ff9827] hover:bg-[#8e4f00] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-75"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('agentCert.submitting')}
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>{kyc.status === 'unverified' ? t('agentCert.submit') : t('agentCert.submitUpdate')}</span>
              </>
            )}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="py-3 px-4 bg-white border border-[#c3c6d0] text-[#43474f] hover:bg-[#f2f3ff] rounded-xl text-xs font-semibold"
            >
              {t('agentCert.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderRightColumn = () => {
    if (!user) return renderSignInPrompt();
    if (user.role === 'admin') return renderAdminPanel();
    if (!agentKYC) return null;
    if (agentKYC.status === 'certified') return renderCertifiedPass(agentKYC);
    if (agentKYC.status === 'in-review' && !editing) return renderUnderReview(agentKYC);
    return renderForm(agentKYC);
  };

  return (
    <section id="agent-portal" className="py-20 px-4 md:px-8 lg:px-12 bg-white relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14">
          {/* Left Column: Governance, Rules & Pipeline */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f2f3ff] text-[#002044] text-[11px] font-bold uppercase tracking-wider mb-4 border border-[#d5e3ff]">
                <Scale className="w-3.5 h-3.5 text-[#ff9827]" />
                {t('agentCert.eyebrow')}
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002044] tracking-tight mb-4">
                {t('agentCert.title')}
              </h2>

              {/* Zero-Tolerance Policy Alert */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#002044] mb-6">
                <div className="flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-[#ff9827] shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-[#002044] leading-snug">
                    <span className="font-bold">{t('agentCert.policyLabel')}</span> {t('agentCert.policyBody')}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#43474f] mb-8 leading-relaxed">
                {t('agentCert.intro')}
              </p>

              {/* 3-Step Verification Pipeline */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#002044] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#002044]">{t('agentCert.step1Title')}</h4>
                    <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
                      {t('agentCert.step1Body')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#ff9827] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#002044]">{t('agentCert.step2Title')}</h4>
                    <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
                      {t('agentCert.step2Body')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0f3563] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#002044]">{t('agentCert.step3Title')}</h4>
                    <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
                      {t('agentCert.step3Body')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust quotation pill */}
            <div className="p-3.5 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#ff9827] shrink-0" />
              <span className="text-xs font-semibold text-[#131b2e]">
                {t('agentCert.trust')}
              </span>
            </div>
          </div>

          {/* Right Column: sign-in prompt, application form, review status or certified pass */}
          <div className="lg:col-span-7">{renderRightColumn()}</div>
        </div>
      </div>
    </section>
  );
};