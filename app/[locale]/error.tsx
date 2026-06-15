'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center mx-auto">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-white">문제가 발생했어요</h2>
        <p className="text-sm text-white/40">{error.message || '알 수 없는 오류'}</p>
        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl bg-[#FF3A5C] text-white text-sm font-semibold hover:bg-[#e02e4e] transition-colors"
        >
          <RotateCcw size={14} />
          다시 시도
        </button>
      </div>
    </div>
  );
}
