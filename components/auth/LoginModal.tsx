'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface LoginModalProps {
  onClose: () => void;
  redirectTo: string;
}

export default function LoginModal({ onClose, redirectTo }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${redirectTo}`,
        },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    // 오버레이
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* 바텀 시트 */}
      <div className="w-full max-w-md bg-[#1A1A2E] rounded-t-3xl border-t border-[#2E2E4A] p-6 pb-10 animate-slide-up">
        {/* 핸들 */}
        <div className="w-10 h-1 bg-[#2E2E4A] rounded-full mx-auto mb-6" />

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🇰🇷</div>
          <h3 className="text-white font-bold text-xl mb-1">Sign in to K-Vibe</h3>
          <p className="text-[#8B8BA8] text-sm">Save your routes & personalize your K-Vibe experience</p>
        </div>

        {/* 게스트 가능 기능 */}
        <div className="bg-[#252540] rounded-xl p-3 mb-5 text-xs text-[#8B8BA8] space-y-1">
          <p className="text-white font-semibold text-xs mb-2">✅ Available without login</p>
          <p>• Map exploration & SNS analysis</p>
          <p>• Persona route generation</p>
          <p>• Facility radar</p>
          <p className="text-[#FF3A5C] font-semibold mt-2">🔒 Requires login: Save routes · Share · History</p>
        </div>

        {/* Google 로그인 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-2xl transition-colors disabled:opacity-60"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {error && (
          <p className="text-red-400 text-xs text-center mt-3">{error}</p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 text-[#8B8BA8] text-sm hover:text-white transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
