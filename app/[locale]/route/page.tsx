'use client';

import { useState, useCallback } from 'react';
import { GripVertical, X, Clock, MapPin, Plus, Share2, Navigation } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CrowdBadge, CrowdLevel } from '@/components/route/CrowdBadge';
import { totalRouteMinutes } from '@/lib/haversine';

interface RouteSpot {
  id: string;
  name: string;
  category: string;
  address: string;
  crowdLevel: CrowdLevel;
  lat: number;
  lng: number;
  stayMinutes: number; // 예상 체류 시간
}

const INITIAL_SPOTS: RouteSpot[] = [
  { id: '1', name: '경복궁', category: '🏛️ 문화', address: '서울 종로구', crowdLevel: 'high', lat: 37.5796, lng: 126.977, stayMinutes: 90 },
  { id: '2', name: '광장시장', category: '🍜 맛집', address: '서울 종로구', crowdLevel: 'mid', lat: 37.570, lng: 126.999, stayMinutes: 60 },
  { id: '3', name: '남산타워', category: '📸 포토', address: '서울 용산구', crowdLevel: 'low', lat: 37.5512, lng: 126.988, stayMinutes: 60 },
];

export default function RoutePage() {
  const [spots, setSpots] = useState<RouteSpot[]>(INITIAL_SPOTS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // ─── 간단한 drag-and-drop (HTML5 DnD API) ──────────────────────────────────
  const onDragStart = useCallback((id: string) => setDraggingId(id), []);
  const onDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);
  const onDrop = useCallback((targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setSpots((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((s) => s.id === draggingId);
      const toIdx = arr.findIndex((s) => s.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDraggingId(null);
    setDragOverId(null);
  }, [draggingId]);
  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  const removeSpot = (id: string) => setSpots((p) => p.filter((s) => s.id !== id));

  // ─── 통계 ────────────────────────────────────────────────────────────────────
  const walkMin = totalRouteMinutes(spots.map((s) => ({ lat: s.lat, lng: s.lng })));
  const stayMin = spots.reduce((acc, s) => acc + s.stayMinutes, 0);
  const totalMin = walkMin + stayMin;
  const totalH = Math.floor(totalMin / 60);
  const totalM = totalMin % 60;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#0D0D1A] overflow-y-auto pb-24">
        {/* 헤더 */}
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-base font-bold text-white">내 루트</h2>
          <p className="text-xs text-white/40 mt-0.5">드래그로 순서를 바꿀 수 있어요</p>
        </div>

        {/* 통계 카드 */}
        <div className="mx-4 mb-4 grid grid-cols-3 gap-2">
          {[
            { label: '장소', value: `${spots.length}곳`, icon: MapPin },
            { label: '이동', value: `${walkMin}분`, icon: Navigation },
            { label: '총 시간', value: `${totalH}h ${totalM}m`, icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <Icon size={14} className="text-[#FF3A5C] mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-[10px] text-white/40">{label}</p>
            </div>
          ))}
        </div>

        {/* 루트 스팟 리스트 */}
        <div className="px-4 space-y-2">
          {spots.map((spot, idx) => (
            <div
              key={spot.id}
              draggable
              onDragStart={() => onDragStart(spot.id)}
              onDragOver={(e) => onDragOver(e, spot.id)}
              onDrop={() => onDrop(spot.id)}
              onDragEnd={onDragEnd}
              className={`relative flex items-center gap-3 bg-white/5 border rounded-xl p-3 transition-all cursor-grab active:cursor-grabbing
                ${dragOverId === spot.id ? 'border-[#FF3A5C]/60 bg-[#FF3A5C]/5' : 'border-white/10'}
                ${draggingId === spot.id ? 'opacity-40' : 'opacity-100'}`}
            >
              {/* 순서 번호 */}
              <div className="w-7 h-7 rounded-full bg-[#FF3A5C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-white">{spot.name}</p>
                  <CrowdBadge level={spot.crowdLevel} size="sm" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/40">{spot.category}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/40">체류 {spot.stayMinutes}분</span>
                </div>
              </div>

              {/* 드래그 핸들 + 삭제 */}
              <div className="flex items-center gap-1 shrink-0">
                <GripVertical size={16} className="text-white/20" />
                <button
                  onClick={() => removeSpot(spot.id)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* 이동 시간 (다음 스팟까지) */}
              {idx < spots.length - 1 && (
                <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A2E] border border-white/10 text-white/40 whitespace-nowrap">
                    도보 {Math.ceil(totalRouteMinutes([
                      { lat: spots[idx].lat, lng: spots[idx].lng },
                      { lat: spots[idx + 1].lat, lng: spots[idx + 1].lng },
                    ]))}분
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* 장소 추가 버튼 */}
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-white/40 hover:border-[#FF3A5C]/50 hover:text-[#FF3A5C]/70 transition-colors text-sm mt-3">
            <Plus size={16} />
            장소 추가
          </button>
        </div>

        {/* 하단 액션 버튼 */}
        {spots.length > 0 && (
          <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4">
            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-xl bg-[#FF3A5C] text-white font-semibold text-sm hover:bg-[#e02e4e] transition-colors flex items-center justify-center gap-2">
                <Navigation size={16} />
                길 안내 시작
              </button>
              <button className="px-4 py-3 rounded-xl bg-white/10 text-white/70 font-semibold text-sm hover:bg-white/20 transition-colors flex items-center gap-1.5">
                <Share2 size={16} />
                공유
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
