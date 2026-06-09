'use client';

import { useRouter, useParams } from 'next/navigation';

const TABS = [
  { id: 'map',     icon: '🗺',  label: 'Map',     path: '/map'     },
  { id: 'analyze', icon: '🔍',  label: 'Analyze', path: '/analyze' },
  { id: 'route',   icon: '🧭',  label: 'Route',   path: '/persona' },
  { id: 'radar',   icon: '📡',  label: 'Radar',   path: '/radar'   },
  { id: 'profile', icon: '👤',  label: 'Profile', path: '/profile' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function BottomNav({ active }: { active: TabId }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string ?? 'en';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-[#1A1A2E]/95 backdrop-blur-sm border-t border-[#2E2E4A] flex items-center z-30">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => router.push(`/${locale}${tab.path}`)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive ? 'text-[#FF3A5C]' : 'text-[#8B8BA8] hover:text-white'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-[#FF3A5C]' : ''}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#FF3A5C] rounded-b-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
