'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bot,
  Camera,
  Compass,
  Heart,
  Languages,
  Map,
  MapPin,
  Music2,
  Radar,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Trees,
  Utensils,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import LoginModal from '@/components/auth/LoginModal';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { useToast } from '@/components/common/Toast';
import { TutorialButton } from '@/components/common/TutorialButton';
import { useViewMode } from '@/components/common/useViewMode';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';
import { fetchPlaces, type PlacesApiResponse } from '@/frontend/api/places';
import { buildLocalApiCacheKey, readLocalApiCache, writeLocalApiCache } from '@/lib/cache';
import {
  CROWD_DOT_CLASS,
  CROWD_TEXT_CLASS,
  isCrowdLevel,
  type CrowdLevel,
  type NormalizedPlace,
} from '@/lib/domain';
import {
  hasSavedPlace,
  parseSavedPlaces,
  removeSavedPlace,
  SAVED_PLACES_STORAGE_KEY,
  serializeSavedPlaces,
  upsertSavedPlace,
  type SaveablePlace,
  type SavedPlace,
} from '@/lib/features';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, getUiCopy, normalizeUiLocale, type UiLocale } from '@/lib/i18n';
import {
  getPersonaFeedCategory,
  parsePersonaPreference,
  PERSONA_PREFERENCE_STORAGE_KEY,
  persistPreferredLocale,
  type PersonaPreference,
} from '@/lib/ui-state';

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

type ApiSource = PlacesApiResponse['source'];

type FeedCategory = 'all' | 'culture' | 'food' | 'fun' | 'photo';
type StoryTopic = 'kpop' | 'streetFood' | 'photoSpots' | 'nature' | 'shopping';
type FeedPlace = SaveablePlace & { distanceM?: number; crowdLevel?: CrowdLevel };

const FEED_CATEGORIES: FeedCategory[] = ['all', 'culture', 'food', 'fun', 'photo'];
const STORY_TOPICS: Array<{ id: StoryTopic; icon: typeof Music2; category: FeedCategory }> = [
  { id: 'kpop', icon: Music2, category: 'fun' },
  { id: 'streetFood', icon: Utensils, category: 'food' },
  { id: 'photoSpots', icon: Camera, category: 'photo' },
  { id: 'nature', icon: Trees, category: 'culture' },
  { id: 'shopping', icon: ShoppingBag, category: 'fun' },
];

function getStoryTopicForFeedCategory(category: FeedCategory): StoryTopic | null {
  return STORY_TOPICS.find((topic) => topic.category === category)?.id ?? null;
}

function toFeedPlace(place: NormalizedPlace, addressPending: string): FeedPlace {
  return {
    id: place.id,
    contentId: place.content_id,
    contentTypeId: place.content_type,
    name: place.name || place.name_en || place.name_ko,
    category: place.category,
    address: place.address ?? addressPending,
    lat: place.lat,
    lng: place.lng,
    ...(place.image_url && { imageUrl: place.image_url }),
    tags: [place.category],
    ...(place.distance_m !== undefined && { distanceM: place.distance_m }),
    ...(isCrowdLevel(place.crowd_level) && { crowdLevel: place.crowd_level }),
  };
}

function formatDistance(meters?: number) {
  if (!meters && meters !== 0) return '';
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
}

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const copy = getUiCopy(locale);
  const { toast } = useToast();
  const { viewMode, setViewMode } = useViewMode();
  const isDesktopMode = viewMode === 'desktop';
  const [showLogin, setShowLogin] = useState(false);
  const [feedPlaces, setFeedPlaces] = useState<FeedPlace[]>([]);
  const [feedSource, setFeedSource] = useState<ApiSource>('mock');
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [feedErrorIsCacheFallback, setFeedErrorIsCacheFallback] = useState(false);
  const [feedReloadKey, setFeedReloadKey] = useState(0);
  const [feedCategory, setFeedCategory] = useState<FeedCategory>('all');
  const [selectedStory, setSelectedStory] = useState<StoryTopic | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [savedHydrated, setSavedHydrated] = useState(false);
  const [personaPreference, setPersonaPreference] = useState<PersonaPreference | null>(null);

  useEffect(() => {
    setSavedPlaces(parseSavedPlaces(window.localStorage.getItem(SAVED_PLACES_STORAGE_KEY)));
    const preference = parsePersonaPreference(window.localStorage.getItem(PERSONA_PREFERENCE_STORAGE_KEY));
    if (preference) {
      const category = getPersonaFeedCategory(preference);
      setPersonaPreference(preference);
      setFeedCategory(category);
      setSelectedStory(getStoryTopicForFeedCategory(category));
    }
    setSavedHydrated(true);
  }, []);

  useEffect(() => {
    if (!savedHydrated) return;
    window.localStorage.setItem(SAVED_PLACES_STORAGE_KEY, serializeSavedPlaces(savedPlaces));
  }, [savedHydrated, savedPlaces]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      setFeedError('');
      setFeedErrorIsCacheFallback(false);

      const query = {
        lat: String(SEOUL_CENTER.lat),
        lng: String(SEOUL_CENTER.lng),
        radius: String(FEED_RADIUS_M),
        category: 'all',
        locale,
      };
      const searchParams = new URLSearchParams(query);
      const localCacheKey = buildLocalApiCacheKey('home-feed', query);
      const cachedData = readLocalApiCache<PlacesApiResponse>(window.localStorage, localCacheKey);

      if (cachedData) {
        setFeedPlaces(cachedData.places.map((place) => toFeedPlace(place, copy.map.addressPending)));
        setFeedSource('cache');
        setFeedLoading(false);
      } else {
        setFeedLoading(true);
      }

      try {
        const data = await fetchPlaces(searchParams, controller.signal);
        const nextData: PlacesApiResponse = {
          places: data.places ?? [],
          cached: Boolean(data.cached),
          source: data.source ?? 'mock',
          cache_key: data.cache_key ?? localCacheKey,
        };
        setFeedPlaces(nextData.places.map((place) => toFeedPlace(place, copy.map.addressPending)));
        setFeedSource(nextData.source);
        writeLocalApiCache(window.localStorage, localCacheKey, nextData);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        if (cachedData) {
          setFeedPlaces(cachedData.places.map((place) => toFeedPlace(place, copy.map.addressPending)));
          setFeedSource('cache');
          setFeedError(copy.homeFeed.cachedFallback);
          setFeedErrorIsCacheFallback(true);
          return;
        }
        setFeedError(error instanceof Error ? error.message : 'HOME_FEED_FAILED');
        setFeedErrorIsCacheFallback(false);
      } finally {
        if (!controller.signal.aborted) setFeedLoading(false);
      }
    }

    loadFeed();
    return () => controller.abort();
  }, [copy.homeFeed.cachedFallback, copy.map.addressPending, feedReloadKey, locale]);

  const filteredFeed = useMemo(() => {
    return feedPlaces.filter((place) => feedCategory === 'all' || place.category === feedCategory);
  }, [feedCategory, feedPlaces]);
  const personaLabel = useMemo(() => {
    if (!personaPreference) return '';
    const themeCopy = copy.persona.themes[personaPreference.theme];
    const detailCopy = (themeCopy.details as Record<string, { label: string }>)[personaPreference.detail];
    return detailCopy?.label ?? themeCopy.label;
  }, [copy.persona, personaPreference]);

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

  const openFeedPlace = useCallback((place: FeedPlace) => {
    const searchParams = new URLSearchParams({
      lat: String(place.lat),
      lng: String(place.lng),
      q: place.name,
      source: 'home',
      detail: '1',
      category: place.category,
      address: place.address,
    });
    if (place.contentId) searchParams.set('contentId', place.contentId);
    if (place.contentTypeId) searchParams.set('contentTypeId', String(place.contentTypeId));
    if (place.imageUrl) searchParams.set('imageUrl', place.imageUrl);
    if (place.overview) searchParams.set('description', place.overview);
    if (place.tags?.length) searchParams.set('tags', place.tags.join(','));
    if (place.crowdLevel) searchParams.set('crowdLevel', place.crowdLevel);
    router.push(`/${locale}/map?${searchParams.toString()}`);
  }, [locale, router]);

  const toggleSavedPlace = useCallback((place: SaveablePlace) => {
    const isSaved = hasSavedPlace(savedPlaces, place);
    setSavedPlaces((current) =>
      isSaved ? removeSavedPlace(current, place) : upsertSavedPlace(current, place),
    );
    toast(isSaved ? copy.placeDetail.removed : copy.placeDetail.saved, isSaved ? 'info' : 'success');
  }, [copy.placeDetail.removed, copy.placeDetail.saved, savedPlaces, toast]);

  return (
    <main
      data-view-mode={viewMode}
      className={`relative mx-auto flex min-h-screen w-full flex-col bg-[#0D0D1A] ${
        isDesktopMode ? 'max-w-7xl px-6 pb-10 pt-6' : 'max-w-md px-5 pb-28 pt-6'
      }`}
    >
      <div className={isDesktopMode ? '-mx-6' : '-mx-5'}>
        <NetworkStatusBanner locale={locale} />
        <PwaInstallPrompt locale={locale} />
      </div>

      <div data-testid="language-switcher" className="w-full space-y-2" role="group" aria-label={copy.landing.languageTitle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Languages size={14} className="text-[#FF3A5C]" />
            {copy.landing.languageTitle}
          </div>
          <ViewModeToggle locale={locale} mode={viewMode} onChange={setViewMode} compact={!isDesktopMode} />
        </div>
        <div className={`grid gap-2 ${isDesktopMode ? 'grid-cols-4' : 'grid-cols-2'}`}>
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              data-testid={`locale-${code}`}
              onClick={() => handleLangChange(code)}
              title={LANGUAGE_NAMES[code]}
              aria-label={`${LANGUAGE_NAMES[code]} (${code.toUpperCase()})`}
              aria-pressed={locale === code}
              className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left transition-colors ${
                locale === code
                  ? 'border-[#FF3A5C] bg-[#FF3A5C] font-bold text-white'
                  : 'border-[#2E2E4A] bg-white/5 text-[#8B8BA8] hover:border-[#FF3A5C] hover:text-white'
              }`}
            >
              <span className="w-8 shrink-0 text-xs font-black uppercase">{code}</span>
              <span className="min-w-0 truncate text-sm">{LANGUAGE_NAMES[code]}</span>
            </button>
          ))}
        </div>
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

          {personaPreference && personaLabel && (
            <button
              type="button"
              onClick={() => {
                const category = getPersonaFeedCategory(personaPreference);
                setFeedCategory(category);
                setSelectedStory(getStoryTopicForFeedCategory(category));
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-[#FF3A5C]/25 bg-[#FF3A5C]/10 px-3 py-2 text-left text-xs font-semibold text-[#FF8BA0] transition-colors hover:bg-[#FF3A5C]/15"
            >
              <Sparkles size={14} />
              <span className="truncate">{copy.homeFeed.personalizedFor.replace('{persona}', personaLabel)}</span>
            </button>
          )}

          <div className={isDesktopMode ? 'overflow-visible' : '-mx-5 overflow-x-auto px-5'}>
            <div className={isDesktopMode ? 'grid grid-cols-5 gap-3' : 'flex gap-3'}>
              {STORY_TOPICS.map(({ id, icon: Icon, category }) => {
                const active = selectedStory === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedStory(id);
                      setFeedCategory(category);
                    }}
                    className={`flex flex-col items-center gap-1.5 text-center ${
                      isDesktopMode ? 'min-w-0 rounded-xl bg-white/[0.03] px-2 py-3' : 'w-[72px] shrink-0'
                    }`}
                    aria-label={copy.homeFeed.stories[id]}
                    aria-pressed={active}
                  >
                    <span
                      className={`flex h-14 w-14 items-center justify-center rounded-full border p-0.5 transition-colors ${
                        active
                          ? 'border-[#FF3A5C] bg-[#FF3A5C]/15 text-[#FF8BA0]'
                          : 'border-white/15 bg-white/5 text-white/65 hover:border-[#FF3A5C]/50 hover:text-white'
                      }`}
                    >
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0D0D1A]">
                        <Icon size={21} />
                      </span>
                    </span>
                    <span className="line-clamp-2 min-h-8 text-[11px] font-semibold leading-4 text-white/65">
                      {copy.homeFeed.stories[id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={isDesktopMode ? 'overflow-visible' : '-mx-5 overflow-x-auto px-5'}>
            <div className={isDesktopMode ? 'flex flex-wrap gap-2' : 'flex gap-2'}>
              {FEED_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={feedCategory === category}
                  onClick={() => {
                    setSelectedStory(null);
                    setFeedCategory(category);
                  }}
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
              <span className="min-w-0 flex-1">
                {feedErrorIsCacheFallback ? feedError : `${copy.homeFeed.error}: ${feedError}`}
              </span>
              <button
                type="button"
                onClick={() => setFeedReloadKey((key) => key + 1)}
                className="shrink-0 rounded-lg bg-red-400/15 px-2 py-1 font-semibold text-red-50 transition-colors hover:bg-red-400/25"
              >
                {copy.homeFeed.retry}
              </button>
            </div>
          )}

          <div className={isDesktopMode ? 'overflow-visible' : '-mx-5 overflow-x-auto px-5'}>
            <div className={isDesktopMode ? 'grid grid-cols-4 gap-3' : 'flex gap-3'}>
              {feedLoading ? (
                (isDesktopMode ? [1, 2, 3, 4] : [1, 2]).map((item) => (
                  <div
                    key={item}
                    className={`h-64 rounded-2xl bg-white/5 skeleton ${isDesktopMode ? 'w-full' : 'w-64 shrink-0'}`}
                  />
                ))
              ) : filteredFeed.length > 0 ? (
                filteredFeed.slice(0, 8).map((place) => {
                  const saved = hasSavedPlace(savedPlaces, place);
                  const distance = formatDistance(place.distanceM);

                  return (
                    <article
                      key={place.id}
                      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E30] ${
                        isDesktopMode ? 'min-w-0' : 'w-64 shrink-0'
                      }`}
                    >
                      <div className="relative h-32 bg-white/5">
                        <button
                          type="button"
                          onClick={() => openFeedPlace(place)}
                          aria-label={copy.homeFeed.openPlaceDetail.replace('{name}', place.name)}
                          className="absolute inset-0 block h-full w-full text-left"
                        >
                          {place.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={place.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#FF3A5C]/15 text-[#FF3A5C]">
                              <MapPin size={28} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </button>
                        {place.crowdLevel && (
                          <span
                            className={`pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold backdrop-blur ${CROWD_TEXT_CLASS[place.crowdLevel]}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${CROWD_DOT_CLASS[place.crowdLevel]}`} />
                            {copy.map.crowd[place.crowdLevel]}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleSavedPlace(place)}
                          aria-label={saved ? copy.placeDetail.saved : copy.placeDetail.save}
                          className={`absolute right-3 top-3 z-10 rounded-full bg-black/45 p-2 backdrop-blur transition-colors ${
                            saved ? 'text-[#FF3A5C]' : 'text-white'
                          }`}
                        >
                          <Heart size={16} className={saved ? 'fill-current' : ''} />
                        </button>
                        <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur">
                          {copy.categories[place.category as keyof typeof copy.categories] ?? place.category}
                        </span>
                      </div>
                      <div className="space-y-3 p-3">
                        <button
                          type="button"
                          onClick={() => openFeedPlace(place)}
                          aria-label={copy.homeFeed.openPlaceDetail.replace('{name}', place.name)}
                          className="block w-full rounded-lg text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#FF3A5C]/40"
                        >
                          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-white">{place.name}</h3>
                          <p className="mt-1 line-clamp-1 text-xs text-white/40">{place.address}</p>
                          {distance && <p className="mt-1 text-xs font-semibold text-[#FF3A5C]">{distance}</p>}
                        </button>
                        <button
                          type="button"
                          onClick={() => openFeedPlace(place)}
                          aria-label={copy.homeFeed.openPlaceDetail.replace('{name}', place.name)}
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
                <div
                  className={`rounded-2xl border border-white/10 bg-white/5 p-5 text-center ${
                    isDesktopMode ? 'col-span-full' : 'w-full'
                  }`}
                >
                  <p className="text-sm font-semibold text-white/65">{copy.homeFeed.empty}</p>
                  <p className="mt-1 text-xs leading-5 text-white/35">{copy.homeFeed.emptyHint}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStory(null);
                        setFeedCategory('all');
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
                    >
                      <RefreshCw size={14} />
                      {copy.homeFeed.showAll}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/${locale}/map`)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
                    >
                      <Map size={14} />
                      {copy.homeFeed.exploreMap}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className={`grid gap-2 ${isDesktopMode ? 'grid-cols-4' : 'grid-cols-2'}`}>
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

      <div className={`flex w-full flex-col gap-3 pt-5 ${isDesktopMode ? 'mx-auto max-w-md' : ''}`}>
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
