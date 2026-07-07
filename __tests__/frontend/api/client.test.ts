import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FrontendApiError, requestJson, withFallback } from '@/frontend/api/client';
import { MOCK_PLACES } from '@/frontend/api/mock-data';

describe('Frontend API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('requestJson', () => {
    it('should successfully fetch and parse JSON', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'test' }),
        } as Response),
      );

      const result = await requestJson('/api/test');
      expect(result).toEqual({ data: 'test' });
      expect(fetch).toHaveBeenCalledWith('/api/test', {});
    });

    it('should throw FrontendApiError on 4xx response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'Not found' }),
        } as Response),
      );

      await expect(requestJson('/api/notfound')).rejects.toThrow(FrontendApiError);
      await expect(requestJson('/api/notfound')).rejects.toThrow('Not found');
    });

    it('should throw FrontendApiError on 5xx response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal server error' }),
        } as Response),
      );

      await expect(requestJson('/api/error')).rejects.toThrow(FrontendApiError);
    });

    it('should use fallback data when provided and request fails', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const fallbackData = { data: 'fallback' };
      const result = await requestJson('/api/test', {}, fallbackData);

      expect(result).toEqual(fallbackData);
      expect(fetch).toHaveBeenCalledWith('/api/test', {});
    });

    it('should throw error when no fallback is provided', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      await expect(requestJson('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON response with fallback', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('Invalid JSON')),
        } as Response),
      );

      const fallbackData = { data: 'fallback' };
      const result = await requestJson('/api/test', {}, fallbackData);

      expect(result).toEqual(fallbackData);
    });
  });

  describe('withFallback', () => {
    it('should return data from fetcher when successful', async () => {
      const fetcher = vi.fn(() => Promise.resolve({ data: 'test' }));
      const fallbackData = { data: 'fallback' };

      const result = await withFallback(fetcher, fallbackData);

      expect(result).toEqual({ data: 'test' });
      expect(fetcher).toHaveBeenCalled();
    });

    it('should return fallback data when fetcher throws', async () => {
      const fetcher = vi.fn(() => Promise.reject(new Error('API Error')));
      const fallbackData = { data: 'fallback' };

      const result = await withFallback(fetcher, fallbackData);

      expect(result).toEqual(fallbackData);
    });

    it('should work with complex objects', async () => {
      const complexFallback = { places: MOCK_PLACES, cached: true };
      const fetcher = vi.fn(() => Promise.reject(new Error('API Error')));

      const result = await withFallback(fetcher, complexFallback);

      expect(result).toEqual(complexFallback);
      expect(result.places.length).toBe(MOCK_PLACES.length);
    });
  });

  describe('FrontendApiError', () => {
    it('should create error with correct properties', () => {
      const error = new FrontendApiError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.name).toBe('FrontendApiError');
    });

    it('should be instanceof Error', () => {
      const error = new FrontendApiError('Test', 404);

      expect(error instanceof Error).toBe(true);
    });
  });
});
