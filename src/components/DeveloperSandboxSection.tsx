import React, { useState } from 'react';
import {
  Terminal,
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  Play,
  ArrowUpRight,
  ShieldCheck,
  Code2,
  Server,
  Check,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { downloadFindNdapApk } from '../utils/apkGenerator';
import { api } from '../services/api';
import { FuturisticTiltCard } from './FuturisticTiltCard';

interface DeveloperSandboxSectionProps {
  onDataRefresh?: () => void;
}

export const DeveloperSandboxSection: React.FC<DeveloperSandboxSectionProps> = ({ onDataRefresh }) => {
  const [activeTab, setActiveTab] = useState<'staging' | 'rc' | 'api'>('staging');
  const [downloadCount, setDownloadCount] = useState(482);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [activeEndpointTest, setActiveEndpointTest] = useState<string>('stats');
  const [endpointTestResult, setEndpointTestResult] = useState<string>('');
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false);

  const handleDownload = (version: string) => {
    downloadFindNdapApk(version);
    setDownloadCount((prev) => prev + 1);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleSimulateWebhook = async () => {
    setWebhookLoading(true);
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
      setWebhookResponse({ error: err.message || 'Webhook invocation failed' });
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleTestEndpoint = async (endpoint: string) => {
    setActiveEndpointTest(endpoint);
    setIsTestingEndpoint(true);
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
      setEndpointTestResult(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  const sampleCurl = `curl -X POST http://localhost:3000/api/momo/webhook \\
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
    <section id="developer-sandbox" className="py-24 px-4 md:px-8 lg:px-12 bg-[#002044] text-white relative overflow-hidden">
      {/* Texture Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002044] via-[#0f3563] to-[#001733] opacity-95" />
      <div className="absolute inset-0 futuristic-grid-dark opacity-30 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ff9827]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 mb-3">
              <Terminal className="w-3.5 h-3.5 text-[#ff9827]" />
              <span className="text-[11px] font-mono font-bold text-[#ff9827] uppercase tracking-wider">
                Engineering &amp; QA Environment
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Developer &amp; Partner Android Sandbox
            </h2>
          </div>
          <p className="text-[#d5e3ff] max-w-md text-sm sm:text-base leading-relaxed font-sans">
            Directly download and test the latest staging &amp; release candidate APK builds of FindNdap Mobile. Built with React Native &amp; Expo for blazing fast performance across Pan-African network conditions.
          </p>
        </div>

        {/* Main Sandbox Box */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/15">
          {/* Tabs & Status */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
            <div className="inline-flex rounded-2xl bg-[#001733] p-1.5 border border-white/10">
              <button
                onClick={() => setActiveTab('staging')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'staging'
                    ? 'bg-[#ff9827] text-white shadow-md'
                    : 'text-[#d5e3ff] hover:text-white'
                }`}
              >
                Staging APK (v1.4.2)
              </button>
              <button
                onClick={() => setActiveTab('rc')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'rc'
                    ? 'bg-[#ff9827] text-white shadow-md'
                    : 'text-[#d5e3ff] hover:text-white'
                }`}
              >
                Release Candidate (v1.5.0-rc)
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'api'
                    ? 'bg-[#ff9827] text-white shadow-md'
                    : 'text-[#d5e3ff] hover:text-white'
                }`}
              >
                REST API &amp; Webhooks
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>CI/CD Build Passing • SHA-256: 8f2c019b7...</span>
            </div>
          </div>

          {/* TAB 1: STAGING APK */}
          {activeTab === 'staging' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Download Card Left with 3D Tilt */}
              <div className="lg:col-span-7">
                <FuturisticTiltCard
                  maxTilt={8}
                  borderLaser={true}
                  className="p-6 rounded-3xl bg-gradient-to-br from-[#0f3563] to-[#002044] border border-white/15 shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#ff9827] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          FindNdap-Mobile-v1.4.2-staging.apk
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#d5e3ff] mt-0.5 font-mono">
                          <span>Size: 38.4 MB</span>
                          <span>•</span>
                          <span>Target: Android 9.0+</span>
                          <span>•</span>
                          <span className="text-[#ff9827] font-semibold">Updated: Today</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono uppercase tracking-wider border border-white/10">
                      ARM64 &amp; x86_64
                    </span>
                  </div>

                  {/* Release Notes */}
                  <div className="bg-[#001733]/80 rounded-2xl p-4 mb-4 text-xs text-[#d5e3ff] space-y-1.5 border border-white/10 font-mono">
                    <div className="text-[11px] font-bold text-[#ff9827] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-[#ff9827]" />
                      Build v1.4.2 Highlights:
                    </div>
                    <p>• MTN MoMo &amp; Orange Money Sandbox Webhook Simulation added.</p>
                    <p>• Offline property inspection photo cache with auto-upload on Wi-Fi/4G.</p>
                    <p>• Low-bandwidth JPEG compressor optimized for 3G rural corridors.</p>
                  </div>

                  {/* Direct Download Button */}
                  <button
                    onClick={() => handleDownload('1.4.2')}
                    className="w-full py-4 bg-gradient-to-r from-[#ff9827] to-[#e68316] hover:from-[#e68316] hover:to-[#8e4f00] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border border-white/20"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download APK File (.apk) — Free Sandbox</span>
                  </button>

                  <div className="flex justify-between items-center text-[11px] text-[#c9e6ff] mt-3 px-1 font-mono">
                    <span>Package: com.findndap.mobile.staging</span>
                    <span>{downloadCount} dev downloads this week</span>
                  </div>

                  {downloadSuccess && (
                    <div className="mt-3 p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Download started! File saved as <strong>FindNdap-Mobile-v1.4.2-staging.apk</strong>.</span>
                    </div>
                  )}
                </FuturisticTiltCard>
              </div>

              {/* QR Code Sideload Right with 3D Tilt */}
              <div className="lg:col-span-5">
                <FuturisticTiltCard
                  maxTilt={10}
                  glareOpacity={0.2}
                  className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white text-[#002044] shadow-2xl border border-white/20"
                >
                  <div className="p-4 bg-[#f2f3ff] rounded-2xl mb-4 border border-[#eaedff] shadow-inner">
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
                      Scan to Install on Device
                    </span>
                    <p className="text-xs text-[#43474f] max-w-xs leading-relaxed">
                      Scan with any Android camera to directly sideload the APK onto your physical testing handset.
                    </p>
                  </div>
                </FuturisticTiltCard>
              </div>
            </div>
          )}

          {/* TAB 2: RELEASE CANDIDATE */}
          {activeTab === 'rc' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <FuturisticTiltCard
                  maxTilt={8}
                  className="p-6 rounded-3xl bg-gradient-to-br from-[#0f3563] to-[#002044] border border-white/15"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-[#ff9827] font-bold uppercase tracking-wider font-mono">
                        Production Candidate
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        FindNdap-Mobile-v1.5.0-rc2.apk
                      </h3>
                      <div className="text-xs text-[#d5e3ff] mt-0.5 font-mono">
                        Size: 41.2 MB • Target: Android 10+ (API 29+) • Signed with Production Keystore
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      RC-2
                    </span>
                  </div>

                  <div className="bg-[#001733]/80 rounded-2xl p-4 mb-4 text-xs text-[#d5e3ff] space-y-1.5 border border-white/10 font-mono">
                    <div className="text-[11px] font-bold text-[#ff9827] uppercase tracking-wider mb-1">
                      New v1.5.0 Features in Testing:
                    </div>
                    <p>• CEMAC &amp; OHADA digital lease contract generator with electronic signatures.</p>
                    <p>• Automated French/English bilingual tenant notification engine.</p>
                    <p>• Offline-first SQLite local persistence with background cloud synchronization.</p>
                  </div>

                  <button
                    onClick={() => handleDownload('1.5.0-rc2')}
                    className="w-full py-4 bg-gradient-to-r from-[#ff9827] to-[#e68316] hover:from-[#e68316] hover:to-[#8e4f00] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Release Candidate APK (v1.5.0)</span>
                  </button>
                </FuturisticTiltCard>
              </div>

              <div className="lg:col-span-5 bg-white/5 p-6 rounded-3xl border border-white/15 space-y-3 text-xs text-[#d5e3ff]">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#ff9827]" />
                  Expo EAS Channel Configuration
                </h4>
                <p>Run locally in Expo development client:</p>
                <div className="p-3 bg-black/60 rounded-xl font-mono text-[11px] text-emerald-300 border border-white/10">
                  npx eas-cli build:run -p android -e staging
                </div>
                <p className="text-[11px] text-[#c9e6ff]">
                  Targeted testers can also receive Over-the-Air updates without reinstalling.
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
                      Mobile App REST API Inspector
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Express Server Port :3000 Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { id: 'stats', label: 'GET /api/stats (Live Recomputed Metrics)' },
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
                      <span>Response Status: 200 OK</span>
                      <span>Content-Type: application/json</span>
                    </div>
                    <pre className="p-4 bg-black/80 rounded-2xl font-mono text-xs text-emerald-300 max-h-56 overflow-y-auto border border-white/15 leading-relaxed shadow-inner">
                      {endpointTestResult}
                    </pre>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      MTN MoMo Collection Endpoint
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
                      <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-black/70 rounded-2xl font-mono text-xs text-[#38bdf8] overflow-x-auto border border-white/15 leading-relaxed">
                    {sampleCurl}
                  </pre>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                    Live Webhook Callback Tester
                  </span>
                  <div className="p-5 bg-[#0f3563] rounded-2xl border border-white/15 text-xs space-y-3">
                    <p className="text-[#d5e3ff] leading-relaxed">
                      Simulate a payment confirmation via the dev-only <code className="text-amber-300 font-mono">POST /api/momo/simulate</code> route (same reconciliation as the secret-protected <code className="text-amber-300 font-mono">/api/momo/webhook</code>) to test instant ledger reconciliation:
                    </p>
                    <button
                      onClick={handleSimulateWebhook}
                      disabled={webhookLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#ff9827] to-[#e68316] hover:from-[#e68316] hover:to-[#8e4f00] disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-lg border border-white/15"
                    >
                      {webhookLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Payment to /api/momo/simulate...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Trigger Live MoMo Webhook (300,000 XAF)</span>
                        </>
                      )}
                    </button>

                    {webhookResponse && (
                      <div className="p-3.5 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-[11px] font-mono space-y-1">
                        <div className="font-bold text-emerald-400">HTTP 200 OK — Handled by Express API</div>
                        <div>Status: {webhookResponse.status || 'SUCCESS'}</div>
                        <div>Message: {webhookResponse.message}</div>
                        {webhookResponse.transaction && (
                          <>
                            <div>TxRef: {webhookResponse.transaction.txRef}</div>
                            <div>Reconciled: {webhookResponse.transaction.amountXAF.toLocaleString()} XAF ({webhookResponse.transaction.tenantName})</div>
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
