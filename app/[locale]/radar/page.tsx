'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Radar, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { FacilityCard } from '@/components/radar/FacilityCard';
import { getFacilityTypeUi } from '@/components/radar/facility-type-ui';
import { RadarMapPreview } from '@/components/radar/RadarMapPreview';
import { RadiusSlider } from '@/components/radar/RadiusSlider';
import { buildGoogleMapsFacilityUrl, type Facility, type FacilityFilter } from '@/lib/facilities';
import { readLastKnownLocation, writeLastKnownLocation } from '@/lib/location-cache';
import { buildLocalApiCacheKey, readLocalApiCache, writeLocalApiCache } from '@/lib/local-api-cache';
import { getDataSourceCopy, getLocationStatusCopy, getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };

const FILTER_TABS: { id: FacilityFilter }[] = [
  { id: 'all' },
  { id: 'restroom' },
  { id: 'cafe_toilet' },
  { id: 'pharmacy' },
  { id: 'convenience' },
  { id: 'popup' },
];

interface Coordinates {
  lat: number;
  lng: number;
}

interface FacilitiesApiResponse {
  facilities: Facility[];
  cached: boolean;
  source: 'mock' | 'cache';
  cache_key: string;
}

export default function RadarPage() {
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale).radar;
  const locationCopy = getLocationStatusCopy(locale);
  const sourceCopy = getDataSourceCopy(locale);
  const [radius, setRadius] = useState(500);
  const [filter, setFilter] = useState<FacilityFilter>('all');
  const [coords, setCoords] = useState<Coordinates>(SEOUL_CENTER);
  const [locationMode, setLocationMode] = useState<'seoul' | 'current' | 'cached'>('seoul');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [source, setSource] = useState<'mock' | 'cache'>('mock');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const applyLastKnownLocation = useCallback(() => {
    const cachedLocation = readLastKnownLocation(window.localStorage);
    if (!cachedLocation) return false;

    setCoords({ lat: cachedLocation.lat, lng: cachedLocation.lng });
    setLocationMode('cached');
    setReloadKey((key) => key + 1);
    return true;
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (applyLastKnownLocation()) return;
      setCoords(SEOUL_CENTER);
      setLocationMode('seoul');
      setReloadKey((key) => key + 1);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        writeLastKnownLocation(window.localStorage, {
          ...nextCoords,
          accuracyM: position.coords.accuracy,
        });
        setCoords(nextCoords);
        setLocationMode('current');
        setReloadKey((key) => key + 1);
      },
      () => {
        if (applyLastKnownLocation()) return;
        setCoords(SEOUL_CENTER);
        setLocationMode('seoul');
        setReloadKey((key) => key + 1);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );
  }, [applyLastKnownLocation]);

  useEffect(() => {
    applyLastKnownLocation();
    requestLocation();
  }, [applyLastKnownLocation, requestLocation]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFacilities() {
      setLoading(true);
      setError('');

      const query = {
        lat: String(coords.lat),
        lng: String(coords.lng),
        radius: String(radius),
        type: filter,
      };
      const params = new URLSearchParams(query);
      const localCacheKey = buildLocalApiCacheKey('facilities', query);

      const cachedData = readLocalApiCache<FacilitiesApiResponse>(window.localStorage, localCacheKey);
      if (cachedData?.facilities?.length) {
        setFacilities(cachedData.facilities);
        setSource('cache');
      }

      try {
        const res = await fetch(`/api/facilities?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Partial<FacilitiesApiResponse> & { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'FACILITIES_REQUEST_FAILED');
        }

        const nextData: FacilitiesApiResponse = {
          facilities: data.facilities ?? [],
          cached: Boolean(data.cached),
          source: data.source ?? 'mock',
          cache_key: data.cache_key ?? localCacheKey,
        };
        setFacilities(nextData.facilities);
        setSource(nextData.source);
        writeLocalApiCache(window.localStorage, localCacheKey, nextData);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        if (cachedData?.facilities?.length) {
          setFacilities(cachedData.facilities);
          setSource('cache');
          return;
        }
        setError(e instanceof Error ? e.message : 'FACILITIES_REQUEST_FAILED');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFacilities();
    return () => controller.abort();
  }, [coords.lat, coords.lng, filter, radius, reloadKey]);

  function openFacilityMap(facility: Facility) {
    window.open(buildGoogleMapsFacilityUrl(facility), '_blank', 'noopener,noreferrer');
  }

  const locationLabel =
    locationMode === 'current'
      ? copy.locationCurrent
      : locationMode === 'cached'
        ? locationCopy.lastKnownLocation
        : copy.locationSeoul;

  return (
    <AppLayout activeTab="radar">
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-20">
        <div className="space-y-3 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Radar size={18} className="text-[#FF3A5C]" />
                {copy.title}
              </h2>
              <p className="mt-0.5 text-xs text-white/40">
                {locationLabel}
                {' / '}
                {copy.found.replace('{count}', String(facilities.length))}
                {' / '}
                {source === 'mock' ? sourceCopy.mock : sourceCopy.cache}
              </p>
            </div>
            <button
              onClick={requestLocation}
              aria-label={copy.refresh}
              className={`rounded-xl bg-white/10 p-2 text-white/60 transition-colors hover:bg-white/20 ${
                loading ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="rounded-xl bg-white/5 p-3">
            <RadiusSlider value={radius} onChange={setRadius} label={copy.radius} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map(({ id }) => {
              const active = filter === id;
              const Icon = id === 'all' ? Radar : getFacilityTypeUi(id).Icon;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  aria-pressed={active}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Icon size={14} />
                  <span>{copy.filters[id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">{copy.errorTitle}</p>
              <p className="mt-0.5 text-red-200/70">{error}</p>
            </div>
            <button
              onClick={() => setReloadKey((key) => key + 1)}
              className="rounded-lg bg-red-400/15 px-2 py-1 font-semibold text-red-100"
            >
              {copy.retry}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
              <RefreshCw size={16} className="animate-spin text-[#FF3A5C]" />
              {copy.loading}
            </div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="space-y-2 px-4 py-16 text-center">
            <p className="text-3xl text-white/30">0</p>
            <p className="text-sm text-white/40">{copy.emptyTitle}</p>
            <p className="text-xs text-white/30">{copy.emptyHint}</p>
          </div>
        ) : (
          <>
            <RadarMapPreview
              center={coords}
              facilities={facilities}
              radius={radius}
              copy={copy}
              onSelectFacility={openFacilityMap}
            />
            <div className="space-y-2 px-4">
              {facilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  copy={copy}
                  onViewMap={openFacilityMap}
                />
              ))}
            </div>
          </>
        )}

        <p className="mb-2 mt-6 px-4 text-center text-xs text-white/20">
          {copy.footer}
        </p>
      </div>
    </AppLayout>
  );
}
