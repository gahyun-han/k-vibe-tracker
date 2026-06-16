'use client';

import { useParams } from 'next/navigation';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { ToastProvider } from '@/components/common/Toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
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
      <ToastProvider>
        <div className="min-h-screen bg-[#0D0D1A] flex flex-col max-w-md mx-auto relative">
          <TopBar title={title} showBack={showBack} />
          <main className="flex-1 overflow-y-auto pt-14">
            <NetworkStatusBanner locale={locale} />
            {children}
          </main>
          <TutorialButton />
          <BottomNav active={activeTab} />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
