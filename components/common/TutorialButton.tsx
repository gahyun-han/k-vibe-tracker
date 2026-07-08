'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Compass, HelpCircle, Map, Mic2, Radar, Search, ShieldCheck, User, X } from 'lucide-react';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';

const STEP_ICONS = [Map, Search, Compass, Mic2, Radar, User] as const;
const STEP_PATHS = ['/map', '/analyze', '/persona', '/route', '/radar', '/profile'] as const;

export function TutorialButton() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const copy = getUiCopy(locale);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  function closeGuide() {
    setOpen(false);
  }

  function openStep(index: number) {
    const path = STEP_PATHS[index] ?? '/map';
    closeGuide();
    router.push(`/${locale}${path}`);
  }

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeGuide();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null || element === document.activeElement);

      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !sheetRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
        return;
      }

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        title={copy.tutorial.buttonLabel}
        aria-label={copy.tutorial.buttonLabel}
        aria-haspopup="dialog"
        aria-controls="tutorial-sheet"
        aria-expanded={open}
        className="absolute bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30 transition-colors hover:bg-[#e02e4e] lg:bottom-6 lg:right-6"
      >
        <HelpCircle size={22} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm" aria-hidden="true" onClick={closeGuide} />
          <section
            ref={sheetRef}
            id="tutorial-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            aria-describedby="tutorial-subtitle tutorial-footer"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[calc(100dvh-1rem)] max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-[#1A1A2E] pb-[env(safe-area-inset-bottom)] shadow-2xl"
          >
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="px-4 pb-5 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF3A5C]/15 text-[#FF3A5C]">
                  <ShieldCheck size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="tutorial-title" className="text-lg font-bold text-white">
                    {copy.tutorial.title}
                  </h2>
                  <p id="tutorial-subtitle" className="mt-1 text-sm leading-6 text-white/55">{copy.tutorial.subtitle}</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeGuide}
                  aria-label={copy.common.close}
                  className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <ol className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                {copy.tutorial.steps.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? HelpCircle;
                  return (
                    <li key={step.title} className="flex gap-3 bg-white/[0.03] p-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#FF3A5C]">
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/55">{step.body}</p>
                        <button
                          type="button"
                          onClick={() => openStep(index)}
                          aria-label={`${step.action} - ${step.title}`}
                          className="mt-2 rounded-lg border border-[#FF3A5C]/30 bg-[#FF3A5C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#FF8BA0] transition-colors hover:border-[#FF3A5C]/60 hover:bg-[#FF3A5C]/20 hover:text-white"
                        >
                          {step.action}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <p id="tutorial-footer" className="mt-3 text-xs leading-5 text-white/40">{copy.tutorial.footer}</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
