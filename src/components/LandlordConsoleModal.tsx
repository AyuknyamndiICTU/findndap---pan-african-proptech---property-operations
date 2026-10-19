import React, { useState, useEffect } from 'react';
import { Building, Unit, MaintenanceTicket, FinancialRecord, BulkSmsNotice, AgentKYC, DashboardStats } from '../types';
import { api, ApiError } from '../services/api';
import { listSmsAudiences } from '../utils/smsAudience';
import { formatDateTime } from '../utils/format';
import { useModalDismiss } from '../utils/useModalDismiss';
import { UnitPricingCard } from './UnitPricingCard';
import { AgentApprovalsPanel } from './AgentApprovalsPanel';
import { useI18n, type TranslationKey } from '../i18n/LanguageContext';
import {
  X,
  Smartphone,
  Wallet,
  MessageSquare,
  Wrench,
  Building2,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Sliders,
  ShieldCheck,
  Lock
} from 'lucide-react';

export type ConsoleTab = 'overview' | 'ledger' | 'sms' | 'maintenance' | 'units' | 'agents';

export interface NewTicketInput {
  unitId: string;
  category: MaintenanceTicket['category'];
  urgency: MaintenanceTicket['urgency'];
  description: string;
}

const TICKET_CATEGORIES: MaintenanceTicket['category'][] = ['Plumbing', 'Electrical', 'Generator', 'Security', 'Masonry'];
const TICKET_URGENCIES: MaintenanceTicket['urgency'][] = ['Low', 'Medium', 'High', 'Emergency'];

interface LandlordConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: ConsoleTab;
  /** True when signed in as landlord/admin; otherwise the console is read-only. */
  canEdit: boolean;
  onSignIn: () => void;
  buildings: Building[];
  units: Unit[];
  transactions: FinancialRecord[];
  tickets: MaintenanceTicket[];
  onUpdateTicketStatus: (ticketId: string, nextStatus: MaintenanceTicket['status']) => void;
  /** Each resolves to an error message, or null on success. */
  onCreateTicket: (input: NewTicketInput) => Promise<string | null>;
  onAddTransaction: (record: Partial<FinancialRecord>) => Promise<string | null>;
  onUpdateUnit: (unitId: string, updates: Partial<Unit>) => Promise<string | null>;
  onAgentReviewed: (stats: DashboardStats) => void;
  onDownloadError: (message: string) => void;
}

export const LandlordConsoleModal: React.FC<LandlordConsoleModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'overview',
  canEdit,
  onSignIn,
  buildings,
  units,
  transactions,
  tickets,
  onUpdateTicketStatus,
  onCreateTicket,
  onAddTransaction,
  onUpdateUnit,
  onAgentReviewed,
  onDownloadError,
}) => {
  const { t, label, lang, locale } = useI18n();
  const [currentTab, setCurrentTab] = useState<ConsoleTab>(defaultTab);
  useModalDismiss(isOpen, onClose);

  // New work-order form state
  const [ticketUnitId, setTicketUnitId] = useState('');
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket['category']>('Plumbing');
  const [ticketUrgency, setTicketUrgency] = useState<MaintenanceTicket['urgency']>('Medium');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketStatus, setTicketStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [ticketSaving, setTicketSaving] = useState(false);

  // SMS Broadcaster State
  const [smsTarget, setSmsTarget] = useState('all');
  // While the message is an untouched template, it follows the interface language.
  const [smsTemplate, setSmsTemplate] = useState<TranslationKey | null>('console.smsDefault');
  const [smsMessage, setSmsMessage] = useState(() => t('console.smsDefault'));
  const applySmsTemplate = (key: TranslationKey) => {
    setSmsTemplate(key);
    setSmsMessage(t(key));
  };
  useEffect(() => {
    if (smsTemplate) setSmsMessage(t(smsTemplate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  const [sentSmsNotices, setSentSmsNotices] = useState<BulkSmsNotice[]>([]);
  const [smsStatus, setSmsStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [smsSending, setSmsSending] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // New Payment Deposit Simulator State
  const [selectedUnitForPay, setSelectedUnitForPay] = useState(units[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState(250000);
  const [paymentMethod, setPaymentMethod] = useState<'MTN MoMo' | 'Orange Money'>('MTN MoMo');
  const [depositStatus, setDepositStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // The modal stays mounted while closed, so re-apply the requested tab on every open.
  useEffect(() => {
    if (isOpen) setCurrentTab(defaultTab === 'agents' && !canEdit ? 'overview' : defaultTab);
  }, [isOpen, defaultTab, canEdit]);

  useEffect(() => {
    if (!isOpen) return;
    api
      .getSmsHistory()
      .then(setSentSmsNotices)
      .catch((err) => console.warn('Could not load SMS history:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'Occupied').length;
  const avgOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const leasedRentRoll = units
    .filter((u) => u.status === 'Occupied')
    .reduce((sum, u) => sum + (u.rentAmountXAF || 0), 0);
  const collectedXAF = transactions
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + (t.amountXAF || 0), 0);
  const verifiedBuildings = buildings.filter((b) => b.isVerified).length;
  const verifiedPct = buildings.length > 0 ? Math.round((verifiedBuildings / buildings.length) * 100) : 0;
  const arrearsUnits = units.filter((u) => (u.balanceDueXAF || 0) > 0);
  const buildingNameOf = (buildingId: string) => buildings.find((b) => b.id === buildingId)?.name;
  const smsAudiences = listSmsAudiences(buildings, units);
  const audienceLabel = (idOrLabel: string, fallback: string) => {
    const key = idOrLabel.trim().toLowerCase();
    if (key === 'all' || key === 'all building tenants') return t('enums.smsAudience.all');
    if (key === 'arrears' || key === 'tenants in arrears') return t('enums.smsAudience.arrears');
    return fallback;
  };
  const num = (value: number) => value.toLocaleString(locale);

  const sendSms = async (notice: { title: string; message: string; target: string }) => {
    try {
      const res = await api.sendBulkSms(notice);
      setSentSmsNotices((prev) => [res.notice, ...prev]);
      return { kind: 'success' as const, text: res.message };
    } catch (err) {
      const text = err instanceof ApiError ? err.message : t('console.smsGatewayError');
      return { kind: 'error' as const, text };
    }
  };

  const handleSendBulkSms = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = smsMessage.trim();
    if (!message) {
      setSmsStatus({ kind: 'error', text: t('console.messageEmpty') });
      return;
    }
    setSmsSending(true);
    setSmsStatus(null);
    const title = message.length > 32 ? `${message.slice(0, 32)}…` : message;
    setSmsStatus(await sendSms({ title, message, target: smsTarget }));
    setSmsSending(false);
  };

  const handleSendArrearsReminder = async () => {
    setReminderStatus(null);
    setReminderStatus(
      await sendSms({
        title: t('console.arrearsTitle'),
        message: t('console.arrearsMessage'),
        target: 'arrears'
      })
    );
  };

  const handleSimulateMoMoDeposit = async () => {
    const targetUnit = units.find((u) => u.id === selectedUnitForPay) || units[0];
    if (!targetUnit) return;
    if (!targetUnit.tenantName) {
      setDepositStatus({ kind: 'error', text: t('console.noTenant', { unit: targetUnit.unitNumber }) });
      return;
    }
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDepositStatus({ kind: 'error', text: t('console.amountInvalid') });
      return;
    }
    setDepositStatus(null);
    const error = await onAddTransaction({ unitId: targetUnit.id, amountXAF: amount, method: paymentMethod });
    setDepositStatus(
      error
        ? { kind: 'error', text: error }
        : { kind: 'success', text: t('console.paymentRecorded', { amount: num(amount), method: paymentMethod }) }
    );
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitId = ticketUnitId || units[0]?.id;
    if (!unitId) return;
    if (!ticketDescription.trim()) {
      setTicketStatus({ kind: 'error', text: t('console.describeProblem') });
      return;
    }
    setTicketSaving(true);
    setTicketStatus(null);
    const error = await onCreateTicket({
      unitId,
      category: ticketCategory,
      urgency: ticketUrgency,
      description: ticketDescription.trim()
    });
    setTicketSaving(false);
    if (error) {
      setTicketStatus({ kind: 'error', text: error });
    } else {
      setTicketDescription('');
      setTicketStatus({ kind: 'success', text: t('console.workOrderLogged') });
    }
  };

  const handleDownloadReceipt = async (txId: string) => {
    try {
      await api.downloadReceipt(txId);
    } catch (err) {
      onDownloadError(err instanceof ApiError ? err.message : t('console.receiptFailed'));
    }
  };

  const unitLabel = (u: Unit) => {
    const b = buildingNameOf(u.buildingId);
    return `${u.unitNumber}${b ? ` – ${b}` : ''}${u.tenantName ? ` (${u.tenantName})` : ''}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="landlord-console-title"
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#002044]/10 overflow-hidden my-4 flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="bg-[#002044] text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9827] text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="landlord-console-title" className="text-xl font-bold tracking-tight">{t('console.title')}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {t('console.liveBadge')}
                </span>
              </div>
              <span className="text-xs text-[#d5e3ff]">
                {t('console.subtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('console.closeConsole')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {!canEdit && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>{t('console.readOnly')}</span>
            </div>
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 rounded-lg bg-[#002044] text-white text-xs font-bold hover:bg-[#0f3563]"
            >
              {t('console.signIn')}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-[#eaedff] bg-[#faf8ff] px-6 text-xs font-bold text-[#43474f] shrink-0">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              currentTab === 'overview'
                ? 'border-[#ff9827] text-[#002044] bg-white'
                : 'border-transparent hover:text-[#002044]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t('console.tabOverview')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('ledger')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              currentTab === 'ledger'
                ? 'border-[#ff9827] text-[#002044] bg-white'
                : 'border-transparent hover:text-[#002044]'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#ff9827]" />
            <span>{t('console.tabLedger', { count: transactions.length })}</span>
          </button>
          <button
            onClick={() => setCurrentTab('sms')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              currentTab === 'sms'
                ? 'border-[#ff9827] text-[#002044] bg-white'
                : 'border-transparent hover:text-[#002044]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#002044]" />
            <span>{t('console.tabSms')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('maintenance')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              currentTab === 'maintenance'
                ? 'border-[#ff9827] text-[#002044] bg-white'
                : 'border-transparent hover:text-[#002044]'
            }`}
          >
            <Wrench className="w-4 h-4 text-[#8e4f00]" />
            <span>{t('console.tabMaintenance', { count: tickets.filter((tk) => tk.status !== 'Resolved').length })}</span>
          </button>
          <button
            onClick={() => setCurrentTab('units')}
            className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              currentTab === 'units'
                ? 'border-[#ff9827] text-[#002044] bg-white'
                : 'border-transparent hover:text-[#002044]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t('console.tabUnits')}</span>
          </button>
          {canEdit && (
            <button
              onClick={() => setCurrentTab('agents')}
              className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                currentTab === 'agents'
                  ? 'border-[#ff9827] text-[#002044] bg-white'
                  : 'border-transparent hover:text-[#002044]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{t('console.tabAgents')}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="text-xs text-[#747780] font-semibold block">{t('console.rentRoll')}</span>
                  <div className="text-2xl font-extrabold text-[#002044] mt-1">
                    {num(leasedRentRoll)} XAF
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    {t('console.collectedVia', { amount: num(collectedXAF) })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="text-xs text-[#747780] font-semibold block">{t('console.verifiedBuildings')}</span>
                  <div className="text-2xl font-extrabold text-[#002044] mt-1">
                    {t('console.propertiesCount', { count: num(buildings.length) })}
                  </div>
                  <span className="text-[11px] text-[#ff9827] font-bold">{t('console.tfAudited', { percent: num(verifiedPct) })}</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="text-xs text-[#747780] font-semibold block">{t('console.occupancyRate')}</span>
                  <div className="text-2xl font-extrabold text-[#002044] mt-1">
                    {t('console.percent', { value: num(avgOccupancy) })}
                  </div>
                  <span className="text-[11px] text-[#002044] font-bold">
                    {t('console.unitsLeased', { occupied: num(occupiedUnits), total: num(totalUnits) })}
                  </span>
                </div>
              </div>

              {/* Digitized Buildings Grid */}
              <div>
                <h3 className="text-base font-bold text-[#002044] mb-3">
                  {t('console.assetsTitle')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buildings.map((bld) => (
                    <div
                      key={bld.id}
                      className="p-4 bg-white border border-[#eaedff] rounded-2xl flex gap-4 shadow-xs hover:border-[#ff9827]/40 transition-colors"
                    >
                      {bld.photoUrl ? (
                        <img
                          src={bld.photoUrl}
                          alt={bld.name}
                          className="w-24 h-24 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="w-24 h-24 rounded-xl bg-[#eaedff] text-[#002044] flex items-center justify-center shrink-0"
                        >
                          <Building2 className="w-8 h-8 opacity-60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#002044] truncate">{bld.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {t('console.verifiedTf')}
                          </span>
                        </div>
                        <div className="text-xs text-[#747780] mt-0.5">
                          {[bld.neighborhood, bld.city].filter(Boolean).join(', ') || '—'}
                        </div>
                        <div className="text-xs font-mono text-[#0f3563] mt-1">{bld.cadastreNumber}</div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {(bld.amenities ?? []).slice(0, 2).map((a) => (
                            <span
                              key={a}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#f2f3ff] text-[#002044]"
                            >
                              {label('amenities', a)}
                            </span>
                          ))}
                          {(bld.amenities?.length ?? 0) > 2 && (
                            <span className="text-[10px] text-[#747780]">
                              {t('console.more', { count: bld.amenities.length - 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LEDGER & MOMO COLLECTION */}
          {currentTab === 'ledger' && (
            <div className="space-y-6">
              {/* Arrears Warning Box (derived from live unit balances) */}
              {arrearsUnits.length > 0 ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                          {t(arrearsUnits.length > 1 ? 'console.arrearsAlertMany' : 'console.arrearsAlertOne', {
                            count: arrearsUnits.length
                          })}
                        </h4>
                        <ul className="text-xs text-rose-800 mt-0.5 space-y-0.5">
                          {arrearsUnits.map((u) => (
                            <li key={u.id}>
                              {u.tenantName || t('console.unassignedTenant')} ({u.unitNumber}
                              {buildingNameOf(u.buildingId) ? `, ${buildingNameOf(u.buildingId)}` : ''}) {t('console.owes')}{' '}
                              <strong>{num(u.balanceDueXAF || 0)} XAF</strong>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      onClick={handleSendArrearsReminder}
                      disabled={!canEdit}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('console.dispatchReminder')}
                    </button>
                  </div>
                  {reminderStatus && (
                    <p
                      role="status"
                      className={`text-xs font-semibold ${reminderStatus.kind === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}
                    >
                      {reminderStatus.text}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-900">
                    {t('console.noArrears')}
                  </span>
                </div>
              )}

              {/* Transactions Ledger Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#002044]">
                    {t('console.ledgerTitle')}
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('console.autoReconciled')}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#eaedff]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f2f3ff] text-[#43474f] font-bold border-b border-[#eaedff]">
                      <tr>
                        <th className="p-3.5">{t('console.colTenant')}</th>
                        <th className="p-3.5">{t('console.colGateway')}</th>
                        <th className="p-3.5">{t('console.colAmount')}</th>
                        <th className="p-3.5">{t('console.colTimestamp')}</th>
                        <th className="p-3.5">{t('console.colStatus')}</th>
                        <th className="p-3.5">{t('console.colReceipt')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eaedff]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#faf8ff] transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#002044]">{tx.tenantName}</div>
                            <div className="text-[11px] text-[#747780]">
                              {tx.buildingName} • {tx.unitNumber}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                tx.method === 'MTN MoMo'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-orange-100 text-orange-900 border border-orange-300'
                              }`}
                            >
                              {tx.method}
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-[#002044]">
                            {num(tx.amountXAF)} XAF
                          </td>
                          <td className="p-3.5 text-[#747780]">{formatDateTime(tx.date, locale)}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                tx.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'Escrow_Locked'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {label('enums.txStatus', tx.status)}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {tx.status === 'Completed' ? (
                              <button
                                onClick={() => handleDownloadReceipt(tx.id)}
                                aria-label={t('console.downloadReceipt', { ref: tx.txRef })}
                                className="text-[#0f3563] hover:underline font-semibold flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
                                <span>{t('console.pdf')}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#747780]" title={t('console.receiptPending')}>
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Record a rent payment against a unit (reconciles its balance) */}
              <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-3">
                <div className="text-xs font-bold text-[#002044] uppercase tracking-wider">
                  {t('console.recordTitle')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="pay-unit" className="block text-[11px] font-semibold text-[#43474f] mb-1">{t('console.unit')}</label>
                    <select
                      id="pay-unit"
                      value={selectedUnitForPay}
                      onChange={(e) => setSelectedUnitForPay(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {unitLabel(u)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pay-method" className="block text-[11px] font-semibold text-[#43474f] mb-1">{t('console.gateway')}</label>
                    <select
                      id="pay-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'MTN MoMo' | 'Orange Money')}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      <option value="MTN MoMo">{t('console.mtnMobileMoney')}</option>
                      <option value="Orange Money">Orange Money</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pay-amount" className="block text-[11px] font-semibold text-[#43474f] mb-1">{t('console.amountXaf')}</label>
                    <input
                      id="pay-amount"
                      type="number"
                      min={1}
                      step="10000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSimulateMoMoDeposit}
                  disabled={!canEdit || units.length === 0}
                  className="px-5 py-2.5 bg-[#002044] hover:bg-[#0f3563] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#ff9827]" aria-hidden="true" />
                  <span>{t('console.recordPayment', { method: paymentMethod })}</span>
                </button>

                {depositStatus && (
                  <div
                    role="status"
                    className={`p-2.5 rounded-lg text-xs font-medium ${
                      depositStatus.kind === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {depositStatus.text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: BULK SMS & NOTIFICATIONS */}
          {currentTab === 'sms' && (
            <div className="space-y-6">
              {/* Broadcast Composer */}
              <div className="bg-[#f2f3ff] p-5 rounded-2xl border border-[#eaedff] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#002044] uppercase tracking-wider">
                    {t('console.smsTitle')}
                  </h3>
                  <span className="text-xs text-[#747780]">
                    {t('console.smsGateway')}
                  </span>
                </div>

                <form onSubmit={handleSendBulkSms} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#002044] mb-1">
                      {t('console.audience')}
                    </label>
                    <select
                      value={smsTarget}
                      onChange={(e) => setSmsTarget(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      {smsAudiences.map((a) => (
                        <option key={a.id} value={a.id} disabled={a.recipients.length === 0}>
                          {t(a.recipients.length === 1 ? 'console.tenantsOne' : 'console.tenantsMany', {
                            label: audienceLabel(a.id, a.label),
                            count: a.recipients.length
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#002044]">
                        {t('console.messageLabel')}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => applySmsTemplate('console.templateDueText')}
                          className="text-[10px] text-[#0f3563] bg-white px-2 py-0.5 rounded border border-[#c3c6d0]"
                        >
                          {t('console.templateDue')}
                        </button>
                        <button
                          type="button"
                          onClick={() => applySmsTemplate('console.templateGeneratorText')}
                          className="text-[10px] text-[#0f3563] bg-white px-2 py-0.5 rounded border border-[#c3c6d0]"
                        >
                          {t('console.templateGenerator')}
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      aria-label={t('console.messageAria')}
                      value={smsMessage}
                      onChange={(e) => {
                        setSmsTemplate(null);
                        setSmsMessage(e.target.value);
                      }}
                      className="w-full p-3 rounded-xl bg-white text-xs text-[#131b2e] border border-[#c3c6d0] focus:ring-2 focus:ring-[#002044]"
                    />
                    <div className="flex justify-between text-[11px] text-[#747780] mt-1">
                      <span>{t('console.gsmChars', { count: smsMessage.length })}</span>
                      <span>
                        {t(Math.ceil(smsMessage.length / 160) > 1 ? 'console.segmentsMany' : 'console.segmentsOne', {
                          count: Math.max(1, Math.ceil(smsMessage.length / 160))
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={smsSending || !canEdit}
                    className="px-6 py-2.5 bg-[#ff9827] hover:bg-[#8e4f00] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{smsSending ? t('console.sending') : t('console.broadcast')}</span>
                  </button>

                  {smsStatus && (
                    <div
                      role="status"
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                        smsStatus.kind === 'success' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {smsStatus.kind === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{smsStatus.text}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* History of Sent Notices */}
              <div>
                <h4 className="text-xs font-bold text-[#002044] uppercase tracking-wider mb-2">
                  {t('console.sentLog')}
                </h4>
                <div className="space-y-2">
                  {sentSmsNotices.length === 0 && (
                    <p className="text-[11px] text-[#747780]">{t('console.noneSent')}</p>
                  )}
                  {sentSmsNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-3 bg-white border border-[#eaedff] rounded-xl flex items-start justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#002044]">{notice.title}</div>
                        <p className="text-[11px] text-[#43474f] mt-0.5">{notice.message}</p>
                        <div className="text-[10px] text-[#747780] mt-1">
                          {t('console.audienceLine', {
                            target: audienceLabel(notice.target, notice.target),
                            count: num(notice.recipientCount)
                          })}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#747780] whitespace-nowrap ml-4">
                        {formatDateTime(notice.sentAt, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MAINTENANCE WORK-ORDER HUB */}
          {currentTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002044]">
                    {t('console.maintenanceTitle')}
                  </h3>
                  <p className="text-xs text-[#747780]">
                    {t('console.maintenanceIntro')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  {t('console.open', { count: tickets.filter((tk) => tk.status !== 'Resolved').length })}
                </span>
              </div>

              {/* New work-order */}
              <form onSubmit={handleCreateTicket} className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-3">
                <div className="text-xs font-bold text-[#002044] uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('console.logTitle')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="ticket-unit" className="block text-[11px] font-semibold text-[#43474f] mb-1">{t('console.unit')}</label>
                    <select
                      id="ticket-unit"
                      value={ticketUnitId || units[0]?.id || ''}
                      onChange={(e) => setTicketUnitId(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {unitLabel(u)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ticket-category" className="block text-[11px] font-semibold text-[#43474f] mb-1">{t('console.category')}</label>
                    <select
                      id="ticket-category"
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as MaintenanceTicket['category'])}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      {TICKET_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {t(`enums.ticketCategory.${c}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ticket-urgency" className="block text-[11px] font-semibold text-[#43474f] mb-1">{t('console.urgency')}</label>
                    <select
                      id="ticket-urgency"
                      value={ticketUrgency}
                      onChange={(e) => setTicketUrgency(e.target.value as MaintenanceTicket['urgency'])}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      {TICKET_URGENCIES.map((u) => (
                        <option key={u} value={u}>
                          {t(`enums.urgency.${u}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="ticket-description" className="block text-[11px] font-semibold text-[#43474f] mb-1">
                    {t('console.problem')}
                  </label>
                  <textarea
                    id="ticket-description"
                    rows={2}
                    maxLength={500}
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white text-xs text-[#131b2e] border border-[#c3c6d0]"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={!canEdit || ticketSaving || units.length === 0}
                    className="px-5 py-2 bg-[#002044] hover:bg-[#0f3563] text-white text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ticketSaving ? t('console.saving') : t('console.logWorkOrder')}
                  </button>
                  {ticketStatus && (
                    <span
                      role="status"
                      className={`text-xs font-semibold ${ticketStatus.kind === 'success' ? 'text-emerald-800' : 'text-rose-700'}`}
                    >
                      {ticketStatus.text}
                    </span>
                  )}
                </div>
              </form>

              {/* 4-Stage Kanban Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['Logged', 'In-Review', 'Dispatched', 'Resolved'] as const).map((stage) => {
                  const stageTickets = tickets.filter((t) => t.status === stage);
                  return (
                    <div
                      key={stage}
                      className="bg-[#f2f3ff] p-3.5 rounded-2xl border border-[#eaedff] flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eaedff]">
                        <span className="text-xs font-bold text-[#002044] uppercase tracking-wider">
                          {t(`enums.ticketStatus.${stage}`)}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-white text-[#002044] text-xs font-bold flex items-center justify-center shadow-xs">
                          {stageTickets.length}
                        </span>
                      </div>

                      <div className="space-y-3 flex-1">
                        {stageTickets.map((tkt) => (
                          <div
                            key={tkt.id}
                            className="p-3 bg-white rounded-xl border border-[#eaedff] shadow-xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  tkt.urgency === 'High' || tkt.urgency === 'Emergency'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {label('enums.urgency', tkt.urgency)}
                              </span>
                              <span className="text-[10px] text-[#747780]">{label('enums.ticketCategory', tkt.category)}</span>
                            </div>

                            <div className="text-xs font-bold text-[#002044] leading-snug">
                              {tkt.description}
                            </div>

                            <div className="text-[11px] text-[#747780]">
                              {tkt.buildingName} • {tkt.unitNumber}
                            </div>
                            <div className="text-[10px] text-[#747780]">{formatDateTime(tkt.reportedDate, locale)}</div>

                            {tkt.assignedVendor && (
                              <div className="text-[10px] text-[#0f3563] font-semibold bg-[#eaedff] p-1 rounded">
                                {t('console.vendor', { vendor: tkt.assignedVendor })}
                              </div>
                            )}

                            {/* Advance Stage Button */}
                            {stage !== 'Resolved' && (
                              <button
                                onClick={() => {
                                  const nextStages: Record<MaintenanceTicket['status'], MaintenanceTicket['status']> = {
                                    Logged: 'In-Review',
                                    'In-Review': 'Dispatched',
                                    Dispatched: 'Resolved',
                                    Resolved: 'Resolved'
                                  };
                                  onUpdateTicketStatus(tkt.id, nextStages[stage]);
                                }}
                                disabled={!canEdit}
                                className="w-full py-1.5 bg-[#002044] hover:bg-[#0f3563] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span>
                                  {t('console.advanceTo', {
                                    stage: t(
                                      `enums.ticketStatus.${
                                        stage === 'Logged' ? 'In-Review' : stage === 'In-Review' ? 'Dispatched' : 'Resolved'
                                      }`
                                    )
                                  })}
                                </span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}

                        {stageTickets.length === 0 && (
                          <div className="text-center py-6 text-xs text-[#747780] italic">
                            {t('console.noTickets')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: UNITS & DYNAMIC PRICING */}
          {currentTab === 'units' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#002044]">
                    {t('console.unitsTitle')}
                  </h3>
                  <p className="text-xs text-[#747780]">
                    {t('console.unitsIntro')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit) => (
                  <UnitPricingCard
                    key={unit.id}
                    unit={unit}
                    buildingName={buildingNameOf(unit.buildingId)}
                    canEdit={canEdit}
                    onUpdateUnit={onUpdateUnit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB: AGENT APPROVALS (admin only) */}
          {currentTab === 'agents' && canEdit && (
            <AgentApprovalsPanel onReviewed={onAgentReviewed} onError={onDownloadError} />
          )}
        </div>
      </div>
    </div>
  );
};
