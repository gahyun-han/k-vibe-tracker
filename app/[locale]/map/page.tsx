'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Navigation, RefreshCw, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CategoryFilter, getCategoryIcon, type Category } from '@/components/map/CategoryFilter';
import { KakaoMapView } from '@/components/map/KakaoMapView';
import { PlaceDetailModal, type Place } from '@/components/map/PlaceDetailModal';
import { readLastKnownLocation, writeLastKnownLocation } from '@/lib/location-cache';
import { buildLocalApiCacheKey, readLocalApiCache, writeLocalApiCache } from '@/lib/local-api-cache';
import {
  createLocalRoutePlan,
  CURRENT_ROUTE_STORAGE_KEY,
  type RoutePlan,
  type RouteStop,
} from '@/lib/routes';
import {
  hasSavedPlace,
  parseSavedPlaces,
  removeSavedPlace,
  SAVED_PLACES_STORAGE_KEY,
  serializeSavedPlaces,
  upsertSavedPlace,
  type SavedPlace,
} from '@/lib/saved-places';
import type { NormalizedPlace, PlaceCategory } from '@/lib/tourapi';
import { getDataSourceCopy, getLocationStatusCopy, getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

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

const DEFAULT_STAY_MINUTES: Record<string, number> = {
  cafe: 75,
  photo: 45,
  fun: 75,
  culture: 90,
  food: 70,
  stay: 60,
};

function toCrowdLevel(value: number | null): Place['crowdLevel'] {
  if (value === null) return undefined;
  if (value < 40) return 'low';
  if (value < 70) return 'mid';
  return 'high';
}

type CategoryLabels = Readonly<Record<PlaceCategory | 'spot', string>>;

function categoryLabelFor(category: string, labels: CategoryLabels) {
  return labels[category as PlaceCategory] ?? labels.spot ?? category;
}

function toPlace(
  place: NormalizedPlace,
  addressPending: string,
  categoryLabels: CategoryLabels,
): Place & { distanceM?: number } {
  const categoryLabel = categoryLabelFor(place.category, categoryLabels);

  return {
    id: place.id,
    contentId: place.content_id,
    contentTypeId: place.content_type,
    name: place.name || place.name_en || place.name_ko,
    category: place.category,
    address: place.address ?? addressPending,
    lat: place.lat,
    lng: place.lng,
    imageUrl: place.image_url ?? undefined,
    crowdLevel: toCrowdLevel(place.crowd_level),
    tags: [categoryLabel],
    distanceM: place.distance_m,
  };
}

function formatDistance(meters?: number) {
  if (!meters && meters !== 0) return '';
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

function toRouteStop(
  place: Place,
  categoryLabels: Readonly<Record<PlaceCategory | 'spot', string>>,
  descriptionTemplate: string,
): RouteStop {
  const category = categoryLabels[place.category as PlaceCategory] ?? place.category;

  return {
    id: `map-${place.id}`,
    name: place.name,
    category,
    address: place.address,
    crowdLevel: place.crowdLevel ?? 'mid',
    lat: place.lat,
    lng: place.lng,
    stayMinutes: DEFAULT_STAY_MINUTES[place.category] ?? 60,
    startTime: 'Flexible',
    description: descriptionTemplate.replace('{category}', category.toLowerCase()),
    tags: place.tags ?? [category],
  };
}

export default function MapPage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const locationCopy = getLocationStatusCopy(locale);
  const sourceCopy = getDataSourceCopy(locale);
  const [categories, setCategories] = useState<Category[]>(['all']);
  const [selectedPlace, setSelectedPlace] = useState<(Place & { distanceM?: number }) | null>(null);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<Coordinates>(SEOUL_CENTER);
  const [locationLabel, setLocationLabel] = useState<string>(copy.map.seoulFallback);
  const [places, setPlaces] = useState<(Place & { distanceM?: number })[]>([]);
  const [focusPlace, setFocusPlace] = useState<(Place & { distanceM?: number }) | null>(null);
  const [source, setSource] = useState<ApiSource>('mock');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedHydrated, setSavedHydrated] = useState(false);
  const initialLocationApplied = useRef(false);

  useEffect(() => {
    setSavedPlaces(parseSavedPlaces(window.localStorage.getItem(SAVED_PLACES_STORAGE_KEY)));
    setSavedHydrated(true);
  }, []);

  useEffect(() => {
    if (!savedHydrated) return;
    window.localStorage.setItem(SAVED_PLACES_STORAGE_KEY, serializeSavedPlaces(savedPlaces));
  }, [savedHydrated, savedPlaces]);

  const addPlaceToRoute = useCallback((place: Place) => {
    try {
      const stored = window.localStorage.getItem(CURRENT_ROUTE_STORAGE_KEY);
      let existingPlan: Partial<RoutePlan> | null = null;
      let existingStops: RouteStop[] = [];

      if (stored) {
        existingPlan = JSON.parse(stored) as Partial<RoutePlan>;
        if (Array.isArray(existingPlan.stops)) {
          existingStops = existingPlan.stops as RouteStop[];
        }
      }

      const routeStop = toRouteStop(place, copy.categories, copy.map.addedFromMap);
      const nextStops = [
        ...existingStops.filter((stop) => stop.id !== routeStop.id),
        routeStop,
      ];
      const title = existingPlan?.title ?? copy.map.savedRouteTitle;
      const plan = createLocalRoutePlan({
        id: existingPlan?.id ?? 'map-saved-route',
        title,
        theme: existingPlan?.theme ?? 'mood',
        detail: existingPlan?.detail ?? 'map',
        summary: existingPlan?.summary ?? copy.map.savedRouteSummary,
        stops: nextStops,
      });

      window.localStorage.setItem(CURRENT_ROUTE_STORAGE_KEY, JSON.stringify(plan));
      router.push(`/${locale}/route`);
    } catch {
      setError('ROUTE_SAVE_FAILED');
    }
  }, [copy.categories, copy.map.addedFromMap, copy.map.savedRouteSummary, copy.map.savedRouteTitle, locale, router]);

  const openPlaceDocent = useCallback((place: Place) => {
    const category = copy.categories[place.category as PlaceCategory] ?? place.category;
    const query = new URLSearchParams({
      name: place.name,
      category,
      address: place.address,
      description: place.overview ?? copy.map.addedFromMap.replace('{category}', category.toLowerCase()),
      stayMinutes: String(DEFAULT_STAY_MINUTES[place.category] ?? 60),
      startTime: 'Flexible',
      tags: (place.tags ?? [category]).join(','),
    });
    query.set('lat', String(place.lat));
    query.set('lng', String(place.lng));
    router.push(`/${locale}/docent?${query.toString()}`);
  }, [copy.categories, copy.map.addedFromMap, locale, router]);

  const toggleSavedPlace = useCallback((place: Place) => {
    setSavedPlaces((current) =>
      hasSavedPlace(current, place)
        ? removeSavedPlace(current, place)
        : upsertSavedPlace(current, {
            id: place.id,
            contentId: place.contentId,
            contentTypeId: place.contentTypeId,
            name: place.name,
            category: place.category,
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            imageUrl: place.images?.[0] ?? place.imageUrl,
            overview: place.overview,
            tags: place.tags,
          }),
    );
  }, []);

  const applyLastKnownLocation = useCallback(() => {
    const cachedLocation = readLastKnownLocation(window.localStorage);
    if (!cachedLocation) return false;

    setFocusPlace(null);
    setCoords({ lat: cachedLocation.lat, lng: cachedLocation.lng });
    setLocationLabel(locationCopy.lastKnownLocation);
    setReloadKey((key) => key + 1);
    return true;
  }, [locationCopy.lastKnownLocation]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      if (applyLastKnownLocation()) return;
      setFocusPlace(null);
      setCoords(SEOUL_CENTER);
      setLocationLabel(copy.map.seoulFallback);
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
        setFocusPlace(null);
        setCoords(nextCoords);
        setLocationLabel(copy.map.currentLocation);
        setReloadKey((key) => key + 1);
      },
      () => {
        if (applyLastKnownLocation()) return;
        setFocusPlace(null);
        setCoords(SEOUL_CENTER);
        setLocationLabel(copy.map.seoulFallback);
        setReloadKey((key) => key + 1);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );
  }, [applyLastKnownLocation, copy.map.currentLocation, copy.map.seoulFallback]);

  useEffect(() => {
    if (initialLocationApplied.current) return;
    initialLocationApplied.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const hasFocusCoords = searchParams.has('lat') && searchParams.has('lng');
    const focusLat = Number(searchParams.get('lat'));
    const focusLng = Number(searchParams.get('lng'));
    const query = searchParams.get('q')?.trim();
    const sourceParam = searchParams.get('source');
    const openDetail = searchParams.get('detail') === '1';
    const description = searchParams.get('description')?.trim();
    const category = searchParams.get('category')?.trim() || 'photo';
    const address = searchParams.get('address')?.trim();
    const tags = searchParams.get('tags')?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [];

    if (hasFocusCoords && Number.isFinite(focusLat) && Number.isFinite(focusLng)) {
      const focusName = query || copy.map.analysisResult;
      const nextLocationLabel = sourceParam === 'analyze' ? copy.map.analysisResult : focusName;
      const focusedPlace = {
        id: `analysis-${focusLat}-${focusLng}`,
        name: focusName,
        category,
        address: address || nextLocationLabel,
        lat: focusLat,
        lng: focusLng,
        overview: description || undefined,
        crowdLevel: undefined,
        tags: tags.length > 0 ? tags : sourceParam === 'analyze' ? ['SNS'] : [],
        distanceM: 0,
      } satisfies Place & { distanceM?: number };
      setCoords({ lat: focusLat, lng: focusLng });
      setLocationLabel(nextLocationLabel);
      setSearch(focusName);
      setFocusPlace(focusedPlace);
      if (openDetail) setSelectedPlace(focusedPlace);
      setReloadKey((key) => key + 1);
      return;
    }

    applyLastKnownLocation();
    requestLocation();
  }, [applyLastKnownLocation, copy.map.analysisResult, requestLocation]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces() {
      setLoading(true);
      setError('');

      const query = {
        lat: String(coords.lat),
        lng: String(coords.lng),
        radius: String(SEARCH_RADIUS_M),
        category: 'all',
        locale,
      };
      const params = new URLSearchParams(query);
      const localCacheKey = buildLocalApiCacheKey('places', query);

      const cachedData = readLocalApiCache<PlacesApiResponse>(window.localStorage, localCacheKey);
      if (cachedData?.places?.length) {
        setPlaces(cachedData.places.map((place) => toPlace(place, copy.map.addressPending, copy.categories)));
        setSource('cache');
      }

      try {
        const res = await fetch(`/api/places?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Partial<PlacesApiResponse> & { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'PLACES_REQUEST_FAILED');
        }

        const nextData: PlacesApiResponse = {
          places: data.places ?? [],
          cached: Boolean(data.cached),
          source: data.source ?? 'mock',
          cache_key: data.cache_key ?? localCacheKey,
        };
        setPlaces(nextData.places.map((place) => toPlace(place, copy.map.addressPending, copy.categories)));
        setSource(nextData.source);
        writeLocalApiCache(window.localStorage, localCacheKey, nextData);
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        if (cachedData?.places?.length) {
          setPlaces(cachedData.places.map((place) => toPlace(place, copy.map.addressPending, copy.categories)));
          setSource('cache');
          return;
        }
        setError(e instanceof Error ? e.message : 'PLACES_REQUEST_FAILED');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPlaces();
    return () => controller.abort();
  }, [coords.lat, coords.lng, copy.categories, copy.map.addressPending, locale, reloadKey]);

  const filtered = useMemo(() => {
    const candidates = focusPlace
      ? [focusPlace, ...places.filter((place) => place.id !== focusPlace.id)]
      : places;

    return candidates.filter((place) => {
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
  }, [categories, focusPlace, places, search]);

  return (
    <AppLayout activeTab="map">
      <div className="flex h-[calc(100dvh-3.5rem)] flex-col bg-[#0D0D1A]">
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#101827]">
          <KakaoMapView
            center={coords}
            places={filtered}
            selectedPlaceId={selectedPlace?.id}
            onSelectPlace={setSelectedPlace}
            formatDistance={formatDistance}
            categoryLabels={copy.categories}
          />

          <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            <p className="text-xs font-semibold text-white">{locationLabel}</p>
            <p className="font-mono text-[10px] text-white/45">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </p>
          </div>

          <div className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-right backdrop-blur">
            <p className="text-xs font-semibold text-white">
              {source === 'tourapi' ? sourceCopy.tourApi : source === 'cache' ? sourceCopy.cache : sourceCopy.mock}
            </p>
            <p className="text-[10px] text-white/45">{SEARCH_RADIUS_M / 1000}{copy.map.radiusLabel}</p>
          </div>

          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#101827]/70">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                <RefreshCw size={16} className="animate-spin text-[#FF3A5C]" />
                {copy.map.loadingNearby}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-3">
            <button
              onClick={() => router.push(`/${locale}/analyze`)}
              className="rounded-full border border-white/10 bg-black/45 p-3 text-white shadow-lg backdrop-blur transition-colors hover:border-[#FF3A5C]/40 hover:bg-[#FF3A5C]/90"
              aria-label={copy.map.openAnalyzer}
              title={copy.map.openAnalyzer}
            >
              <Search size={20} />
            </button>
            <button
              onClick={requestLocation}
              className="rounded-full bg-[#FF3A5C] p-3 text-white shadow-lg shadow-[#FF3A5C]/30 transition-colors hover:bg-[#e02e4e]"
              aria-label={copy.map.refreshLocation}
              title={copy.map.refreshLocation}
            >
              <Navigation size={20} />
            </button>
          </div>
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
                placeholder={copy.map.searchPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-white/8 py-2 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#FF3A5C]/50"
              />
            </div>
            <CategoryFilter selected={categories} onChange={setCategories} labels={copy.categories} />
          </div>

          {error && (
            <div className="mx-4 mb-2 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{copy.map.placesError}</p>
                <p className="mt-0.5 text-red-200/70">{error}</p>
              </div>
              <button
                onClick={() => setReloadKey((key) => key + 1)}
                className="rounded-lg bg-red-400/15 px-2 py-1 font-semibold text-red-100"
              >
                {copy.map.retry}
              </button>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto pb-20">
            {!loading && filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/35">{copy.map.noPlaces}</div>
            ) : (
              filtered.map((place) => {
                const CategoryIcon = getCategoryIcon(place.category);
                const categoryLabel = categoryLabelFor(place.category, copy.categories);

                return (
                  <button
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70"
                      aria-label={categoryLabel}
                      title={categoryLabel}
                    >
                      <CategoryIcon size={17} />
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
                          {copy.map.crowd[place.crowdLevel]}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <PlaceDetailModal
          place={selectedPlace}
          locale={locale}
          labels={copy.placeDetail}
          categoryLabels={copy.categories}
          isSaved={selectedPlace ? hasSavedPlace(savedPlaces, selectedPlace) : false}
          onClose={() => setSelectedPlace(null)}
          onAddToRoute={addPlaceToRoute}
          onOpenDocent={openPlaceDocent}
          onToggleSave={toggleSavedPlace}
        />
      </div>
    </AppLayout>
  );
}
