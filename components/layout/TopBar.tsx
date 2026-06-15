'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export default function TopBar({ title, showBack }: TopBarProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-30 mx-auto flex h-14 max-w-md items-center gap-2 border-b border-[#2E2E4A] bg-[#1A1A2E]/95 px-4 backdrop-blur-sm">
        {showBack ? (
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B8BA8] transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <span className="text-lg font-black text-[#FF3A5C]">K</span>
        )}

        <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-white">
          {title ?? 'K-Vibe Tracker'}
        </h1>

        <LanguageSwitcher />

        {user ? (
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            aria-label="Open profile"
            className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#FF3A5C]/50"
          >
            {user.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FF3A5C]/20 text-xs font-bold text-white">
                {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="shrink-0 rounded-full border border-[#2E2E4A] px-3 py-1.5 text-xs text-[#8B8BA8] transition-colors hover:border-[#FF3A5C] hover:text-white"
          >
            Sign in
          </button>
        )}
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/map`} />}
    </>
  );
}
