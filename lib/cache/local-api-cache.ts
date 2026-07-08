export const LOCAL_API_CACHE_PREFIX = 'k-vibe-api-cache:';
export const LOCAL_API_CACHE_TTL_MS = 60 * 60 * 1000;

type ApiCacheStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface CachedPayload<T> {
  timestamp: number;
  value: T;
}

export type CachedApiResponse<T = unknown> = CachedPayload<T>;

function normalizeParamValue(value: string | number | boolean) {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  return String(value);
}

export function buildLocalApiCacheKey(namespace: string, params: Record<string, string | number | boolean>) {
  const sortedParams = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(normalizeParamValue(value))}`)
    .join('&');

  return `${LOCAL_API_CACHE_PREFIX}${namespace}?${sortedParams}`;
}

export function readLocalApiCache<T>(storage: ApiCacheStorage, key: string, now = Date.now()): T | null {
  try {
    const rawValue = storage.getItem(key);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<CachedPayload<T>>;
    const timestamp = Number(parsed.timestamp);

    if (!Number.isFinite(timestamp) || parsed.value === undefined) {
      storage.removeItem(key);
      return null;
    }

    if (now - timestamp > LOCAL_API_CACHE_TTL_MS) {
      storage.removeItem(key);
      return null;
    }

    return parsed.value as T;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeLocalApiCache<T>(storage: ApiCacheStorage, key: string, value: T, timestamp = Date.now()) {
  try {
    const payload: CachedPayload<T> = { timestamp, value };
    storage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
