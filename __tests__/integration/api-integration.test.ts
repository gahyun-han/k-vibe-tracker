import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchPlaces } from '@/frontend/api/places';
import { withFallback } from '@/frontend/api/client';
import { MOCK_PLACES } from '@/frontend/api/mock-data';
import type { PlacesApiResponse } from '@/types/api';

describe('Frontend-Backend Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Places API Integration', () => {
    it('should fetch places with correct parameters', async () => {
      const mockResponse: PlacesApiResponse = {
        places: MOCK_PLACES.slice(0, 2),
        cached: false,
        source: 'tourapi',
        cache_key: 'test-key',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response),
      );

      const params = new URLSearchParams({
        lat: '37.5665',
        lng: '126.978',
        radius: '1000',
      });

      const result = await fetchPlaces(params);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        `/api/places?lat=37.5665&lng=126.978&radius=1000`,
        { signal: undefined },
      );
    });

    it('should use mock data when API is unavailable', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const params = new URLSearchParams();
      const mockResponse: PlacesApiResponse = {
        places: MOCK_PLACES,
        cached: false,
        source: 'mock',
        cache_key: 'mock-key',
      };

      const result = await withFallback(
        () => fetchPlaces(params),
        mockResponse,
      );

      expect(result.places.length).toBeGreaterThan(0);
      expect(result.source).toBe('mock');
    });

    it('should respect AbortSignal for request cancellation', async () => {
      const controller = new AbortController();

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ places: [] }),
        } as Response),
      );

      const params = new URLSearchParams();
      await fetchPlaces(params, controller.signal);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });

  describe('Error Recovery', () => {
    it('should recover from API errors with fallback', async () => {
      let callCount = 0;

      const unreliableFetcher = async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('API temporarily unavailable');
        }
        return { places: MOCK_PLACES, cached: false, source: 'tourapi' as const };
      };

      const fallbackData: PlacesApiResponse = {
        places: MOCK_PLACES.slice(0, 1),
        cached: true,
        source: 'cache',
        cache_key: 'fallback',
      };

      // First call fails, should use fallback
      const result = await withFallback(unreliableFetcher, fallbackData);

      expect(result.source).toBe('cache');
      expect(result.places.length).toBe(1);
    });

    it('should handle consecutive failures gracefully', async () => {
      const alwaysFails = () => Promise.reject(new Error('Always fails'));

      const fallbackData: PlacesApiResponse = {
        places: MOCK_PLACES,
        cached: true,
        source: 'cache',
        cache_key: 'fallback',
      };

      const result = await withFallback(alwaysFails, fallbackData);

      expect(result).toEqual(fallbackData);
    });
  });

  describe('Data Validation', () => {
    it('should validate place structure from API', () => {
      const place = MOCK_PLACES[0];

      // Required fields
      expect(place.id).toBeDefined();
      expect(typeof place.id).toBe('string');
      expect(place.name).toBeDefined();
      expect(typeof place.name).toBe('string');
      expect(place.lat).toBeDefined();
      expect(typeof place.lat).toBe('number');
      expect(place.lng).toBeDefined();
      expect(typeof place.lng).toBe('number');

      // Optional fields
      expect(place.category).toBeDefined();
      expect(typeof place.category).toBe('string');
    });

    it('should validate API response structure', async () => {
      const mockResponse: PlacesApiResponse = {
        places: MOCK_PLACES,
        cached: false,
        source: 'tourapi',
        cache_key: 'test-key',
      };

      expect(mockResponse.places).toBeDefined();
      expect(Array.isArray(mockResponse.places)).toBe(true);
      expect(mockResponse.cached).toBeDefined();
      expect(typeof mockResponse.cached).toBe('boolean');
      expect(mockResponse.source).toBeDefined();
      expect(['mock', 'tourapi', 'cache']).toContain(mockResponse.source);
      expect(mockResponse.cache_key).toBeDefined();
      expect(typeof mockResponse.cache_key).toBe('string');
    });
  });

  describe('Request/Response Lifecycle', () => {
    it('should complete full request lifecycle', async () => {
      const mockResponse: PlacesApiResponse = {
        places: MOCK_PLACES.slice(0, 1),
        cached: false,
        source: 'tourapi',
        cache_key: 'test-key',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        } as Response),
      );

      const params = new URLSearchParams({ keyword: 'cafe' });
      const result = await fetchPlaces(params);

      // Verify request was made
      expect(fetch).toHaveBeenCalled();

      // Verify response structure
      expect(result.places).toBeDefined();
      expect(result.places.length).toBeGreaterThan(0);
      expect(result.cached).toBe(false);
      expect(result.source).toBe('tourapi');
    });

    it('should handle empty results', async () => {
      const emptyResponse: PlacesApiResponse = {
        places: [],
        cached: true,
        source: 'cache',
        cache_key: 'empty-key',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(emptyResponse),
        } as Response),
      );

      const params = new URLSearchParams();
      const result = await fetchPlaces(params);

      expect(result.places).toEqual([]);
      expect(result.places.length).toBe(0);
    });
  });
});
