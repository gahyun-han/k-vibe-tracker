'use client';

import { useState } from 'react';
import { Radar, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { RadiusSlider } from '@/components/radar/RadiusSlider';
import { FacilityCard, Facility } from '@/components/radar/FacilityCard';

type FacilityType = Facility['type'] | 'all';

const FILTER_TABS: { id: FacilityType; label: string; emoji: string }[] = [
  { id: 'all',         label: '전체',     emoji: '🗺️' },
  { id: 'restroom',    label: '화장실',   emoji: '🚻' },
  { id: 'pharmacy',    label: '약국',     emoji: '💊' },
  { id: 'convenience', label: '편의점',   emoji: '🏪' },
  { id: 'popup',       label: '팝업',     emoji: '🎪' },
];

const MOCK_FACILITIES: Facility[] = [
  {
    id: '1', type: 'restroom', name: '성수역 공중화장실',
    address: '서울 성동구 성수이로 78 지하 1층', distance: 120,
    is24h: true, hasDisabled: true, floor: '지하 1층',
    lat: 37.5447, lng: 127.0564,
  },
  {
    id: '2', type: 'pharmacy', name: '성수 온누리약국',
    address: '서울 성동구 성수일로 77', distance: 250,
    isOpen: true, lat: 37.5449, lng: 127.0571,
  },
  {
    id: '3', type: 'convenience', name: 'CU 성수점',
    address: '서울 성동구 성수이로 68', distance: 310,
    is24h: true, lat: 37.5443, lng: 127.0558,
  },
  {
    id: '4', type: 'popup', name: '무신사 팝업스토어',
    address: '서울 성동구 아차산로 113', distance: 480,
    isOpen: true, extra: '2026.06.01 – 2026.06.30 (잔여 16일)',
    lat: 37.5451, lng: 127.0580,
  },
  {
    id: '5', type: 'restroom', name: '뚝섬역 공중화장실',
    address: '서울 성동구 뚝섬로 지하 1층', distance: 620,
    is24h: false, hasDisabled: true, floor: '지하 1층',
    lat: 37.5468, lng: 127.0650,
  },
  {
    id: '6', type: 'cafe_toilet', name: '스타벅스 성수점 (화장실)',
    address: '서울 성동구 성수이로 99', distance: 750,
    is24h: false, extra: '음료 구매 고객 전용 (영수증 필요)',
    lat: 37.5440, lng: 127.0545,
  },
];

export default function RadarPage() {
  const [radius, setRadius] = useState(500);
  const [filter, setFilter] = useState<FacilityType>('all');
  const [loading, setLoading] = useState(false);

  const facilities = MOCK_FACILITIES
    .filter((f) => f.distance <= radius)
    .filter((f) => filter === 'all' || f.type === filter);

  function refresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#0D0D1A] overflow-y-auto pb-20">
        {/* 헤더 */}
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radar size={18} className="text-[#FF3A5C]" />
                주변 편의시설
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                현위치 기준 · {facilities.length}개 발견
              </p>
            </div>
            <button
              onClick={refresh}
              className={`p-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-colors ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* 반경 슬라이더 */}
          <div className="bg-white/5 rounded-xl p-3">
            <RadiusSlider value={radius} onChange={setRadius} />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${filter === id
                    ? 'bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 시설 목록 */}
        <div className="px-4 space-y-2">
          {facilities.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-3xl">🔍</p>
              <p className="text-white/40 text-sm">반경 내 시설이 없어요</p>
              <p className="text-white/30 text-xs">반경을 늘려보세요</p>
            </div>
          ) : (
            facilities
              .sort((a, b) => a.distance - b.distance)
              .map((f) => <FacilityCard key={f.id} facility={f} />)
          )}
        </div>

        {/* 데이터 출처 안내 */}
        <p className="text-center text-xs text-white/20 mt-6 mb-2 px-4">
          화장실 데이터: 행정안전부 공중화장실 API 연동 예정
        </p>
      </div>
    </AppLayout>
  );
}
