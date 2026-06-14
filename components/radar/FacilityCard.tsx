'use client';

import { useState } from 'react';
import { MapPin, Clock, Accessibility, ChevronDown, ChevronUp } from 'lucide-react';

export interface Facility {
  id: string;
  type: 'restroom' | 'pharmacy' | 'cafe_toilet' | 'convenience' | 'popup';
  name: string;
  address: string;
  distance: number; // meters
  is24h?: boolean;
  isOpen?: boolean;
  hasDisabled?: boolean;
  floor?: string;
  lat: number;
  lng: number;
  extra?: string; // e.g. 팝업스토어 기간
}

const TYPE_CONFIG = {
  restroom:    { emoji: '🚻', label: '화장실',   color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  pharmacy:    { emoji: '💊', label: '약국',     color: 'text-green-400',  bg: 'bg-green-400/10'  },
  cafe_toilet: { emoji: '☕', label: '카페화장실', color: 'text-amber-400',  bg: 'bg-amber-400/10'  },
  convenience: { emoji: '🏪', label: '편의점',   color: 'text-purple-400', bg: 'bg-purple-400/10' },
  popup:       { emoji: '🎪', label: '팝업스토어', color: 'text-pink-400',   bg: 'bg-pink-400/10'   },
};

interface Props {
  facility: Facility;
}

export function FacilityCard({ facility: f }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[f.type];
  const distLabel = f.distance >= 1000
    ? `${(f.distance / 1000).toFixed(1)}km`
    : `${f.distance}m`;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3.5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* 아이콘 */}
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center text-xl shrink-0`}>
          {cfg.emoji}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            {f.is24h && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 font-semibold">
                24h
              </span>
            )}
            {f.isOpen === false && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-400/10 text-red-400 font-semibold">
                닫힘
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">{f.name}</p>
          <p className="text-xs text-white/40 truncate">{f.address}</p>
        </div>

        {/* 거리 + 토글 */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-[#FF3A5C]">{distLabel}</span>
          {expanded ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
        </div>
      </button>

      {/* 확장 정보 */}
      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-2 border-t border-white/5 pt-2.5">
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
              <span>장애인 시설 있음</span>
            </div>
          )}
          {f.extra && (
            <div className="text-xs text-white/50 bg-white/5 rounded-lg px-2.5 py-1.5">
              {f.extra}
            </div>
          )}
          <button className="w-full mt-1 py-2 rounded-lg bg-[#FF3A5C]/20 text-[#FF3A5C] text-xs font-semibold hover:bg-[#FF3A5C]/30 transition-colors">
            지도에서 보기
          </button>
        </div>
      )}
    </div>
  );
}
