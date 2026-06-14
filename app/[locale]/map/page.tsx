'use client';

import { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CategoryFilter, Category } from '@/components/map/CategoryFilter';
import { PlaceDetailModal, Place } from '@/components/map/PlaceDetailModal';

// ─── Mock data (TourAPI 연동 시 교체) ────────────────────────────────────────
const MOCK_PLACES: Place[] = [
  {
    id: '1', name: '성수동 카페거리', category: 'cafe',
    address: '서울 성동구 성수이로 78', lat: 37.5447, lng: 127.0564,
    openHours: '09:00 – 22:00', rating: 4.7, reviewCount: 1820,
    crowdLevel: 'mid', tags: ['감성카페', '루프탑', '인스타'],
  },
  {
    id: '2', name: '경복궁', category: 'culture',
    address: '서울 종로구 사직로 161', lat: 37.5796, lng: 126.9770,
    openHours: '09:00 – 18:00', phone: '02-3700-3900',
    rating: 4.9, reviewCount: 8342, crowdLevel: 'high',
    tags: ['한복', '궁궐', '역사', '야경'],
  },
  {
    id: '3', name: '홍대 놀이터', category: 'fun',
    address: '서울 마포구 어울마당로 35', lat: 37.5519, lng: 126.9227,
    openHours: '24시간', rating: 4.4, reviewCount: 3201,
    crowdLevel: 'high', tags: ['버스킹', '자유'],
  },
  {
    id: '4', name: '광장시장 마약김밥', category: 'food',
    address: '서울 종로구 창경궁로 88', lat: 37.5700, lng: 126.9996,
    openHours: '08:00 – 23:00', rating: 4.8, reviewCount: 5401,
    crowdLevel: 'mid', tags: ['마약김밥', '빈대떡', '전통시장'],
  },
  {
    id: '5', name: '남산타워 포토스팟', category: 'photo',
    address: '서울 용산구 남산공원길 105', lat: 37.5512, lng: 126.9882,
    openHours: '10:00 – 23:00', phone: '02-3455-9277',
    rating: 4.8, reviewCount: 6150, crowdLevel: 'low',
    tags: ['야경', '전망', '서울뷰'],
  },
  {
    id: '6', name: '한강공원 여의도', category: 'all',
    address: '서울 영등포구 여의동로 330', lat: 37.5284, lng: 126.9341,
    openHours: '24시간', rating: 4.6, reviewCount: 9102,
    crowdLevel: 'low', tags: ['피크닉', '자전거', '치맥'],
  },
];

const CROWD_DOT: Record<string, string> = {
  low: 'bg-emerald-400', mid: 'bg-yellow-400', high: 'bg-red-400',
};
const CROWD_LABEL: Record<string, string> = {
  low: '여유', mid: '보통', high: '혼잡',
};
const CAT_EMOJI: Record<string, string> = {
  cafe: '☕', culture: '🏛️', photo: '📸', fun: '🎮', food: '🍜', stay: '🏨', all: '📍',
};

export default function MapPage() {
  const [categories, setCategories] = useState<Category[]>(['all']);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [search, setSearch] = useState('');

  const filtered = MOCK_PLACES.filter((p) => {
    const matchCat = categories.includes('all') || categories.includes(p.category as Category);
    const matchSearch = !search || p.name.includes(search) || p.tags?.some((t) => t.includes(search));
    return matchCat && matchSearch;
  });

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#0D0D1A]">
        {/* 지도 영역 — Kakao Maps JS API 연동 시 교체 */}
        <div className="relative flex-1 min-h-0 bg-[#111122]">
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-white/30">
            <MapPin size={48} />
            <p className="text-sm font-medium">Kakao Maps API 연동 예정</p>
            <p className="text-xs">NEXT_PUBLIC_KAKAO_MAP_KEY 설정 후 활성화</p>
          </div>
          <button className="absolute right-4 bottom-4 p-3 rounded-full bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30 hover:bg-[#e02e4e] transition-colors">
            <Navigation size={20} />
          </button>
        </div>

        {/* 하단 패널 */}
        <div className="bg-[#0D0D1A] border-t border-white/10">
          <div className="px-4 pt-3 pb-2 space-y-2">
            {/* 검색 */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="장소 검색..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/8 border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-[#FF3A5C]/50"
              />
            </div>
            {/* 카테고리 필터 */}
            <CategoryFilter selected={categories} onChange={setCategories} />
          </div>

          {/* 장소 목록 */}
          <div className="overflow-y-auto max-h-56 pb-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">검색 결과가 없어요</div>
            ) : (
              filtered.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                    {CAT_EMOJI[place.category] ?? '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{place.name}</p>
                      {place.crowdLevel && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CROWD_DOT[place.crowdLevel]}`} />
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate">{place.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {place.rating && <p className="text-xs text-yellow-400 font-semibold">★ {place.rating}</p>}
                    {place.crowdLevel && (
                      <p className={`text-xs ${place.crowdLevel === 'low' ? 'text-emerald-400' : place.crowdLevel === 'mid' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {CROWD_LABEL[place.crowdLevel]}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 장소 상세 모달 */}
        <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      </div>
    </AppLayout>
  );
}
