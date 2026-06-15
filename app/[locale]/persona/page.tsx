'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  RotateCcw,
  Save,
  Share2,
  Sparkles,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CrowdBadge } from '@/components/route/CrowdBadge';
import {
  ROUTE_THEME_OPTIONS,
  formatDuration,
  type RoutePlan,
  type RouteTheme,
} from '@/lib/routes';

const STORAGE_KEY = 'k-vibe-current-route';

type Step = 1 | 2;

interface GenerateRouteResponse {
  plan: RoutePlan;
  cached: boolean;
  source: 'mock';
}

export default function PersonaPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const [step, setStep] = useState<Step>(1);
  const [theme, setTheme] = useState<RouteTheme | ''>('');
  const [detail, setDetail] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [shareStatus, setShareStatus] = useState('');

  const selectedTheme = useMemo(
    () => ROUTE_THEME_OPTIONS.find((option) => option.id === theme),
    [theme]
  );

  async function generateRoute() {
    if (!theme || !detail) return;

    setLoading(true);
    setError('');
    setShareStatus('');

    try {
      const res = await fetch('/api/routes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, detail, start_time: startTime }),
      });
      const data = (await res.json()) as Partial<GenerateRouteResponse> & { error?: string };

      if (!res.ok || !data.plan) {
        throw new Error(data.error ?? 'ROUTE_GENERATION_FAILED');
      }

      setPlan(data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ROUTE_GENERATION_FAILED');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep(1);
    setTheme('');
    setDetail('');
    setPlan(null);
    setError('');
    setShareStatus('');
  }

  function saveAndEditRoute() {
    if (!plan) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    router.push(`/${locale}/route`);
  }

  async function shareRoute() {
    if (!plan) return;

    try {
      if (navigator.share) {
        await navigator.share({ title: plan.title, text: plan.shareText, url: window.location.href });
        setShareStatus('Shared');
        return;
      }

      await navigator.clipboard.writeText(plan.shareText);
      setShareStatus('Copied');
    } catch {
      setShareStatus('Share unavailable');
    }
  }

  if (plan) {
    return (
      <AppLayout activeTab="route">
        <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
          <div className="space-y-4 px-4 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#FF3A5C]">Local route preview</p>
                <h2 className="mt-0.5 text-lg font-bold text-white">{plan.title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/45">{plan.summary}</p>
              </div>
              <button
                onClick={reset}
                aria-label="Create another route"
                className="rounded-xl bg-white/10 p-2 text-white/60 hover:bg-white/20"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Stops', value: String(plan.stops.length), icon: MapPin },
                { label: 'Walking', value: formatDuration(plan.walkingMinutes), icon: Clock },
                { label: 'Total', value: formatDuration(plan.totalMinutes), icon: Sparkles },
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
                        <p className="text-[10px] text-white/30">{stop.stayMinutes}min</p>
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
                Edit Route
              </button>
              <button
                onClick={shareRoute}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-white/20"
              >
                <Share2 size={16} />
                Share
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
          <p className="text-xs font-semibold text-[#FF3A5C]">Route generator</p>
          <h2 className="mt-1 text-lg font-bold text-white">Build a K-content day plan</h2>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Pick a theme and route mood. This local generator is deterministic while paid AI is approval-gated.
          </p>
          <div className="mt-4 flex gap-1.5">
            {([1, 2] as const).map((item) => (
              <div
                key={item}
                className={`h-1 flex-1 rounded-full transition-all ${step >= item ? 'bg-[#FF3A5C]' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-4">
          {step === 1 && (
            <>
              <div className="rounded-xl bg-white/5 p-3">
                <label className="text-xs font-semibold text-white/50" htmlFor="start-time">
                  Start time
                </label>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#0D0D1A] px-3 py-2 text-sm text-white outline-none focus:border-[#FF3A5C]/50"
                />
              </div>

              {ROUTE_THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setTheme(option.id);
                    setDetail('');
                    setStep(2);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-[#FF3A5C]/50 hover:bg-[#FF3A5C]/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF3A5C]/15 text-xs font-bold text-[#FF3A5C]">
                    {option.id.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{option.label}</p>
                    <p className="text-xs leading-5 text-white/40">{option.description}</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto shrink-0 text-white/30" />
                </button>
              ))}
            </>
          )}

          {step === 2 && selectedTheme && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg bg-white/10 p-2 text-white/50 hover:text-white"
                  aria-label="Back to route themes"
                >
                  <ChevronLeft size={16} />
                </button>
                <div>
                  <p className="text-xs text-white/40">{selectedTheme.label}</p>
                  <h3 className="text-base font-bold text-white">Choose the route mood</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedTheme.details.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDetail(option.id)}
                    className={`min-h-[112px] rounded-xl border p-3 text-left transition-all ${
                      detail === option.id
                        ? 'border-[#FF3A5C] bg-[#FF3A5C]/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="mt-1 text-xs leading-5 text-white/45">{option.description}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 2 && (
          <div className="px-4 pb-4">
            <button
              onClick={generateRoute}
              disabled={!detail || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating route...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Route
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
