'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { getPwaInstallCopy, type UiLocale } from '@/lib/i18n';

const INSTALL_DISMISSED_STORAGE_KEY = 'k-vibe-install-prompt-dismissed';

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

function isStandaloneMode() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || Boolean(navigatorWithStandalone.standalone);
}

export function PwaInstallPrompt({ locale }: { locale: UiLocale }) {
  const copy = getPwaInstallCopy(locale);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) return;
    if (window.localStorage.getItem(INSTALL_DISMISSED_STORAGE_KEY) === '1') return;

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  async function installApp() {
    if (!installEvent) return;

    setVisible(false);

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'accepted') {
        window.localStorage.setItem(INSTALL_DISMISSED_STORAGE_KEY, '1');
      }
    } catch {
      // The browser may reject if the prompt was consumed elsewhere.
    } finally {
      setInstallEvent(null);
    }
  }

  function dismissPrompt() {
    window.localStorage.setItem(INSTALL_DISMISSED_STORAGE_KEY, '1');
    setVisible(false);
    setInstallEvent(null);
  }

  if (!visible || !installEvent) return null;

  return (
    <div
      role="status"
      data-pwa-install-prompt="ready"
      className="mx-4 mb-3 rounded-xl border border-sky-300/25 bg-sky-300/10 px-3 py-3 text-sky-50"
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-300/15 text-sky-100">
          <Download size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold">{copy.title}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-sky-50/70">{copy.body}</p>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={installApp}
              className="rounded-lg bg-sky-200 px-3 py-1.5 text-xs font-bold text-[#0D0D1A] transition-colors hover:bg-white"
            >
              {copy.install}
            </button>
            <button
              type="button"
              onClick={dismissPrompt}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-sky-50/75 transition-colors hover:bg-white/15"
            >
              {copy.dismiss}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissPrompt}
          aria-label={copy.close}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sky-50/55 transition-colors hover:bg-white/10 hover:text-sky-50"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
