'use client';

import { useParams } from 'next/navigation';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import { PwaInstallPrompt } from '@/components/common/PwaInstallPrompt';
import { TutorialButton } from '@/components/common/TutorialButton';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: 'map' | 'analyze' | 'route' | 'radar' | 'profile';
  title?: string;
  showBack?: boolean;
}

export default function AppLayout({ children, activeTab, title, showBack }: AppLayoutProps) {
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0D0D1A] p-8 text-center">
          <div className="space-y-4">
            <p className="text-5xl font-black text-[#FF3A5C]">!</p>
            <h2 className="text-xl font-bold text-white">{copy.common.unexpectedErrorTitle}</h2>
            <p className="text-sm text-[#8B8BA8]">{copy.common.unexpectedErrorBody}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-[#FF3A5C] px-6 py-3 font-bold text-white"
            >
              {copy.common.reloadPage}
            </button>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-[#080812] lg:px-4">
        <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#0D0D1A] shadow-2xl shadow-black/30 lg:h-screen lg:max-w-6xl lg:flex-row lg:overflow-hidden lg:border-x lg:border-white/10">
          <BottomNav active={activeTab} />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:min-h-0">
            <TopBar title={title} showBack={showBack} />
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              <NetworkStatusBanner locale={locale} />
              <PwaInstallPrompt locale={locale} />
              {children}
            </main>
          </div>
          <TutorialButton />
        </div>
      </div>
    </ErrorBoundary>
  );
}
