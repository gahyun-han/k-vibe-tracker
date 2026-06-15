'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bot, Compass, Languages, Map, Radar, Search, Sparkles } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: 'Korean' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
];

const FEATURES = [
  { icon: Map, label: 'Map', description: 'TourAPI-ready nearby spots' },
  { icon: Search, label: 'Analyze', description: 'Local-first SNS extraction' },
  { icon: Compass, label: 'Route', description: 'Mock route planner' },
  { icon: Radar, label: 'Radar', description: 'Facility finder' },
];

const TRENDING_TAGS = ['Seongsu cafes', 'Gwangjang food', 'Palace drama', 'Hongdae photo', 'Han River night'];

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const [showLogin, setShowLogin] = useState(false);

  function handleStart() {
    router.push(`/${locale}/map`);
  }

  function handleLangChange(code: string) {
    router.push(`/${code}`);
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0D0D1A] px-5 py-8">
      <div className="mx-auto flex w-full max-w-sm justify-end gap-2">
        {LANGUAGES.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLangChange(language.code)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              locale === language.code
                ? 'border-[#FF3A5C] bg-[#FF3A5C] font-bold text-white'
                : 'border-[#2E2E4A] text-[#8B8BA8] hover:border-[#FF3A5C] hover:text-white'
            }`}
          >
            {language.code.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF3A5C] to-[#7C3AED] text-white shadow-2xl shadow-[#FF3A5C]/25">
            <Sparkles size={30} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FF3A5C]">Local-first travel lab</p>
            <h1 className="mt-1 text-3xl font-black text-white">
              K-Vibe <span className="text-[#FF3A5C]">Tracker</span>
            </h1>
          </div>
        </div>

        <p className="text-base leading-7 text-[#8B8BA8]">
          Discover Korea through K-content inspired places, routes, and nearby travel helpers. Core workflows run without paid keys during development.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map(({ icon: Icon, label, description }) => (
            <div key={label} className="rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-3">
              <Icon size={18} className="mb-2 text-[#FF3A5C]" />
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs leading-5 text-[#8B8BA8]">{description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#2E2E4A] bg-[#1E1E30] p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Bot size={14} className="text-purple-400" />
            Development mode
          </p>
          <p className="text-xs leading-5 text-[#8B8BA8]">
            Mock-backed APIs are active for places, analysis, facilities, and routes. Approval-gated services stay disabled until credentials are provided.
          </p>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B8BA8]">
            <Languages size={14} className="text-[#FF3A5C]" />
            Trending prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#FF3A5C]/30 bg-[#FF3A5C]/15 px-2.5 py-1 text-xs font-medium text-[#FF3A5C]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={handleStart}
          className="w-full rounded-2xl bg-[#FF3A5C] py-4 text-base font-bold text-white shadow-lg shadow-[#FF3A5C]/25 transition-colors hover:bg-[#CC2847]"
        >
          Explore K-Vibe
        </button>
        <button
          onClick={() => setShowLogin(true)}
          className="w-full rounded-2xl border border-[#2E2E4A] bg-transparent py-3.5 text-sm font-semibold text-[#8B8BA8] transition-colors hover:bg-[#1E1E30] hover:text-white"
        >
          Sign in
        </button>
        <p className="text-center text-xs text-[#8B8BA8]">Map, Analyze, Route, and Radar work without login.</p>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/map`} />}
    </main>
  );
}
