'use client';

import { useEffect } from 'react';
import { X, MapPin, Clock, Phone, ExternalLink, Star, Users } from 'lucide-react';

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  phone?: string;
  openHours?: string;
  rating?: number;
  reviewCount?: number;
  crowdLevel?: 'low' | 'mid' | 'high';
  tags?: string[];
  tourApiUrl?: string;
}

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

const CROWD_CONFIG = {
  low:  { label: '여유', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  mid:  { label: '보통', color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400'  },
  high: { label: '혼잡', color: 'text-red-400',     bg: 'bg-red-400/10',     dot: 'bg-red-400'     },
};

const CATEGORY_EMOJI: Record<string, string> = {
  cafe: '☕', photo: '📸', fun: '🎮', culture: '🏛️', food: '🍜', stay: '🏨', all: '📍',
};

export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  useEffect(() => {
    if (place) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [place]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!place) return null;

  const crowd = place.crowdLevel ? CROWD_CONFIG[place.crowdLevel] : null;
  const emoji = CATEGORY_EMOJI[place.category] ?? '📍';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
        <div className="bg-[#1A1A2E] rounded-t-2xl border border-white/10 shadow-2xl animate-slide-up">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Image */}
          {place.imageUrl ? (
            <div className="relative mx-4 mt-2 rounded-xl overflow-hidden h-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="mx-4 mt-2 rounded-xl h-36 bg-white/5 flex items-center justify-center">
              <span className="text-5xl">{emoji}</span>
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF3A5C]/20 text-[#FF3A5C] font-semibold">
                    {emoji} {place.category}
                  </span>
                  {crowd && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${crowd.bg} ${crowd.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${crowd.dot}`} />
                      {crowd.label}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{place.name}</h2>
                {place.rating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-yellow-400 font-semibold">{place.rating}</span>
                    {place.reviewCount && (
                      <span className="text-xs text-white/40">({place.reviewCount.toLocaleString()})</span>
                    )}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60">
                <X size={18} />
              </button>
            </div>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Info rows */}
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#FF3A5C]" />
                <span>{place.address}</span>
              </div>
              {place.openHours && (
                <div className="flex items-center gap-2.5 text-sm text-white/70">
                  <Clock size={14} className="shrink-0 text-[#FF3A5C]" />
                  <span>{place.openHours}</span>
                </div>
              )}
              {place.phone && (
                <div className="flex items-center gap-2.5 text-sm text-white/70">
                  <Phone size={14} className="shrink-0 text-[#FF3A5C]" />
                  <span>{place.phone}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button className="flex-1 py-2.5 rounded-xl bg-[#FF3A5C] text-white text-sm font-semibold hover:bg-[#e02e4e] transition-colors">
                루트에 추가
              </button>
              {place.tourApiUrl && (
                <a
                  href={place.tourApiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={14} />
                  더보기
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
