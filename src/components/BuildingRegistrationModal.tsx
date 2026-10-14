import React, { useState } from 'react';
import { Building, Unit, AgentKYC } from '../types';
import { X, Building2, Plus, Trash2, CheckCircle2, ShieldAlert, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';

interface BuildingRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentKYC: AgentKYC;
  onAddBuilding: (building: Building, units: Unit[]) => void;
  onEnableCertification: () => void;
}

export const BuildingRegistrationModal: React.FC<BuildingRegistrationModalProps> = ({
  isOpen,
  onClose,
  agentKYC,
  onAddBuilding,
  onEnableCertification,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

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

  const handleSubmitBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const buildingId = `bld-${Date.now().toString().slice(-4)}`;
    const totalRev = units.reduce((acc, curr) => acc + curr.rentAmountXAF, 0);

    const newBuilding: Building = {
      id: buildingId,
      name,
      cadastreNumber,
      city,
      neighborhood,
      propertyType,
      totalUnits: units.length,
      availableUnits: units.filter((u) => u.status === 'Available').length,
      monthlyRevenueXAF: totalRev,
      occupancyRate: 0,
      photoUrl,
      amenities,
      registeredBy: `${agentKYC.fullName} (Cert. #${agentKYC.badgeId || 'AG-8921'})`,
      isVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const createdUnits: Unit[] = units.map((u, idx) => ({
      id: `u-${Date.now()}-${idx}`,
      buildingId,
      unitNumber: u.unitNumber,
      type: u.type,
      rentAmountXAF: u.rentAmountXAF,
      status: u.status,
      balanceDueXAF: 0,
    }));

    onAddBuilding(newBuilding, createdUnits);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#002044]/10 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#002044] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9827] text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Register a Building &amp; Properties</h2>
              <span className="text-xs text-[#d5e3ff]">
                FindNdap Cadastral Intake Engine • Certified Broker Workspace
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

        {/* RESTRICTION CHECK: Only Certified Agents Can Register Buildings */}
        {!agentKYC.isCertified ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-[#002044] mb-2">
                Certified Agent Verification Required
              </h3>
              <p className="text-sm text-[#43474f] leading-relaxed">
                To guarantee 0% listing fraud across Cameroon and Central Africa,{' '}
                <strong className="text-[#002044]">
                  only verified and accredited real estate agents can register buildings and property units
                </strong>{' '}
                into FindNdap.
              </p>
            </div>

            <div className="p-4 bg-[#f2f3ff] rounded-2xl border border-[#eaedff] max-w-md mx-auto text-left text-xs text-[#002044] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-[#ff9827]">
                <ShieldCheck className="w-4 h-4" />
                <span>Certification Requirements:</span>
              </div>
              <p>• Valid National ID / Passport (CNI)</p>
              <p>• RCCM / Tax Identification Number (NUI)</p>
              <p>• Cadastral physical premises inspection by legal desk</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onEnableCertification();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#ff9827] hover:bg-[#8e4f00] text-white font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate / Unlock Certified Agent Status</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#002044] font-semibold text-sm rounded-xl transition-colors"
              >
                Close &amp; Fill KYC Form
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
                1. Building &amp; Title Info
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
                2. Amenities &amp; Infrastructure
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
                3. Properties &amp; Units ({units.length})
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
              {/* STEP 1: Building & Title Info */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        Building Complex Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Résidence Victoria Gardens"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        Cadastral Land Title # (Titre Foncier) *
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
                        City
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
                        Neighborhood / Quarter
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bonapriso, Akwa, Bastos"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#002044] mb-1">
                        Property Type
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as Building['propertyType'])}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#f2f3ff] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002044] border border-[#eaedff]"
                      >
                        <option value="Residential Complex">Residential Complex</option>
                        <option value="Mixed Use">Mixed Use</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Student Residence">Student Residence</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#002044] mb-1">
                      Building Photography URL
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
                        Sample 1 (Apartment Complex)
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
                        Sample 2 (Prestige Manor)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Amenities & Infrastructure */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-[#43474f]">
                    Select the utilities and verified amenities available for occupants in this building.
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
                          <span className="text-xs">{amenity}</span>
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
                      Add Property / Unit to Building
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#43474f] mb-1">
                          Unit # / Door
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Apt 201"
                          value={newUnitNumber}
                          onChange={(e) => setNewUnitNumber(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#43474f] mb-1">
                          Unit Configuration
                        </label>
                        <select
                          value={newUnitType}
                          onChange={(e) => setNewUnitType(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-white text-xs border border-[#c3c6d0]"
                        >
                          <option value="Studio Deluxe">Studio Deluxe</option>
                          <option value="1-Bedroom Modern">1-Bedroom Modern</option>
                          <option value="2-Bedroom Luxury Suite">2-Bedroom Luxury Suite</option>
                          <option value="3-Bedroom Executive">3-Bedroom Executive</option>
                          <option value="Commercial Shop">Commercial Shop</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#43474f] mb-1">
                          Rent (XAF / month)
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
                      <span>Add Unit to Inventory</span>
                    </button>
                  </div>

                  {/* Configured Units List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#002044]">
                        Configured Units ({units.length})
                      </span>
                      <span className="text-xs text-[#747780]">
                        Total Expected Rent: {units.reduce((a, c) => a + c.rentAmountXAF, 0).toLocaleString()} XAF/mo
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
                              <div className="text-[11px] text-[#747780]">{unit.type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-extrabold text-[#ff9827]">
                              {unit.rentAmountXAF.toLocaleString()} XAF/mo
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUnit(idx)}
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
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3)}
                    className="px-5 py-2.5 rounded-xl bg-[#002044] text-white text-xs font-bold hover:bg-[#0f3563]"
                  >
                    Next: {activeStep === 1 ? 'Amenities' : 'Units'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#ff9827] hover:bg-[#8e4f00] text-white text-xs font-bold shadow-md transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Building to Cadastral Database</span>
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
