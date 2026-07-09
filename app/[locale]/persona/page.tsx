'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronRight,
  Clock,
  MapPin,
  RotateCcw,
  Save,
  Share2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import AppLayout from '@/components/layout/AppLayout';
import { CrowdBadge } from '@/components/route/CrowdBadge';
import {
  CURRENT_ROUTE_STORAGE_KEY,
  buildKContentRoutePlan,
  getKContentPersonas,
  formatDuration,
  type KPersona,
  type RoutePlan,
} from '@/lib/domain';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';

interface PersonaAvatarProps {
  persona: Pick<KPersona, 'badge' | 'profileImg'>;
  label: string;
}

function PersonaAvatar({ persona, label }: PersonaAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (persona.profileImg && !imageFailed) {
    return (
      <Image
        src={persona.profileImg}
        alt={`${label} profile`}
        width={40}
        height={40}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF3A5C]/15 text-xs font-bold text-[#FF3A5C]">
      {persona.badge}
    </div>
  );
}

export default function PersonaPage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const uiCopy = getUiCopy(locale);
  const copy = uiCopy.persona;
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [shareStatus, setShareStatus] = useState('');

  const kContentPersonas = useMemo(() => getKContentPersonas(), []);

  function generateKContentRoute(personaId: string) {
    setError('');
    setShareStatus('');
    const kPlan = buildKContentRoutePlan({ personaId, locale });
    if (!kPlan) {
      setError('ROUTE_GENERATION_FAILED');
      return;
    }
    setPlan(kPlan);
    setShareStatus(copy.routeGenerated);
    toast(copy.routeGenerated, 'success');
  }

  function reset() {
    setPlan(null);
    setError('');
    setShareStatus('');
  }

  function saveAndEditRoute() {
    if (!plan) return;
    try {
      window.localStorage.setItem(CURRENT_ROUTE_STORAGE_KEY, JSON.stringify(plan));
      toast(copy.routeSaved, 'success');
      router.push(`/${locale}/route`);
    } catch {
      setShareStatus(copy.routeSaveUnavailable);
      toast(copy.routeSaveUnavailable, 'error');
    }
  }

  async function shareRoute() {
    if (!plan) return;

    try {
      if (navigator.share) {
        await navigator.share({ title: plan.title, text: plan.shareText, url: window.location.href });
        setShareStatus(copy.shared);
        toast(copy.shared, 'success');
        return;
      }

      await navigator.clipboard.writeText(plan.shareText);
      setShareStatus(copy.copied);
      toast(copy.copied, 'success');
    } catch {
      setShareStatus(copy.shareUnavailable);
      toast(copy.shareUnavailable, 'error');
    }
  }

  if (plan) {
    return (
      <AppLayout activeTab="route">
        <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
          <div className="space-y-4 px-4 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#FF3A5C]">{copy.previewEyebrow}</p>
                <h2 className="mt-0.5 text-lg font-bold text-white">{plan.title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/45">{plan.summary}</p>
              </div>
              <button
                onClick={reset}
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
                        <p className="text-[10px] text-white/30">{stop.stayMinutes}{uiCopy.route.staySuffix}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveAndEditRoute}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e]"
              >
                <Save size={16} />
                {copy.editRoute}
              </button>
              <button
                onClick={shareRoute}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/20"
              >
                <Share2 size={16} />
                {copy.share}
              </button>
            </div>
            {shareStatus && <p className="text-center text-xs text-white/35">{shareStatus}</p>}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab="route">
      <div className="flex h-full flex-col bg-[#0D0D1A] pb-24">
        <div className="px-4 pt-4">
          <p className="text-xs font-semibold text-[#FF3A5C]">{copy.generatorEyebrow}</p>
          <h2 className="mt-1 text-lg font-bold text-white">{copy.title}</h2>
          <p className="mt-1 text-xs leading-5 text-white/45">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-4">
          <div className="rounded-xl border border-[#FF3A5C]/25 bg-[#FF3A5C]/[0.06] p-3">
            <p className="text-xs font-semibold text-[#FF3A5C]">{copy.kContentEyebrow}</p>
            <h3 className="mt-0.5 text-base font-bold text-white">{copy.kContentTitle}</h3>
            <p className="mt-1 text-xs leading-5 text-white/45">{copy.kContentSubtitle}</p>
            <div className="mt-3 space-y-2">
              {kContentPersonas.map((persona) => {
                const label = locale === 'ko' ? persona.label.ko : persona.label.en;
                const description = locale === 'ko' ? persona.description.ko : persona.description.en;
                return (
                  <button
                    key={persona.id}
                    onClick={() => generateKContentRoute(persona.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#0D0D1A] p-3 text-left transition-all hover:border-[#FF3A5C]/60 hover:bg-[#FF3A5C]/10"
                  >
                    <PersonaAvatar persona={persona} label={label} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{label}</p>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                          {persona.routeCnt}
                          {copy.kContentStopsSuffix}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/40">{description}</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto shrink-0 text-white/30" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
