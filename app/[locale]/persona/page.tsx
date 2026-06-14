'use client';

import { useState } from 'react';
import { ChevronRight, Sparkles, RotateCcw, Share2, MapPin, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { CrowdBadge, CrowdLevel } from '@/components/route/CrowdBadge';
import { totalRouteMinutes } from '@/lib/haversine';

// ─── 스텝 1: 카테고리 ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'kpop',   label: 'K-POP 아이돌', emoji: '🎤', desc: 'BTS, BLACKPINK 등' },
  { id: 'drama',  label: 'K-드라마',     emoji: '🎬', desc: '촬영지 투어' },
  { id: 'mood',   label: '무드 여행',     emoji: '🌙', desc: '감성/로맨틱/힐링' },
];

// ─── 스텝 2: 세부 선택 (카테고리별) ──────────────────────────────────────────
const DETAIL_MAP: Record<string, { id: string; label: string; emoji: string }[]> = {
  kpop: [
    { id: 'bts',       label: 'BTS',       emoji: '💜' },
    { id: 'blackpink', label: 'BLACKPINK', emoji: '🩷' },
    { id: 'aespa',     label: 'aespa',     emoji: '🤖' },
    { id: 'ive',       label: 'IVE',       emoji: '🌹' },
    { id: 'newjeans',  label: 'NewJeans',  emoji: '🐰' },
    { id: 'stray',     label: 'Stray Kids', emoji: '🐺' },
  ],
  drama: [
    { id: 'squid',    label: '오징어 게임',           emoji: '🦑' },
    { id: 'goblin',   label: '도깨비',               emoji: '👻' },
    { id: 'itaewon',  label: '이태원 클라쓰',         emoji: '🍺' },
    { id: 'youngwoo', label: '이상한 변호사 우영우',    emoji: '🐳' },
    { id: 'crash',    label: '지금 거신 전화는',       emoji: '📞' },
  ],
  mood: [
    { id: 'romantic', label: '로맨틱',  emoji: '🌹' },
    { id: 'healing',  label: '힐링',   emoji: '🌿' },
    { id: 'cafe',     label: '카페 투어', emoji: '☕' },
    { id: 'night',    label: '야경',   emoji: '🌃' },
    { id: 'nature',   label: '자연',   emoji: '🏞️' },
    { id: 'food',     label: '미식',   emoji: '🍜' },
  ],
};

// ─── 목 루트 결과 ─────────────────────────────────────────────────────────────
const MOCK_ROUTE = [
  { id: '1', name: '한강공원 뚝섬',   emoji: '🌊', address: '서울 광진구',   time: '09:00', crowdLevel: 'low' as CrowdLevel,  stayMin: 60,  lat: 37.5300, lng: 127.0661 },
  { id: '2', name: '성수동 카페거리', emoji: '☕', address: '서울 성동구',   time: '11:00', crowdLevel: 'mid' as CrowdLevel,  stayMin: 90,  lat: 37.5447, lng: 127.0564 },
  { id: '3', name: '광장시장',        emoji: '🍜', address: '서울 종로구',   time: '13:00', crowdLevel: 'high' as CrowdLevel, stayMin: 60,  lat: 37.5700, lng: 126.9996 },
  { id: '4', name: '경복궁',          emoji: '🏛️', address: '서울 종로구',   time: '15:00', crowdLevel: 'high' as CrowdLevel, stayMin: 90,  lat: 37.5796, lng: 126.9770 },
  { id: '5', name: '남산타워',        emoji: '🗼', address: '서울 용산구',   time: '18:00', crowdLevel: 'mid' as CrowdLevel,  stayMin: 60,  lat: 37.5512, lng: 126.9882 },
];

type Step = 1 | 2 | 3;

export default function PersonaPage() {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState('');
  const [detail, setDetail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const walkMin = totalRouteMinutes(MOCK_ROUTE.map((s) => ({ lat: s.lat, lng: s.lng })));
  const totalMin = walkMin + MOCK_ROUTE.reduce((a, s) => a + s.stayMin, 0);

  function generate() {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setDone(true); }, 1800);
  }

  function reset() {
    setStep(1); setCategory(''); setDetail(''); setDone(false);
  }

  async function share() {
    const text = `K-Vibe 오늘의 루트: ${MOCK_ROUTE.map((s) => s.name).join(' → ')}`;
    if (navigator.share) {
      await navigator.share({ title: 'K-Vibe 루트', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      alert('링크 복사됨!');
    }
  }

  // ── 루트 결과 화면 ──────────────────────────────────────────────────────────
  if (done) return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#0D0D1A] overflow-y-auto pb-24">
        <div className="px-4 pt-4 space-y-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#FF3A5C] font-semibold">AI 생성 루트</p>
              <h2 className="text-base font-bold text-white mt-0.5">
                {CATEGORIES.find((c) => c.id === category)?.emoji}{' '}
                {DETAIL_MAP[category]?.find((d) => d.id === detail)?.label ?? category}의 하루
              </h2>
              <p className="text-xs text-white/40 mt-0.5">서울 · 총 {Math.floor(totalMin / 60)}시간 {totalMin % 60}분</p>
            </div>
            <button onClick={reset} className="p-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20">
              <RotateCcw size={16} />
            </button>
          </div>

          {/* 타임라인 */}
          <div className="space-y-3">
            {MOCK_ROUTE.map((spot, idx) => (
              <div key={spot.id} className="flex gap-3">
                {/* 타임라인 선 */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#FF3A5C] text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  {idx < MOCK_ROUTE.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 mt-1 mb-1 min-h-[16px]" />
                  )}
                </div>

                {/* 카드 */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 mb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{spot.emoji}</span>
                        <p className="text-sm font-semibold text-white">{spot.name}</p>
                        <CrowdBadge level={spot.crowdLevel} size="sm" />
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{spot.address}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-[#FF3A5C]">{spot.time}</p>
                      <p className="text-[10px] text-white/30">{spot.stayMin}분</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 공유 / 루트 저장 */}
          <div className="flex gap-2">
            <button className="flex-1 py-3 rounded-xl bg-[#FF3A5C] text-white font-semibold text-sm flex items-center justify-center gap-2">
              <MapPin size={16} />
              루트 저장
            </button>
            <button
              onClick={share}
              className="px-4 py-3 rounded-xl bg-white/10 text-white/70 text-sm font-semibold flex items-center gap-1.5 hover:bg-white/20"
            >
              <Share2 size={16} />
              공유
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );

  // ── 스텝 UI ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-[#0D0D1A] pb-24">
        {/* 스텝 인디케이터 */}
        <div className="px-4 pt-4">
          <div className="flex gap-1.5 mb-4">
            {([1, 2] as const).map((s) => (
              <div key={s} className={`h-1 rounded-full flex-1 transition-all ${step >= s ? 'bg-[#FF3A5C]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {/* 스텝 1: 카테고리 */}
          {step === 1 && (
            <>
              <h2 className="text-base font-bold text-white">어떤 여행을 원하세요?</h2>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); setStep(2); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#FF3A5C]/50 hover:bg-[#FF3A5C]/5 transition-all text-left"
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">{c.label}</p>
                    <p className="text-xs text-white/40">{c.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30 ml-auto" />
                </button>
              ))}
            </>
          )}

          {/* 스텝 2: 세부 선택 */}
          {step === 2 && (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className="text-white/40 hover:text-white text-sm">←</button>
                <h2 className="text-base font-bold text-white">구체적으로 선택해주세요</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(DETAIL_MAP[category] ?? []).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDetail(d.id)}
                    className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all
                      ${detail === d.id
                        ? 'bg-[#FF3A5C]/20 border-[#FF3A5C] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                  >
                    <span className="text-2xl">{d.emoji}</span>
                    <span className="text-sm font-medium text-center">{d.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 다음/생성 버튼 */}
        {step === 2 && (
          <div className="px-4 pb-4">
            <button
              onClick={generate}
              disabled={!detail || generating}
              className="w-full py-3 rounded-xl bg-[#FF3A5C] text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI 루트 생성 중...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  루트 생성하기
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
