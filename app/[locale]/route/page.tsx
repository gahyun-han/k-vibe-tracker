'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Footprints, GripVertical, LocateFixed, Map, MapPin, Mic2, Navigation, Plus, Share2, TrainFront, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useToast, type ToastType } from '@/components/common/Toast';
import { CrowdBadge } from '@/components/route/CrowdBadge';
import { RouteMiniMap } from '@/components/route/RouteMiniMap';
import { haversineKm } from '@/lib/features';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceUrl,
  buildLocalRouteShareUrl,
  buildRouteMapUrl,
  buildRouteStopDetailUrl,
  calculateRouteLegs,
  calculateWalkingMinutes,
  createLocalRoutePlan,
  createRouteProgressState,
  CURRENT_ROUTE_STORAGE_KEY,
  decodeRoutePlanFromShare,
  formatDuration,
  generateMockRoutePlan,
  parseRouteProgressState,
  ROUTE_PROGRESS_STORAGE_KEY,
  type RoutePlan,
  type RouteStop,
  type RouteTheme,
} from '@/lib/domain';

interface RoutePlanMeta {
  id: string;
  theme: RouteTheme;
  detail: string;
  summary: string;
}

interface RouteLocationCheck {
  loading: boolean;
  message: string;
  tone: 'neutral' | 'success' | 'warning' | 'error';
}

export default function RoutePage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const uiCopy = getUiCopy(locale);
  const copy = uiCopy.route;
  const { toast } = useToast();
  const fallbackPlan = useMemo(
    () => generateMockRoutePlan({ theme: 'mood', detail: 'cafe', copy: uiCopy.persona }),
    [uiCopy.persona],
  );
  const [planTitle, setPlanTitle] = useState(fallbackPlan.title);
  const [planMeta, setPlanMeta] = useState<RoutePlanMeta>({
    id: fallbackPlan.id,
    theme: fallbackPlan.theme,
    detail: fallbackPlan.detail,
    summary: fallbackPlan.summary,
  });
  const [spots, setSpots] = useState<RouteStop[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [completedStopIds, setCompletedStopIds] = useState<string[]>([]);
  const [locationCheck, setLocationCheck] = useState<RouteLocationCheck>({
    loading: false,
    message: '',
    tone: 'neutral',
  });
  const [status, setStatus] = useState('');
  const extraStop = useMemo<RouteStop>(() => ({
    id: copy.extraStop.id,
    name: copy.extraStop.name,
    category: copy.extraStop.category,
    address: copy.extraStop.address,
    crowdLevel: 'mid',
    lat: 37.569,
    lng: 126.9786,
    stayMinutes: 45,
    startTime: '17:30',
    description: copy.extraStop.description,
    tags: [...copy.extraStop.tags],
  }), [copy]);

  const announceStatus = useCallback((message: string, type: ToastType = 'info') => {
    setStatus(message);
    toast(message, type);
  }, [toast]);

  useEffect(() => {
    const sharedRoute = new URLSearchParams(window.location.search).get('route');
    const stored = window.localStorage.getItem(CURRENT_ROUTE_STORAGE_KEY);

    function applyPlan(plan: RoutePlan, resetProgress = false) {
      setPlanTitle(plan.title);
      setPlanMeta({
        id: plan.id,
        theme: plan.theme,
        detail: plan.detail,
        summary: plan.summary,
      });
      setSpots(plan.stops);
      setCompletedStopIds(
        resetProgress
          ? []
          : parseRouteProgressState(
              window.localStorage.getItem(ROUTE_PROGRESS_STORAGE_KEY),
              plan.id,
              plan.stops.map((spot) => spot.id),
            ).completedStopIds,
      );
      setHydrated(true);
    }

    if (sharedRoute) {
      const decoded = decodeRoutePlanFromShare(sharedRoute);
      if (decoded) {
        applyPlan(decoded, true);
        announceStatus(copy.sharedRouteLoaded, 'success');
        return;
      }
      announceStatus(copy.sharedRouteInvalid, 'warning');
    }

    if (!stored) {
      applyPlan(fallbackPlan);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<RoutePlan>;
      if (Array.isArray(parsed.stops) && parsed.stops.length > 0) {
        applyPlan({
          ...fallbackPlan,
          ...parsed,
          id: parsed.id ?? fallbackPlan.id,
          title: parsed.title ?? fallbackPlan.title,
          theme: parsed.theme ?? fallbackPlan.theme,
          detail: parsed.detail ?? fallbackPlan.detail,
          summary: parsed.summary ?? fallbackPlan.summary,
          stops: parsed.stops as RouteStop[],
        });
        return;
      }
    } catch {
      window.localStorage.removeItem(CURRENT_ROUTE_STORAGE_KEY);
    }

    applyPlan(fallbackPlan);
  }, [announceStatus, copy.sharedRouteInvalid, copy.sharedRouteLoaded, fallbackPlan]);

  useEffect(() => {
    if (!hydrated || spots.length === 0) return;

    const plan = createLocalRoutePlan({
      id: planMeta.id,
      title: planTitle,
      theme: planMeta.theme,
      detail: planMeta.detail,
      summary: planMeta.summary,
      stops: spots,
    });
    window.localStorage.setItem(CURRENT_ROUTE_STORAGE_KEY, JSON.stringify(plan));
  }, [hydrated, planMeta, planTitle, spots]);

  useEffect(() => {
    if (!hydrated) return;

    const progress = createRouteProgressState(
      planMeta.id,
      completedStopIds,
      spots.map((spot) => spot.id),
    );
    if (progress.completedStopIds.length !== completedStopIds.length) {
      setCompletedStopIds(progress.completedStopIds);
      return;
    }

    window.localStorage.setItem(ROUTE_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }, [completedStopIds, hydrated, planMeta.id, spots]);

  const stats = useMemo(() => {
    const walking = calculateWalkingMinutes(spots);
    const stay = spots.reduce((total, spot) => total + spot.stayMinutes, 0);

    return {
      walking,
      stay,
      total: walking + stay,
      done: completedStopIds.length,
    };
  }, [completedStopIds.length, spots]);
  const directionsUrl = useMemo(() => buildGoogleMapsDirectionsUrl(spots), [spots]);
  const routeMapUrl = useMemo(() => buildRouteMapUrl(spots, planTitle, locale), [locale, planTitle, spots]);
  const routeLegs = useMemo(() => calculateRouteLegs(spots), [spots]);
  const nextGuidanceStop = useMemo(
    () => spots.find((spot) => !completedStopIds.includes(spot.id)),
    [completedStopIds, spots],
  );

  useEffect(() => {
    setLocationCheck({ loading: false, message: '', tone: 'neutral' });
  }, [nextGuidanceStop?.id]);

  const onDragStart = useCallback((id: string) => setDraggingId(id), []);
  const onDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);
  const onDrop = useCallback((targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setSpots((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((spot) => spot.id === draggingId);
      const toIdx = next.findIndex((spot) => spot.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
    setDraggingId(null);
    setDragOverId(null);
    announceStatus(copy.orderUpdated, 'success');
  }, [announceStatus, copy.orderUpdated, draggingId]);
  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  function moveSpot(id: string, direction: -1 | 1) {
    setSpots((prev) => {
      const fromIdx = prev.findIndex((spot) => spot.id === id);
      const toIdx = fromIdx + direction;
      if (fromIdx === -1 || toIdx < 0 || toIdx >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
    announceStatus(copy.orderUpdated, 'success');
  }

  function removeSpot(id: string) {
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
    announceStatus(copy.stopRemoved, 'warning');
  }

  function addSampleStop() {
    setSpots((prev) => {
      if (prev.some((spot) => spot.id === extraStop.id)) return prev;
      return [...prev, extraStop];
    });
    announceStatus(copy.sampleStopAdded, 'success');
  }

  function toggleStopCompleted(id: string) {
    const isCompleted = completedStopIds.includes(id);
    setCompletedStopIds((prev) => (isCompleted ? prev.filter((stopId) => stopId !== id) : [...prev, id]));
    announceStatus(isCompleted ? copy.stopReopened : copy.stopCompleted, 'success');
  }

  async function shareRoute() {
    const plan = createLocalRoutePlan({
      id: planMeta.id,
      title: planTitle,
      theme: planMeta.theme,
      detail: planMeta.detail,
      summary: planMeta.summary,
      stops: spots,
    });
    const shareUrl = buildLocalRouteShareUrl(plan, window.location.href);

    try {
      if (navigator.share) {
        await navigator.share({ title: plan.title, text: plan.shareText, url: shareUrl });
        announceStatus(copy.shared, 'success');
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      announceStatus(copy.copiedSummary, 'success');
    } catch {
      announceStatus(copy.shareUnavailable, 'error');
    }
  }

  function openDocent(spot: RouteStop) {
    const query = new URLSearchParams({
      name: spot.name,
      category: spot.category,
      address: spot.address,
      description: spot.description,
      stayMinutes: String(spot.stayMinutes),
      startTime: spot.startTime,
      tags: spot.tags.join(','),
    });
    query.set('lat', String(spot.lat));
    query.set('lng', String(spot.lng));
    router.push(`/${locale}/docent?${query.toString()}`);
  }

  function openStopMap(spot: RouteStop) {
    window.open(buildGoogleMapsPlaceUrl(spot), '_blank', 'noopener,noreferrer');
  }

  function openStopDetail(spot: RouteStop) {
    router.push(buildRouteStopDetailUrl(spot, locale));
  }

  function openRouteMap() {
    if (!routeMapUrl) {
      announceStatus(copy.addStopBeforeGuidance, 'warning');
      return;
    }

    router.push(routeMapUrl);
  }

  function openDirections() {
    if (!directionsUrl) {
      announceStatus(copy.addStopBeforeGuidance, 'warning');
      return;
    }

    window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    announceStatus(copy.directionsOpened, 'success');
  }

  function checkNextStopDistance() {
    if (!nextGuidanceStop) {
      setLocationCheck({ loading: false, message: copy.routeCompleted, tone: 'success' });
      return;
    }

    if (!navigator.geolocation) {
      setLocationCheck({ loading: false, message: copy.locationUnsupported, tone: 'error' });
      return;
    }

    setLocationCheck({ loading: true, message: copy.checkingLocation, tone: 'neutral' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distanceM = Math.round(
          haversineKm(
            position.coords.latitude,
            position.coords.longitude,
            nextGuidanceStop.lat,
            nextGuidanceStop.lng,
          ) * 1000,
        );
        const distance = formatLegDistance(distanceM);
        const template = distanceM <= 100 ? copy.nextStopNear : copy.nextStopFar;
        setLocationCheck({
          loading: false,
          message: template
            .replace('{distance}', distance)
            .replace('{name}', nextGuidanceStop.name),
          tone: distanceM <= 100 ? 'success' : 'neutral',
        });
      },
      (error) => {
        setLocationCheck({
          loading: false,
          message: error.code === error.PERMISSION_DENIED ? copy.locationPermissionDenied : copy.locationCheckError,
          tone: 'error',
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 },
    );
  }

  function startGuidance() {
    if (spots.length === 0) {
      announceStatus(copy.addStopBeforeGuidance, 'warning');
      return;
    }

    if (!nextGuidanceStop) {
      announceStatus(copy.routeCompleted, 'success');
      return;
    }

    openDocent(nextGuidanceStop);
  }

  function formatLegDistance(meters: number) {
    return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  }

  return (
    <AppLayout activeTab="route" title={copy.title}>
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24 lg:pb-6">
        <div className="px-4 pb-3 pt-4">
          <p className="text-xs font-semibold text-[#FF3A5C]">{copy.editableEyebrow}</p>
          <h2 className="mt-0.5 text-lg font-bold text-white">{planTitle}</h2>
          {planMeta.summary && (
            <p className="mt-1 text-sm leading-5 text-white/70">{planMeta.summary}</p>
          )}
          <p className="mt-1 text-xs leading-5 text-white/40">{copy.helper}</p>
        </div>

        <div className="mx-4 mb-4 grid grid-cols-4 gap-2">
          {[
            { label: copy.stops, value: String(spots.length), icon: MapPin },
            { label: copy.done, value: `${stats.done}/${spots.length}`, icon: CheckCircle2 },
            { label: copy.walking, value: formatDuration(stats.walking), icon: Navigation },
            { label: copy.total, value: formatDuration(stats.total), icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
              <Icon size={14} className="mx-auto mb-1 text-[#FF3A5C]" />
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-[10px] text-white/40">{label}</p>
            </div>
          ))}
        </div>

        <RouteMiniMap
          stops={spots}
          title={copy.miniMapTitle}
          subtitle={copy.miniMapSubtitle}
          openStopMapLabel={copy.openStopMap}
          onOpenStopMap={openStopMap}
        />

        {spots.length > 0 && (
          <section className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF3A5C]/15 text-[#FF8BA0]">
                <LocateFixed size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white">{copy.locationCardTitle}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  {nextGuidanceStop
                    ? copy.locationCardBody.replace('{name}', nextGuidanceStop.name)
                    : copy.routeCompleted}
                </p>
                {locationCheck.message && (
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      locationCheck.tone === 'success'
                        ? 'text-emerald-300'
                        : locationCheck.tone === 'error'
                          ? 'text-red-300'
                          : locationCheck.tone === 'warning'
                            ? 'text-amber-200'
                            : 'text-white/60'
                    }`}
                  >
                    {locationCheck.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={checkNextStopDistance}
                disabled={locationCheck.loading}
                className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/20 disabled:cursor-wait disabled:opacity-50"
              >
                {locationCheck.loading ? copy.checkingLocation : copy.checkCurrentLocation}
              </button>
            </div>
          </section>
        )}

        {spots.length > 0 && (
          <div className="sticky bottom-20 z-20 mb-4 px-4 lg:bottom-4">
            <div className="grid grid-cols-[minmax(0,1fr)_44px_44px_44px] gap-2 rounded-2xl border border-white/10 bg-[#0D0D1A]/95 p-2 shadow-2xl shadow-black/30 backdrop-blur">
              <button
                onClick={openRouteMap}
                title={copy.openRouteMapTitle}
                className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
              >
                <Map size={16} className="shrink-0" />
                <span className="truncate">{copy.openRouteMap}</span>
              </button>
              <button
                onClick={openDirections}
                title={copy.openDirections}
                aria-label={copy.openDirections}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20"
              >
                <Navigation size={16} />
              </button>
              <button
                onClick={startGuidance}
                title={copy.startGuidance}
                aria-label={copy.startGuidance}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20"
              >
                <Mic2 size={16} />
              </button>
              <button
                onClick={shareRoute}
                title={copy.share}
                aria-label={copy.share}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 px-4">
          {spots.map((spot, idx) => {
            const isCompleted = completedStopIds.includes(spot.id);
            const leg = routeLegs[idx];
            const LegIcon = leg?.mode === 'transit' ? TrainFront : Footprints;
            const legLabel = leg
              ? (leg.mode === 'transit' ? copy.transitSegment : copy.travelSegment)
                .replace('{duration}', formatDuration(leg.travelMinutes))
                .replace('{distance}', formatLegDistance(leg.distanceM))
              : '';
            const legBetween = leg
              ? copy.travelSegmentBetween
                .replace('{from}', leg.fromName)
                .replace('{to}', leg.toName)
              : '';
            return (
              <Fragment key={spot.id}>
                <div
                  draggable
                  onDragStart={() => onDragStart(spot.id)}
                  onDragOver={(e) => onDragOver(e, spot.id)}
                  onDrop={() => onDrop(spot.id)}
                  onDragEnd={onDragEnd}
                  className={`relative flex cursor-grab items-center gap-2 rounded-xl border bg-white/5 p-2 transition-all active:cursor-grabbing ${
                    dragOverId === spot.id
                      ? 'border-[#FF3A5C]/60 bg-[#FF3A5C]/5'
                      : isCompleted
                        ? 'border-emerald-400/30 bg-emerald-400/5'
                        : 'border-white/10'
                  } ${draggingId === spot.id ? 'opacity-40' : 'opacity-100'}`}
                >
                  <button
                    type="button"
                    onClick={() => openStopDetail(spot)}
                    aria-label={copy.openStopDetail.replace('{name}', spot.name)}
                    title={copy.openStopDetailTitle}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#FF3A5C]/40"
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        isCompleted ? 'bg-emerald-500' : 'bg-[#FF3A5C]'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={15} /> : idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className={`text-sm font-semibold ${isCompleted ? 'text-white/55 line-through' : 'text-white'}`}>
                          {spot.name}
                        </p>
                        <CrowdBadge level={spot.crowdLevel} size="sm" labels={uiCopy.map.crowd} />
                        {isCompleted && (
                          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            {copy.completed}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-white/40">{spot.category}</span>
                        <span className="text-white/20">.</span>
                        <span className="text-xs text-white/40">{spot.stayMinutes}{copy.staySuffix}</span>
                        <span className="text-white/20">.</span>
                        <span className="text-xs text-white/40">{spot.startTime}</span>
                      </div>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleStopCompleted(spot.id)}
                      aria-pressed={isCompleted}
                      aria-label={(isCompleted ? copy.markIncomplete : copy.markComplete).replace('{name}', spot.name)}
                      title={isCompleted ? copy.markIncompleteTitle : copy.markCompleteTitle}
                      className={`rounded-lg p-1 transition-colors hover:bg-white/10 ${
                        isCompleted ? 'text-emerald-300 hover:text-emerald-200' : 'text-white/30 hover:text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSpot(spot.id, -1)}
                      disabled={idx === 0}
                      aria-label={copy.moveStopUp.replace('{name}', spot.name)}
                      title={copy.moveStopUpTitle}
                      className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-[#FF3A5C] disabled:opacity-25"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSpot(spot.id, 1)}
                      disabled={idx === spots.length - 1}
                      aria-label={copy.moveStopDown.replace('{name}', spot.name)}
                      title={copy.moveStopDownTitle}
                      className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-[#FF3A5C] disabled:opacity-25"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <GripVertical size={16} className="text-white/20" />
                    <button
                      type="button"
                      onClick={() => openStopMap(spot)}
                      aria-label={copy.openStopMap.replace('{name}', spot.name)}
                      title={copy.openStopMapTitle}
                      className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-[#FF3A5C]"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDocent(spot)}
                      aria-label={copy.openDocent.replace('{name}', spot.name)}
                      title={copy.openDocentTitle}
                      className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-[#FF3A5C]"
                    >
                      <Mic2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSpot(spot.id)}
                      aria-label={copy.removeStop.replace('{name}', spot.name)}
                      className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {leg && (
                  <div
                    role="group"
                    className="grid grid-cols-[36px_minmax(0,1fr)] gap-2 px-1 py-1"
                    aria-label={legBetween}
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-3 border-l border-dashed border-white/15" />
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border border-dashed ${
                        leg.mode === 'transit'
                          ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-200'
                          : 'border-white/15 bg-white/[0.03] text-white/40'
                      }`}>
                        <LegIcon size={14} />
                      </div>
                      <div className="h-3 border-l border-dashed border-white/15" />
                    </div>
                    <div className="min-w-0 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-2">
                      <p className="text-xs font-semibold text-white/55">{legLabel}</p>
                      <p className="mt-0.5 truncate text-[11px] text-white/25">{legBetween}</p>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}

          <button
            onClick={addSampleStop}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm text-white/40 transition-colors hover:border-[#FF3A5C]/50 hover:text-[#FF3A5C]/70"
          >
            <Plus size={16} />
            {copy.addSampleStop}
          </button>
        </div>

        {status && <p className="mt-4 px-4 text-center text-xs text-white/35">{status}</p>}
      </div>
    </AppLayout>
  );
}
