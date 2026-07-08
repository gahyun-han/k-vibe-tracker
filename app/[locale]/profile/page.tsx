'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, CheckCircle2, Clock, CloudOff, Heart, Languages, Lock, LogOut, Map, MapPin, PlayCircle, Route, Settings2, Sparkles } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import LoginModal from '@/components/auth/LoginModal';
import {
  parsePersonaPreference,
  PERSONA_PREFERENCE_STORAGE_KEY,
  type PersonaPreference,
} from '@/lib/ui-state';
import {
  CURRENT_ROUTE_STORAGE_KEY,
  formatDuration,
  parseRouteProgressState,
  ROUTE_PROGRESS_STORAGE_KEY,
  type RoutePlan,
} from '@/lib/domain';
import {
  parseSavedPlaces,
  SAVED_PLACES_STORAGE_KEY,
  type SavedPlace,
} from '@/lib/features';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client';
import { getProfileSettingsCopy, getUiCopy, normalizeUiLocale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';

const SAVED_TILE_BACKGROUNDS = [
  'from-[#FFB3C1] to-[#FF3A5C]',
  'from-[#B3D4FF] to-[#2563EB]',
  'from-[#FFE9B3] to-[#F59E0B]',
  'from-[#B3FFD4] to-[#16A34A]',
  'from-[#E9D5FF] to-[#7C3AED]',
] as const;

const SAVED_PLACES_PREVIEW_LIMIT = 4;

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const copy = getUiCopy(locale);
  const settingsCopy = getProfileSettingsCopy(locale);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [currentRoute, setCurrentRoute] = useState<RoutePlan | null>(null);
  const [routeCompletedStopIds, setRouteCompletedStopIds] = useState<string[]>([]);
  const [personaPreference, setPersonaPreference] = useState<PersonaPreference | null>(null);
  const [showAllSavedPlaces, setShowAllSavedPlaces] = useState(false);
  const supabaseConfigured = hasSupabaseEnv();

  useEffect(() => {
    setSavedPlaces(parseSavedPlaces(window.localStorage.getItem(SAVED_PLACES_STORAGE_KEY)));
    setPersonaPreference(parsePersonaPreference(window.localStorage.getItem(PERSONA_PREFERENCE_STORAGE_KEY)));

    try {
      const route = JSON.parse(window.localStorage.getItem(CURRENT_ROUTE_STORAGE_KEY) ?? 'null') as Partial<RoutePlan> | null;
      if (route?.title && Array.isArray(route.stops)) {
        const plan = route as RoutePlan;
        setCurrentRoute(plan);
        setRouteCompletedStopIds(
          parseRouteProgressState(
            window.localStorage.getItem(ROUTE_PROGRESS_STORAGE_KEY),
            plan.id,
            plan.stops.map((stop) => stop.id),
          ).completedStopIds,
        );
      }
    } catch {
      setCurrentRoute(null);
      setRouteCompletedStopIds([]);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }

  function openSavedPlace(place: SavedPlace) {
    const searchParams = new URLSearchParams({
      lat: String(place.lat),
      lng: String(place.lng),
      q: place.name,
      source: 'saved',
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
  }

  function openCurrentRoute() {
    router.push(`/${locale}/route`);
  }

  if (loading) {
    return (
      <AppLayout activeTab="profile" title={copy.profile.title}>
        <div className="space-y-4 px-4 pt-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      </AppLayout>
    );
  }

  const displayName = user?.user_metadata?.['full_name'] ?? copy.profile.guestTitle;
  const displayEmail = user?.email ?? copy.profile.guestSubtitle;
  const avatarInitial = (user?.user_metadata?.['full_name']?.[0] ?? user?.email?.[0] ?? 'G').toUpperCase();
  const personaLabel = personaPreference
    ? ((copy.persona.themes[personaPreference.theme].details as Record<string, { label: string }>)[personaPreference.detail]?.label ??
      copy.persona.themes[personaPreference.theme].label)
    : copy.profile.personaUnset;
  const routeCount = currentRoute ? 1 : 0;
  const routeTotalStops = currentRoute?.stops.length ?? 0;
  const routeCompletedCount = currentRoute ? routeCompletedStopIds.length : 0;
  const routeProgressPercent = routeTotalStops > 0 ? Math.round((routeCompletedCount / routeTotalStops) * 100) : 0;
  const nextRouteStop = currentRoute?.stops.find((stop) => !routeCompletedStopIds.includes(stop.id));
  const visibleSavedPlaces = showAllSavedPlaces ? savedPlaces : savedPlaces.slice(0, SAVED_PLACES_PREVIEW_LIMIT);
  const canToggleSavedPlaces = savedPlaces.length > SAVED_PLACES_PREVIEW_LIMIT;
  const settingItems = [
    { icon: Languages, ...settingsCopy.items.language },
    { icon: Bell, ...settingsCopy.items.notifications },
    { icon: CloudOff, ...settingsCopy.items.offlineMaps },
    { icon: Map, ...settingsCopy.items.mapData },
  ];

  return (
    <AppLayout activeTab="profile" title={copy.profile.title}>
      <div className="space-y-4 px-4 pb-24 pt-4">
        <section className="rounded-2xl border border-[#2E2E4A] bg-[#1E1E30] p-4">
          <div className="flex items-center gap-4">
            {user?.user_metadata?.['avatar_url'] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata['avatar_url']} alt={copy.common.avatarAlt} className="h-14 w-14 rounded-full border-2 border-[#FF3A5C] object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FF3A5C] bg-[#FF3A5C]/20 text-2xl font-bold text-white">
                {avatarInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">{displayName}</p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-[#8B8BA8]">{displayEmail}</p>
              <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#FF3A5C]/10 px-2.5 py-1 text-[11px] font-semibold text-[#FF8BA0]">
                <Sparkles size={12} className="shrink-0" />
                <span className="shrink-0 text-white/45">{copy.profile.personaLabel}</span>
                <span className="truncate">{personaLabel}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-lg font-bold text-white">{savedPlaces.length}</p>
              <p className="text-xs text-white/40">{copy.profile.statsPlaces}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-lg font-bold text-white">{routeCount}</p>
              <p className="text-xs text-white/40">{copy.profile.statsRoutes}</p>
            </div>
          </div>
        </section>

        {!user && !supabaseConfigured && (
          <section className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100">
            <p className="mb-1 flex items-center gap-2 font-semibold">
              <Lock size={13} />
              {copy.profile.supabaseNotConfigured}
            </p>
            <p className="leading-5 text-amber-100/70">{copy.profile.supabaseDescription}</p>
          </section>
        )}

        {!user && supabaseConfigured && (
          <section className="rounded-xl border border-[#FF3A5C]/25 bg-[#FF3A5C]/10 p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FF3A5C]/15 text-[#FF8BA0]">
                <Lock size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{copy.profile.signInTitle}</p>
                <p className="mt-1 text-xs leading-5 text-white/55">{copy.profile.signInDescription}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="shrink-0 rounded-xl bg-[#FF3A5C] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#e02e4e]"
              >
                {copy.common.signIn}
              </button>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Heart size={16} className="text-[#FF3A5C]" />
              {copy.profile.savedPlaces}
            </h2>
            {canToggleSavedPlaces && (
              <button
                type="button"
                onClick={() => setShowAllSavedPlaces((current) => !current)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/55 transition-colors hover:border-[#FF3A5C]/50 hover:text-white"
              >
                {showAllSavedPlaces ? copy.profile.showLess : copy.profile.seeAll}
              </button>
            )}
          </div>

          {savedPlaces.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {visibleSavedPlaces.map((place, index) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => openSavedPlace(place)}
                  aria-label={copy.profile.openSavedDetail.replace('{name}', place.name)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-colors hover:border-[#FF3A5C]/60"
                >
                  {place.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={place.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${SAVED_TILE_BACKGROUNDS[index % SAVED_TILE_BACKGROUNDS.length]} text-white`}
                    >
                      <MapPin size={28} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/75 backdrop-blur">
                    {copy.categories[place.category as keyof typeof copy.categories] ?? place.category}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="line-clamp-2 text-sm font-bold leading-5 text-white drop-shadow">{place.name}</p>
                    <p className="mt-1 truncate text-[11px] text-white/65">{place.address}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#FF8BA0]">
                      <Map size={11} />
                      {copy.profile.openSavedDetailCta}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-sm font-semibold text-white/75">{copy.profile.noSavedPlaces}</p>
              <p className="mt-1 text-xs leading-5 text-white/40">{copy.profile.noSavedPlacesHint}</p>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/map`)}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
              >
                <Map size={15} />
                {copy.profile.openMap}
              </button>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#2E2E4A] bg-[#1E1E30]">
          <div className="border-b border-[#2E2E4A] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Route size={16} className="text-[#FF3A5C]" />
              {copy.profile.savedRoutes}
            </p>
          </div>
          {currentRoute ? (
            <div className="space-y-3 p-4">
              <button
                type="button"
                onClick={openCurrentRoute}
                aria-label={copy.profile.openRouteDetail.replace('{name}', currentRoute.title)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-[#FF3A5C]/50 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{currentRoute.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#8B8BA8]">
                      {copy.profile.routeStops.replace('{count}', String(currentRoute.stops.length))}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#FF3A5C]/10 px-2.5 py-1 text-[11px] font-semibold text-[#FF3A5C]">
                    {routeProgressPercent}%
                  </span>
                </div>

                <div className="mb-1 mt-3 flex items-center justify-between text-[11px] text-white/45">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    {copy.profile.routeProgress
                      .replace('{done}', String(routeCompletedCount))
                      .replace('{total}', String(routeTotalStops))}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {formatDuration(currentRoute.totalMinutes)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${routeProgressPercent}%` }}
                  />
                </div>

                <div className="mt-3 rounded-lg bg-white/5 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    {nextRouteStop ? copy.profile.nextStop : copy.profile.routeComplete}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {nextRouteStop?.name ?? currentRoute.stops[currentRoute.stops.length - 1]?.name}
                  </p>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#FF8BA0]">
                  <Route size={12} />
                  {copy.profile.openRouteDetailCta}
                </p>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={openCurrentRoute}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-2.5 text-sm font-semibold text-white"
                >
                  <PlayCircle size={15} />
                  {copy.profile.continueRoute}
                </button>
                <button
                  type="button"
                  onClick={openCurrentRoute}
                  className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white/75"
                >
                  {copy.profile.editRoute}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-[#8B8BA8]">{copy.profile.noSavedRoutes}</p>
              <p className="mt-1 text-xs text-[#8B8BA8]">{copy.profile.noSavedRoutesHint}</p>
              <button
                type="button"
                onClick={() => router.push(`/${locale}/persona`)}
                className="mt-4 rounded-xl bg-[#FF3A5C] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {copy.profile.createFirstRoute}
              </button>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#2E2E4A] bg-[#1E1E30]">
          <div className="border-b border-[#2E2E4A] px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Settings2 size={16} className="text-[#FF3A5C]" />
              {settingsCopy.title}
            </p>
          </div>
          {settingItems.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex w-full items-center gap-3 border-b border-[#2E2E4A] px-4 py-4 text-left last:border-b-0"
            >
              <Icon size={18} className="text-[#FF3A5C]" />
              <span className="flex-1 text-sm font-medium text-white">{label}</span>
              <span className="text-xs text-[#8B8BA8]">{value}</span>
            </div>
          ))}
        </section>

        {!user ? (
          <>
            <button
              onClick={() => setShowLogin(true)}
              className="w-full rounded-2xl bg-[#FF3A5C] py-4 font-bold text-white disabled:opacity-60"
            >
              {copy.profile.signInGoogle}
            </button>
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/profile`} />}
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-transparent py-3.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut size={16} />
            {copy.profile.signOut}
          </button>
        )}
      </div>
    </AppLayout>
  );
}
