'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bell, CloudOff, Languages, Lock, LogOut, Map, Route, UserRound } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import LoginModal from '@/components/auth/LoginModal';
import { createClient, hasSupabaseEnv } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const GUEST_CAPABILITIES = [
  { icon: Map, label: 'Explore map and facilities' },
  { icon: Route, label: 'Generate and edit local routes' },
  { icon: CloudOff, label: 'Use mock-backed development data' },
];

const SETTINGS = [
  { icon: Languages, label: 'Language', value: 'Use the top switcher' },
  { icon: Bell, label: 'Notifications', value: 'Approval-gated' },
  { icon: CloudOff, label: 'Offline maps', value: 'Not connected' },
];

export default function ProfilePage() {
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const supabaseConfigured = hasSupabaseEnv();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }

  if (loading) {
    return (
      <AppLayout activeTab="profile" title="Profile">
        <div className="space-y-4 px-4 pt-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-16 rounded-2xl skeleton" />
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout activeTab="profile" title="Profile">
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF3A5C]/15 text-[#FF3A5C]">
            <UserRound size={30} />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-bold text-white">Sign in to save trips</h3>
            <p className="text-sm leading-6 text-[#8B8BA8]">
              Guest mode is fully usable for local development. Account sync is enabled after Supabase credentials are configured.
            </p>
          </div>

          {!supabaseConfigured && (
            <div className="w-full rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-left text-xs text-amber-100">
              <p className="mb-1 flex items-center gap-2 font-semibold">
                <Lock size={13} />
                Supabase not configured
              </p>
              <p className="leading-5 text-amber-100/70">
                Login is intentionally disabled until `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.
              </p>
            </div>
          )}

          <div className="w-full space-y-2">
            {GUEST_CAPABILITIES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-left text-sm text-white/70">
                <Icon size={16} className="shrink-0 text-[#FF3A5C]" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowLogin(true)}
            className="w-full max-w-xs rounded-2xl bg-[#FF3A5C] py-4 font-bold text-white disabled:opacity-60"
          >
            Sign in with Google
          </button>
        </div>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} redirectTo={`/${locale}/profile`} />}
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab="profile" title="Profile">
      <div className="space-y-4 px-4 pb-24 pt-4">
        <div className="flex items-center gap-4 rounded-2xl border border-[#2E2E4A] bg-[#1E1E30] p-5">
          {user.user_metadata?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.user_metadata.avatar_url} alt="avatar" className="h-14 w-14 rounded-full border-2 border-[#FF3A5C] object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FF3A5C] bg-[#FF3A5C]/20 text-2xl font-bold text-white">
              {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-bold text-white">{user.user_metadata?.full_name ?? 'Traveler'}</p>
            <p className="truncate text-sm text-[#8B8BA8]">{user.email}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2E2E4A] bg-[#1E1E30]">
          <div className="border-b border-[#2E2E4A] px-4 py-3">
            <p className="text-sm font-bold text-white">Saved routes</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm text-[#8B8BA8]">No saved routes yet</p>
            <p className="mt-1 text-xs text-[#8B8BA8]">Generate a route and save it here after persistence is connected.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#2E2E4A] bg-[#1E1E30]">
          {SETTINGS.map(({ icon: Icon, label, value }) => (
            <button
              key={label}
              className="flex w-full items-center gap-3 border-b border-[#2E2E4A] px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-[#252540]"
            >
              <Icon size={18} className="text-[#FF3A5C]" />
              <span className="flex-1 text-sm font-medium text-white">{label}</span>
              <span className="text-xs text-[#8B8BA8]">{value}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-transparent py-3.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </AppLayout>
  );
}
