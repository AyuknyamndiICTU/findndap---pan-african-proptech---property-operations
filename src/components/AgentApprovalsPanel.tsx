import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, ShieldCheck, XCircle } from 'lucide-react';
import { api, ApiError } from '../services/api';
import { AgentKYC, DashboardStats } from '../types';
import { formatDateTime } from '../utils/format';
import { useI18n, type TranslationKey } from '../i18n/LanguageContext';

interface AgentApprovalsPanelProps {
  onReviewed: (stats: DashboardStats) => void;
  onError: (message: string) => void;
}

const STATUS_STYLE: Record<AgentKYC['status'], string> = {
  'in-review': 'bg-amber-100 text-amber-900',
  certified: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  unverified: 'bg-slate-100 text-slate-700'
};

const STATUS_LABEL_KEY: Record<AgentKYC['status'], TranslationKey> = {
  'in-review': 'approvals.statusInReview',
  certified: 'approvals.statusCertified',
  rejected: 'approvals.statusRejected',
  unverified: 'approvals.statusUnverified'
};

export const AgentApprovalsPanel: React.FC<AgentApprovalsPanelProps> = ({ onReviewed, onError }) => {
  const { t, locale } = useI18n();
  const tRef = useRef(t);
  tRef.current = t;
  const [agents, setAgents] = useState<AgentKYC[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      setAgents(await api.listAgentApplications());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : tRef.current('approvals.loadFailed'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (agent: AgentKYC, decision: 'approve' | 'reject') => {
    const id = agent.userId!;
    const note = (notes[id] || '').trim();
    if (decision === 'reject' && !note) {
      setRowError((prev) => ({ ...prev, [id]: t('approvals.reasonRequired') }));
      return;
    }
    setBusyId(id);
    setRowError((prev) => ({ ...prev, [id]: '' }));
    try {
      const res = await api.reviewAgent(id, decision, note || undefined);
      setAgents((prev) => (prev || []).map((a) => (a.userId === id ? res.agent : a)));
      setNotes((prev) => ({ ...prev, [id]: '' }));
      onReviewed(res.stats);
    } catch (err) {
      setRowError((prev) => ({ ...prev, [id]: err instanceof ApiError ? err.message : t('approvals.saveFailed') }));
    } finally {
      setBusyId(null);
    }
  };

  const downloadDocument = async (agent: AgentKYC) => {
    try {
      await api.downloadAgentDocument(agent.userId!);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : t('approvals.downloadFailed'));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#002044]">{t('approvals.title')}</h3>
        <p className="text-xs text-[#747780]">
          {t('approvals.intro')}
        </p>
      </div>

      {loadError && (
        <p role="alert" className="text-xs font-semibold text-rose-700">
          {loadError}
        </p>
      )}
      {agents === null && !loadError && <p className="text-xs text-[#747780]">{t('approvals.loading')}</p>}
      {agents?.length === 0 && <p className="text-xs text-[#747780]">{t('approvals.empty')}</p>}

      <div className="space-y-3">
        {agents?.map((agent) => {
          const id = agent.userId!;
          const reviewable = agent.status === 'in-review';
          return (
            <div key={id} className="p-4 bg-white border border-[#eaedff] rounded-2xl shadow-xs space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-[#002044]">{agent.fullName}</div>
                  <div className="text-xs text-[#747780]">
                    @{agent.username} • {agent.agencyName}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_STYLE[agent.status]}`}>
                  {t(STATUS_LABEL_KEY[agent.status])}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div className="flex gap-2">
                  <dt className="text-[#747780]">{t('approvals.license')}</dt>
                  <dd className="font-mono font-semibold text-[#002044]">{agent.licenseId}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[#747780]">{t('approvals.city')}</dt>
                  <dd className="font-semibold text-[#002044]">{agent.city}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[#747780]">{t('approvals.momoPayout')}</dt>
                  <dd className="font-semibold text-[#002044]">{agent.momoNumber}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[#747780]">{t('approvals.submitted')}</dt>
                  <dd className="font-semibold text-[#002044]">{formatDateTime(agent.submittedAt, locale)}</dd>
                </div>
                {agent.badgeId && (
                  <div className="flex gap-2">
                    <dt className="text-[#747780]">{t('approvals.badge')}</dt>
                    <dd className="font-mono font-semibold text-emerald-700">{agent.badgeId}</dd>
                  </div>
                )}
                {agent.reviewNote && (
                  <div className="flex gap-2 sm:col-span-2">
                    <dt className="text-[#747780]">{t('approvals.reviewNote')}</dt>
                    <dd className="text-[#002044]">{agent.reviewNote}</dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-wrap items-center gap-2">
                {agent.hasDocument && (
                  <button
                    onClick={() => downloadDocument(agent)}
                    className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#002044] text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('approvals.idDocument', { name: agent.documentName ?? '' })}</span>
                  </button>
                )}
              </div>

              {(reviewable || agent.status === 'certified') && (
                <div className="space-y-2 pt-2 border-t border-[#eaedff]">
                  <label htmlFor={`note-${id}`} className="block text-[11px] font-semibold text-[#43474f]">
                    {reviewable ? t('approvals.noteLabel') : t('approvals.revokeReasonLabel')}
                  </label>
                  <input
                    id={`note-${id}`}
                    value={notes[id] || ''}
                    maxLength={500}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [id]: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg bg-white text-xs text-[#131b2e] border border-[#c3c6d0]"
                  />
                  <div className="flex flex-wrap gap-2">
                    {reviewable && (
                      <button
                        onClick={() => review(agent, 'approve')}
                        disabled={busyId === id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{t('approvals.approve')}</span>
                      </button>
                    )}
                    <button
                      onClick={() => review(agent, 'reject')}
                      disabled={busyId === id}
                      className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{reviewable ? t('approvals.reject') : t('approvals.revoke')}</span>
                    </button>
                  </div>
                  {rowError[id] && (
                    <p role="alert" className="text-xs font-semibold text-rose-700">
                      {rowError[id]}
                    </p>
                  )}
                </div>
              )}

              {agent.status === 'certified' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('approvals.canRegister')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
