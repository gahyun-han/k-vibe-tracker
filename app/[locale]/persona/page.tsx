'use client';

import { useTranslations } from 'next-intl';
import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const MOOD_TAGS = ['힙한', '조용한', '활기찬', '로맨틱', '빈티지', '모던', '전통적', '스릴있는'];
const STYLE_TAGS = ['카페투어', '사진맛집', '미식', '쇼핑', '역사탐방', '자연', '야경', '액티비티'];
const STAR_SUGGESTIONS = ['BTS 뷔', 'aespa 카리나', '뉴진스 하니', '없음 (나만의 무드)'];

export default function PersonaPage() {
  const t = useTranslations('persona');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedStar, setSelectedStar] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  function toggleTag(tag: string, list: string[], setter: (v: string[]) => void) {
    setter(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  }

  function handleNext() {
    if (step < 3) setStep((s) => (s + 1) as 2 | 3);
    else router.push(`/${locale}/route`);
  }

  const canNext =
    (step === 1 && selectedStar) ||
    (step === 2 && selectedMoods.length > 0) ||
    (step === 3 && selectedStyles.length > 0);

  return (
    <AppLayout activeTab="route" title={t('title')}>
      <div className="px-4 pt-4 pb-24">

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-[#FF3A5C] text-white' :
                'bg-[#252540] text-[#8B8BA8]'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-green-500' : 'bg-[#252540]'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: 스타 선택 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-white font-bold text-lg mb-1">{t('step1_title')}</h3>
            <p className="text-[#8B8BA8] text-sm mb-5">{t('step1_desc')}</p>
            <div className="grid grid-cols-2 gap-3">
              {STAR_SUGGESTIONS.map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedStar(star)}
                  className={`p-4 rounded-2xl border text-sm font-semibold text-left transition-all ${
                    selectedStar === star
                      ? 'border-[#FF3A5C] bg-[#FF3A5C]/10 text-white'
                      : 'border-[#2E2E4A] bg-[#1E1E30] text-[#8B8BA8] hover:border-[#FF3A5C]/50'
                  }`}
                >
                  <span className="text-2xl block mb-2">⭐</span>
                  {star}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 무드 태그 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-white font-bold text-lg mb-1">{t('step2_title')}</h3>
            <p className="text-[#8B8BA8] text-sm mb-5">{t('step2_desc')}</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag, selectedMoods, setSelectedMoods)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    selectedMoods.includes(tag)
                      ? 'border-[#FF3A5C] bg-[#FF3A5C]/20 text-[#FF3A5C]'
                      : 'border-[#2E2E4A] bg-[#1E1E30] text-[#8B8BA8] hover:border-[#FF3A5C]/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 스타일 태그 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-white font-bold text-lg mb-1">{t('step3_title')}</h3>
            <p className="text-[#8B8BA8] text-sm mb-5">{t('step3_desc')}</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag, selectedStyles, setSelectedStyles)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    selectedStyles.includes(tag)
                      ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#A78BFA]'
                      : 'border-[#2E2E4A] bg-[#1E1E30] text-[#8B8BA8] hover:border-[#7C3AED]/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 선택 요약 */}
        {(selectedMoods.length > 0 || selectedStyles.length > 0) && (
          <div className="mt-5 p-3 bg-[#1E1E30] rounded-xl border border-[#2E2E4A]">
            {selectedStar && <p className="text-[#8B8BA8] text-xs">⭐ {selectedStar}</p>}
            {selectedMoods.length > 0 && <p className="text-[#8B8BA8] text-xs mt-1">무드: {selectedMoods.join(', ')}</p>}
            {selectedStyles.length > 0 && <p className="text-[#8B8BA8] text-xs mt-1">스타일: {selectedStyles.join(', ')}</p>}
          </div>
        )}

        {/* 다음/생성 버튼 */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className="fixed bottom-20 left-4 right-4 py-4 bg-[#FF3A5C] disabled:bg-[#252540] disabled:text-[#8B8BA8] text-white font-bold text-base rounded-2xl transition-colors"
        >
          {step === 3 ? `🧭 ${t('generate_btn')}` : t('next_btn')} {step < 3 && '→'}
        </button>
      </div>
    </AppLayout>
  );
}
