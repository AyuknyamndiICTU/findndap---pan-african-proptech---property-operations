import React, { useState } from 'react';
import { Building, Unit, AgentKYC, AuthUser } from '../types';
import { X, Building2, Plus, Trash2, CheckCircle2, ShieldAlert, ShieldCheck, LogIn, UploadCloud } from 'lucide-react';
import { useModalDismiss } from '../utils/useModalDismiss';
import { useI18n } from '../i18n/LanguageContext';

interface BuildingRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  agentKYC: AgentKYC | null;
  onAddBuilding: (building: Building, units: Unit[]) => Promise<string | null>;
  onSignIn: () => void;
  onGoToCertification: () => void;
}

export const BuildingRegistrationModal: React.FC<BuildingRegistrationModalProps> = ({
  isOpen,
  onClose,
  user,
  agentKYC,
  onAddBuilding,
  onSignIn,
  onGoToCertification,
}) => {
  const { t, label, locale } = useI18n();
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  useModalDismiss(isOpen, onClose);
  const isCertifiedAgent = user?.role === 'agent' && agentKYC?.status === 'certified';

  // Building State
  const [name, setName] = useState('');
  const [cadastreNumber, setCadastreNumber] = useState('TF-DLA/2025/');
  const [city, setCity] = useState('Douala');
  const [neighborhood, setNeighborhood] = useState('Bonapriso');
  const [propertyType, setPropertyType] = useState<Building['propertyType']>('Residential Complex');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([
    'Borehole (Forage)',
    'Standby Genset',
    '24/7 Security Guard',
    'Solar Inverter',
  ]);

  // Units list
  const [units, setUnits] = useState<Array<{ unitNumber: string; type: string; rentAmountXAF: number; status: Unit['status'] }>>([
    { unitNumber: 'Apt 101', type: '2-Bedroom Luxury Suite', rentAmountXAF: 280000, status: 'Available' },
    { unitNumber: 'Apt 102', type: '3-Bedroom Executive', rentAmountXAF: 400000, status: 'Available' },
  ]);

  // New Unit Form Temporary State
  const [newUnitNumber, setNewUnitNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newUnitType, setNewUnitType] = useState('2-Bedroom Modern');
  const [newUnitRent, setNewUnitRent] = useState(250000);

  if (!isOpen) return null;

  const availableAmenitiesList = [
    'Borehole (Forage)',
    'Standby Genset',
    '24/7 Security Guard',
    'Solar Inverter',
    'Fiber Optic',
    'Dedicated Parking',
    'Underground Reservoir',
    'CCTV Surveillance',
    'Electric Perimeter Fence',
  ];

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAddUnit = () => {
    if (!newUnitNumber.trim()) return;
    setUnits([
      ...units,
      {
        unitNumber: newUnitNumber,
        type: newUnitType,
        rentAmountXAF: Number(newUnitRent) || 200000,
        status: 'Available',
      },
    ]);
    setNewUnitNumber('');
  };

  const handleRemoveUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const handleSubmitBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implicit submission (Enter key) on earlier steps advances instead of publishing.
    if (activeStep < 3) {
      setActiveStep((prev) => (prev + 1) as 1 | 2 | 3);
      return;
    }
    if (!name.trim() || !cadastreNumber.trim()) {
      setFormError(t('buildingModal.requiredFields'));
      setActiveStep(1);
      return;
    }
    setFormError(null);

    // The server assigns the id, totals and "registered by" from the signed-in agent's certification.
    const newBuilding: Building = {
      id: '',
      name,
      cadastreNumber,
      city,
      neighborhood,
      propertyType,
      totalUnits: units.length,
      availableUnits: units.filter((u) => u.status === 'Available').length,
      monthlyRevenueXAF: 0,
      occupancyRate: 0,
      photoUrl,
      amenities,
      registeredBy: '',
      isVerified: true,
      createdAt: '',
    };

    const createdUnits: Unit[] = units.map((u) => ({
      id: '',
      buildingId: '',
      unitNumber: u.unitNumber,
      type: u.type,
      rentAmountXAF: u.rentAmountXAF,
      status: u.status,
      balanceDueXAF: 0,
    }));

    setSubmitting(true);
    const error = await onAddBuilding(newBuilding, createdUnits);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-modal-title"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#002044]/10 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-[#002044] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9827] text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="building-modal-title" className="text-xl font-extrabold tracking-tight">{t('buildingModal.title')}</h2>
              <span className="text-xs text-[#d5e3ff]">
                {t('buildingModal.subtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('buildingModal.close')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* RESTRICTION CHECK: Only Certified Agents Can Register Buildings */}
        {!isCertifiedAgent ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-[#002044] mb-2">
                {t('buildingModal.gateTitle')}
              </h3>
              <p className="text-sm text-[#43474f] leading-relaxed">
                {t('buildingModal.gateIntro')}{' '}
                <strong className="text-[#002044]">
                  {t('buildingModal.gateStrong')}
                </strong>
                .
              </p>
              <p className="text-sm text-[#43474f] leading-relaxed mt-2">
                {!user
                  ? t('buildingModal.gateSignIn')
                  : user.role === 'admin'
                  ? t('buildingModal.gateAdmin')
                  : agentKYC?.status === 'in-review'
                  ? t('buildingModal.gateInReview')
                  : t('buildingModal.gateApply')}
              </p>
            </div>

            <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] max-w-md mx-auto text-left text-xs text-[#002044] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#ff9827]">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>{t('buildingModal.requirements')}</span>
              </div>
              <p>{t('buildingModal.req1')}</p>
              <p>{t('buildingModal.req2')}</p>
              <p>{t('buildingModal.req3')}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {!user ? (
                <button
                  onClick={onSignIn}
                  className="w-full sm:w-auto px-6 py-3 bg-[#ff9827] hover:bg-[#8e4f00] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>{t('buildingModal.signIn')}</span>
                </button>
              ) : (
                user.role === 'agent' && (
                  <button
                    onClick={onGoToCertification}
                    className="w-full sm:w-auto px-6 py-3 bg-[#ff9827] hover:bg-[#8e4f00] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>{agentKYC?.status === 'in-review' ? t('buildingModal.viewApplication') : t('buildingModal.goToForm')}</span>
                  </button>
                )
              )}
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#002044] font-semibold text-sm rounded-xl transition-colors"
              >
                {t('buildingModal.close')}
              </button>
            </div>
          </div>
        ) : (
          /* CERTIFIED AGENT: STEPPED FORM */
          <form onSubmit={handleSubmitBuilding}>
            {/* Step indicators */}
            <div className="flex border-b border-[#eaedff] bg-[#faf8ff] text-xs font-bold text-[#43474f]">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  activeStep === 1
                    ? 'border-[#ff9827] text-[#002044] bg-white'
                    : 'border-transparent hover:bg-white/60'
                }`}
              >
                {t('buildingModal.step1')}
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  activeStep === 2
                    ? 'border-[#ff9827] text-[#002044] bg-white'
                    : 'border-transparent hover:bg-white/60'
                }`}
              >
                {t('buildingModal.step2')}
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors ${
                  activeStep === 3
                    ? 'border-[#ff9827] text-[#002044] bg-white'
                    : 'border-transparent hover:bg-white/60'
                }`}
              >
                {t('buildingModal.step3', { count: units.length })}
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
              {formError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              {/* STEP 1: Building & Title Info */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        {t('buildingModal.nameLabel')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('buildingModal.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        {t('buildingModal.titleLabel')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="TF-DLA/2025/11209"
                        value={cadastreNumber}
                        onChange={(e) => setCadastreNumber(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] font-mono text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        {t('buildingModal.city')}
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      >
                        <option value="Douala">Douala</option>
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Abidjan">Abidjan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        {t('buildingModal.neighborhood')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('buildingModal.neighborhoodPlaceholder')}
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        {t('buildingModal.propertyType')}
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as Building['propertyType'])}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      >
                        <option value="Residential Complex">{t('enums.propertyType.Residential Complex')}</option>
                        <option value="Mixed Use">{t('enums.propertyType.Mixed Use')}</option>
                        <option value="Commercial">{t('enums.propertyType.Commercial')}</option>
                        <option value="Student Residence">{t('enums.propertyType.Student Residence')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#002044] mb-1">
                      {t('buildingModal.photoUrl')}
                    </label>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoUrl(
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
                          )
                        }
                        className="text-[11px] text-[#0f3563] bg-[#eaedff] px-2 py-1 rounded"
                      >
                        {t('buildingModal.sample1')}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPhotoUrl(
                            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
                          )
                        }
                        className="text-[11px] text-[#0f3563] bg-[#eaedff] px-2 py-1 rounded"
                      >
                        {t('buildingModal.sample2')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Amenities & Infrastructure */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-[#43474f]">
                    {t('buildingModal.amenitiesIntro')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableAmenitiesList.map((amenity) => {
                      const isChecked = amenities.includes(amenity);
                      return (
                        <div
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isChecked
                              ? 'bg-[#eaedff] border-[#0f3563] text-[#002044] font-bold'
                              : 'bg-[#faf8ff] border-[#eaedff] text-[#43474f]'
                          }`}
                        >
                          <span className="text-xs">{label('amenities', amenity)}</span>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                              isChecked ? 'bg-[#002044] text-white' : 'border border-[#c3c6d0]'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Units / Properties in Building */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  {/* Add Unit Form */}
                  <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff]">
                    <div className="font-bold text-xs text-[#002044] uppercase tracking-wider mb-3">
                      {t('buildingModal.addUnitTitle')}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#43474f] mb-1">
                          {t('buildingModal.unitNumber')}
                        </label>
                        <input
                          type="text"
                          placeholder={t('buildingModal.unitNumberPlaceholder')}
                          value={newUnitNumber}
                          onChange={(e) => setNewUnitNumber(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUnit();
                            }
                          }}
                          className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#43474f] mb-1">
                          {t('buildingModal.unitConfig')}
                        </label>
                        <select
                          value={newUnitType}
                          onChange={(e) => setNewUnitType(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                        >
                          <option value="Studio Deluxe">{t('unitTypes.Studio Deluxe')}</option>
                          <option value="1-Bedroom Modern">{t('unitTypes.1-Bedroom Modern')}</option>
                          <option value="2-Bedroom Luxury Suite">{t('unitTypes.2-Bedroom Luxury Suite')}</option>
                          <option value="3-Bedroom Executive">{t('unitTypes.3-Bedroom Executive')}</option>
                          <option value="Commercial Shop">{t('unitTypes.Commercial Shop')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#43474f] mb-1">
                          {t('buildingModal.rent')}
                        </label>
                        <input
                          type="number"
                          step="10000"
                          value={newUnitRent}
                          onChange={(e) => setNewUnitRent(Number(e.target.value))}
                          className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUnit}
                      className="px-4 py-2 bg-[#002044] hover:bg-[#0f3563] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ff9827]" />
                      <span>{t('buildingModal.addUnit')}</span>
                    </button>
                  </div>

                  {/* Configured Units List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#002044]">
                        {t('buildingModal.configuredUnits', { count: units.length })}
                      </span>
                      <span className="text-xs text-[#747780]">
                        {t('buildingModal.totalRent', {
                          amount: units.reduce((a, c) => a + c.rentAmountXAF, 0).toLocaleString(locale)
                        })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {units.map((unit, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-[#eaedff] rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-[#eaedff] text-[#002044] font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-[#002044]">{unit.unitNumber}</div>
                              <div className="text-[11px] text-[#747780]">{label('unitTypes', unit.type)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-extrabold text-[#ff9827]">
                              {t('buildingModal.unitRent', { amount: unit.rentAmountXAF.toLocaleString(locale) })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUnit(idx)}
                              aria-label={t('buildingModal.removeUnit', { unit: unit.unitNumber })}
                              title={t('buildingModal.removeUnit', { unit: unit.unitNumber })}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-[#faf8ff] p-4 px-6 border-t border-[#eaedff] flex items-center justify-between">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3)}
                  className="px-4 py-2.5 rounded-xl border border-[#c3c6d0] text-xs font-bold text-[#002044] hover:bg-white"
                >
                  {t('buildingModal.back')}
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {/* Distinct keys stop React reusing one DOM node; otherwise the click on
                    "Next: Units" lands on a node that became type="submit" and publishes early. */}
                {activeStep < 3 ? (
                  <button
                    key="next-step"
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3)}
                    className="px-5 py-2.5 rounded-xl bg-[#002044] text-white text-xs font-bold hover:bg-[#0f3563]"
                  >
                    {activeStep === 1 ? t('buildingModal.nextAmenities') : t('buildingModal.nextUnits')}
                  </button>
                ) : (
                  <button
                    key="publish"
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#ff9827] hover:bg-[#8e4f00] text-white text-xs font-bold shadow-md transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t('buildingModal.publish')}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
