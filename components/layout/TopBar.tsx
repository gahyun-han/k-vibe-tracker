'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import LoginModal from '@/components/auth/LoginModal';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ViewModeToggle } from '@/components/common/ViewModeToggle';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import type { ViewMode } from '@/lib/ui-state';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function TopBar({ title, showBack, viewMode, onViewModeChange }: TopBarProps) {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const copy = getUiCopy(locale);
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const fullName = typeof user?.user_metadata?.['full_name'] === 'string' ? user.user_metadata['full_name'] : '';
  const avatarInitial = (fullName.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();

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
      <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center gap-2 border-b border-[#2E2E4A] bg-[#1A1A2E]/95 px-4 backdrop-blur-sm">
        {showBack ? (
          <button
            onClick={() => router.back()}
            aria-label={copy.common.goBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8B8BA8] transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push(`/${locale}`)}
            aria-label={copy.common.goHome}
            title={copy.common.goHome}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-black text-[#FF3A5C] transition-colors hover:bg-white/10 hover:text-[#FF8BA0]"
          >
            K
          </button>
        )}

        <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-white">
          {title ?? copy.common.appName}
        </h1>

        <LanguageSwitcher />

        <ViewModeToggle locale={locale} mode={viewMode} onChange={onViewModeChange} compact />

        {user ? (
          <button
            onClick={() => router.push(`/${locale}/profile`)}
            aria-label={copy.common.openProfile}
            className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#FF3A5C]/50"
          >
            {user.user_metadata?.['avatar_url'] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata['avatar_url']} alt={copy.common.avatarAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#FF3A5C]/20 text-xs font-bold text-white">
                {avatarInitial}
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="shrink-0 rounded-full border border-[#2E2E4A] px-3 py-1.5 text-xs text-[#8B8BA8] transition-colors hover:border-[#FF3A5C] hover:text-white"
          >
            {copy.common.signIn}
          </button>
        )}
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/map`} />}
    </>
  );
}
