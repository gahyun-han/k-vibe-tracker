import { describe, expect, it } from 'vitest';
import {
  buildFacilitiesCacheKey,
  buildGoogleMapsFacilityUrl,
  getMockFacilities,
  type Facility,
} from '@/lib/facilities';

describe('facility helpers', () => {
  it('builds stable cache keys for facility queries', () => {
    expect(buildFacilitiesCacheKey({
      lat: 37.56654,
      lng: 126.97801,
      radius: 500,
      type: 'all',
    })).toBe('facilities:37.5665:126.9780:500:all');
  });

  it('returns mock facilities inside the requested radius sorted by distance', () => {
    const facilities = getMockFacilities({
      lat: 37.5665,
      lng: 126.978,
      radius: 500,
      type: 'all',
    });

    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities.every((facility) => facility.distance <= 500)).toBe(true);
    expect(facilities.map((facility) => facility.distance)).toEqual(
      [...facilities.map((facility) => facility.distance)].sort((a, b) => a - b),
    );
  });

  it('builds no-key Google Maps facility handoff URLs', () => {
    const facility: Pick<Facility, 'lat' | 'lng'> = { lat: 37.5671, lng: 126.9784 };
    const url = new URL(buildGoogleMapsFacilityUrl(facility));

    expect(url.origin).toBe('https://www.google.com');
    expect(url.pathname).toBe('/maps/search/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('query')).toBe('37.5671,126.9784');
  });
});
