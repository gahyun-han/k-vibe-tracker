'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Radar, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { FacilityCard } from '@/components/radar/FacilityCard';
import { RadiusSlider } from '@/components/radar/RadiusSlider';
import type { Facility, FacilityFilter } from '@/lib/facilities';

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

const FILTER_TABS: { id: FacilityFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'All' },
  { id: 'restroom', label: 'Restroom', icon: 'WC' },
  { id: 'cafe_toilet', label: 'Cafe WC', icon: 'Cafe' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'Rx' },
  { id: 'convenience', label: 'Store', icon: 'CV' },
  { id: 'popup', label: 'Pop-up', icon: 'Pop' },
];

interface Coordinates {
  lat: number;
  lng: number;
}

interface FacilitiesApiResponse {
  facilities: Facility[];
  cached: boolean;
  source: 'mock';
  cache_key: string;
}

export default function RadarPage() {
  const [radius, setRadius] = useState(500);
  const [filter, setFilter] = useState<FacilityFilter>('all');
  const [coords, setCoords] = useState<Coordinates>(SEOUL_CENTER);
  const [locationLabel, setLocationLabel] = useState('Seoul fallback');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [source, setSource] = useState<'mock'>('mock');
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

    async function loadFacilities() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        lat: String(coords.lat),
        lng: String(coords.lng),
        radius: String(radius),
        type: filter,
      });

      try {
        const res = await fetch(`/api/facilities?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Partial<FacilitiesApiResponse> & { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'FACILITIES_REQUEST_FAILED');
        }

        setFacilities(data.facilities ?? []);
        setSource(data.source ?? 'mock');
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'FACILITIES_REQUEST_FAILED');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFacilities();
    return () => controller.abort();
  }, [coords.lat, coords.lng, filter, radius, reloadKey]);

  return (
    <AppLayout activeTab="radar">
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-20">
        <div className="space-y-3 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Radar size={18} className="text-[#FF3A5C]" />
                Facility Radar
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                {locationLabel} · {facilities.length} found · {source === 'mock' ? 'Mock' : source}
              </p>
            </div>
            <button
              onClick={() => setReloadKey((key) => key + 1)}
              aria-label="Refresh facilities"
              className={`rounded-xl bg-white/10 p-2 text-white/60 transition-colors hover:bg-white/20 ${
                loading ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <RadiusSlider value={radius} onChange={setRadius} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  filter === id
                    ? 'bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span className="text-[11px] font-bold">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Facilities could not be loaded</p>
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

        {loading ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
              <RefreshCw size={16} className="animate-spin text-[#FF3A5C]" />
              Scanning nearby facilities
            </div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="space-y-2 px-4 py-16 text-center">
            <p className="text-3xl text-white/30">0</p>
            <p className="text-sm text-white/40">No facilities found in this radius</p>
            <p className="text-xs text-white/30">Increase the radius or try another category.</p>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {facilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}

        <p className="mb-2 mt-6 px-4 text-center text-xs text-white/20">
          Local mock data is used during development. Live facility sources are approval-gated.
        </p>
      </div>
    </AppLayout>
  );
}
