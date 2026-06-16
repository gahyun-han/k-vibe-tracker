'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Compass, HelpCircle, Map, Mic2, Radar, Search, ShieldCheck, User, X } from 'lucide-react';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

const STEP_ICONS = [Map, Search, Compass, Mic2, Radar, User] as const;

export function TutorialButton() {
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={copy.tutorial.buttonLabel}
        aria-label={copy.tutorial.buttonLabel}
        className="absolute bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#FF3A5C] text-white shadow-lg shadow-[#FF3A5C]/30 transition-colors hover:bg-[#e02e4e]"
      >
        <HelpCircle size={22} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-2xl border border-white/10 bg-[#1A1A2E] pb-[env(safe-area-inset-bottom)] shadow-2xl"
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
                  <p className="mt-1 text-sm leading-6 text-white/55">{copy.tutorial.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={copy.common.close}
                  className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                {copy.tutorial.steps.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? HelpCircle;
                  return (
                    <div key={step.title} className="flex gap-3 bg-white/[0.03] p-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#FF3A5C]">
                        <Icon size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/55">{step.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs leading-5 text-white/40">{copy.tutorial.footer}</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
