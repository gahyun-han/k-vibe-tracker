import type { UiLocale } from '@/lib/ui-copy';

export const PREFERRED_LOCALE_STORAGE_KEY = 'k-vibe-preferred-locale';
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

type LocaleStorage = Pick<Storage, 'setItem'>;

export function buildPreferredLocaleCookie(locale: UiLocale) {
  return `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function persistPreferredLocale(
  locale: UiLocale,
  storage?: LocaleStorage,
  setCookie?: (cookieValue: string) => void,
) {
  let persisted = false;

  try {
    storage?.setItem(PREFERRED_LOCALE_STORAGE_KEY, locale);
    persisted = Boolean(storage) || persisted;
  } catch {
    // URL locale switching still works if browser storage is unavailable.
  }

  try {
    setCookie?.(buildPreferredLocaleCookie(locale));
    persisted = Boolean(setCookie) || persisted;
  } catch {
    // Cookie persistence is best-effort.
  }

  return persisted;
}
