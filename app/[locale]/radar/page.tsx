'use client';

import { useTranslations } from 'next-intl';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';

const MOCK_FACILITIES = [
  { id: '1', type: 'restroom', name: '성수역 공중화장실',   distance: 120, is24h: true,  isPublic: true  },
  { id: '2', type: 'restroom', name: '서울숲 공원 화장실',  distance: 340, is24h: true,  isPublic: true  },
  { id: '3', type: 'pharmacy', name: '성수 약국',           distance: 210, is24h: false, isPublic: true  },
  { id: '4', type: 'cafe_toilet', name: '스타벅스 성수점', distance: 80,  is24h: false, isPublic: false },
];

const TYPE_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  restroom:    { icon: '🚻', label: 'Restroom',  color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  pharmacy:    { icon: '💊', label: 'Pharmacy',  color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  cafe_toilet: { icon: '☕', label: 'Cafe WC',   color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

export default function RadarPage() {
  const t = useTranslations('radar');
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? MOCK_FACILITIES
    : MOCK_FACILITIES.filter((f) => f.type === filter);

  return (
    <AppLayout activeTab="radar" title={t('title')}>
      <div className="px-4 pt-4 pb-24">

        {/* 안내 배너 */}
        <div className="bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A] mb-4">
          <p className="text-white text-sm font-semibold mb-1">📡 {t('guide_title')}</p>
          <p className="text-[#8B8BA8] text-xs">{t('guide_desc')}</p>
        </div>

        {/* 필터 */}
        <div className="flex gap-2 mb-4">
          {['all', 'restroom', 'pharmacy', 'cafe_toilet'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === f
                  ? 'bg-[#FF3A5C] border-[#FF3A5C] text-white'
                  : 'bg-[#1E1E30] border-[#2E2E4A] text-[#8B8BA8]'
              }`}
            >
              {f === 'all' ? t('filter_all') : TYPE_LABELS[f]?.icon + ' ' + TYPE_LABELS[f]?.label}
            </button>
          ))}
        </div>

        {/* 결과 리스트 */}
        <div className="space-y-3">
          {filtered.map((f) => {
            const meta = TYPE_LABELS[f.type];
            return (
              <div key={f.id} className="bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#252540] flex items-center justify-center text-xl shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{f.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                      {f.is24h && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">24h</span>}
                      {!f.isPublic && <span className="text-xs text-[#8B8BA8]">이용 필요</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FF3A5C] font-bold text-sm">{f.distance}m</p>
                    <p className="text-[#8B8BA8] text-xs">도보 ~{Math.ceil(f.distance / 80)}min</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 bg-[#252540] text-[#8B8BA8] text-xs font-semibold rounded-xl hover:text-white transition-colors">
                  🗺 {t('navigate_btn')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
