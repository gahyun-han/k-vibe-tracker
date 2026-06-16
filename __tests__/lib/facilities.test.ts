import { describe, expect, it } from 'vitest';
import {
  buildFacilitiesCacheKey,
  buildGoogleMapsFacilityUrl,
  getMockFacilities,
  normalizeTourApiFestivalFacilities,
  type Facility,
} from '@/lib/facilities';

describe('facility helpers', () => {
  it('builds stable cache keys for facility queries', () => {
    expect(buildFacilitiesCacheKey({
      lat: 37.56654,
      lng: 126.97801,
      radius: 500,
      type: 'all',
      locale: 'en',
    })).toBe('facilities:en:37.5665:126.9780:500:all');
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

  it('normalizes nearby TourAPI festivals as popup facilities', () => {
    const facilities = normalizeTourApiFestivalFacilities({
      lat: 37.5665,
      lng: 126.978,
      radius: 500,
      type: 'popup',
      items: [
        {
          contentid: 'event-1',
          title: 'Seoul Pop-up Festival',
          addr1: 'Seoul Plaza',
          eventstartdate: '20260617',
          eventenddate: '20260620',
          mapy: '37.5667',
          mapx: '126.9782',
          progresstype: '진행중',
        },
        {
          contentid: 'event-far',
          title: 'Far Event',
          mapy: '37.7',
          mapx: '127.2',
        },
      ],
    });

    expect(facilities).toHaveLength(1);
    expect(facilities[0]).toMatchObject({
      id: 'tourapi_popup_event-1',
      type: 'popup',
      name: 'Seoul Pop-up Festival',
      address: 'Seoul Plaza',
      isOpen: true,
      extra: '2026-06-17 - 2026-06-20 / 진행중',
    });
  });
});
