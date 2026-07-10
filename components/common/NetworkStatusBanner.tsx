'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { getNetworkStatusCopy, type UiLocale } from '@/lib/i18n';

export function NetworkStatusBanner({ locale }: { locale: UiLocale }) {
  const copy = getNetworkStatusCopy(locale);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function syncNetworkStatus() {
      setOffline(!navigator.onLine);
    }

    syncNetworkStatus();
    window.addEventListener('online', syncNetworkStatus);
    window.addEventListener('offline', syncNetworkStatus);

    return () => {
      window.removeEventListener('online', syncNetworkStatus);
      window.removeEventListener('offline', syncNetworkStatus);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      data-network-status="offline"
      className="mx-4 mb-3 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-amber-50"
    >
      <div className="flex items-start gap-2">
        <WifiOff size={15} className="mt-0.5 shrink-0 text-amber-200" />
        <div className="min-w-0">
          <p className="text-xs font-bold">{copy.offlineTitle}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-amber-50/70">{copy.offlineBody}</p>
        </div>
      </div>
    </div>
  );
}
