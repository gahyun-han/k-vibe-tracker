'use client';

import { useState } from 'react';
import { CheckCircle2, Lock, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';

interface LoginModalProps {
  onClose: () => void;
  redirectTo: string;
}

export default function LoginModal({ onClose, redirectTo }: LoginModalProps) {
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const copy = getUiCopy(locale).login;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error(copy.supabaseMissing);
      }

      const { error: loginError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        },
      });
      if (loginError) throw loginError;
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.failed);
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-16 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-2xl border border-[#2E2E4A] bg-[#1A1A2E] p-6">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#2E2E4A]" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#FF3A5C]">{copy.eyebrow}</p>
            <h3 id="login-modal-title" className="mt-1 text-xl font-bold text-white">{copy.title}</h3>
            <p className="mt-1 text-sm leading-5 text-[#8B8BA8]">
              {copy.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={copy.close}
            className="rounded-lg p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 font-bold text-gray-800 transition-colors hover:bg-gray-100 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {copy.continueGoogle}
        </button>

        {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

        <button
          onClick={onClose}
          className="mb-5 mt-3 w-full py-3 text-sm text-[#8B8BA8] transition-colors hover:text-white"
        >
          {copy.continueGuest}
        </button>

        <div className="space-y-2 rounded-xl bg-[#252540] p-3 text-xs text-[#8B8BA8]">
          <p className="mb-2 text-xs font-semibold text-white">{copy.availableWithoutLogin}</p>
          {copy.guestFeatures.map((feature) => (
            <p key={feature} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-400" />
              {feature}
            </p>
          ))}
          <p className="mt-3 flex items-center gap-2 font-semibold text-[#FF3A5C]">
            <Lock size={13} className="shrink-0" />
            {copy.loginRequiredLater}
          </p>
        </div>
      </div>
    </div>
  );
}
