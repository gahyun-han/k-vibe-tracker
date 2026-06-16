'use client';

import { Crosshair, LocateFixed } from 'lucide-react';
import type { Facility, FacilityType } from '@/lib/facilities';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RadarMapPreviewCopy {
  mapTitle: string;
  mapSubtitle: string;
  currentPosition: string;
  openFacilityMap: string;
  facilityTypes: Readonly<Record<FacilityType, string>>;
}

interface RadarMapPreviewProps {
  center: Coordinates;
  facilities: Facility[];
  radius: number;
  copy: RadarMapPreviewCopy;
  onSelectFacility: (facility: Facility) => void;
}

const TYPE_PIN: Record<FacilityType, { label: string; className: string }> = {
  restroom: { label: 'WC', className: 'bg-blue-400 text-[#0D0D1A]' },
  pharmacy: { label: 'Rx', className: 'bg-emerald-400 text-[#0D0D1A]' },
  cafe_toilet: { label: 'Cafe', className: 'bg-amber-400 text-[#0D0D1A]' },
  convenience: { label: 'CV', className: 'bg-violet-400 text-white' },
  popup: { label: 'Pop', className: 'bg-pink-400 text-white' },
};

function toPreviewPoint(center: Coordinates, facility: Facility, radius: number) {
  const metersPerLat = 111_320;
  const metersPerLng = 111_320 * Math.cos((center.lat * Math.PI) / 180);
  const xMeters = (facility.lng - center.lng) * metersPerLng;
  const yMeters = (center.lat - facility.lat) * metersPerLat;
  const scale = Math.max(radius, 1);
  const x = 50 + (xMeters / scale) * 42;
  const y = 50 + (yMeters / scale) * 42;

  return {
    x: Math.max(8, Math.min(92, x)),
    y: Math.max(8, Math.min(92, y)),
  };
}

export function RadarMapPreview({
  center,
  facilities,
  radius,
  copy,
  onSelectFacility,
}: RadarMapPreviewProps) {
  const previewFacilities = facilities.slice(0, 12);

  return (
    <section className="mx-4 mb-3 rounded-xl border border-white/10 bg-white/5 p-3" aria-label={copy.mapTitle}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">{copy.mapTitle}</h3>
          <p className="mt-0.5 text-xs text-white/40">{copy.mapSubtitle.replace('{radius}', String(radius))}</p>
        </div>
        <Crosshair size={18} className="shrink-0 text-[#FF3A5C]" />
      </div>

      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#101827]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="absolute inset-[14%] rounded-full border border-[#FF3A5C]/25" />
        <div className="absolute inset-[26%] rounded-full border border-white/10" />
        <div className="absolute inset-[38%] rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white/10" />

        <div className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/25">
          <LocateFixed size={18} aria-label={copy.currentPosition} />
        </div>

        {previewFacilities.map((facility) => {
          const point = toPreviewPoint(center, facility, radius);
          const pin = TYPE_PIN[facility.type];
          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => onSelectFacility(facility)}
              aria-label={copy.openFacilityMap.replace('{name}', facility.name)}
              title={`${copy.facilityTypes[facility.type]} · ${facility.distance}m`}
              className={`absolute z-20 flex h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-1.5 text-[10px] font-black shadow-lg shadow-black/30 transition-transform hover:scale-105 ${pin.className}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              {pin.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
