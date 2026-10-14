import React, { useState } from 'react';
import { AgentKYC } from '../types';
import { ShieldCheck, Scale, AlertOctagon, UploadCloud, CheckCircle2, QrCode, Building2, ArrowRight } from 'lucide-react';

interface AgentCertificationSectionProps {
  agentKYC: AgentKYC;
  onRegisterAgent: (agentData: Partial<AgentKYC>) => void;
  onOpenBuildingModal: () => void;
}

export const AgentCertificationSection: React.FC<AgentCertificationSectionProps> = ({
  agentKYC,
  onRegisterAgent,
  onOpenBuildingModal,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    agencyName: '',
    licenseId: '',
    city: 'Douala (Littoral, Cameroon)',
    momoNumber: '',
  });
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('Please agree to the mandatory physical inspection terms.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onRegisterAgent({
        fullName: formData.fullName || 'Certified Broker',
        agencyName: formData.agencyName || 'Pan-African Realty Partners',
        licenseId: formData.licenseId || 'RC/DLA/2025/B/9921',
        city: formData.city,
        momoNumber: '+237 ' + formData.momoNumber,
        documentName: uploadedFileName || 'National_ID_License_Audit.pdf',
        isCertified: true,
        status: 'certified',
        badgeId: `FND-CERT-${Math.floor(1000 + Math.random() * 9000)}`,
        submittedAt: new Date().toISOString().split('T')[0]
      });
      setIsSubmitting(false);
      setSubmissionSuccess(true);
    }, 900);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    } else {
      setUploadedFileName('CNI_Agent_Commercial_Registry.pdf');
    }
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
                Strict Quality Governance
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002044] tracking-tight mb-4">
                Exclusive Certified Agent Network
              </h2>

              {/* Zero-Tolerance Policy Alert */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#002044] mb-6">
                <div className="flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 text-[#ff9827] shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-[#002044] leading-snug">
                    <span className="font-bold">Zero-Tolerance Fraud Policy:</span> Only fully certified, KYC-verified agents are authorized to register buildings and upload listings to FindNdap.
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#43474f] mb-8 leading-relaxed">
                We empower legitimate real estate brokers with institutional tools while permanently blacklisting rogue operators. Get your certification badge, boost client credibility, and unlock direct commission settlements.
              </p>

              {/* 3-Step Verification Pipeline */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#002044] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#002044]">Identity &amp; License Filing</h4>
                    <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
                      Submit official national ID (CNI/Passport), commercial registry (RCCM), and agency operating license.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#ff9827] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#002044]">Cadastral &amp; Background Audit</h4>
                    <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
                      Our compliance legal desk completes background checks and historical listing verification within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#0f3563] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#002044]">Console Authorization &amp; Badge</h4>
                    <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
                      Receive your encrypted QR Agent Pass, building onboarding privileges, and dedicated Mobile Money commission wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust quotation pill */}
            <div className="p-3.5 rounded-2xl bg-[#f2f3ff] border border-[#eaedff] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#ff9827] shrink-0" />
              <span className="text-xs font-semibold text-[#131b2e]">
                Over 850+ vetted brokers active across Douala, Yaoundé, and Abidjan.
              </span>
            </div>
          </div>

          {/* Right Column: Application Form or Active Certified Pass */}
          <div className="lg:col-span-7">
            {agentKYC.isCertified ? (
              /* If Certified: Showcase Agent Digital Pass & Direct Link to Register Buildings */
              <div className="bg-[#faf8ff] rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/30 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#002044]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <h3 className="text-xl font-bold text-[#002044]">Certified Agent Console Access</h3>
                      <span className="text-xs text-emerald-800 font-semibold">
                        Cadastral Accreditation Verified • {agentKYC.badgeId}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                    ACTIVE CERTIFIED
                  </span>
                </div>

                <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#eaedff]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <span className="text-xs text-[#747780] block">Certified Agent Name</span>
                      <span className="text-base font-bold text-[#002044]">{agentKYC.fullName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#747780] block">Real Estate Agency</span>
                      <span className="text-base font-bold text-[#002044]">{agentKYC.agencyName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#747780] block">Official License #</span>
                      <span className="text-xs font-mono font-bold text-[#0f3563]">{agentKYC.licenseId}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#747780] block">Operating Region</span>
                      <span className="text-sm font-semibold text-[#002044]">{agentKYC.city}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-900 font-medium">
                      Full Cadastral Building Registration privileges unlocked. You are authorized to submit new complexes, coordinate unit leases, and receive verified mobile money commissions.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onOpenBuildingModal}
                    className="flex-1 py-3.5 px-5 bg-[#002044] hover:bg-[#0f3563] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <Building2 className="w-4 h-4 text-[#ff9827]" />
                    <span>Register a Building &amp; Properties Now</span>
                  </button>
                  <button
                    onClick={() => {
                      onRegisterAgent({ isCertified: false, status: 'unverified' });
                      setSubmissionSuccess(false);
                    }}
                    className="py-3 px-4 bg-white border border-[#c3c6d0] text-[#43474f] hover:bg-[#f2f3ff] rounded-xl text-xs font-semibold transition-colors"
                  >
                    Reset Demo State
                  </button>
                </div>
              </div>
            ) : (
              /* If Uncertified: KYC Intake Form */
              <div className="bg-[#ffffff] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#002044]/10 relative">
                <div className="flex items-center justify-between pb-4 mb-6 bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff]">
                  <div>
                    <h3 className="text-lg font-bold text-[#002044]">Certified Agent Application</h3>
                    <span className="text-xs text-[#43474f]">FindNdap Cadastral Accreditation Desk</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#ff9827] text-white text-[11px] font-bold">
                    KYC v2.4
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jean-Paul Mbarga"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        Real Estate Agency / Business Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Horizon Immobilier SARL"
                        value={formData.agencyName}
                        onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        License or Commercial ID (RCCM / NUI)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="RC/DLA/2021/B/184"
                        value={formData.licenseId}
                        onChange={(e) => setFormData({ ...formData, licenseId: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        Primary Operating City / Region
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      >
                        <option value="Douala (Littoral, Cameroon)">Douala (Littoral, Cameroon)</option>
                        <option value="Yaoundé (Centre, Cameroon)">Yaoundé (Centre, Cameroon)</option>
                        <option value="Bafoussam (West, Cameroon)">Bafoussam (West, Cameroon)</option>
                        <option value="Abidjan (Ivory Coast)">Abidjan (Ivory Coast)</option>
                        <option value="Libreville (Gabon)">Libreville (Gabon)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#002044] mb-1">
                      Mobile Money Number (For Verified Broker Payouts)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-xl bg-[#eaedff] text-[#43474f] text-xs font-bold border border-r-0 border-[#eaedff]">
                        +237
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="670 00 00 00 (MTN or Orange)"
                        value={formData.momoNumber}
                        onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-r-xl bg-[#f2f3ff] text-[#131b2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>
                  </div>

                  {/* Document Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-[#002044] mb-1">
                      Upload National ID Card or Agency License (PDF / JPG)
                    </label>
                    <label className="w-full p-6 rounded-2xl bg-[#f2f3ff] hover:bg-[#eaedff] border-2 border-dashed border-[#c3c6d0] text-center flex flex-col items-center justify-center cursor-pointer transition-colors block">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleSimulateUpload}
                      />
                      <UploadCloud className="w-8 h-8 text-[#ff9827] mb-2" />
                      <span className="text-xs font-bold text-[#002044]">
                        {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Click or drop to upload identity document'}
                      </span>
                      <span className="text-[11px] text-[#747780] mt-1">
                        Maximum file size 15MB • 256-bit encrypted storage
                      </span>
                    </label>
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
                      I certify that all documents submitted are authentic. I agree to FindNdap&apos;s mandatory physical building inspection terms prior to any listing publication.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#ff9827] hover:bg-[#8e4f00] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Validating Cadastral Record...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Application for Certification</span>
                      </>
                    )}
                  </button>

                  {/* Quick Demo Pre-fill shortcut */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          fullName: 'Béatrice Mengue',
                          agencyName: 'Yaoundé Realty & Asset Partners',
                          licenseId: 'RC/YDE/2021/B/8492',
                          city: 'Yaoundé (Centre, Cameroon)',
                          momoNumber: '677 44 55 66',
                        });
                        setUploadedFileName('CNI_Agent_Commercial_Registry.pdf');
                        setAgreed(true);
                      }}
                      className="text-[11px] text-[#0f3563] hover:underline font-semibold"
                    >
                      ⚡ Quick-Fill with Verified Broker Sample Data
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
