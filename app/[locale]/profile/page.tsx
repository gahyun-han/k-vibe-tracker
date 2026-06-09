'use client';

import { useTranslations } from 'next-intl';
import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import LoginModal from '@/components/auth/LoginModal';
import type { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) {
    return (
      <AppLayout activeTab="profile" title={t('title')}>
        <div className="px-4 pt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout activeTab="profile" title={t('title')}>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-5 px-8">
          <div className="text-5xl">👤</div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1">{t('login_required_title')}</h3>
            <p className="text-[#8B8BA8] text-sm">{t('login_required_desc')}</p>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full max-w-xs py-4 bg-[#FF3A5C] text-white font-bold rounded-2xl"
          >
            {t('login_btn')}
          </button>
          <p className="text-[#8B8BA8] text-xs">{t('guest_features')}</p>
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo="" />}
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab="profile" title={t('title')}>
      <div className="px-4 pt-4 pb-24 space-y-4">

        {/* 유저 카드 */}
        <div className="bg-[#1E1E30] rounded-2xl p-5 border border-[#2E2E4A] flex items-center gap-4">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-14 h-14 rounded-full border-2 border-[#FF3A5C]" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FF3A5C]/20 border-2 border-[#FF3A5C] flex items-center justify-center text-2xl">
              {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-bold">{user.user_metadata?.full_name ?? 'Traveler'}</p>
            <p className="text-[#8B8BA8] text-sm">{user.email}</p>
          </div>
        </div>

        {/* 저장된 루트 */}
        <div className="bg-[#1E1E30] rounded-2xl border border-[#2E2E4A] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2E2E4A]">
            <p className="text-white font-bold text-sm">{t('saved_routes')}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[#8B8BA8] text-sm">{t('no_routes')}</p>
            <p className="text-[#8B8BA8] text-xs mt-1">{t('create_route_hint')}</p>
          </div>
        </div>

        {/* 설정 메뉴 */}
        <div className="bg-[#1E1E30] rounded-2xl border border-[#2E2E4A] overflow-hidden divide-y divide-[#2E2E4A]">
          {[
            { icon: '🌐', label: t('language') },
            { icon: '🔔', label: t('notifications') },
            { icon: '📱', label: t('offline_mode') },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[#252540] transition-colors">
              <span className="text-xl">{item.icon}</span>
              <span className="text-white text-sm font-medium flex-1">{item.label}</span>
              <span className="text-[#8B8BA8]">›</span>
            </button>
          ))}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 bg-transparent border border-red-500/50 text-red-400 font-semibold text-sm rounded-2xl hover:bg-red-500/10 transition-colors"
        >
          {t('logout')}
        </button>
      </div>
    </AppLayout>
  );
}
