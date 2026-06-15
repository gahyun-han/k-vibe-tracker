'use client';

import { useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  Youtube,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { extractVideoId, getThumbnailUrl, isValidYoutubeUrl } from '@/lib/youtube';
import type { AnalysisResult } from '@/lib/analysis';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

const EXAMPLE_URLS = [
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=BKorP55Aqvg',
];

export default function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const urlValid = isValidYoutubeUrl(url);
  const videoId = url ? extractVideoId(url) : null;

  async function analyze() {
    if (!urlValid) return;
    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: url }),
      });
      const data = (await res.json()) as AnalysisResult & { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? 'ANALYSIS_REQUEST_FAILED');
      }

      setResult(data);
      setStatus('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'ANALYSIS_REQUEST_FAILED');
      setStatus('error');
    }
  }

  function setExample(exampleUrl: string) {
    setUrl(exampleUrl);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  }

  return (
    <AppLayout activeTab="analyze">
      <div className="flex h-full flex-col overflow-y-auto bg-[#0D0D1A] pb-24">
        <div className="space-y-4 px-4 pb-6 pt-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Sparkles size={18} className="text-[#FF3A5C]" />
              SNS Spot Analyzer
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-white/40">
              Paste a YouTube URL to extract likely Seoul travel spots. Local mock analysis is used until AI is approved.
            </p>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setStatus('idle');
                  setResult(null);
                  setErrorMsg('');
                }}
                placeholder="Paste a YouTube URL"
                className="w-full rounded-xl border border-white/10 bg-white/8 py-3 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#FF3A5C]/50"
              />
            </div>

            {url && !urlValid && (
              <p className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={12} />
                This does not look like a supported YouTube URL.
              </p>
            )}

            {videoId && (
              <div className="relative h-32 overflow-hidden rounded-xl bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbnailUrl(videoId)}
                  alt="YouTube thumbnail"
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
              onClick={analyze}
              disabled={!urlValid || status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF3A5C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e02e4e] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'loading' ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing spots...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Analyze Spots
                </>
              )}
            </button>

            <div>
              <p className="mb-1.5 text-xs text-white/30">Example URLs</p>
              <div className="space-y-1">
                {EXAMPLE_URLS.map((exampleUrl) => (
                  <button
                    key={exampleUrl}
                    onClick={() => setExample(exampleUrl)}
                    className="w-full truncate rounded-lg px-2 py-1 text-left text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
                  >
                    {exampleUrl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {status === 'loading' && (
            <div className="space-y-2 rounded-xl bg-white/5 p-4">
              {['Validating URL', 'Building local spot candidates', 'Preparing map-ready results'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${
                      i === 0 ? 'border-[#FF3A5C]' : 'border-white/20'
                    }`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                  <span className="text-xs text-white/50">{step}</span>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-400">Analysis failed</p>
                  <p className="mt-0.5 text-xs text-red-400/70">{errorMsg}</p>
                </div>
              </div>
              <button
                onClick={analyze}
                className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Found {result.places.length} candidate spots
                  </p>
                  <p className="truncate text-xs text-white/40">{result.title}</p>
                </div>
                <span className="shrink-0 rounded-full bg-purple-400/10 px-2 py-0.5 text-xs font-semibold text-purple-400">
                  {result.source === 'worker' ? 'AI Worker' : 'Mock'}
                </span>
              </div>

              {result.places.map((place, idx) => (
                <div
                  key={`${place.name}-${idx}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF3A5C] text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{place.name}</p>
                    {place.lat !== null && place.lng !== null && (
                      <p className="text-xs text-white/40">
                        {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                      </p>
                    )}
                    {place.reason && <p className="mt-1 line-clamp-2 text-xs text-white/35">{place.reason}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-[#FF3A5C]">
                      {Math.round(place.confidence * 100)}%
                    </p>
                    <p className="text-[10px] text-white/30">confidence</p>
                  </div>
                </div>
              ))}

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/20">
                <MapPin size={14} />
                View on Map
              </button>
            </div>
          )}

          {status === 'idle' && (
            <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-white/70">Local-first analysis</p>
                <p className="mt-0.5 text-xs leading-5 text-white/40">
                  The API returns deterministic mock spot extraction unless
                  <code className="px-1 text-purple-400">ENABLE_AI_WORKER_ANALYSIS=true</code>
                  and an approved worker URL are configured.
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
              Open video
            </a>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
