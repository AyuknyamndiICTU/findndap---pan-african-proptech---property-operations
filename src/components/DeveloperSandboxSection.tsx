import React, { useState } from 'react';
import {
  Terminal,
  Smartphone,
  Download,
  QrCode,
  Copy,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Code2,
  Server,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { APK_BUILDS, ApkBuild, downloadApk } from '../utils/apk';
import { api } from '../services/api';
import { formatXaf } from '../utils/format';
import { FuturisticTiltCard } from './FuturisticTiltCard';
import { useI18n } from '../i18n/LanguageContext';

interface DeveloperSandboxSectionProps {
  onDataRefresh?: () => void;
}

export const DeveloperSandboxSection: React.FC<DeveloperSandboxSectionProps> = ({ onDataRefresh }) => {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'staging' | 'rc' | 'api'>('staging');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [activeEndpointTest, setActiveEndpointTest] = useState<string>('stats');
  const [endpointTestResult, setEndpointTestResult] = useState<string>('');
  const [endpointTestFailed, setEndpointTestFailed] = useState(false);
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false);

  const stableApk = APK_BUILDS.stable;
  const rcApk = APK_BUILDS.rc;
  const versionSuffix = (build: ApkBuild | null) =>
    build?.version ? t('sandbox.versionSuffix', { version: build.version }) : '';
  const apkButtonClass = (build: ApkBuild | null) =>
    `w-full py-4 bg-gradient-to-r from-[#ff9827] to-[#e68316] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all border border-white/20 ${
      build ? 'hover:from-[#e68316] hover:to-[#8e4f00] hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
    }`;

  const handleSimulateWebhook = async () => {
    setWebhookLoading(true);
    setWebhookResponse(null);
    setWebhookError(null);
    try {
      const res = await api.simulateMoMoWebhook({
        amount: 300000,
        payerMsisdn: '+237 671 22 33 44',
        unitReference: 'Apt 101',
        description: 'September 2025 MoMo Rent Deposit',
        tenantName: 'Dr. Jean-Marc Bella',
        buildingName: 'Résidence Le Cristal'
      });
      setWebhookResponse(res);
      if (onDataRefresh) {
        onDataRefresh();
      }
    } catch (err: any) {
      setWebhookError(err instanceof Error && err.message ? err.message : t('sandbox.webhookFailedGeneric'));
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleTestEndpoint = async (endpoint: string) => {
    setActiveEndpointTest(endpoint);
    setIsTestingEndpoint(true);
    setEndpointTestFailed(false);
    try {
      let data: any;
      if (endpoint === 'stats') data = await api.getStats();
      else if (endpoint === 'buildings') data = await api.getBuildings();
      else if (endpoint === 'units') data = await api.getUnits();
      else if (endpoint === 'transactions') data = await api.getTransactions();
      else if (endpoint === 'tickets') data = await api.getTickets();
      else if (endpoint === 'config') data = await api.getMobileConfig();
      setEndpointTestResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setEndpointTestFailed(true);
      setEndpointTestResult(JSON.stringify({ error: e?.message || t('sandbox.requestFailed') }, null, 2));
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const sampleCurl = `curl -X POST ${origin}/api/momo/webhook \\
  -H "X-Webhook-Secret: $MOMO_WEBHOOK_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 300000,
    "currency": "XAF",
    "payerMsisdn": "+237671223344",
    "unitReference": "Apt 101",
    "tenantName": "Dr. Jean-Marc Bella",
    "description": "September 2025 Rent Deposit"
  }'`;

  return (
    <section id="developer-sandbox" className="py-14 sm:py-24 px-4 md:px-8 lg:px-12 bg-[#002044] text-white relative overflow-hidden scroll-mt-24">
      {/* Texture Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002044] via-[#0f3563] to-[#001733] opacity-95" />
      <div className="absolute inset-0 futuristic-grid-dark opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ff9827]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-3">
              <Terminal className="w-3.5 h-3.5 text-[#ff9827]" />
              <span className="text-[11px] font-mono font-bold text-[#ff9827] uppercase tracking-wider">
                {t('sandbox.eyebrow')}
              </span>
            </div>
            <h2 className="text-[1.75rem] sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {t('sandbox.title')}
            </h2>
          </div>
          <p className="text-[#d5e3ff] max-w-md text-sm sm:text-base leading-relaxed font-sans">
            {t('sandbox.intro')}
          </p>
        </div>

        {/* Main Sandbox Box */}
        <div className="rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-xl p-3 sm:p-8 lg:p-10 shadow-2xl border border-white/15">
          {/* Tabs & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 mb-5 sm:mb-8 border-b border-white/10">
            <div className="grid grid-cols-3 w-full sm:w-auto sm:inline-flex rounded-2xl bg-[#001733] p-1 sm:p-1.5 border border-white/10">
              <button
                onClick={() => setActiveTab('staging')}
                className={`px-2 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs leading-tight font-bold transition-all ${
                  activeTab === 'staging'
                    ? 'bg-[#ff9827] text-white shadow-md'
                    : 'text-[#d5e3ff] hover:text-white'
                }`}
              >
                {t('sandbox.tabStaging')}{versionSuffix(stableApk)}
              </button>
              <button
                onClick={() => setActiveTab('rc')}
                className={`px-2 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs leading-tight font-bold transition-all ${
                  activeTab === 'rc'
                    ? 'bg-[#ff9827] text-white shadow-md'
                    : 'text-[#d5e3ff] hover:text-white'
                }`}
              >
                {t('sandbox.tabRc')}{versionSuffix(rcApk)}
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-2 sm:px-4 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs leading-tight font-bold transition-all ${
                  activeTab === 'api'
                    ? 'bg-[#ff9827] text-white shadow-md'
                    : 'text-[#d5e3ff] hover:text-white'
                }`}
              >
                {t('sandbox.tabApi')}
              </button>
            </div>

            <div
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${
                stableApk || rcApk
                  ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
                  : 'text-amber-300 bg-amber-950/40 border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${stableApk || rcApk ? 'bg-emerald-400' : 'bg-amber-400'}`} aria-hidden="true" />
              <span>{stableApk || rcApk ? t('sandbox.buildsPublished') : t('sandbox.noBuilds')}</span>
            </div>
          </div>

          {/* TAB 1: STAGING APK */}
          {activeTab === 'staging' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
              {/* Download Card Left with 3D Tilt */}
              <div className="lg:col-span-7">
                <FuturisticTiltCard
                  maxTilt={8}
                  borderLaser={true}
                  className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0f3563] to-[#002044] border border-white/15 shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#ff9827] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {t('sandbox.stagingTitle')}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#d5e3ff] mt-0.5 font-mono">
                          {stableApk ? (
                            stableApk.version && <span>{t('sandbox.version', { version: stableApk.version })}</span>
                          ) : (
                            <span className="text-amber-300 font-semibold">{t('sandbox.apkUnavailable')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Release Notes */}
                  <div className="bg-[#001733]/80 rounded-2xl p-4 mb-4 text-xs text-[#d5e3ff] space-y-1.5 border border-white/10 font-mono">
                    <div className="text-[11px] font-bold text-[#ff9827] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#ff9827]" />
                      {t('sandbox.stagingHighlights')}
                    </div>
                    <p>{t('sandbox.stagingNote1')}</p>
                    <p>{t('sandbox.stagingNote2')}</p>
                    <p>{t('sandbox.stagingNote3')}</p>
                  </div>

                  {/* Direct Download Button */}
                  <button
                    type="button"
                    onClick={() => downloadApk(stableApk)}
                    disabled={!stableApk}
                    aria-disabled={!stableApk}
                    className={apkButtonClass(stableApk)}
                  >
                    <Download className="w-5 h-5" aria-hidden="true" />
                    <span>{stableApk ? t('sandbox.downloadStaging', { suffix: versionSuffix(stableApk) }) : t('sandbox.apkUnavailable')}</span>
                  </button>
                </FuturisticTiltCard>
              </div>

              {/* QR Code Sideload Right with 3D Tilt (desktop only: on a phone you download directly) */}
              <div className="hidden lg:block lg:col-span-5">
                <FuturisticTiltCard
                  maxTilt={10}
                  glareOpacity={0.2}
                  className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white text-[#002044] shadow-2xl border border-white/20"
                >
                  <div className="p-4 bg-[#f2f3ff] rounded-2xl mb-4 border border-[#eaedff] shadow-inner opacity-60" aria-hidden="true">
                    <svg className="w-36 h-36" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="10" y="10" width="24" height="24" rx="2" className="text-[#002044]" />
                      <rect x="14" y="14" width="16" height="16" rx="1" fill="#ffffff" />
                      <rect x="18" y="18" width="8" height="8" className="text-[#002044]" />

                      <rect x="66" y="10" width="24" height="24" rx="2" className="text-[#002044]" />
                      <rect x="70" y="14" width="16" height="16" rx="1" fill="#ffffff" />
                      <rect x="74" y="18" width="8" height="8" className="text-[#002044]" />

                      <rect x="10" y="66" width="24" height="24" rx="2" className="text-[#002044]" />
                      <rect x="14" y="70" width="16" height="16" rx="1" fill="#ffffff" />
                      <rect x="18" y="74" width="8" height="8" className="text-[#002044]" />

                      <rect x="42" y="12" width="6" height="6" className="text-[#002044]" />
                      <rect x="52" y="18" width="6" height="6" className="text-[#002044]" />
                      <rect x="42" y="28" width="6" height="6" className="text-[#002044]" />
                      <rect x="12" y="42" width="6" height="6" className="text-[#002044]" />
                      <rect x="22" y="52" width="6" height="6" className="text-[#002044]" />
                      <rect x="42" y="42" width="16" height="16" fill="#ff9827" />
                      <rect x="64" y="42" width="6" height="6" className="text-[#002044]" />
                      <rect x="76" y="52" width="6" height="6" className="text-[#002044]" />
                      <rect x="42" y="64" width="6" height="6" className="text-[#002044]" />
                      <rect x="52" y="74" width="6" height="6" className="text-[#002044]" />
                      <rect x="64" y="70" width="10" height="10" className="text-[#002044]" />
                      <rect x="80" y="80" width="8" height="8" className="text-[#002044]" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-base font-extrabold text-[#002044] block mb-1">
                      {t('sandbox.installTitle')}
                    </span>
                    <p className="text-xs text-[#43474f] max-w-xs leading-relaxed">
                      {stableApk ? t('sandbox.installBody') : t('sandbox.installUnavailable')}
                    </p>
                  </div>
                </FuturisticTiltCard>
              </div>
            </div>
          )}

          {/* TAB 2: RELEASE CANDIDATE */}
          {activeTab === 'rc' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
              <div className="lg:col-span-7">
                <FuturisticTiltCard
                  maxTilt={8}
                  className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0f3563] to-[#002044] border border-white/15"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-[#ff9827] font-bold uppercase tracking-wider font-mono">
                        {t('sandbox.productionCandidate')}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {t('sandbox.rcTitle')}
                      </h3>
                      <div className="text-xs text-[#d5e3ff] mt-0.5 font-mono">
                        {rcApk ? (
                          rcApk.version && <span>{t('sandbox.version', { version: rcApk.version })}</span>
                        ) : (
                          <span className="text-amber-300 font-semibold">{t('sandbox.apkUnavailable')}</span>
                        )}
                      </div>
                    </div>
                    {rcApk?.version && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                        {rcApk.version}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#001733]/80 rounded-2xl p-4 mb-4 text-xs text-[#d5e3ff] space-y-1.5 border border-white/10 font-mono">
                    <div className="text-[11px] font-bold text-[#ff9827] uppercase tracking-wider mb-1">
                      {t('sandbox.rcFeatures')}
                    </div>
                    <p>{t('sandbox.rcNote1')}</p>
                    <p>{t('sandbox.rcNote2')}</p>
                    <p>{t('sandbox.rcNote3')}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadApk(rcApk)}
                    disabled={!rcApk}
                    aria-disabled={!rcApk}
                    className={apkButtonClass(rcApk)}
                  >
                    <Download className="w-5 h-5" aria-hidden="true" />
                    <span>{rcApk ? t('sandbox.downloadRc', { suffix: versionSuffix(rcApk) }) : t('sandbox.apkUnavailable')}</span>
                  </button>
                </FuturisticTiltCard>
              </div>

              <div className="lg:col-span-5 bg-white/5 p-4 sm:p-6 rounded-3xl border border-white/15 space-y-3 text-xs text-[#d5e3ff]">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ff9827]" />
                  {t('sandbox.easTitle')}
                </h4>
                <p>{t('sandbox.easRunLocally')}</p>
                <div className="p-3 bg-black/60 rounded-xl font-mono text-[11px] text-emerald-300 border border-white/10">
                  npx eas-cli build:run -p android -e staging
                </div>
                <p className="text-[11px] text-[#c9e6ff]">
                  {t('sandbox.easOta')}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REST API & WEBHOOKS */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              {/* Endpoint Tester Selector */}
              <div className="p-5 rounded-3xl bg-[#0f3563]/80 border border-white/15 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#ff9827]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {t('sandbox.inspectorTitle')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {t('sandbox.serverActive')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { id: 'stats', label: t('sandbox.statsEndpoint') },
                    { id: 'buildings', label: 'GET /api/buildings' },
                    { id: 'units', label: 'GET /api/units' },
                    { id: 'transactions', label: 'GET /api/transactions' },
                    { id: 'tickets', label: 'GET /api/tickets' },
                    { id: 'config', label: 'GET /api/mobile/config' }
                  ].map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => handleTestEndpoint(ep.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                        activeEndpointTest === ep.id
                          ? 'bg-[#ff9827] text-white font-bold shadow-md scale-105'
                          : 'bg-[#002044] text-[#d5e3ff] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {ep.label}
                    </button>
                  ))}
                </div>

                {endpointTestResult && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#d5e3ff] mb-1.5">
                      <span className={endpointTestFailed ? 'text-red-300 font-bold' : ''}>
                        {endpointTestFailed ? t('sandbox.requestFailed') : t('sandbox.responseOk')}
                      </span>
                      <span>Content-Type: application/json</span>
                    </div>
                    <pre className={`p-4 bg-black/80 rounded-2xl font-mono text-xs ${endpointTestFailed ? 'text-red-300' : 'text-emerald-300'} max-h-56 overflow-y-auto border border-white/15 leading-relaxed shadow-inner`}>
                      {endpointTestResult}
                    </pre>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {t('sandbox.momoEndpoint')}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sampleCurl);
                        setCopiedCurl(true);
                        setTimeout(() => setCopiedCurl(false), 2000);
                      }}
                      className="text-xs text-[#ff9827] hover:underline flex items-center gap-1 font-mono"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCurl ? t('sandbox.copied') : t('sandbox.copyCurl')}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-black/70 rounded-2xl font-mono text-xs text-[#38bdf8] overflow-x-auto border border-white/15 leading-relaxed">
                    {sampleCurl}
                  </pre>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                    {t('sandbox.webhookTester')}
                  </span>
                  <div className="p-5 bg-[#0f3563] rounded-2xl border border-white/15 text-xs space-y-3">
                    <p className="text-[#d5e3ff] leading-relaxed">
                      {t('sandbox.webhookIntroBefore')} <code className="text-amber-300 font-mono">POST /api/momo/simulate</code> {t('sandbox.webhookIntroMiddle')} <code className="text-amber-300 font-mono">/api/momo/webhook</code>{t('sandbox.webhookIntroAfter')}
                    </p>
                    <button
                      onClick={handleSimulateWebhook}
                      disabled={webhookLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#ff9827] to-[#e68316] hover:from-[#e68316] hover:to-[#8e4f00] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-lg border border-white/15"
                    >
                      {webhookLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t('sandbox.dispatching')}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>{t('sandbox.trigger', { amount: formatXaf(300000, locale) })}</span>
                        </>
                      )}
                    </button>

                    {webhookError && (
                      <div
                        role="alert"
                        className="p-3.5 bg-red-950/90 border border-red-500 rounded-xl text-red-200 text-[11px] font-mono space-y-1"
                      >
                        <div className="font-bold text-red-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          {t('sandbox.webhookFailedTitle')}
                        </div>
                        <div>{t('sandbox.reason', { reason: webhookError })}</div>
                      </div>
                    )}

                    {webhookResponse && !webhookError && (
                      <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-[11px] font-mono space-y-1">
                        <div className="font-bold text-emerald-400">{t('sandbox.handled')}</div>
                        {webhookResponse.status && <div>{t('sandbox.status', { status: webhookResponse.status })}</div>}
                        {webhookResponse.message && <div>{t('sandbox.message', { message: webhookResponse.message })}</div>}
                        {webhookResponse.transaction && (
                          <>
                            <div>{t('sandbox.txRef', { ref: webhookResponse.transaction.txRef })}</div>
                            <div>
                              {t('sandbox.reconciled', {
                                amount: formatXaf(Number(webhookResponse.transaction.amountXAF) || 0, locale),
                                tenant: webhookResponse.transaction.tenantName
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
