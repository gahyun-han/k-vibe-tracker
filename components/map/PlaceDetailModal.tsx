'use client';

import { useEffect } from 'react';
import { Clock, ExternalLink, MapPin, Phone, Star, Tags, X } from 'lucide-react';

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
  low: { label: 'Quiet', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  mid: { label: 'Normal', color: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  high: { label: 'Busy', color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
};

const CATEGORY_LABEL: Record<string, string> = {
  all: 'Spot',
  cafe: 'Cafe',
  photo: 'Photo',
  fun: 'Fun',
  culture: 'Culture',
  food: 'Food',
  stay: 'Stay',
};

export function PlaceDetailModal({ place, onClose }: PlaceDetailModalProps) {
  useEffect(() => {
    if (place) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
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
  const categoryLabel = CATEGORY_LABEL[place.category] ?? place.category;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg">
        <div className="animate-slide-up rounded-t-2xl border border-white/10 bg-[#1A1A2E] shadow-2xl">
          <div className="flex justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>

          {place.imageUrl ? (
            <div className="relative mx-4 mt-2 h-44 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ) : (
            <div className="mx-4 mt-2 flex h-36 items-center justify-center rounded-xl bg-white/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF3A5C]/15 text-[#FF3A5C]">
                <Tags size={34} />
              </div>
            </div>
          )}

          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FF3A5C]/20 px-2 py-0.5 text-xs font-semibold text-[#FF3A5C]">
                    {categoryLabel}
                  </span>
                  {crowd && (
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${crowd.bg} ${crowd.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${crowd.dot}`} />
                      {crowd.label}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">{place.name}</h2>
                {place.rating && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">{place.rating}</span>
                    {place.reviewCount && (
                      <span className="text-xs text-white/40">({place.reviewCount.toLocaleString()})</span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close place detail"
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

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

            <div className="flex gap-2 pt-1">
              <button className="flex-1 rounded-xl bg-[#FF3A5C] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]">
                Add to Route
              </button>
              {place.tourApiUrl && (
                <a
                  href={place.tourApiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
                >
                  <ExternalLink size={14} />
                  Details
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
