'use client';

import { Clock, MapPin, RotateCcw, Save, Share2, Sparkles } from 'lucide-react';
import { CrowdBadge } from '@/components/route/CrowdBadge';
import { formatDuration, type RoutePlan } from '@/lib/domain';
import type { getUiCopy } from '@/lib/i18n';

type UiCopy = ReturnType<typeof getUiCopy>;

interface PersonaRoutePreviewProps {
  plan: RoutePlan;
  copy: UiCopy['persona'];
  routeCopy: UiCopy['route'];
  shareStatus: string;
  onReset: () => void;
  onSaveAndEditRoute: () => void;
  onShareRoute: () => void | Promise<void>;
}

export function PersonaRoutePreview({
  plan,
  copy,
  routeCopy,
  shareStatus,
  onReset,
  onSaveAndEditRoute,
  onShareRoute,
}: PersonaRoutePreviewProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
      <div className="space-y-4 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#FF3A5C]">{copy.previewEyebrow}</p>
            <h2 className="mt-0.5 text-lg font-bold text-white">{plan.title}</h2>
            <p className="mt-1 text-xs leading-5 text-white/45">{plan.summary}</p>
          </div>
          <button
            onClick={onReset}
            aria-label={copy.createAnother}
            className="rounded-xl bg-white/10 p-2 text-white/60 hover:bg-white/20"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: copy.stops, value: String(plan.stops.length), icon: MapPin },
            { label: copy.walking, value: formatDuration(plan.walkingMinutes), icon: Clock },
            { label: copy.total, value: formatDuration(plan.totalMinutes), icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
              <Icon size={14} className="mx-auto mb-1 text-[#FF3A5C]" />
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-[10px] text-white/40">{label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {plan.stops.map((stop, index) => (
            <div key={stop.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF3A5C] text-sm font-bold text-white">
                  {index + 1}
                </div>
                {index < plan.stops.length - 1 && (
                  <div className="mb-1 mt-1 min-h-[16px] w-px flex-1 bg-white/10" />
                )}
              </div>

              <div className="mb-1 flex-1 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-semibold text-white">{stop.name}</p>
                      <CrowdBadge level={stop.crowdLevel} size="sm" />
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">{stop.address}</p>
                    <p className="mt-2 text-xs leading-5 text-white/55">{stop.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-[#FF3A5C]">{stop.startTime}</p>
                    <p className="text-[10px] text-white/30">
                      {stop.stayMinutes}
                      {routeCopy.staySuffix}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSaveAndEditRoute}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
          >
            <Save size={16} />
            {copy.editRoute}
          </button>
          <button
            onClick={() => {
              void onShareRoute();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/20"
          >
            <Share2 size={16} />
            {copy.share}
          </button>
        </div>
        {shareStatus && <p className="text-center text-xs text-white/35">{shareStatus}</p>}
      </div>
    </div>
  );
}
