import React, { useMemo, useState, useRef, MouseEvent } from 'react';
import { Crosshair, Radio, MapPin, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { Building } from '../types';
import { useI18n } from '../i18n/LanguageContext';

interface CityCoordinates {
  name: string;
  lat: number;
  lng: number;
}

const CITY_COORDINATES: CityCoordinates[] = [
  { name: 'Douala', lat: 4.0511, lng: 9.7679 },
  { name: 'Yaoundé', lat: 3.848, lng: 11.5021 },
  { name: 'Kribi', lat: 2.9378, lng: 9.9077 },
  { name: 'Bafoussam', lat: 5.4778, lng: 10.4176 },
  { name: 'Limbe', lat: 4.0186, lng: 9.2043 },
  { name: 'Buea', lat: 4.1527, lng: 9.241 },
  { name: 'Garoua', lat: 9.3014, lng: 13.3977 },
  { name: 'Bamenda', lat: 5.9631, lng: 10.1591 },
  { name: 'Ngaoundéré', lat: 7.3167, lng: 13.5833 },
  { name: 'Bertoua', lat: 4.577, lng: 13.6846 },
  { name: 'Ebolowa', lat: 2.9, lng: 11.15 },
  { name: 'Maroua', lat: 10.5956, lng: 14.3247 },
];

const FALLBACK_CITY = CITY_COORDINATES[1];

// Cameroon bounding box used to project coordinates onto the hologram.
const BOUNDS = { minLat: 1.6, maxLat: 13.1, minLng: 8.4, maxLng: 16.2 };
const PLOT_MARGIN = 12; // percent kept free on each side of the radar area

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Resolves a free-form city string (e.g. "Douala (Littoral)") to known coordinates; unknown cities fall back to Yaoundé. */
export function getCityCoordinates(city: string | undefined): CityCoordinates & { isFallback: boolean } {
  const target = normalize(city || '');
  if (target) {
    const match =
      CITY_COORDINATES.find((c) => normalize(c.name) === target) ||
      CITY_COORDINATES.find((c) => target.startsWith(normalize(c.name))) ||
      CITY_COORDINATES.find((c) => target.includes(normalize(c.name)));
    if (match) return { ...match, isFallback: false };
  }
  return { ...FALLBACK_CITY, isFallback: true };
}

export function formatCoordinates(lat: number, lng: number): string {
  const latLabel = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngLabel = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latLabel}, ${lngLabel}`;
}

interface RadarPin {
  building: Building;
  cityLabel: string;
  coords: string;
  x: number; // percentage in radar
  y: number; // percentage in radar
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function buildPins(buildings: Building[]): RadarPin[] {
  const perCity = new Map<string, number>();
  return buildings.map((building) => {
    const city = getCityCoordinates(building.city);
    const span = 100 - PLOT_MARGIN * 2;
    const baseX = PLOT_MARGIN + ((city.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * span;
    const baseY = PLOT_MARGIN + ((BOUNDS.maxLat - city.lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * span;

    // Spread buildings that share a city on a small spiral so pins don't overlap.
    const index = perCity.get(city.name) ?? 0;
    perCity.set(city.name, index + 1);
    const radius = index === 0 ? 0 : 4 * Math.sqrt(index);
    const angle = index * 2.39996; // golden angle in radians
    const x = clamp(baseX + radius * Math.cos(angle), 4, 96);
    const y = clamp(baseY + radius * Math.sin(angle), 4, 96);

    return {
      building,
      cityLabel: city.isFallback ? building.city || city.name : city.name,
      coords: formatCoordinates(city.lat, city.lng),
      x,
      y,
    };
  });
}

interface CadastralRadarHologramProps {
  buildings: Building[];
}

export const CadastralRadarHologram: React.FC<CadastralRadarHologramProps> = ({ buildings }) => {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const pins = useMemo(() => buildPins(buildings || []), [buildings]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePin = pins.find((pin) => pin.building.id === activeId) ?? pins[0] ?? null;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -y * 18, y: x * 18 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl p-6 bg-gradient-to-b from-[#002044] via-[#001733] to-[#0a0f1d] text-white overflow-hidden shadow-2xl border border-white/15 preserve-3d transition-all duration-300 group cursor-crosshair"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 futuristic-grid-dark opacity-30 pointer-events-none" />

      {/* Holographic Radial Gradient Glow */}
      <div className="absolute inset-0 bg-radial from-[#ff9827]/15 via-transparent to-transparent pointer-events-none" />

      {/* Header telemetry */}
      <div className="relative z-20 flex items-center justify-between pb-4 border-b border-white/10 mb-4 preserve-3d">
        <div className="flex items-center gap-2.5" style={{ transform: 'translateZ(20px)' }}>
          <div className="w-8 h-8 rounded-xl bg-[#ff9827]/20 border border-[#ff9827]/50 flex items-center justify-center text-[#ff9827]">
            <Radio className="w-4 h-4 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-[#ff9827] uppercase flex items-center gap-1.5">
              <span>{t('radar.title')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[11px] text-[#a8c8fe] font-mono">
              {t('radar.subtitle')}
            </div>
          </div>
        </div>

        <div
          className="px-3 py-1 rounded-full bg-[#0f3563] border border-white/15 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm"
          style={{ transform: 'translateZ(25px)' }}
        >
          <Crosshair className="w-3 h-3 text-[#ff9827]" aria-hidden="true" />
          <span>{t(pins.length === 1 ? 'radar.sitesOne' : 'radar.sitesMany', { count: pins.length })}</span>
        </div>
      </div>

      {/* Main Radar Screen Visual */}
      <div className="relative h-64 w-full flex items-center justify-center my-2 preserve-3d">
        {/* Radar Concentric Rings */}
        <div className="absolute w-56 h-56 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-44 h-44 rounded-full border border-white/15 border-dashed flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-[#ff9827]/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff9827] shadow-[0_0_12px_#ff9827]" />
              </div>
            </div>
          </div>
        </div>

        {/* Crosshair Axes */}
        <div className="absolute w-56 h-[1px] bg-white/15" />
        <div className="absolute h-56 w-[1px] bg-white/15" />

        {/* Rotating Radar Scanner Beam */}
        <div className="absolute w-56 h-56 rounded-full overflow-hidden pointer-events-none">
          <div
            className="w-full h-full origin-center animate-radar"
            style={{
              background: 'conic-gradient(from 0deg, rgba(255, 152, 39, 0.35) 0deg, rgba(255, 152, 39, 0) 60deg, transparent 360deg)',
            }}
          />
        </div>

        {/* Interactive Cadastral Nodes on Radar (one per registered building) */}
        {pins.map((pin) => {
          const isSelected = activePin?.building.id === pin.building.id;
          const isVerified = pin.building.isVerified;
          return (
            <button
              key={pin.building.id}
              type="button"
              onClick={() => setActiveId(pin.building.id)}
              onMouseEnter={() => setActiveId(pin.building.id)}
              onFocus={() => setActiveId(pin.building.id)}
              aria-label={`${pin.building.name}, ${pin.cityLabel}`}
              aria-pressed={isSelected}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: `translate(-50%, -50%) translateZ(${isSelected ? 35 : 15}px)`,
              }}
              className={`absolute z-30 transition-all duration-300 group/node focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9827] rounded-full ${
                isSelected ? 'scale-125 z-40' : 'hover:scale-110 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Outer pulse ring */}
              <span
                aria-hidden="true"
                className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                  isSelected ? 'bg-[#ff9827]' : isVerified ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {/* Core Beacon */}
              <div
                aria-hidden="true"
                className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-[#ff9827] shadow-[0_0_15px_#ff9827]'
                    : isVerified
                    ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                    : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                }`}
              />
              {/* Node City Label floating */}
              <span
                aria-hidden="true"
                className={`absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono transition-opacity ${
                  isSelected
                    ? 'bg-[#002044] text-[#ff9827] border border-[#ff9827]/60 font-bold opacity-100 shadow-md'
                    : 'bg-black/60 text-white/80 opacity-0 group-hover/node:opacity-100'
                }`}
              >
                {pin.cityLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Telemetry Card for Selected Property */}
      <div
        className="relative z-20 mt-2 p-3.5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md preserve-3d"
        style={{ transform: 'translateZ(25px)' }}
        aria-live="polite"
      >
        {activePin ? (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#ff9827] shrink-0" aria-hidden="true" />
                  <span className="truncate">{activePin.building.name}</span>
                </div>
                <div className="text-[11px] font-mono text-[#a8c8fe] mt-0.5">
                  {[activePin.building.neighborhood, activePin.building.city].filter(Boolean).join(', ')} •{' '}
                  <span className="text-[#ff9827]">{activePin.coords}</span>
                </div>
              </div>
              {activePin.building.isVerified ? (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  {t('radar.verified')}
                </span>
              ) : (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {t('radar.pending')}
                </span>
              )}
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-[#d5e3ff] min-w-0 truncate">
                {t('radar.titreFoncier')} <span className="text-white font-bold">{activePin.building.cadastreNumber || '—'}</span>
              </span>
              <span className="text-[#ff9827] font-bold shrink-0">
                {t(activePin.building.totalUnits === 1 ? 'radar.unitsOne' : 'radar.unitsMany', {
                  count: activePin.building.totalUnits
                })}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#ff9827] shrink-0">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-white">{t('radar.emptyTitle')}</div>
              <div className="text-[11px] font-mono text-[#a8c8fe] mt-0.5">
                {t('radar.emptyBody')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
