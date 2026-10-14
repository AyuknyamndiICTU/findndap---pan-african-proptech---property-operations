import React, { useState } from 'react';
import { Building, Unit, MaintenanceTicket, FinancialRecord, BulkSmsNotice } from '../types';
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
  Sliders
} from 'lucide-react';

interface LandlordConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'overview' | 'ledger' | 'sms' | 'maintenance' | 'units';
  buildings: Building[];
  units: Unit[];
  transactions: FinancialRecord[];
  tickets: MaintenanceTicket[];
  onUpdateTicketStatus: (ticketId: string, nextStatus: MaintenanceTicket['status']) => void;
  onAddTransaction: (record: FinancialRecord) => void;
  onUpdateUnitStatus: (unitId: string, status: Unit['status'], rent?: number) => void;
}

export const LandlordConsoleModal: React.FC<LandlordConsoleModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'overview',
  buildings,
  units,
  transactions,
  tickets,
  onUpdateTicketStatus,
  onAddTransaction,
  onUpdateUnitStatus,
}) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'ledger' | 'sms' | 'maintenance' | 'units'>(defaultTab);

  // SMS Broadcaster State
  const [smsTarget, setSmsTarget] = useState('All Building Occupants (84 Tenants)');
  const [smsMessage, setSmsMessage] = useState(
    'Notice: Generator servicing scheduled tomorrow from 10:00 to 12:00. Borehole pressure will remain normal. Thank you - Building Management'
  );
  const [sentSmsNotices, setSentSmsNotices] = useState<BulkSmsNotice[]>([
    {
      id: 'sms-1',
      title: 'Water Supply Routine Sanitization',
      message: 'Notice regarding annual borehole tank cleaning on Friday.',
      target: 'Résidence Le Cristal',
      recipientCount: 16,
      sentAt: 'Yesterday, 14:20 PM'
    }
  ]);
  const [smsToast, setSmsToast] = useState(false);

  // New Payment Deposit Simulator State
  const [selectedUnitForPay, setSelectedUnitForPay] = useState(units[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState(250000);
  const [paymentMethod, setPaymentMethod] = useState<'MTN MoMo' | 'Orange Money'>('MTN MoMo');
  const [depositToast, setDepositToast] = useState(false);

  if (!isOpen) return null;

  const totalMonthlyRev = buildings.reduce((a, b) => a + b.monthlyRevenueXAF, 0);
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'Occupied').length;
  const avgOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 100;

  const handleSendBulkSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsMessage.trim()) return;

    const newNotice: BulkSmsNotice = {
      id: `sms-${Date.now()}`,
      title: smsMessage.slice(0, 32) + '...',
      message: smsMessage,
      target: smsTarget,
      recipientCount: smsTarget.includes('All') ? 84 : 16,
      sentAt: 'Just now'
    };

    setSentSmsNotices([newNotice, ...sentSmsNotices]);
    setSmsToast(true);
    setTimeout(() => setSmsToast(false), 3500);
  };

  const handleSimulateMoMoDeposit = () => {
    const targetUnit = units.find((u) => u.id === selectedUnitForPay) || units[0];
    const bld = buildings.find((b) => b.id === targetUnit?.buildingId) || buildings[0];

    const newTx: FinancialRecord = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      tenantName: targetUnit?.tenantName || 'Tenant Mobile User',
      buildingName: bld?.name || 'FindNdap Complex',
      unitNumber: targetUnit?.unitNumber || 'Apt 101',
      amountXAF: Number(paymentAmount) || 250000,
      method: paymentMethod,
      date: 'Just now',
      status: 'Completed',
      txRef: `${paymentMethod === 'MTN MoMo' ? 'MOMO' : 'OM'}-CMR-${Math.floor(100000 + Math.random() * 900000)}`
    };

    onAddTransaction(newTx);
    setDepositToast(true);
    setTimeout(() => setDepositToast(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#002044]/10 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#002044] text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9827] text-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">FindNdap Landlord Mobile Console</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  LIVE OPERATIONS
                </span>
              </div>
              <span className="text-xs text-[#d5e3ff]">
                Centralized property operations • Douala &amp; Yaoundé Metro
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            <span>Portfolio Overview</span>
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
            <span>Rent Collection &amp; Ledger ({transactions.length})</span>
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
            <span>Automated Bulk SMS</span>
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
            <span>Work-Order Hub ({tickets.filter((t) => t.status !== 'Resolved').length} Pending)</span>
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
            <span>Dynamic Unit Pricing</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Stats Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="text-xs text-[#747780] font-semibold block">Total Monthly Portfolio Revenue</span>
                  <div className="text-2xl font-extrabold text-[#002044] mt-1">
                    {totalMonthlyRev.toLocaleString()} XAF
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">↑ Reconciled via MoMo &amp; OM</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="text-xs text-[#747780] font-semibold block">Cadastral Verified Buildings</span>
                  <div className="text-2xl font-extrabold text-[#002044] mt-1">
                    {buildings.length} Properties
                  </div>
                  <span className="text-[11px] text-[#ff9827] font-bold">100% Titre Foncier Audited</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f3ff] border border-[#eaedff]">
                  <span className="text-xs text-[#747780] font-semibold block">Occupancy Rate</span>
                  <div className="text-2xl font-extrabold text-[#002044] mt-1">
                    {avgOccupancy}%
                  </div>
                  <span className="text-[11px] text-[#002044] font-bold">{occupiedUnits} of {totalUnits} Units Leased</span>
                </div>
              </div>

              {/* Digitized Buildings Grid */}
              <div>
                <h3 className="text-base font-bold text-[#002044] mb-3">
                  Digitized Real Estate Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buildings.map((bld) => (
                    <div
                      key={bld.id}
                      className="p-4 bg-white border border-[#eaedff] rounded-2xl flex gap-4 shadow-xs hover:border-[#ff9827]/40 transition-colors"
                    >
                      <img
                        src={bld.photoUrl}
                        alt={bld.name}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#002044] truncate">{bld.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            Verified TF
                          </span>
                        </div>
                        <div className="text-xs text-[#747780] mt-0.5">
                          {bld.neighborhood}, {bld.city}
                        </div>
                        <div className="text-xs font-mono text-[#0f3563] mt-1">{bld.cadastreNumber}</div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {bld.amenities.slice(0, 2).map((a) => (
                            <span
                              key={a}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#f2f3ff] text-[#002044]"
                            >
                              {a}
                            </span>
                          ))}
                          {bld.amenities.length > 2 && (
                            <span className="text-[10px] text-[#747780]">
                              +{bld.amenities.length - 2} more
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
              {/* Arrears Warning Box */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                      Arrears Alert: 1 Account Overdue
                    </h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      Alain Kouam (Apt 103, Le Cristal) owes <strong>220,000 XAF</strong>. Automated payment reminder is scheduled.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert('Instant MTN MoMo Payment Reminder SMS dispatched to Alain Kouam (+237 650 11 22 33)');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs transition-colors"
                >
                  Dispatch MoMo Reminder SMS
                </button>
              </div>

              {/* Transactions Ledger Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-[#002044]">
                    Automated Mobile Money Transactions Ledger
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Auto-reconciled
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#eaedff]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f2f3ff] text-[#43474f] font-bold border-b border-[#eaedff]">
                      <tr>
                        <th className="p-3.5">Tenant / Unit</th>
                        <th className="p-3.5">Gateway</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Receipt</th>
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
                            {tx.amountXAF.toLocaleString()} XAF
                          </td>
                          <td className="p-3.5 text-[#747780]">{tx.date}</td>
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
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => alert(`Official PDF receipt generated for Ref: ${tx.txRef}`)}
                              className="text-[#0f3563] hover:underline font-semibold flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#ff9827]" />
                              <span>PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Deposit Simulator Sandbox inside Ledger */}
              <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] space-y-3">
                <div className="text-xs font-bold text-[#002044] uppercase tracking-wider">
                  Test Live Payment Gateway Simulation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#43474f] mb-1">Select Unit</label>
                    <select
                      value={selectedUnitForPay}
                      onChange={(e) => setSelectedUnitForPay(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unitNumber} - {u.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#43474f] mb-1">Gateway</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'MTN MoMo' | 'Orange Money')}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      <option value="MTN MoMo">MTN Mobile Money</option>
                      <option value="Orange Money">Orange Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#43474f] mb-1">Amount (XAF)</label>
                    <input
                      type="number"
                      step="10000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full h-10 px-2.5 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSimulateMoMoDeposit}
                  className="px-5 py-2.5 bg-[#002044] hover:bg-[#0f3563] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#ff9827]" />
                  <span>Execute Simulated {paymentMethod} Deposit</span>
                </button>

                {depositToast && (
                  <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-medium">
                    ✓ Payment of {paymentAmount.toLocaleString()} XAF reconciled to ledger via {paymentMethod}!
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
                    Direct Telecom Bulk SMS Broadcast
                  </h3>
                  <span className="text-xs text-[#747780]">
                    Direct Gateway: MTN CMR &amp; Orange CMR
                  </span>
                </div>

                <form onSubmit={handleSendBulkSms} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#002044] mb-1">
                      Recipient Audience
                    </label>
                    <select
                      value={smsTarget}
                      onChange={(e) => setSmsTarget(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                    >
                      <option value="All Building Occupants (84 Tenants)">
                        All Building Occupants (84 Tenants)
                      </option>
                      <option value="Résidence Le Cristal Only (16 Tenants)">
                        Résidence Le Cristal Only (16 Tenants)
                      </option>
                      <option value="Les Terrasses d’Akwa (32 Tenants)">
                        Les Terrasses d’Akwa (32 Tenants)
                      </option>
                      <option value="Tenants in Arrears (Immediate Follow-Up)">
                        Tenants in Arrears (Immediate Follow-Up)
                      </option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-[#002044]">
                        Announcement Message (Bilingual SMS format)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSmsMessage(
                              'Reminder: Monthly rent is due in 5 days on 10th Sep. Please pay directly via your FindNdap mobile app with MTN MoMo or Orange Money.'
                            )
                          }
                          className="text-[10px] text-[#0f3563] bg-white px-2 py-0.5 rounded border border-[#c3c6d0]"
                        >
                          Template: Due Reminder
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSmsMessage(
                              'Alert: Standby generator maintenance tomorrow 10:00-12:00. No water interruption anticipated. - Management'
                            )
                          }
                          className="text-[10px] text-[#0f3563] bg-white px-2 py-0.5 rounded border border-[#c3c6d0]"
                        >
                          Template: Generator Service
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white text-xs text-[#131b2e] border border-[#c3c6d0] focus:ring-2 focus:ring-[#002044]"
                    />
                    <div className="flex justify-between text-[11px] text-[#747780] mt-1">
                      <span>Standard GSM characters: {smsMessage.length} / 160</span>
                      <span>Delivery rate: 99.8%</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#ff9827] hover:bg-[#8e4f00] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast SMS Announcement</span>
                  </button>

                  {smsToast && (
                    <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>SMS Announcement successfully transmitted across mobile networks!</span>
                    </div>
                  )}
                </form>
              </div>

              {/* History of Sent Notices */}
              <div>
                <h4 className="text-xs font-bold text-[#002044] uppercase tracking-wider mb-2">
                  Sent Announcements Log
                </h4>
                <div className="space-y-2">
                  {sentSmsNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="p-3 bg-white border border-[#eaedff] rounded-xl flex items-start justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#002044]">{notice.title}</div>
                        <p className="text-[11px] text-[#43474f] mt-0.5">{notice.message}</p>
                        <div className="text-[10px] text-[#747780] mt-1">
                          Audience: {notice.target} • {notice.recipientCount} Recipients
                        </div>
                      </div>
                      <span className="text-[10px] text-[#747780] whitespace-nowrap ml-4">
                        {notice.sentAt}
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
                    Centralized Work-Order &amp; Repair Triage
                  </h3>
                  <p className="text-xs text-[#747780]">
                    Track tenant tickets from submission to resolution with certified vendor quotes.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  Avg SLA: 4.2 Hours
                </span>
              </div>

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
                          {stage}
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
                                {tkt.urgency}
                              </span>
                              <span className="text-[10px] text-[#747780]">{tkt.category}</span>
                            </div>

                            <div className="text-xs font-bold text-[#002044] leading-snug">
                              {tkt.description}
                            </div>

                            <div className="text-[11px] text-[#747780]">
                              {tkt.buildingName} • {tkt.unitNumber}
                            </div>

                            {tkt.assignedVendor && (
                              <div className="text-[10px] text-[#0f3563] font-semibold bg-[#eaedff] p-1 rounded">
                                Vendor: {tkt.assignedVendor}
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
                                className="w-full py-1.5 bg-[#002044] hover:bg-[#0f3563] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                              >
                                <span>Advance to {stage === 'Logged' ? 'In-Review' : stage === 'In-Review' ? 'Dispatched' : 'Resolved'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}

                        {stageTickets.length === 0 && (
                          <div className="text-center py-6 text-xs text-[#747780] italic">
                            No tickets in this stage
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
                    Real-Time Unit Availability &amp; Pricing Management
                  </h3>
                  <p className="text-xs text-[#747780]">
                    Toggle status instantly across your mobile app and online listings.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-4 bg-white border border-[#eaedff] rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#002044]">{unit.unitNumber}</div>
                        <div className="text-xs text-[#747780]">{unit.type}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          unit.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : unit.status === 'Occupied'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {unit.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
                      <span className="text-xs text-[#747780]">Monthly Rent:</span>
                      <span className="text-sm font-extrabold text-[#ff9827]">
                        {unit.rentAmountXAF.toLocaleString()} XAF
                      </span>
                    </div>

                    {unit.tenantName && (
                      <div className="text-[11px] text-[#43474f] bg-[#f2f3ff] p-2 rounded-lg">
                        Tenant: <strong>{unit.tenantName}</strong> ({unit.tenantPhone})
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          onUpdateUnitStatus(
                            unit.id,
                            unit.status === 'Available' ? 'Occupied' : 'Available'
                          )
                        }
                        className="flex-1 py-1.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#002044] text-xs font-bold rounded-lg transition-colors"
                      >
                        Toggle {unit.status === 'Available' ? 'Occupied' : 'Available'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
