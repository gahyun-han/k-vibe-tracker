'use client';

import { useParams, useRouter } from 'next/navigation';
import { Compass, Map, Radar, Search, User } from 'lucide-react';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';
import type { ViewMode } from '@/lib/view-mode';

const TABS = [
  { id: 'map', icon: Map, path: '/map' },
  { id: 'analyze', icon: Search, path: '/analyze' },
  { id: 'route', icon: Compass, path: '/persona' },
  { id: 'radar', icon: Radar, path: '/radar' },
  { id: 'profile', icon: User, path: '/profile' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BottomNav({ active, viewMode }: { active: TabId; viewMode: ViewMode }) {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const isDesktopMode = viewMode === 'desktop';

  return (
    <>
      <nav
        aria-label={copy.common.appName}
        className={`h-screen w-60 shrink-0 flex-col border-r border-[#2E2E4A] bg-[#10101F]/95 ${
          isDesktopMode ? 'flex' : 'hidden'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#FF3A5C]">K-Vibe</p>
          <p className="mt-1 text-lg font-black text-white">Tracker</p>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-3 py-4">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            const Icon = tab.icon;
            const label = copy.nav[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => router.push(`/${locale}${tab.path}`)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[#FF3A5C]/15 text-white'
                    : 'text-[#8B8BA8] hover:bg-white/10 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isActive ? 'bg-[#FF3A5C] text-white' : 'bg-white/10 text-white/55 group-hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label={copy.common.appName}
        className={`fixed bottom-0 left-0 right-0 z-30 mx-auto h-16 max-w-md items-center border-t border-[#2E2E4A] bg-[#1A1A2E]/95 backdrop-blur-sm ${
          isDesktopMode ? 'hidden' : 'flex'
        }`}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          const isPrimary = tab.id === 'analyze';
          const Icon = tab.icon;
          const label = copy.nav[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(`/${locale}${tab.path}`)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                isPrimary ? '-mt-5' : ''
              } ${isActive ? 'text-[#FF3A5C]' : 'text-[#8B8BA8] hover:text-white'}`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`flex shrink-0 items-center justify-center transition-colors ${
                  isPrimary
                    ? `h-12 w-12 rounded-full border shadow-lg shadow-[#FF3A5C]/25 ${
                        isActive
                          ? 'border-[#FF8BA0] bg-[#FF3A5C] text-white'
                          : 'border-[#FF3A5C]/40 bg-[#FF3A5C] text-white hover:bg-[#e02e4e]'
                      }`
                    : 'h-5 w-5'
                }`}
              >
                <Icon size={isPrimary ? 22 : 20} />
              </span>
              <span
                className={`text-[9px] font-semibold tracking-wide ${
                  isPrimary ? 'mt-0.5 text-white' : isActive ? 'text-[#FF3A5C]' : ''
                }`}
              >
                {label}
              </span>
              {isActive && !isPrimary && (
                <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-[#FF3A5C]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
