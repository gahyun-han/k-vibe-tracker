import { describe, expect, it } from 'vitest';
import {
  buildLocalizedPath,
  buildPreferredLocaleCookie,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  PREFERRED_LOCALE_STORAGE_KEY,
  persistPreferredLocale,
} from '@/lib/ui-state';

describe('locale preference', () => {
  it('builds locale-switched paths without dropping query state', () => {
    const searchParams = new URLSearchParams({
      detail: '1',
      lat: '37.5447',
      lng: '127.0564',
      q: 'Seongsu Cafe Street',
    });

    expect(buildLocalizedPath('/ko/map', 'ja', searchParams)).toBe(
      '/ja/map?detail=1&lat=37.5447&lng=127.0564&q=Seongsu+Cafe+Street',
    );
    expect(buildLocalizedPath('/en/route', 'zh', '?route=encoded-local-plan')).toBe(
      '/zh/route?route=encoded-local-plan',
    );
    expect(buildLocalizedPath('/map', 'ko')).toBe('/ko/map');
  });

  it('builds the next-intl locale cookie value', () => {
    expect(buildPreferredLocaleCookie('ja')).toBe(
      `NEXT_LOCALE=ja; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`,
    );
  });

  it('persists locale to storage and cookie sink', () => {
    const values = new Map<string, string>();
    const cookies: string[] = [];

    const persisted = persistPreferredLocale(
      'zh',
      { setItem: (key, value) => values.set(key, value) },
      (cookieValue) => cookies.push(cookieValue),
    );

    expect(persisted).toBe(true);
    expect(values.get(PREFERRED_LOCALE_STORAGE_KEY)).toBe('zh');
    expect(cookies).toEqual([buildPreferredLocaleCookie('zh')]);
  });

  it('keeps cookie persistence even if storage throws', () => {
    const cookies: string[] = [];

    const persisted = persistPreferredLocale(
      'ko',
      {
        setItem: () => {
          throw new Error('storage disabled');
        },
      },
      (cookieValue) => cookies.push(cookieValue),
    );

    expect(persisted).toBe(true);
    expect(cookies).toEqual([buildPreferredLocaleCookie('ko')]);
  });
});
