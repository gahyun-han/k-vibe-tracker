'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, CheckCircle2, Clock, CloudOff, Heart, Languages, Lock, LogOut, Map, MapPin, PlayCircle, Route, Settings2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import LoginModal from '@/components/auth/LoginModal';
import {
  CURRENT_ROUTE_STORAGE_KEY,
  formatDuration,
  parseRouteProgressState,
  ROUTE_PROGRESS_STORAGE_KEY,
  type RoutePlan,
} from '@/lib/routes';
import {
  parseSavedPlaces,
  SAVED_PLACES_STORAGE_KEY,
  type SavedPlace,
} from '@/lib/saved-places';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client';
import { getProfileSettingsCopy, getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';
import type { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const settingsCopy = getProfileSettingsCopy(locale);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [currentRoute, setCurrentRoute] = useState<RoutePlan | null>(null);
  const [routeCompletedStopIds, setRouteCompletedStopIds] = useState<string[]>([]);
  const supabaseConfigured = hasSupabaseEnv();

  useEffect(() => {
    setSavedPlaces(parseSavedPlaces(window.localStorage.getItem(SAVED_PLACES_STORAGE_KEY)));

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
    });
    router.push(`/${locale}/map?${searchParams.toString()}`);
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

  const displayName = user?.user_metadata?.full_name ?? copy.profile.guestTitle;
  const displayEmail = user?.email ?? copy.profile.guestSubtitle;
  const avatarInitial = (user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? 'G').toUpperCase();
  const routeCount = currentRoute ? 1 : 0;
  const routeTotalStops = currentRoute?.stops.length ?? 0;
  const routeCompletedCount = currentRoute ? routeCompletedStopIds.length : 0;
  const routeProgressPercent = routeTotalStops > 0 ? Math.round((routeCompletedCount / routeTotalStops) * 100) : 0;
  const nextRouteStop = currentRoute?.stops.find((stop) => !routeCompletedStopIds.includes(stop.id));
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
            {user?.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url} alt={copy.common.avatarAlt} className="h-14 w-14 rounded-full border-2 border-[#FF3A5C] object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FF3A5C] bg-[#FF3A5C]/20 text-2xl font-bold text-white">
                {avatarInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">{displayName}</p>
              <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-[#8B8BA8]">{displayEmail}</p>
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

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Heart size={16} className="text-[#FF3A5C]" />
              {copy.profile.savedPlaces}
            </h2>
          </div>

          {savedPlaces.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {savedPlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => openSavedPlace(place)}
                  className="min-h-[154px] overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-colors hover:border-[#FF3A5C]/60 hover:bg-[#FF3A5C]/5"
                >
                  {place.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={place.imageUrl} alt="" className="h-20 w-full object-cover" />
                  ) : (
                    <div className="flex h-20 w-full items-center justify-center bg-[#FF3A5C]/15 text-[#FF3A5C]">
                      <MapPin size={24} />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-white">{place.name}</p>
                    <p className="mt-1 truncate text-xs text-white/40">{place.address}</p>
                    <p className="mt-2 text-xs font-semibold text-[#FF3A5C]">{copy.profile.openMap}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center">
              <p className="text-sm font-semibold text-white/75">{copy.profile.noSavedPlaces}</p>
              <p className="mt-1 text-xs leading-5 text-white/40">{copy.profile.noSavedPlacesHint}</p>
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

              <div>
                <div className="mb-1 flex items-center justify-between text-[11px] text-white/45">
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
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  {nextRouteStop ? copy.profile.nextStop : copy.profile.routeComplete}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {nextRouteStop?.name ?? currentRoute.stops[currentRoute.stops.length - 1]?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/route`)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-2.5 text-sm font-semibold text-white"
                >
                  <PlayCircle size={15} />
                  {copy.profile.continueRoute}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/route`)}
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
