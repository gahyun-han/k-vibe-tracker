'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import LoginModal from '@/components/auth/LoginModal';
import type { User } from '@supabase/supabase-js';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export default function TopBar({ title, showBack }: TopBarProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto h-14 bg-[#1A1A2E]/95 backdrop-blur-sm border-b border-[#2E2E4A] flex items-center px-4 z-30">
        {showBack ? (
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center text-[#8B8BA8] hover:text-white mr-2">
            ←
          </button>
        ) : (
          <span className="text-[#FF3A5C] font-black text-lg mr-2">K</span>
        )}

        <h1 className="flex-1 text-white font-bold text-sm truncate">
          {title ?? 'K-Vibe Tracker'}
        </h1>

        {/* 우측: 유저 아바타 or 로그인 버튼 */}
        {user ? (
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#FF3A5C]/50"
          >
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#FF3A5C]/20 flex items-center justify-center text-xs text-white font-bold">
                {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="text-xs px-3 py-1.5 rounded-full border border-[#2E2E4A] text-[#8B8BA8] hover:border-[#FF3A5C] hover:text-white transition-colors"
          >
            Sign in
          </button>
        )}
      </header>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/map`} />
      )}
    </>
  );
}
