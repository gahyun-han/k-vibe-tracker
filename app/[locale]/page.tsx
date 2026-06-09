'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import LoginModal from '@/components/auth/LoginModal';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'ja', label: '日本語',   flag: '🇯🇵' },
  { code: 'zh', label: '中文',     flag: '🇨🇳' },
  { code: 'ko', label: '한국어',   flag: '🇰🇷' },
];

const FEATURES = [
  { icon: '🗺',  key: 'feature_map',     color: '#2563EB' },
  { icon: '📹',  key: 'feature_analyze', color: '#DC2626' },
  { icon: '🧭',  key: 'feature_persona', color: '#7C3AED' },
  { icon: '🎙',  key: 'feature_docent',  color: '#059669' },
  { icon: '📡',  key: 'feature_radar',   color: '#D97706' },
];

export default function LandingPage() {
  const t = useTranslations('landing');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [showLogin, setShowLogin] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState('/map');

  function handleStart() {
    router.push(`/${locale}/map`);
  }

  function handleLangChange(code: string) {
    router.push(`/${code}`);
  }

  return (
    <main className="min-h-screen bg-[#0D0D1A] flex flex-col items-center justify-between px-5 py-8">
      {/* 언어 선택 */}
      <div className="w-full max-w-sm flex justify-end gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLangChange(lang.code)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              locale === lang.code
                ? 'bg-[#FF3A5C] border-[#FF3A5C] text-white font-bold'
                : 'border-[#2E2E4A] text-[#8B8BA8] hover:border-[#FF3A5C] hover:text-white'
            }`}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>

      {/* 로고 / 히어로 */}
      <div className="flex flex-col items-center text-center flex-1 justify-center gap-6 my-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF3A5C] to-[#7C3AED] flex items-center justify-center text-4xl shadow-2xl shadow-[#FF3A5C]/30">
          🇰🇷
        </div>

        <div>
          <h1 className="text-4xl font-black text-white mb-2">
            K-Vibe <span className="text-[#FF3A5C]">Tracker</span>
          </h1>
          <p className="text-[#8B8BA8] text-base leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* 기능 뱃지 */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {FEATURES.map((f) => (
            <span
              key={f.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#2E2E4A] text-white bg-[#1E1E30]"
            >
              {f.icon} {t(f.key)}
            </span>
          ))}
        </div>

        {/* 트렌딩 키워드 미리보기 */}
        <div className="w-full max-w-sm bg-[#1E1E30] rounded-2xl p-4 border border-[#2E2E4A]">
          <p className="text-[#8B8BA8] text-xs mb-3 font-semibold uppercase tracking-wider">
            🔥 {t('trending_now')}
          </p>
          <div className="flex flex-wrap gap-2">
            {['인생네컷', '코인노래방', '방탈출', '성수 카페', '홍대 빈티지'].map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#FF3A5C]/20 text-[#FF3A5C] font-medium border border-[#FF3A5C]/30">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          onClick={handleStart}
          className="w-full py-4 bg-[#FF3A5C] hover:bg-[#CC2847] text-white font-bold text-base rounded-2xl transition-colors shadow-lg shadow-[#FF3A5C]/30"
        >
          {t('start_btn')} →
        </button>
        <button
          onClick={() => { setShowLogin(true); setLoginRedirect(`/${locale}/map`); }}
          className="w-full py-3.5 bg-transparent hover:bg-[#1E1E30] text-[#8B8BA8] hover:text-white font-semibold text-sm rounded-2xl border border-[#2E2E4A] transition-colors"
        >
          {t('login_btn')}
        </button>
        <p className="text-center text-[#8B8BA8] text-xs">
          {t('guest_notice')}
        </p>
      </div>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          redirectTo={loginRedirect}
        />
      )}
    </main>
  );
}
