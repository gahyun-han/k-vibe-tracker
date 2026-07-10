import { describe, expect, it } from 'vitest';
import {
  buildLocalApiCacheKey,
  LOCAL_API_CACHE_TTL_MS,
  readLocalApiCache,
  writeLocalApiCache,
} from '@/lib/cache';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('local api cache', () => {
  it('builds stable keys regardless of param insertion order', () => {
    const left = buildLocalApiCacheKey('places', { lng: 126.978, lat: 37.5665, locale: 'en' });
    const right = buildLocalApiCacheKey('places', { locale: 'en', lat: 37.5665, lng: 126.978 });

    expect(left).toBe(right);
    expect(left).toContain('k-vibe-api-cache:places?');
  });

  it('reads values while the cache is fresh', () => {
    const storage = new MemoryStorage();
    const key = buildLocalApiCacheKey('facilities', { radius: 500, type: 'all' });
    const timestamp = 1_000_000;

    writeLocalApiCache(storage, key, { items: ['a', 'b'] }, timestamp);

    expect(readLocalApiCache(storage, key, timestamp + 60_000)).toEqual({ items: ['a', 'b'] });
  });

  it('expires stale values after one hour', () => {
    const storage = new MemoryStorage();
    const key = buildLocalApiCacheKey('places', { locale: 'ko' });
    const timestamp = 1_000_000;

    writeLocalApiCache(storage, key, { places: [] }, timestamp);

    expect(readLocalApiCache(storage, key, timestamp + LOCAL_API_CACHE_TTL_MS + 1)).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });

  it('removes malformed cache payloads', () => {
    const storage = new MemoryStorage();
    const key = buildLocalApiCacheKey('places', { locale: 'ja' });
    storage.setItem(key, '{bad json');

    expect(readLocalApiCache(storage, key)).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });
});
