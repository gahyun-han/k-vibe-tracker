'use client';

import { useTranslations } from 'next-intl';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export default function AnalyzePage() {
  const t = useTranslations('analyze');
  const [url, setUrl] = useState('');
  const [state, setState] = useState<AnalysisState>('idle');
  const [error, setError] = useState('');

  function validateYoutubeUrl(val: string) {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(val);
  }

  async function handleAnalyze() {
    if (!url.trim()) return;
    if (!validateYoutubeUrl(url)) {
      setError(t('error_invalid_url'));
      return;
    }
    setError('');
    setState('loading');
    // Sprint 1에서 실제 API 연동 — 현재는 mock delay
    await new Promise((r) => setTimeout(r, 2200));
    setState('success');
  }

  function handleReset() {
    setUrl('');
    setState('idle');
    setError('');
  }

  return (
    <AppLayout activeTab="analyze" title={t('title')}>
      <div className="px-4 pt-4 pb-24">

        {/* 안내 카드 */}
        <div className="bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A] mb-5">
          <p className="text-white text-sm font-semibold mb-1">📹 {t('guide_title')}</p>
          <p className="text-[#8B8BA8] text-xs leading-relaxed">{t('guide_desc')}</p>
        </div>

        {/* URL 입력 */}
        <div className="mb-4">
          <label className="block text-xs text-[#8B8BA8] font-semibold mb-2 uppercase tracking-wider">
            YouTube URL
          </label>
          <div className={`flex gap-2 p-1 rounded-xl border transition-colors ${error ? 'border-red-500' : 'border-[#2E2E4A] focus-within:border-[#FF3A5C]'} bg-[#1E1E30]`}>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 outline-none placeholder:text-[#8B8BA8]"
              disabled={state === 'loading'}
            />
            {url && (
              <button onClick={handleReset} className="px-3 text-[#8B8BA8] hover:text-white text-lg">×</button>
            )}
          </div>
          {error && <p className="text-red-400 text-xs mt-1.5 pl-1">{error}</p>}
        </div>

        {/* 분석 버튼 */}
        <button
          onClick={handleAnalyze}
          disabled={!url.trim() || state === 'loading'}
          className="w-full py-4 bg-[#FF3A5C] disabled:bg-[#2E2E4A] disabled:text-[#8B8BA8] text-white font-bold rounded-2xl transition-colors"
        >
          {state === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('analyzing')}
            </span>
          ) : t('analyze_btn')}
        </button>

        {/* AI 준비 중 안내 */}
        {state === 'loading' && (
          <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
            <p className="text-blue-400 text-xs">☕ {t('ai_warmup')}</p>
          </div>
        )}

        {/* 결과 카드 (mock) */}
        {state === 'success' && (
          <div className="mt-5 bg-[#1E1E30] rounded-2xl border border-[#2E2E4A] overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-[#FF3A5C]/20 to-[#7C3AED]/20 px-4 py-3 border-b border-[#2E2E4A]">
              <p className="text-white font-bold text-sm">✅ {t('result_title')}</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[#8B8BA8] text-xs mb-1">{t('detected_place')}</p>
                <p className="text-white font-semibold">성수동 카페 골목</p>
                <p className="text-[#8B8BA8] text-xs">서울특별시 성동구 성수1가1동</p>
              </div>
              <div>
                <p className="text-[#8B8BA8] text-xs mb-1">{t('vibe_tags')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {['힙한', '빈티지', '카페', '감성', '인스타감성'].map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#FF3A5C]/20 text-[#FF3A5C] border border-[#FF3A5C]/30">{tag}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[#8B8BA8] text-xs mb-1">AI Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#252540] rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-[#FF3A5C] rounded-full" />
                  </div>
                  <span className="text-white text-xs font-bold">87%</span>
                </div>
              </div>
              <button className="w-full py-3 bg-[#FF3A5C] text-white font-bold text-sm rounded-xl mt-1">
                🗺 {t('show_on_map')}
              </button>
            </div>
          </div>
        )}

        {/* 예시 URL 안내 */}
        {state === 'idle' && (
          <div className="mt-6">
            <p className="text-[#8B8BA8] text-xs mb-3 font-semibold">{t('example_label')}</p>
            <div className="space-y-2">
              {[
                { label: 'K-pop MV 촬영지', url: 'youtube.com/watch?v=example1' },
                { label: '한국 여행 브이로그', url: 'youtube.com/watch?v=example2' },
              ].map((ex) => (
                <button
                  key={ex.url}
                  onClick={() => setUrl(`https://${ex.url}`)}
                  className="w-full flex items-center gap-3 p-3 bg-[#1E1E30] border border-[#2E2E4A] rounded-xl text-left hover:border-[#FF3A5C]/50 transition-colors"
                >
                  <span className="text-lg">▶</span>
                  <div>
                    <p className="text-white text-xs font-semibold">{ex.label}</p>
                    <p className="text-[#8B8BA8] text-xs">{ex.url}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
