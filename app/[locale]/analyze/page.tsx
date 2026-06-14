'use client';

import { useState } from 'react';
import { Search, Youtube, MapPin, Sparkles, AlertCircle, ExternalLink, RotateCcw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { isValidYoutubeUrl, extractVideoId, getThumbnailUrl } from '@/lib/youtube';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface PlaceResult {
  name: string;
  lat: number | null;
  lng: number | null;
  confidence: number;
}

interface AnalysisResult {
  videoId: string;
  title: string;
  places: PlaceResult[];
  cached: boolean;
}

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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'AI_WORKER_ERROR');
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus('success');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'UNKNOWN_ERROR');
      setStatus('error');
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#0D0D1A] overflow-y-auto pb-24">
        <div className="px-4 pt-4 pb-6 space-y-4">
          {/* 헤더 */}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#FF3A5C]" />
              SNS Spot Analyzer
            </h2>
            <p className="text-xs text-white/40 mt-0.5">YouTube 영상 속 장소를 AI로 분석해요</p>
          </div>

          {/* URL 입력 */}
          <div className="space-y-2">
            <div className="relative">
              <Youtube size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              <input
                value={url}
                onChange={(e) => { setUrl(e.target.value); setStatus('idle'); }}
                placeholder="YouTube URL을 붙여넣으세요"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-[#FF3A5C]/50 transition-colors"
              />
            </div>

            {/* URL 유효성 표시 */}
            {url && !urlValid && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12} />
                YouTube URL이 아닌 것 같아요
              </p>
            )}

            {/* 썸네일 미리보기 */}
            {videoId && (
              <div className="relative rounded-xl overflow-hidden h-32 bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getThumbnailUrl(videoId)}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <Youtube size={12} className="text-red-400" />
                  <span className="text-xs text-white/80 font-mono">{videoId}</span>
                </div>
              </div>
            )}

            {/* 분석 버튼 */}
            <button
              onClick={analyze}
              disabled={!urlValid || status === 'loading'}
              className="w-full py-3 rounded-xl bg-[#FF3A5C] text-white font-semibold text-sm
                disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e02e4e] transition-colors
                flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI 분석 중... (최대 10초)
                </>
              ) : (
                <>
                  <Search size={16} />
                  장소 분석하기
                </>
              )}
            </button>

            {/* 예시 URL */}
            <div>
              <p className="text-xs text-white/30 mb-1.5">예시 URL</p>
              <div className="space-y-1">
                {EXAMPLE_URLS.map((u) => (
                  <button
                    key={u}
                    onClick={() => setUrl(u)}
                    className="w-full text-left text-xs text-white/40 hover:text-white/70 transition-colors py-1 px-2 rounded-lg hover:bg-white/5 truncate"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 로딩 상태 */}
          {status === 'loading' && (
            <div className="bg-white/5 rounded-xl p-4 space-y-2">
              {['영상 메타데이터 분석 중', 'AI 장소명 추출 중', 'TourAPI 좌표 매핑 중'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 animate-spin border-t-transparent
                    ${i === 0 ? 'border-[#FF3A5C]' : 'border-white/20'}`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                  <span className="text-xs text-white/50">{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* 에러 */}
          {status === 'error' && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">분석 실패</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{errorMsg}</p>
                </div>
              </div>
              <button
                onClick={analyze}
                className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
              >
                <RotateCcw size={12} />
                다시 시도
              </button>
            </div>
          )}

          {/* 결과 */}
          {status === 'success' && result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  발견된 장소 {result.places.length}곳
                </p>
                {result.cached && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400 font-semibold">
                    캐시 결과
                  </span>
                )}
              </div>

              <p className="text-xs text-white/40 truncate">📹 {result.title}</p>

              {result.places.map((place, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#FF3A5C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{place.name}</p>
                    {place.lat && place.lng && (
                      <p className="text-xs text-white/40">
                        {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-[#FF3A5C]">
                      {Math.round(place.confidence * 100)}%
                    </p>
                    <p className="text-[10px] text-white/30">확신도</p>
                  </div>
                </div>
              ))}

              <button className="w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <MapPin size={14} />
                지도에서 보기
              </button>
            </div>
          )}

          {/* AI 워커 상태 안내 */}
          {status === 'idle' && (
            <div className="bg-white/5 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white/70">AI 워커 상태</p>
                <p className="text-xs text-white/40 mt-0.5">
                  OpenAI API 키 연동 전까지 목 데이터로 동작해요.
                  <br />
                  AI 워커: <code className="text-purple-400">ai-worker/main.py</code> (Render.com 배포)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
