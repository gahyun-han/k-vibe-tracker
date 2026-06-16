'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bot, Compass, Languages, Map, Radar, Search, Sparkles } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

const FEATURES = [
  { id: 'map', icon: Map, path: '/map' },
  { id: 'analyze', icon: Search, path: '/analyze' },
  { id: 'route', icon: Compass, path: '/persona' },
  { id: 'radar', icon: Radar, path: '/radar' },
] as const;

const TRENDING_DESTINATIONS = [
  { lat: 37.5447, lng: 127.0564 },
  { lat: 37.5701, lng: 126.9996 },
  { lat: 37.5796, lng: 126.977 },
  { lat: 37.5563, lng: 126.9236 },
  { lat: 37.51, lng: 126.9955 },
] as const;

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const [showLogin, setShowLogin] = useState(false);

  function handleStart() {
    router.push(`/${locale}/map`);
  }

  function handleLangChange(code: string) {
    router.push(`/${code}`);
  }

  function openTrending(index: number, label: string) {
    const destination = TRENDING_DESTINATIONS[index] ?? TRENDING_DESTINATIONS[0];
    const searchParams = new URLSearchParams({
      lat: String(destination.lat),
      lng: String(destination.lng),
      q: label,
      source: 'home',
    });
    router.push(`/${locale}/map?${searchParams.toString()}`);
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0D0D1A] px-5 py-8">
      <div className="mx-auto flex w-full max-w-sm justify-end gap-2">
        {SUPPORTED_LOCALES.map((code) => (
          <button
            key={code}
            onClick={() => handleLangChange(code)}
            title={LANGUAGE_NAMES[code]}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              locale === code
                ? 'border-[#FF3A5C] bg-[#FF3A5C] font-bold text-white'
                : 'border-[#2E2E4A] text-[#8B8BA8] hover:border-[#FF3A5C] hover:text-white'
            }`}
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF3A5C] to-[#7C3AED] text-white shadow-2xl shadow-[#FF3A5C]/25">
            <Sparkles size={30} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF3A5C]">{copy.landing.eyebrow}</p>
            <h1 className="mt-1 text-3xl font-black text-white">
              K-Vibe <span className="text-[#FF3A5C]">Tracker</span>
            </h1>
          </div>
        </div>

        <p className="text-base leading-7 text-[#8B8BA8]">
          {copy.landing.description}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map(({ id, icon: Icon, path }) => (
            <button
              key={id}
              type="button"
              onClick={() => router.push(`/${locale}${path}`)}
              className="rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-3 text-left transition-colors hover:border-[#FF3A5C]/60 hover:bg-[#24243A]"
            >
              <Icon size={18} className="mb-2 text-[#FF3A5C]" />
              <p className="text-sm font-semibold text-white">{copy.nav[id]}</p>
              <p className="mt-1 text-xs leading-5 text-[#8B8BA8]">{copy.landing.features[id]}</p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#2E2E4A] bg-[#1E1E30] p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Bot size={14} className="text-purple-400" />
            {copy.landing.developmentMode}
          </p>
          <p className="text-xs leading-5 text-[#8B8BA8]">
            {copy.landing.developmentDescription}
          </p>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Languages size={14} className="text-[#FF3A5C]" />
            {copy.landing.trendingLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {copy.landing.trendingTags.map((tag, index) => (
              <button
                key={tag}
                type="button"
                onClick={() => openTrending(index, tag)}
                className="rounded-full border border-[#FF3A5C]/30 bg-[#FF3A5C]/15 px-2.5 py-1 text-xs font-medium text-[#FF3A5C]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={handleStart}
          className="w-full rounded-2xl bg-[#FF3A5C] py-4 text-base font-bold text-white shadow-lg shadow-[#FF3A5C]/25 transition-colors hover:bg-[#CC2847]"
        >
          {copy.landing.start}
        </button>
        <button
          onClick={() => setShowLogin(true)}
          className="w-full rounded-2xl border border-[#2E2E4A] bg-transparent py-3.5 text-sm font-semibold text-[#8B8BA8] transition-colors hover:bg-[#1E1E30] hover:text-white"
        >
          {copy.common.signIn}
        </button>
        <p className="text-center text-xs text-[#8B8BA8]">{copy.landing.guestNotice}</p>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/map`} />}
    </main>
  );
}
