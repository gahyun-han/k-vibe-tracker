'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, Bot, Compass, Heart, Languages, Map, MapPin, Radar, RefreshCw, Search, Sparkles } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import { TutorialButton } from '@/components/common/TutorialButton';
import { persistPreferredLocale } from '@/lib/locale-preference';
import {
  hasSavedPlace,
  parseSavedPlaces,
  removeSavedPlace,
  SAVED_PLACES_STORAGE_KEY,
  serializeSavedPlaces,
  upsertSavedPlace,
  type SaveablePlace,
  type SavedPlace,
} from '@/lib/saved-places';
import type { NormalizedPlace } from '@/lib/tourapi';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, getUiCopy, normalizeUiLocale, type UiLocale } from '@/lib/ui-copy';

const SEOUL_CENTER = { lat: 37.5665, lng: 126.978 };
const FEED_RADIUS_M = 2_000;

const FEATURES = [
  { id: 'map', icon: Map, path: '/map' },
  { id: 'analyze', icon: Search, path: '/analyze' },
  { id: 'route', icon: Compass, path: '/persona' },
  { id: 'radar', icon: Radar, path: '/radar' },
] as const;

const TRENDING_DESTINATIONS = [
  { lat: 37.5447, lng: 127.0564 },
  { lat: 37.5701, lng: 126.9996 },
  { lat: 37.5796, lng: 126.977 },
  { lat: 37.5563, lng: 126.9236 },
  { lat: 37.51, lng: 126.9955 },
] as const;

type ApiSource = 'mock' | 'tourapi' | 'cache';
type FeedCategory = 'all' | 'culture' | 'food' | 'fun' | 'photo';

interface PlacesApiResponse {
  places: NormalizedPlace[];
  cached: boolean;
  source: ApiSource;
  cache_key: string;
}

const FEED_CATEGORIES: FeedCategory[] = ['all', 'culture', 'food', 'fun', 'photo'];

function toFeedPlace(place: NormalizedPlace, addressPending: string): SaveablePlace & { distanceM?: number } {
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
    tags: [place.category],
    distanceM: place.distance_m,
  };
}

function formatDistance(meters?: number) {
  if (!meters && meters !== 0) return '';
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const [showLogin, setShowLogin] = useState(false);
  const [feedPlaces, setFeedPlaces] = useState<(SaveablePlace & { distanceM?: number })[]>([]);
  const [feedSource, setFeedSource] = useState<ApiSource>('mock');
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [feedReloadKey, setFeedReloadKey] = useState(0);
  const [feedCategory, setFeedCategory] = useState<FeedCategory>('all');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedHydrated, setSavedHydrated] = useState(false);

  useEffect(() => {
    setSavedPlaces(parseSavedPlaces(window.localStorage.getItem(SAVED_PLACES_STORAGE_KEY)));
    setSavedHydrated(true);
  }, []);

  useEffect(() => {
    if (!savedHydrated) return;
    window.localStorage.setItem(SAVED_PLACES_STORAGE_KEY, serializeSavedPlaces(savedPlaces));
  }, [savedHydrated, savedPlaces]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      setFeedLoading(true);
      setFeedError('');

      const searchParams = new URLSearchParams({
        lat: String(SEOUL_CENTER.lat),
        lng: String(SEOUL_CENTER.lng),
        radius: String(FEED_RADIUS_M),
        category: 'all',
        locale,
      });

      try {
        const res = await fetch(`/api/places?${searchParams.toString()}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Partial<PlacesApiResponse> & { error?: string };

        if (!res.ok) {
          throw new Error(data.error ?? 'HOME_FEED_FAILED');
        }

        setFeedPlaces((data.places ?? []).map((place) => toFeedPlace(place, copy.map.addressPending)));
        setFeedSource(data.source ?? 'mock');
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setFeedError(error instanceof Error ? error.message : 'HOME_FEED_FAILED');
      } finally {
        if (!controller.signal.aborted) setFeedLoading(false);
      }
    }

    loadFeed();
    return () => controller.abort();
  }, [copy.map.addressPending, feedReloadKey, locale]);

  const filteredFeed = useMemo(() => {
    return feedPlaces.filter((place) => feedCategory === 'all' || place.category === feedCategory);
  }, [feedCategory, feedPlaces]);

  function handleStart() {
    router.push(`/${locale}/map`);
  }

  function handleLangChange(code: UiLocale) {
    persistPreferredLocale(code, window.localStorage, (value) => {
      document.cookie = value;
    });
    router.push(`/${code}`);
  }

  function openTrending(index: number, label: string) {
    const destination = TRENDING_DESTINATIONS[index] ?? TRENDING_DESTINATIONS[0];
    const searchParams = new URLSearchParams({
      lat: String(destination.lat),
      lng: String(destination.lng),
      q: label,
      source: 'home',
    });
    router.push(`/${locale}/map?${searchParams.toString()}`);
  }

  const openFeedPlace = useCallback((place: SaveablePlace) => {
    const searchParams = new URLSearchParams({
      lat: String(place.lat),
      lng: String(place.lng),
      q: place.name,
      source: 'home',
    });
    router.push(`/${locale}/map?${searchParams.toString()}`);
  }, [locale, router]);

  const toggleSavedPlace = useCallback((place: SaveablePlace) => {
    setSavedPlaces((current) =>
      hasSavedPlace(current, place)
        ? removeSavedPlace(current, place)
        : upsertSavedPlace(current, place),
    );
  }, []);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#0D0D1A] px-5 pb-28 pt-6">
      <div className="flex w-full justify-end gap-2">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            onClick={() => handleLangChange(code)}
            title={LANGUAGE_NAMES[code]}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              locale === code
                ? 'border-[#FF3A5C] bg-[#FF3A5C] font-bold text-white'
                : 'border-[#2E2E4A] text-[#8B8BA8] hover:border-[#FF3A5C] hover:text-white'
            }`}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex w-full flex-col gap-5 pt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF3A5C] to-[#7C3AED] text-white shadow-2xl shadow-[#FF3A5C]/25">
            <Sparkles size={30} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF3A5C]">{copy.landing.eyebrow}</p>
            <h1 className="mt-1 text-3xl font-black text-white">
              K-Vibe <span className="text-[#FF3A5C]">Tracker</span>
            </h1>
          </div>
        </div>

        <p className="text-base leading-7 text-[#8B8BA8]">
          {copy.landing.description}
        </p>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#FF3A5C]">{copy.homeFeed.eyebrow}</p>
              <h2 className="mt-1 text-lg font-bold text-white">{copy.homeFeed.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                {feedSource === 'tourapi' ? copy.homeFeed.sourceTourapi : feedSource === 'cache' ? copy.homeFeed.sourceCache : copy.homeFeed.sourceMock}
              </span>
              <button
                type="button"
                onClick={() => setFeedReloadKey((key) => key + 1)}
                aria-label={copy.homeFeed.refresh}
                title={copy.homeFeed.refresh}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/60 transition-colors hover:bg-white/20"
              >
                <RefreshCw size={15} className={feedLoading ? 'animate-spin text-[#FF3A5C]' : ''} />
              </button>
            </div>
          </div>

          <div className="-mx-5 overflow-x-auto px-5">
            <div className="flex gap-2">
              {FEED_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFeedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    feedCategory === category
                      ? 'bg-[#FF3A5C] text-white'
                      : 'bg-white/10 text-white/65 hover:bg-white/20'
                  }`}
                >
                  {copy.categories[category]}
                </button>
              ))}
            </div>
          </div>

          {feedError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-100">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{copy.homeFeed.error}: {feedError}</span>
            </div>
          )}

          <div className="-mx-5 overflow-x-auto px-5">
            <div className="flex gap-3">
              {feedLoading ? (
                [1, 2].map((item) => (
                  <div key={item} className="h-64 w-64 shrink-0 rounded-2xl bg-white/5 skeleton" />
                ))
              ) : filteredFeed.length > 0 ? (
                filteredFeed.slice(0, 8).map((place) => {
                  const saved = hasSavedPlace(savedPlaces, place);
                  const distance = formatDistance(place.distanceM);

                  return (
                    <article
                      key={place.id}
                      className="w-64 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E30]"
                    >
                      <div className="relative h-32 bg-white/5">
                        {place.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={place.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#FF3A5C]/15 text-[#FF3A5C]">
                            <MapPin size={28} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <button
                          type="button"
                          onClick={() => toggleSavedPlace(place)}
                          aria-label={saved ? copy.placeDetail.saved : copy.placeDetail.save}
                          className={`absolute right-3 top-3 rounded-full bg-black/45 p-2 backdrop-blur transition-colors ${
                            saved ? 'text-[#FF3A5C]' : 'text-white'
                          }`}
                        >
                          <Heart size={16} className={saved ? 'fill-current' : ''} />
                        </button>
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur">
                          {copy.categories[place.category as keyof typeof copy.categories] ?? place.category}
                        </span>
                      </div>
                      <div className="space-y-3 p-3">
                        <div>
                          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white">{place.name}</h3>
                          <p className="mt-1 line-clamp-1 text-xs text-white/40">{place.address}</p>
                          {distance && <p className="mt-1 text-xs font-semibold text-[#FF3A5C]">{distance}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => openFeedPlace(place)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/20"
                        >
                          <Map size={15} />
                          {copy.homeFeed.openMap}
                        </button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="w-full rounded-xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/45">
                  {copy.homeFeed.empty}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map(({ id, icon: Icon, path }) => (
            <button
              key={id}
              type="button"
              onClick={() => router.push(`/${locale}${path}`)}
              className="rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-3 text-left transition-colors hover:border-[#FF3A5C]/60 hover:bg-[#24243A]"
            >
              <Icon size={18} className="mb-2 text-[#FF3A5C]" />
              <p className="text-sm font-semibold text-white">{copy.nav[id]}</p>
              <p className="mt-1 text-xs leading-5 text-[#8B8BA8]">{copy.landing.features[id]}</p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#2E2E4A] bg-[#1E1E30] p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Bot size={14} className="text-purple-400" />
            {copy.landing.developmentMode}
          </p>
          <p className="text-xs leading-5 text-[#8B8BA8]">
            {copy.landing.developmentDescription}
          </p>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Languages size={14} className="text-[#FF3A5C]" />
            {copy.landing.trendingLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {copy.landing.trendingTags.map((tag, index) => (
              <button
                key={tag}
                type="button"
                onClick={() => openTrending(index, tag)}
                className="rounded-full border border-[#FF3A5C]/30 bg-[#FF3A5C]/15 px-2.5 py-1 text-xs font-medium text-[#FF3A5C]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 pt-5">
        <button
          onClick={handleStart}
          className="w-full rounded-2xl bg-[#FF3A5C] py-4 text-base font-bold text-white shadow-lg shadow-[#FF3A5C]/25 transition-colors hover:bg-[#CC2847]"
        >
          {copy.landing.start}
        </button>
        <button
          onClick={() => setShowLogin(true)}
          className="w-full rounded-2xl border border-[#2E2E4A] bg-transparent py-3.5 text-sm font-semibold text-[#8B8BA8] transition-colors hover:bg-[#1E1E30] hover:text-white"
        >
          {copy.common.signIn}
        </button>
        <p className="text-center text-xs text-[#8B8BA8]">{copy.landing.guestNotice}</p>
      </div>

      <TutorialButton />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/map`} />}
    </main>
  );
}
