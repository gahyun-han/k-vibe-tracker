import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  persistPreferredLocale,
  readPreferredLocale,
} from '@/lib/ui-state';
import {
  readLocalApiCache,
  writeLocalApiCache,
  buildLocalApiCacheKey,
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
      persistPreferredLocale('ko');
      const locale = readPreferredLocale();

      expect(locale).toBe('ko');
    });

    it('should update locale preference', () => {
      persistPreferredLocale('ko');
      expect(readPreferredLocale()).toBe('ko');

      persistPreferredLocale('en');
      expect(readPreferredLocale()).toBe('en');
    });

    it('should handle all supported locales', () => {
      const locales = ['ko', 'en', 'ja', 'zh'];

      locales.forEach((locale) => {
        persistPreferredLocale(locale as any);
        expect(readPreferredLocale()).toBe(locale);
      });
    });

    it('should return null when not set', () => {
      const locale = readPreferredLocale();
      expect(locale).toBeNull();
    });
  });

  describe('API Cache', () => {
    it('should build correct cache keys', () => {
      const key = buildLocalApiCacheKey({
        lat: 37.5665,
        lng: 126.978,
        radius: 1000,
      });

      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });

    it('should cache and retrieve data', () => {
      const cacheKey = buildLocalApiCacheKey({
        lat: 37.5665,
        lng: 126.978,
      });

      const mockData = {
        places: [
          { id: '1', name: 'Place 1', lat: 37.5665, lng: 126.978 },
        ],
        cached: true,
      };

      writeLocalApiCache(cacheKey, mockData, 60);
      const retrieved = readLocalApiCache(cacheKey);

      expect(retrieved).toEqual(mockData);
    });

    it('should return null for expired cache', async () => {
      const cacheKey = buildLocalApiCacheKey({
        lat: 37.5665,
        lng: 126.978,
      });

      const mockData = { places: [] };

      // Cache with 0 second TTL (expires immediately)
      writeLocalApiCache(cacheKey, mockData, 0);

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const retrieved = readLocalApiCache(cacheKey);
      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent cache keys', () => {
      const retrieved = readLocalApiCache('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should handle different cache keys separately', () => {
      const key1 = buildLocalApiCacheKey({ lat: 37.5665, lng: 126.978 });
      const key2 = buildLocalApiCacheKey({ lat: 37.57, lng: 126.98 });

      const data1 = { places: ['A'] };
      const data2 = { places: ['B'] };

      writeLocalApiCache(key1, data1, 60);
      writeLocalApiCache(key2, data2, 60);

      expect(readLocalApiCache(key1)).toEqual(data1);
      expect(readLocalApiCache(key2)).toEqual(data2);
    });
  });
});
