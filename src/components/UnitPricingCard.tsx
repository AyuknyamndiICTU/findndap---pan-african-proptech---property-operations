import React, { useState } from 'react';
import { Unit } from '../types';
import { useI18n } from '../i18n/LanguageContext';

interface UnitPricingCardProps {
  unit: Unit;
  buildingName?: string;
  /** False in read-only mode (not signed in as landlord/admin). */
  canEdit?: boolean;
  /** Resolves to an error message, or null on success. */
  onUpdateUnit: (unitId: string, updates: Partial<Unit>) => Promise<string | null>;
}

const CAMEROON_MOBILE = /^6\d{8}$/;

export const UnitPricingCard: React.FC<UnitPricingCardProps> = ({ unit, buildingName, canEdit = true, onUpdateUnit }) => {
  const { t, label, locale } = useI18n();
  const [editingRent, setEditingRent] = useState(false);
  const [rentDraft, setRentDraft] = useState(String(unit.rentAmountXAF));
  const [leasing, setLeasing] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = async (updates: Partial<Unit>) => {
    setBusy(true);
    setError(null);
    const err = await onUpdateUnit(unit.id, updates);
    setBusy(false);
    if (err) setError(err);
    return !err;
  };

  const saveRent = async () => {
    const rent = Number(rentDraft);
    if (!Number.isFinite(rent) || rent <= 0) {
      setError(t('unitCard.rentInvalid'));
      return;
    }
    if (await update({ rentAmountXAF: rent })) setEditingRent(false);
  };

  const leaseUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = tenantPhone.replace(/\D/g, '').replace(/^237/, '');
    if (!tenantName.trim()) {
      setError(t('unitCard.tenantNameRequired'));
      return;
    }
    if (!CAMEROON_MOBILE.test(digits)) {
      setError(t('unitCard.phoneInvalid'));
      return;
    }
    const ok = await update({ status: 'Occupied', tenantName: tenantName.trim(), tenantPhone: `+237 ${digits}` });
    if (ok) {
      setLeasing(false);
      setTenantName('');
      setTenantPhone('');
    }
  };

  return (
    <div className="p-4 bg-white border border-[#eaedff] rounded-2xl shadow-xs space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-bold text-[#002044]">{unit.unitNumber}</div>
          <div className="text-xs text-[#747780]">
            {label('unitTypes', unit.type)}
            {buildingName ? ` • ${buildingName}` : ''}
          </div>
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
          {t(`enums.unitStatus.${unit.status}`)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#eaedff]">
        <span className="text-xs text-[#747780]">{t('unitCard.monthlyRent')}</span>
        {editingRent ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              step={5000}
              aria-label={t('unitCard.rentAria', { unit: unit.unitNumber })}
              value={rentDraft}
              onChange={(e) => setRentDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveRent()}
              className="w-28 h-8 px-2 rounded-lg bg-white text-xs border border-[#c3c6d0]"
            />
            <button
              onClick={saveRent}
              disabled={busy || !canEdit}
              className="px-2 h-8 rounded-lg bg-[#002044] text-white text-[11px] font-bold disabled:opacity-50"
            >
              {t('unitCard.save')}
            </button>
            <button
              onClick={() => {
                setEditingRent(false);
                setRentDraft(String(unit.rentAmountXAF));
                setError(null);
              }}
              className="px-2 h-8 rounded-lg text-[#43474f] text-[11px] font-semibold"
            >
              {t('unitCard.cancel')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-[#ff9827]">{unit.rentAmountXAF.toLocaleString(locale)} XAF</span>
            <button
              onClick={() => {
                setRentDraft(String(unit.rentAmountXAF));
                setEditingRent(true);
              }}
              disabled={!canEdit}
              className="text-[11px] font-semibold text-[#0f3563] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
            >
              {t('unitCard.edit')}
            </button>
          </div>
        )}
      </div>

      {unit.tenantName && (
        <div className="text-[11px] text-[#43474f] bg-[#f2f3ff] p-2 rounded-lg">
          {t('unitCard.tenant')} <strong>{unit.tenantName}</strong>
          {unit.tenantPhone ? ` (${unit.tenantPhone})` : ''}
          {(unit.balanceDueXAF || 0) > 0 && (
            <span className="block text-rose-700 font-semibold mt-0.5">
              {t('unitCard.balanceDue', { amount: unit.balanceDueXAF!.toLocaleString(locale) })}
            </span>
          )}
        </div>
      )}

      {leasing ? (
        <form onSubmit={leaseUnit} className="space-y-2">
          <input
            type="text"
            placeholder={t('unitCard.tenantNamePlaceholder')}
            aria-label={t('unitCard.tenantNamePlaceholder')}
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-white text-xs border border-[#c3c6d0]"
          />
          <input
            type="tel"
            placeholder={t('unitCard.tenantPhonePlaceholder')}
            aria-label={t('unitCard.tenantPhoneAria')}
            value={tenantPhone}
            onChange={(e) => setTenantPhone(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-white text-xs border border-[#c3c6d0]"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy || !canEdit}
              className="flex-1 py-1.5 bg-[#002044] text-white text-xs font-bold rounded-lg disabled:opacity-50"
            >
              {t('unitCard.confirmLease')}
            </button>
            <button
              type="button"
              onClick={() => {
                setLeasing(false);
                setError(null);
              }}
              className="px-3 py-1.5 text-[#43474f] text-xs font-semibold"
            >
              {t('unitCard.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2 pt-1">
          {unit.status === 'Available' ? (
            <button
              onClick={() => setLeasing(true)}
              disabled={busy || !canEdit}
              className="flex-1 py-1.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#002044] text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {t('unitCard.leaseToTenant')}
            </button>
          ) : (
            <button
              onClick={() => update({ status: 'Available' })}
              disabled={busy || !canEdit}
              className="flex-1 py-1.5 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#002044] text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {unit.status === 'Occupied' ? t('unitCard.endLease') : t('unitCard.markAvailable')}
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] font-semibold text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
};
