import React from 'react';
import { ArrowRight, Smartphone, ShieldCheck, Download } from 'lucide-react';
import { downloadFindNdapApk } from '../utils/apkGenerator';

interface CallToActionSectionProps {
  onRegisterAgentClick: () => void;
  onOpenLandlordConsole: () => void;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  onRegisterAgentClick,
  onOpenLandlordConsole,
}) => {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-12 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#002044] via-[#0f3563] to-[#002044] p-8 sm:p-12 lg:p-16 text-white text-center relative shadow-2xl overflow-hidden">
          {/* Background circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff9827]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#ff9827]" />
              Modernizing Pan-African Real Estate
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Ready to Modernize Your Real Estate Operations?
            </h2>

            <p className="text-base sm:text-lg text-[#d5e3ff] mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of African property owners and verified brokers running profitable, automated, and fraud-free rental businesses directly from their mobile phones.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onRegisterAgentClick}
                className="w-full sm:w-auto px-7 py-4 bg-[#ff9827] hover:bg-[#8e4f00] text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>Register as Certified Agent</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => downloadFindNdapApk('1.4.2')}
                className="w-full sm:w-auto px-7 py-4 bg-white text-[#002044] hover:bg-[#eaedff] font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4 text-[#ff9827]" />
                <span>Download Developer APK (v1.4.2)</span>
              </button>

              <button
                onClick={onOpenLandlordConsole}
                className="w-full sm:w-auto px-7 py-4 bg-white/15 hover:bg-white/25 text-white font-bold text-sm rounded-2xl border border-white/20 flex items-center justify-center gap-2 transition-all"
              >
                <Smartphone className="w-4 h-4 text-[#ff9827]" />
                <span>Test Live Console</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
