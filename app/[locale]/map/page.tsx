'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, LocateFixed, MapPin, Navigation, RefreshCw, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CategoryFilter, type Category } from '@/components/map/CategoryFilter';
import { PlaceDetailModal, type Place } from '@/components/map/PlaceDetailModal';
import type { NormalizedPlace } from '@/lib/tourapi';

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
const SEARCH_RADIUS_M = 2_000;

type ApiSource = 'mock' | 'tourapi' | 'cache';

interface PlacesApiResponse {
  places: NormalizedPlace[];
  cached: boolean;
  source: ApiSource;
  cache_key: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const CROWD_DOT: Record<string, string> = {
  low: 'bg-emerald-400',
  mid: 'bg-yellow-400',
  high: 'bg-red-400',
};

const CROWD_LABEL: Record<string, string> = {
  low: 'Quiet',
  mid: 'Normal',
  high: 'Busy',
};

const CATEGORY_ICON: Record<string, string> = {
  all: 'Map',
  cafe: 'Cafe',
  photo: 'Photo',
  fun: 'Fun',
  culture: 'Culture',
  food: 'Food',
  stay: 'Stay',
};

function toCrowdLevel(value: number | null): Place['crowdLevel'] {
  if (value === null) return undefined;
  if (value < 40) return 'low';
  if (value < 70) return 'mid';
  return 'high';
}

function toPlace(place: NormalizedPlace): Place & { distanceM?: number } {
  return {
    id: place.id,
    name: place.name || place.name_en || place.name_ko,
    category: place.category,
    address: place.address ?? 'Address pending',
    lat: place.lat,
    lng: place.lng,
    imageUrl: place.image_url ?? undefined,
    crowdLevel: toCrowdLevel(place.crowd_level),
    tags: [CATEGORY_ICON[place.category] ?? place.category],
    distanceM: place.distance_m,
  };
}

function formatDistance(meters?: number) {
  if (!meters && meters !== 0) return '';
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

function pinPosition(place: Place, center: Coordinates) {
  const lngOffset = (place.lng - center.lng) * 2600;
  const latOffset = (center.lat - place.lat) * 3600;
  const x = Math.max(8, Math.min(92, 50 + lngOffset));
  const y = Math.max(10, Math.min(88, 50 + latOffset));
  return { left: `${x}%`, top: `${y}%` };
}

export default function MapPage() {
  const [categories, setCategories] = useState<Category[]>(['all']);
  const [selectedPlace, setSelectedPlace] = useState<(Place & { distanceM?: number }) | null>(null);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<Coordinates>(SEOUL_CENTER);
  const [locationLabel, setLocationLabel] = useState('Seoul fallback');
  const [places, setPlaces] = useState<(Place & { distanceM?: number })[]>([]);
  const [source, setSource] = useState<ApiSource>('mock');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setCoords(SEOUL_CENTER);
      setLocationLabel('Seoul fallback');
      setReloadKey((key) => key + 1);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLabel('Current location');
        setReloadKey((key) => key + 1);
      },
      () => {
        setCoords(SEOUL_CENTER);
        setLocationLabel('Seoul fallback');
        setReloadKey((key) => key + 1);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        lat: String(coords.lat),
        lng: String(coords.lng),
        radius: String(SEARCH_RADIUS_M),
        category: 'all',
      });

      try {
        const res = await fetch(`/api/places?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Partial<PlacesApiResponse> & { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'PLACES_REQUEST_FAILED');
        }

        setPlaces((data.places ?? []).map(toPlace));
        setSource(data.source ?? 'mock');
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'PLACES_REQUEST_FAILED');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPlaces();
    return () => controller.abort();
  }, [coords.lat, coords.lng, reloadKey]);

  const filtered = useMemo(() => {
    return places.filter((place) => {
      const matchCat =
        categories.includes('all') || categories.includes(place.category as Category);
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.tags?.some((tag) => tag.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [categories, places, search]);

  return (
    <AppLayout activeTab="map">
      <div className="flex h-full flex-col bg-[#0D0D1A]">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#101827]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,58,92,0.20),transparent_32%),radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.14),transparent_24%)]" />

          <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            <p className="text-xs font-semibold text-white">{locationLabel}</p>
            <p className="font-mono text-[10px] text-white/45">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          </div>

          <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-right backdrop-blur">
            <p className="text-xs font-semibold text-white">
              {source === 'tourapi' ? 'TourAPI' : source === 'cache' ? 'Cache' : 'Mock'}
            </p>
            <p className="text-[10px] text-white/45">{SEARCH_RADIUS_M / 1000}km radius</p>
          </div>

          {filtered.slice(0, 16).map((place) => {
            const selected = selectedPlace?.id === place.id;
            return (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg transition-all ${
                  selected
                    ? 'border-[#FF3A5C] bg-[#FF3A5C] text-white'
                    : 'border-white/20 bg-[#1A1A2E]/90 text-white/85 hover:border-[#FF3A5C]/70'
                }`}
                style={pinPosition(place, coords)}
              >
                <span className="mr-1">{CATEGORY_ICON[place.category] ?? 'Spot'}</span>
                {formatDistance(place.distanceM)}
              </button>
            );
          })}

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#101827]/70">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                <RefreshCw size={16} className="animate-spin text-[#FF3A5C]" />
                Loading nearby places
              </div>
            </div>
          )}

          <button
            onClick={requestLocation}
            className="absolute bottom-4 right-4 z-30 rounded-full bg-[#FF3A5C] p-3 text-white shadow-lg shadow-[#FF3A5C]/30 transition-colors hover:bg-[#e02e4e]"
            aria-label="Refresh current location"
          >
            <Navigation size={20} />
          </button>
        </div>

        <div className="border-t border-white/10 bg-[#0D0D1A]">
          <div className="space-y-2 px-4 pb-2 pt-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search places"
                className="w-full rounded-xl border border-white/10 bg-white/8 py-2 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#FF3A5C]/50"
              />
            </div>
            <CategoryFilter selected={categories} onChange={setCategories} />
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Places could not be loaded</p>
                <p className="mt-0.5 text-red-200/70">{error}</p>
              </div>
              <button
                onClick={() => setReloadKey((key) => key + 1)}
                className="rounded-lg bg-red-400/15 px-2 py-1 font-semibold text-red-100"
              >
                Retry
              </button>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto pb-2">
            {!loading && filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/35">No places found</div>
            ) : (
              filtered.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[10px] font-semibold text-white/70">
                    {CATEGORY_ICON[place.category] ?? 'Spot'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">{place.name}</p>
                      {place.crowdLevel && (
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${CROWD_DOT[place.crowdLevel]}`}
                        />
                      )}
                    </div>
                    <p className="truncate text-xs text-white/40">{place.address}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {place.distanceM !== undefined && (
                      <p className="text-xs font-semibold text-white/60">
                        {formatDistance(place.distanceM)}
                      </p>
                    )}
                    {place.crowdLevel && (
                      <p
                        className={`text-xs ${
                          place.crowdLevel === 'low'
                            ? 'text-emerald-400'
                            : place.crowdLevel === 'mid'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                        }`}
                      >
                        {CROWD_LABEL[place.crowdLevel]}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      </div>
    </AppLayout>
  );
}
