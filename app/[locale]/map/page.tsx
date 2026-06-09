'use client';

import { useTranslations } from 'next-intl';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';

const MOCK_SPOTS = [
  { id: '1', name: '성수동 카페거리',    category: '☕ Cafe',     crowd: 72, vibe: '힙·빈티지',    hot: true  },
  { id: '2', name: '홍대 인생네컷',      category: '📸 Photo',   crowd: 45, vibe: '트렌디',        hot: false },
  { id: '3', name: '코인노래방 (강남)',   category: '🎤 Fun',     crowd: 31, vibe: '신나는',        hot: false },
  { id: '4', name: '북촌 한옥마을',      category: '🏛 Culture', crowd: 88, vibe: '전통·감성',     hot: true  },
  { id: '5', name: '망원동 방탈출',      category: '🔐 Escape',  crowd: 20, vibe: '스릴·재미',     hot: false },
];

function CrowdBadge({ level }: { level: number }) {
  if (level >= 70) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">🔴 Busy</span>;
  if (level >= 40) return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">🟡 Moderate</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">🟢 Calm</span>;
}

export default function MapPage() {
  const t = useTranslations('map');
  const [filter, setFilter] = useState<string>('all');

  const filters = ['all', 'cafe', 'photo', 'fun', 'culture'];

  return (
    <AppLayout activeTab="map" title={t('title')}>
      {/* 지도 영역 placeholder */}
      <div className="relative mx-4 mt-4 h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A3A2E] to-[#0D2E1A] flex items-center justify-center border border-[#2E2E4A]">
        <div className="text-center">
          <p className="text-4xl mb-2">🗺</p>
          <p className="text-[#8B8BA8] text-sm">Kakao Maps — Sprint 1에서 연동</p>
          <p className="text-[#8B8BA8] text-xs mt-1">현재 위치 기반 핀 표시 예정</p>
        </div>
        {/* 샘플 핀들 */}
        <span className="absolute top-8 left-12 text-2xl animate-bounce">📍</span>
        <span className="absolute top-16 right-16 text-2xl animate-bounce" style={{animationDelay:'0.3s'}}>📍</span>
        <span className="absolute bottom-10 left-1/2 text-2xl animate-bounce" style={{animationDelay:'0.6s'}}>📍</span>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto scrollbar-hide pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-[#FF3A5C] text-white'
                : 'bg-[#1E1E30] text-[#8B8BA8] border border-[#2E2E4A] hover:text-white'
            }`}
          >
            {t(`filter_${f}`)}
          </button>
        ))}
      </div>

      {/* 트렌딩 스팟 리스트 */}
      <div className="px-4 mt-4 pb-24">
        <h3 className="text-sm font-bold text-white mb-3">🔥 {t('trending_spots')}</h3>
        <div className="flex flex-col gap-3">
          {MOCK_SPOTS.map((spot) => (
            <div key={spot.id} className="bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A] active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {spot.hot && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF3A5C]/20 text-[#FF3A5C] font-bold">HOT</span>}
                    <span className="text-xs text-[#8B8BA8]">{spot.category}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{spot.name}</p>
                  <p className="text-[#8B8BA8] text-xs mt-0.5"># {spot.vibe}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <CrowdBadge level={spot.crowd} />
                  <span className="text-[#8B8BA8] text-xs">{spot.crowd}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
