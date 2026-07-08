'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  Clock3,
  ExternalLink,
  Instagram,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  Youtube,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import AppLayout from '@/components/layout/AppLayout';
import { postAnalyze } from '@/frontend/api/analyze';
import {
  detectSnsPlatform,
  extractVideoId,
  getThumbnailUrl,
  buildAnalysisLocalCacheKey,
  createLocalRoutePlan,
  CURRENT_ROUTE_STORAGE_KEY,
  type AnalysisPlace,
  type AnalysisResult,
  type RouteStop,
} from '@/lib/domain';
import { readLocalApiCache, writeLocalApiCache } from '@/lib/cache';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

const EXAMPLE_URLS = [
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=BKorP55Aqvg',
  'https://www.instagram.com/reel/CxExampleSpot/',
];

export default function AnalyzePage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const copy = getUiCopy(locale).analyze;
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  const urlPlatform = detectSnsPlatform(url);
  const isYoutubeInput = urlPlatform === 'youtube';
  const isInstagramInput = urlPlatform === 'instagram';
  const videoId = url ? extractVideoId(url) : null;
  const urlValid = isYoutubeInput && Boolean(videoId);
  const InputIcon = isInstagramInput ? Instagram : Youtube;

  useEffect(() => {
    if (status !== 'loading') return;

    const timer = window.setInterval(() => {
      setLoadingStepIndex((index) => Math.min(index + 1, copy.loadingSteps.length - 1));
    }, 900);

    return () => window.clearInterval(timer);
  }, [copy.loadingSteps.length, status]);

  async function analyze(targetUrl = url) {
    const nextUrl = targetUrl.trim();
    const nextVideoId = extractVideoId(nextUrl);
    if (targetUrl !== url) setUrl(nextUrl);
    if (detectSnsPlatform(nextUrl) !== 'youtube' || !nextVideoId) return;

    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    setLoadingStepIndex(0);

    const localCacheKey = buildAnalysisLocalCacheKey({ locale, videoId: nextVideoId });
    const cachedResult = readLocalApiCache<AnalysisResult>(window.localStorage, localCacheKey);
    if (cachedResult) {
      setResult({ ...cachedResult, cached: true });
      setStatus('success');
      setLoadingStepIndex(copy.loadingSteps.length - 1);
      toast(copy.cachedResultLoaded, 'info');
      return;
    }

    try {
      const data = await postAnalyze({ youtube_url: nextUrl, locale });
      const nextResult = {
        ...data,
        cached: Boolean(data.cached),
      };

      writeLocalApiCache(window.localStorage, localCacheKey, nextResult);
      setResult(nextResult);
      setStatus('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'ANALYSIS_REQUEST_FAILED');
      setStatus('error');
      toast(copy.errorTitle, 'error');
    }
  }

  function setExample(exampleUrl: string) {
    setUrl(exampleUrl);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    setLoadingStepIndex(0);

    if (detectSnsPlatform(exampleUrl) === 'youtube' && extractVideoId(exampleUrl)) {
      void analyze(exampleUrl);
    }
  }

  function placesWithCoordinates(places: AnalysisPlace[]) {
    return places.filter((place): place is AnalysisPlace & { lat: number; lng: number } => {
      return Number.isFinite(place.lat) && Number.isFinite(place.lng);
    });
  }

  function viewPlaceOnMap(place: AnalysisPlace, openDetail = false) {
    if (place.lat === null || place.lng === null) return;
    const searchParams = new URLSearchParams({
      lat: String(place.lat),
      lng: String(place.lng),
      q: place.name,
      source: 'analyze',
    });
    if (place.reason) searchParams.set('description', place.reason);
    if (openDetail) searchParams.set('detail', '1');
    router.push(`/${locale}/map?${searchParams.toString()}`);
  }

  function saveAnalysisRoute() {
    if (!result) return;
    const candidates = placesWithCoordinates(result.places);
    if (candidates.length === 0) return;

    const stops: RouteStop[] = candidates.map((place, index) => ({
      id: `analysis-${result.video_id}-${index}`,
      name: place.name,
      category: 'SNS',
      address: copy.detectedAddress,
      crowdLevel: place.confidence >= 0.9 ? 'mid' : 'low',
      lat: place.lat,
      lng: place.lng,
      stayMinutes: 45,
      startTime: 'Flexible',
      description: place.reason,
      tags: ['sns', 'analysis'],
    }));

    const plan = createLocalRoutePlan({
      id: `analysis-${result.video_id}`,
      title: copy.routeTitle,
      theme: 'mood',
      detail: 'analysis',
      summary: copy.routeSummary.replace('{title}', result.title),
      stops,
    });

    try {
      window.localStorage.setItem(CURRENT_ROUTE_STORAGE_KEY, JSON.stringify(plan));
      toast(copy.routeSaved, 'success');
      router.push(`/${locale}/route`);
    } catch {
      toast(copy.routeSaveFailed, 'error');
    }
  }

  function viewFirstResultOnMap() {
    if (!result) return;
    const first = placesWithCoordinates(result.places)[0];
    if (first) viewPlaceOnMap(first);
  }

  return (
    <AppLayout activeTab="analyze">
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
        <div className="space-y-4 px-4 pb-6 pt-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Sparkles size={18} className="text-[#FF3A5C]" />
              {copy.title}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-white/40">
              {copy.subtitle}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-400/10 px-2.5 py-1 text-xs font-semibold text-red-200">
                <Youtube size={12} />
                {copy.youtubeSupported}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-400/10 px-2.5 py-1 text-xs font-semibold text-pink-200">
                <Instagram size={12} />
                {copy.instagramPending}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <InputIcon
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${isInstagramInput ? 'text-pink-300' : 'text-red-400'}`}
              />
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setStatus('idle');
                  setResult(null);
                  setErrorMsg('');
                  setLoadingStepIndex(0);
                }}
                placeholder={copy.inputPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-white/8 py-3 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#FF3A5C]/50"
              />
            </div>

            {url && !urlValid && !isInstagramInput && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={12} />
                {isYoutubeInput ? copy.invalidUrl : copy.unsupportedUrl}
              </p>
            )}

            {isInstagramInput && (
              <div className="flex items-start gap-2 rounded-xl border border-pink-300/20 bg-pink-300/10 p-3">
                <Instagram size={15} className="mt-0.5 shrink-0 text-pink-200" />
                <div>
                  <p className="text-xs font-semibold text-pink-100">{copy.instagramPendingTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-pink-50/65">{copy.instagramPendingBody}</p>
                </div>
              </div>
            )}

            {videoId && (
              <div className="relative h-32 overflow-hidden rounded-xl bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbnailUrl(videoId)}
                  alt={copy.thumbnailAlt}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <Youtube size={12} className="text-red-400" />
                  <span className="font-mono text-xs text-white/80">{videoId}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => void analyze()}
              disabled={!urlValid || status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'loading' ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {copy.loadingButton}
                </>
              ) : (
                <>
                  <Search size={16} />
                  {copy.analyzeButton}
                </>
              )}
            </button>

            <div>
              <p className="mb-1.5 text-xs text-white/30">{copy.examplesLabel}</p>
              <div className="space-y-2">
                {EXAMPLE_URLS.map((exampleUrl) => {
                  const platform = detectSnsPlatform(exampleUrl);
                  const ExampleIcon = platform === 'instagram' ? Instagram : Youtube;
                  const platformLabel = platform === 'instagram' ? copy.instagramPending : copy.youtubeSupported;

                  return (
                    <button
                      key={exampleUrl}
                      type="button"
                      onClick={() => setExample(exampleUrl)}
                      disabled={status === 'loading'}
                      aria-label={`${copy.examplesLabel}: ${exampleUrl}`}
                      className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-colors hover:border-[#FF3A5C]/30 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        platform === 'instagram' ? 'bg-pink-400/10 text-pink-200' : 'bg-red-400/10 text-red-200'
                      }`}>
                        <ExampleIcon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-white/70">{platformLabel}</span>
                        <span className="block truncate font-mono text-[11px] text-white/35">{exampleUrl}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {status === 'loading' && (
            <div role="status" aria-live="polite" className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-2.5">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-[#FF3A5C]" />
                <div>
                  <p className="text-sm font-semibold text-white">{copy.loadingTitle}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/45">{copy.loadingEstimate}</p>
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#FF3A5C] transition-all duration-500"
                  style={{ width: `${((loadingStepIndex + 1) / copy.loadingSteps.length) * 100}%` }}
                />
              </div>

              <div className="space-y-2">
                {copy.loadingSteps.map((step, i) => {
                  const complete = i < loadingStepIndex;
                  const active = i === loadingStepIndex;

                  return (
                    <div key={step} className="flex items-center gap-2">
                      {complete ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                      ) : active ? (
                        <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#FF3A5C] border-t-transparent" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border border-white/15 bg-white/5" />
                      )}
                      <span className={`text-xs ${active ? 'font-semibold text-white' : complete ? 'text-white/65' : 'text-white/35'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs leading-5 text-white/40">{copy.loadingColdStart}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-400">{copy.errorTitle}</p>
                  <p className="mt-0.5 text-xs text-red-400/70">{errorMsg}</p>
                </div>
              </div>
              <button
                onClick={() => void analyze()}
                className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
              >
                <RotateCcw size={12} />
                {copy.retry}
              </button>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {copy.foundSpots.replace('{count}', String(result.places.length))}
                  </p>
                  <p className="truncate text-xs text-white/40">{result.title}</p>
                </div>
                <span className="shrink-0 rounded-full bg-purple-400/10 px-2 py-0.5 text-xs font-semibold text-purple-400">
                  {result.cached ? copy.sourceCache : result.source === 'worker' ? copy.sourceWorker : copy.sourceMock}
                </span>
              </div>

              {result.places.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{copy.emptyTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-white/45">{copy.emptyBody}</p>
                  <button
                    type="button"
                    onClick={() => setExample(EXAMPLE_URLS[0]!)}
                    className="mt-3 flex items-center gap-2 rounded-xl border border-[#FF3A5C]/30 bg-[#FF3A5C]/10 px-3 py-2 text-sm font-semibold text-[#FF8BA0] transition-colors hover:border-[#FF3A5C]/60 hover:bg-[#FF3A5C]/20 hover:text-white"
                  >
                    <Youtube size={15} />
                    {copy.tryExample}
                  </button>
                </div>
              ) : (
                result.places.map((place, idx) => {
                  const coordinateText = place.lat !== null && place.lng !== null
                    ? `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`
                    : '';
                  const hasCoordinates = Boolean(coordinateText);
                  const confidencePercent = Math.max(0, Math.min(100, Math.round(place.confidence * 100)));
                  const showEstimatedLocation = !hasCoordinates || confidencePercent < 80;

                  return (
                    <button
                      key={`${place.name}-${idx}`}
                      type="button"
                      onClick={() => viewPlaceOnMap(place, true)}
                      disabled={!hasCoordinates}
                      aria-label={`${copy.viewOnMap}: ${place.name}`}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-[#FF3A5C]/35 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF3A5C] text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{place.name}</p>
                        {hasCoordinates && (
                          <p className="text-xs text-white/40">{coordinateText}</p>
                        )}
                        {showEstimatedLocation && (
                          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-200">
                            <AlertCircle size={10} />
                            {copy.estimatedLocation}
                          </p>
                        )}
                        {place.reason && <p className="mt-1 line-clamp-2 text-xs text-white/35">{place.reason}</p>}
                        <div
                          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
                          role="progressbar"
                          aria-label={`${copy.confidence} ${confidencePercent}%`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={confidencePercent}
                        >
                          <div
                            className="h-full rounded-full bg-[#FF3A5C] transition-all duration-300"
                            style={{ width: `${confidencePercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-[#FF3A5C]">
                          {confidencePercent}%
                        </p>
                        <p className="text-[10px] text-white/30">{copy.confidence}</p>
                        {hasCoordinates && (
                          <span className="mt-2 inline-flex rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/70">
                            {copy.map}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={viewFirstResultOnMap}
                  disabled={placesWithCoordinates(result.places).length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MapPin size={14} />
                  {copy.viewOnMap}
                </button>
                <button
                  type="button"
                  onClick={saveAnalysisRoute}
                  disabled={placesWithCoordinates(result.places).length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Compass size={14} />
                  {copy.buildRoute}
                </button>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-white/70">{copy.localModeTitle}</p>
                <p className="mt-0.5 text-xs leading-5 text-white/40">
                  {copy.localModeBody}
                </p>
              </div>
            </div>
          )}

          {videoId && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/45 transition-colors hover:border-white/20 hover:text-white/70"
            >
              <ExternalLink size={12} />
              {copy.openVideo}
            </a>
          )}

          {isInstagramInput && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-semibold text-white/45 transition-colors hover:border-white/20 hover:text-white/70"
            >
              <ExternalLink size={12} />
              {copy.openPost}
            </a>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
