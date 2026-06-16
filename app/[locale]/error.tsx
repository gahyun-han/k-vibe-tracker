'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = normalizeUiLocale(params.locale);
  const copy = getUiCopy(locale);

  useEffect(() => {
    console.error('[LocaleError]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0D0D1A] px-6 py-12 text-center">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-[#1E1E30] p-6 shadow-2xl shadow-black/25">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-200">
          <AlertTriangle size={28} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-black text-white">{copy.common.unexpectedErrorTitle}</h1>
          <p className="text-sm leading-6 text-[#8B8BA8]">{copy.common.unexpectedErrorBody}</p>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="max-h-28 overflow-auto rounded-xl bg-black/25 p-3 text-left text-xs text-red-200">
            {error.message}
          </pre>
        )}
        <button
          type="button"
          onClick={reset}
          className="mx-auto flex items-center justify-center gap-2 rounded-2xl bg-[#FF3A5C] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#FF3A5C]/25 transition-colors hover:bg-[#e02e4e]"
        >
          <RotateCcw size={16} />
          {copy.common.reloadPage}
        </button>
      </div>
    </main>
  );
}
