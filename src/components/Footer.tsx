import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Mail, Phone, MapPin, Download } from 'lucide-react';
import { downloadFindNdapApk } from '../utils/apkGenerator';

interface FooterProps {
  onOpenAgentModal: () => void;
  onOpenLandlordConsole: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAgentModal,
  onOpenLandlordConsole,
}) => {
  return (
    <footer className="bg-[#002044] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="lg" textColor="white" />
            <p className="text-sm text-[#d5e3ff] leading-relaxed max-w-sm">
              The premier Pan-African property management and cadastral verification ecosystem. Streamlining landlord operations, automated Mobile Money rent collection, and accredited broker building registrations.
            </p>
            <div className="space-y-2 pt-2 text-xs text-[#d5e3ff]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#ff9827]" />
                <span>Akwa Boulevard &amp; Bastos Diplomatic Quarter, Cameroon</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#ff9827]" />
                <span>contact@findndap.com • legal@findndap.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#ff9827]" />
                <span>+237 670 00 99 22 (MoMo / WhatsApp Operations)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Landlords */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff9827]">
              Landlord Solutions
            </h4>
            <ul className="space-y-2 text-xs text-[#d5e3ff]">
              <li>
                <button
                  onClick={onOpenLandlordConsole}
                  className="hover:text-white transition-colors"
                >
                  Live Operations Console
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Automated MoMo Collection
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Direct Bulk SMS Broadcaster
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Maintenance Triage System
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Digital Unit Pricing &amp; Leases
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Certified Agents */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff9827]">
              Certified Agent Portal
            </h4>
            <ul className="space-y-2 text-xs text-[#d5e3ff]">
              <li>
                <button
                  onClick={onOpenAgentModal}
                  className="hover:text-white transition-colors"
                >
                  Register as Certified Agent
                </button>
              </li>
              <li>
                <a href="#agent-portal" className="hover:text-white transition-colors">
                  Cadastral Title (TF) Verification
                </a>
              </li>
              <li>
                <a href="#agent-portal" className="hover:text-white transition-colors">
                  Building Registration Studio
                </a>
              </li>
              <li>
                <a href="#agent-portal" className="hover:text-white transition-colors">
                  Zero-Tolerance Fraud Policy
                </a>
              </li>
              <li>
                <a href="#agent-portal" className="hover:text-white transition-colors">
                  Direct MoMo Commission Payouts
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff9827]">
              Developer Hub &amp; APK
            </h4>
            <ul className="space-y-2 text-xs text-[#d5e3ff]">
              <li>
                <button
                  onClick={() => downloadFindNdapApk('1.4.2')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-[#ff9827]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Staging APK (.apk)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => downloadFindNdapApk('1.5.0-rc2')}
                  className="hover:text-white transition-colors"
                >
                  Release Candidate (v1.5.0-rc)
                </button>
              </li>
              <li>
                <a href="#developer-hub" className="hover:text-white transition-colors">
                  MTN MoMo Sandbox Webhooks
                </a>
              </li>
              <li>
                <a href="#developer-hub" className="hover:text-white transition-colors">
                  Orange Money REST Endpoints
                </a>
              </li>
              <li>
                <a href="#developer-hub" className="hover:text-white transition-colors">
                  CI/CD Build Pipeline
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
              OHADA &amp; CEMAC Compliant Digital Property Leases • Titre Foncier Cadastral Verification
            </span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} FindNdap Inc. All rights reserved. Registered under Pan-African Proptech Accord.
          </div>
        </div>
      </div>
    </footer>
  );
};
