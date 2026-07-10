import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  persistPreferredLocale,
  readPreferredLocale,
} from '@/lib/ui-state';
import {
  readLocalApiCache,
  writeLocalApiCache,
  buildLocalApiCacheKey,
  LOCAL_API_CACHE_TTL_MS,
} from '@/lib/cache';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UI State Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Locale Preference', () => {
    it('should persist and read locale preference', () => {
      persistPreferredLocale('ko', window.localStorage);
      const locale = readPreferredLocale(window.localStorage);

      expect(locale).toBe('ko');
    });

    it('should update locale preference', () => {
      persistPreferredLocale('ko', window.localStorage);
      expect(readPreferredLocale(window.localStorage)).toBe('ko');

      persistPreferredLocale('en', window.localStorage);
      expect(readPreferredLocale(window.localStorage)).toBe('en');
    });

    it('should handle all supported locales', () => {
      const locales = ['ko', 'en', 'ja', 'zh'];

      locales.forEach((locale) => {
        persistPreferredLocale(locale as any, window.localStorage);
        expect(readPreferredLocale(window.localStorage)).toBe(locale);
      });
    });

    it('should return null when not set', () => {
      const locale = readPreferredLocale(window.localStorage);
      expect(locale).toBeNull();
    });
  });

  describe('API Cache', () => {
    it('should build correct cache keys', () => {
      const key = buildLocalApiCacheKey('places', {
        lat: 37.5665,
        lng: 126.978,
        radius: 1000,
      });

      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should cache and retrieve data', () => {
      const cacheKey = buildLocalApiCacheKey('places', {
        lat: 37.5665,
        lng: 126.978,
      });

      const mockData = {
        places: [
          { id: '1', name: 'Place 1', lat: 37.5665, lng: 126.978 },
        ],
        cached: true,
      };

      writeLocalApiCache(window.localStorage, cacheKey, mockData);
      const retrieved = readLocalApiCache(window.localStorage, cacheKey);

      expect(retrieved).toEqual(mockData);
    });

    it('should return null for expired cache', () => {
      const cacheKey = buildLocalApiCacheKey('places', {
        lat: 37.5665,
        lng: 126.978,
      });

      const mockData = { places: [] };

      writeLocalApiCache(window.localStorage, cacheKey, mockData, 0);
      const retrieved = readLocalApiCache(window.localStorage, cacheKey, LOCAL_API_CACHE_TTL_MS + 1);
      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent cache keys', () => {
      const retrieved = readLocalApiCache(window.localStorage, 'non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should handle different cache keys separately', () => {
      const key1 = buildLocalApiCacheKey('places', { lat: 37.5665, lng: 126.978 });
      const key2 = buildLocalApiCacheKey('places', { lat: 37.57, lng: 126.98 });

      const data1 = { places: ['A'] };
      const data2 = { places: ['B'] };

      writeLocalApiCache(window.localStorage, key1, data1);
      writeLocalApiCache(window.localStorage, key2, data2);

      expect(readLocalApiCache(window.localStorage, key1)).toEqual(data1);
      expect(readLocalApiCache(window.localStorage, key2)).toEqual(data2);
    });
  });
});
