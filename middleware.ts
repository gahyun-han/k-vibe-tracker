import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const locales = ['ko', 'en', 'ja', 'zh'];
const defaultLocale = 'en';

// 로그인 없이 접근 가능한 경로
const publicPaths = ['/', '/map', '/analyze', '/persona', '/radar'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  // Supabase 세션 갱신
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // /[locale]/profile, /[locale]/route/save 는 로그인 필수
  const pathname = request.nextUrl.pathname;
  const localePattern = new RegExp(`^/(${locales.join('|')})`);
  const pathWithoutLocale = pathname.replace(localePattern, '') || '/';

  const requiresAuth = ['/profile'].some((p) => pathWithoutLocale.startsWith(p));

  if (requiresAuth && !user) {
    // 로그인 페이지로 리다이렉트 (locale 유지)
    const locale = pathname.match(localePattern)?.[1] ?? defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    url.searchParams.set('login', 'required');
    return NextResponse.redirect(url);
  }

  // i18n 미들웨어 적용
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
