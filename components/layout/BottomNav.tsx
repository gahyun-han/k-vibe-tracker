'use client';

import { useParams, useRouter } from 'next/navigation';
import { Compass, Map, Radar, Search, User } from 'lucide-react';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

const TABS = [
  { id: 'map', icon: Map, path: '/map' },
  { id: 'analyze', icon: Search, path: '/analyze' },
  { id: 'route', icon: Compass, path: '/persona' },
  { id: 'radar', icon: Radar, path: '/radar' },
  { id: 'profile', icon: User, path: '/profile' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BottomNav({ active }: { active: TabId }) {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto flex h-16 max-w-md items-center border-t border-[#2E2E4A] bg-[#1A1A2E]/95 backdrop-blur-sm">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const Icon = tab.icon;
        const label = copy.nav[tab.id];
        return (
          <button
            key={tab.id}
            onClick={() => router.push(`/${locale}${tab.path}`)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive ? 'text-[#FF3A5C]' : 'text-[#8B8BA8] hover:text-white'
            }`}
            aria-label={label}
          >
            <Icon size={20} />
            <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-[#FF3A5C]' : ''}`}>
              {label}
            </span>
            {isActive && (
              <span className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-[#FF3A5C]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
