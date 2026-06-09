'use client';

import TopBar from './TopBar';
import BottomNav from './BottomNav';
import { ToastProvider } from '@/components/common/Toast';
import ErrorBoundary from '@/components/common/ErrorBoundary';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: 'map' | 'analyze' | 'route' | 'radar' | 'profile';
  title?: string;
  showBack?: boolean;
}

export default function AppLayout({ children, activeTab, title, showBack }: AppLayoutProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen bg-[#0D0D1A] flex flex-col max-w-md mx-auto relative">
          <TopBar title={title} showBack={showBack} />
          <main className="flex-1 overflow-y-auto pt-14">
            {children}
          </main>
          <BottomNav active={activeTab} />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
