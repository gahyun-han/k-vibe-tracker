'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Check, Globe2 } from 'lucide-react';
import { LANGUAGE_NAMES, SUPPORTED_LOCALES, type UiLocale } from '@/lib/ui-copy';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LOCALES.includes(locale as UiLocale) ? (locale as UiLocale) : 'en';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(code: string) {
    const segments = pathname.split('/');
    segments[1] = code;
    router.push(segments.join('/'));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
      >
        <Globe2 size={14} />
        <span className="font-semibold uppercase">{current}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#1A1A2E] shadow-xl">
          {SUPPORTED_LOCALES.map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                onClick={() => switchLocale(code)}
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
