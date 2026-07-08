'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Check, Globe2 } from 'lucide-react';
import { buildLocalizedPath, persistPreferredLocale } from '@/lib/ui-state';
import { getUiCopy, LANGUAGE_NAMES, SUPPORTED_LOCALES, type UiLocale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LOCALES.includes(locale as UiLocale) ? (locale as UiLocale) : 'en';
  const copy = getUiCopy(current);

  useEffect(() => {
    saveLocalePreference(current);
  }, [current]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function saveLocalePreference(code: UiLocale) {
    persistPreferredLocale(code, window.localStorage, (cookieValue) => {
      document.cookie = cookieValue;
    });
  }

  function switchLocale(code: UiLocale) {
    saveLocalePreference(code);
    const currentSearch = typeof window === 'undefined' ? '' : window.location.search;
    router.push(buildLocalizedPath(pathname, code, currentSearch));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        data-testid="language-switcher"
        aria-label={copy.common.changeLanguage}
        aria-controls="language-switcher-menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
      >
        <Globe2 size={14} />
        <span className="font-semibold uppercase">{current}</span>
      </button>

      {open && (
        <div
          id="language-switcher-menu"
          role="menu"
          aria-label={copy.common.changeLanguage}
          className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#1A1A2E] shadow-xl"
        >
          {SUPPORTED_LOCALES.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                data-testid={`locale-${code}`}
                role="menuitemradio"
                aria-checked={active}
                aria-label={`${LANGUAGE_NAMES[code]} (${code.toUpperCase()})`}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[#FF3A5C]/20 font-semibold text-[#FF3A5C]'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="w-5 text-xs font-bold uppercase">{code}</span>
                <span className="flex-1 text-left">{LANGUAGE_NAMES[code]}</span>
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
