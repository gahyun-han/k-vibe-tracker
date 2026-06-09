'use client';

import { useTranslations } from 'next-intl';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';

const MOCK_ROUTE = {
  title: 'BTS 감성 성수 하루',
  spots: [
    { order: 1, name: '성수동 카페거리',  category: '☕', time: '10:00', duration: '1.5h', walk: '도보 8분' },
    { order: 2, name: '어반소스 빈티지샵', category: '🛍',  time: '11:40', duration: '45min', walk: '도보 5분' },
    { order: 3, name: '레코드샵 Vinyl',   category: '🎵', time: '12:30', duration: '30min', walk: '도보 12분' },
    { order: 4, name: '서울숲 피크닉',    category: '🌿', time: '13:30', duration: '1h', walk: '도보 15분' },
  ],
  totalTime: '3.5h',
  totalDist: '2.4km',
};

export default function RoutePage() {
  const t = useTranslations('route');
  const [isGenerating, setIsGenerating] = useState(false);
  const [route, setRoute] = useState<typeof MOCK_ROUTE | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRoute(MOCK_ROUTE);
    setIsGenerating(false);
  }

  return (
    <AppLayout activeTab="route" title={t('title')}>
      <div className="px-4 pt-4 pb-24">

        {!route && !isGenerating && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
            <div className="text-6xl">🧭</div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{t('empty_title')}</h3>
              <p className="text-[#8B8BA8] text-sm">{t('empty_desc')}</p>
            </div>
            <button
              onClick={handleGenerate}
              className="px-8 py-3.5 bg-[#FF3A5C] text-white font-bold rounded-2xl"
            >
              {t('create_btn')}
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-[#FF3A5C]/30 border-t-[#FF3A5C] rounded-full animate-spin" />
            <p className="text-white font-semibold">AI가 루트를 만들고 있어요...</p>
            <p className="text-[#8B8BA8] text-sm">선택한 무드 분석 중</p>
          </div>
        )}

        {route && (
          <div className="animate-fade-in">
            {/* 루트 헤더 */}
            <div className="bg-gradient-to-r from-[#FF3A5C]/20 to-[#7C3AED]/20 rounded-2xl p-4 border border-[#2E2E4A] mb-5">
              <p className="text-[#FF3A5C] text-xs font-bold mb-1">AI GENERATED</p>
              <h3 className="text-white font-bold text-lg">{route.title}</h3>
              <div className="flex gap-4 mt-2">
                <span className="text-[#8B8BA8] text-xs">⏱ {route.totalTime}</span>
                <span className="text-[#8B8BA8] text-xs">📍 {route.totalDist}</span>
                <span className="text-[#8B8BA8] text-xs">🏠 {route.spots.length} spots</span>
              </div>
            </div>

            {/* 스팟 타임라인 */}
            <div className="relative">
              <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-[#2E2E4A]" />
              {route.spots.map((spot, i) => (
                <div key={spot.order} className="flex gap-4 mb-4 last:mb-0 relative">
                  <div className="w-12 h-12 rounded-full bg-[#FF3A5C] flex items-center justify-center text-white font-bold text-sm z-10 shrink-0">
                    {spot.order}
                  </div>
                  <div className="flex-1 bg-[#1E1E30] rounded-2xl p-3 border border-[#2E2E4A]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{spot.category} {spot.name}</p>
                        <p className="text-[#8B8BA8] text-xs mt-0.5">{spot.time} · {spot.duration}</p>
                      </div>
                    </div>
                    {i < route.spots.length - 1 && (
                      <p className="text-[#8B8BA8] text-xs mt-2 pt-2 border-t border-[#2E2E4A]">→ {spot.walk}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 mt-5">
              <button className="flex-1 py-3.5 bg-[#FF3A5C] text-white font-bold text-sm rounded-2xl">
                🗺 {t('start_nav')}
              </button>
              <button className="px-5 py-3.5 bg-[#1E1E30] text-[#8B8BA8] text-sm rounded-2xl border border-[#2E2E4A]">
                🔗 Share
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
