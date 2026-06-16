'use client';

import { useState } from 'react';
import { Accessibility, ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import type { Facility, FacilityType } from '@/lib/facilities';

export type { Facility };

const TYPE_CONFIG: Record<
  FacilityType,
  { icon: string; color: string; bg: string }
> = {
  restroom: { icon: 'WC', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  pharmacy: { icon: 'Rx', color: 'text-green-400', bg: 'bg-green-400/10' },
  cafe_toilet: {
    icon: 'Cafe',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  convenience: {
    icon: 'CV',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  popup: { icon: 'Pop', color: 'text-pink-400', bg: 'bg-pink-400/10' },
};

interface FacilityCardCopy {
  facilityTypes: Readonly<Record<FacilityType, string>>;
  closed: string;
  twentyFourHours: string;
  accessibleRestroom: string;
  viewOnMap: string;
}

interface Props {
  facility: Facility;
  copy: FacilityCardCopy;
}

export function FacilityCard({ facility: f, copy }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[f.type];
  const distLabel = f.distance >= 1000
    ? `${(f.distance / 1000).toFixed(1)}km`
    : `${f.distance}m`;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <button
        className="flex w-full items-center gap-3 p-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${cfg.bg} ${cfg.color}`}
        >
          {cfg.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
              {copy.facilityTypes[f.type]}
            </span>
            {f.is24h && (
              <span className="rounded-full bg-emerald-400/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">
                {copy.twentyFourHours}
              </span>
            )}
            {f.isOpen === false && (
              <span className="rounded-full bg-red-400/10 px-1.5 py-0.5 text-xs font-semibold text-red-400">
                {copy.closed}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">{f.name}</p>
          <p className="truncate text-xs text-white/40">{f.address}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-bold text-[#FF3A5C]">{distLabel}</span>
          {expanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-white/5 px-3.5 pb-3.5 pt-2.5">
          <div className="flex items-start gap-2 text-xs text-white/60">
            <MapPin size={12} className="mt-0.5 shrink-0 text-[#FF3A5C]" />
            <span>{f.address}</span>
          </div>
          {f.floor && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Clock size={12} className="shrink-0 text-[#FF3A5C]" />
              <span>{f.floor}</span>
            </div>
          )}
          {f.hasDisabled && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Accessibility size={12} />
              <span>{copy.accessibleRestroom}</span>
            </div>
          )}
          {f.extra && (
            <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-white/50">
              {f.extra}
            </div>
          )}
          <button className="mt-1 w-full rounded-lg bg-[#FF3A5C]/20 py-2 text-xs font-semibold text-[#FF3A5C] transition-colors hover:bg-[#FF3A5C]/30">
            {copy.viewOnMap}
          </button>
        </div>
      )}
    </div>
  );
}
