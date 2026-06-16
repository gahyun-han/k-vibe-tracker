'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, GripVertical, MapPin, Mic2, Navigation, Plus, Share2, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CrowdBadge } from '@/components/route/CrowdBadge';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';
import {
  calculateWalkingMinutes,
  createLocalRoutePlan,
  CURRENT_ROUTE_STORAGE_KEY,
  formatDuration,
  generateMockRoutePlan,
  type RoutePlan,
  type RouteStop,
  type RouteTheme,
} from '@/lib/routes';

interface RoutePlanMeta {
  id: string;
  theme: RouteTheme;
  detail: string;
  summary: string;
}

export default function RoutePage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const uiCopy = getUiCopy(locale);
  const copy = uiCopy.route;
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

  useEffect(() => {
    const stored = window.localStorage.getItem(CURRENT_ROUTE_STORAGE_KEY);

    function applyPlan(plan: RoutePlan) {
      setPlanTitle(plan.title);
      setPlanMeta({
        id: plan.id,
        theme: plan.theme,
        detail: plan.detail,
        summary: plan.summary,
      });
      setSpots(plan.stops);
      setHydrated(true);
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
  }, [fallbackPlan]);

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

  const stats = useMemo(() => {
    const walking = calculateWalkingMinutes(spots);
    const stay = spots.reduce((total, spot) => total + spot.stayMinutes, 0);

    return {
      walking,
      stay,
      total: walking + stay,
    };
  }, [spots]);

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
    setStatus(copy.orderUpdated);
  }, [copy.orderUpdated, draggingId]);
  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  function removeSpot(id: string) {
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
    setStatus(copy.stopRemoved);
  }

  function addSampleStop() {
    setSpots((prev) => {
      if (prev.some((spot) => spot.id === extraStop.id)) return prev;
      return [...prev, extraStop];
    });
    setStatus(copy.sampleStopAdded);
  }

  async function shareRoute() {
    const shareText = `${planTitle}: ${spots.map((spot) => spot.name).join(' -> ')}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: planTitle, text: shareText, url: window.location.href });
        setStatus(copy.shared);
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setStatus(copy.copiedSummary);
    } catch {
      setStatus(copy.shareUnavailable);
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

  function startGuidance() {
    if (spots.length === 0) {
      setStatus(copy.addStopBeforeGuidance);
      return;
    }

    openDocent(spots[0]);
  }

  return (
    <AppLayout activeTab="route" title={copy.title}>
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
        <div className="px-4 pb-3 pt-4">
          <p className="text-xs font-semibold text-[#FF3A5C]">{copy.editableEyebrow}</p>
          <h2 className="mt-0.5 text-lg font-bold text-white">{planTitle}</h2>
          <p className="mt-1 text-xs text-white/40">{copy.helper}</p>
        </div>

        <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
          {[
            { label: copy.stops, value: String(spots.length), icon: MapPin },
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

        <div className="space-y-2 px-4">
          {spots.map((spot, idx) => (
            <div
              key={spot.id}
              draggable
              onDragStart={() => onDragStart(spot.id)}
              onDragOver={(e) => onDragOver(e, spot.id)}
              onDrop={() => onDrop(spot.id)}
              onDragEnd={onDragEnd}
              className={`relative flex cursor-grab items-center gap-3 rounded-xl border bg-white/5 p-3 transition-all active:cursor-grabbing ${
                dragOverId === spot.id ? 'border-[#FF3A5C]/60 bg-[#FF3A5C]/5' : 'border-white/10'
              } ${draggingId === spot.id ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF3A5C] text-xs font-bold text-white">
                {idx + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">{spot.name}</p>
                  <CrowdBadge level={spot.crowdLevel} size="sm" />
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-white/40">{spot.category}</span>
                  <span className="text-white/20">.</span>
                  <span className="text-xs text-white/40">{spot.stayMinutes}{copy.staySuffix}</span>
                  <span className="text-white/20">.</span>
                  <span className="text-xs text-white/40">{spot.startTime}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <GripVertical size={16} className="text-white/20" />
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
          ))}

          <button
            onClick={addSampleStop}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm text-white/40 transition-colors hover:border-[#FF3A5C]/50 hover:text-[#FF3A5C]/70"
          >
            <Plus size={16} />
            {copy.addSampleStop}
          </button>
        </div>

        {status && <p className="mt-4 px-4 text-center text-xs text-white/35">{status}</p>}

        {spots.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-md px-4">
            <div className="flex gap-2">
              <button
                onClick={startGuidance}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
              >
                <Navigation size={16} />
                {copy.startGuidance}
              </button>
              <button
                onClick={shareRoute}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20"
              >
                <Share2 size={16} />
                {copy.share}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
