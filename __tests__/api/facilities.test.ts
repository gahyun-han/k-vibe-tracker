import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/facilities/route';

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/facilities');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

describe('GET /api/facilities', () => {
  const originalTourApiKey = process.env.TOUR_API_KEY;

  beforeEach(() => {
    delete process.env.TOUR_API_KEY;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalTourApiKey === undefined) delete process.env.TOUR_API_KEY;
    else process.env.TOUR_API_KEY = originalTourApiKey;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns mock facilities sorted by distance for valid coordinates', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978', radius: '500' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.cached).toBe(false);
    expect(data.cache_key).toBe('facilities:ko:37.5665:126.9780:500:all');
    expect(data.facilities.length).toBeGreaterThan(0);
    expect(data.facilities.every((facility: { distance: number }) => facility.distance <= 500)).toBe(true);

    const distances = data.facilities.map((facility: { distance: number }) => facility.distance);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it('filters facilities by type', async () => {
    for (const type of ['pharmacy', 'medical', 'transit']) {
      const res = await GET(
        makeRequest({ lat: '37.5665', lng: '126.978', radius: '1500', type })
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.facilities.length).toBeGreaterThan(0);
      expect(data.facilities.every((facility: { type: string }) => facility.type === type)).toBe(true);
    }
  });

  it('uses a default radius when none is provided', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cache_key).toBe('facilities:ko:37.5665:126.9780:500:all');
  });

  it('rejects invalid coordinates', async () => {
    const res = await GET(makeRequest({ lat: '120', lng: '126.978' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_COORDINATES');
  });

  it('rejects invalid radius values', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978', radius: '5000' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_RADIUS');
  });

  it('rejects invalid facility types', async () => {
    const res = await GET(
      makeRequest({ lat: '37.5665', lng: '126.978', radius: '500', type: 'karaoke' })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_TYPE');
  });

  it('rejects invalid locales', async () => {
    const res = await GET(
      makeRequest({ lat: '37.5665', lng: '126.978', radius: '500', locale: 'fr' })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_LOCALE');
  });

  it('adds nearby TourAPI festivals to popup facilities when a key exists', async () => {
    process.env.TOUR_API_KEY = 'encoded%2Bkey';
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        response: {
          body: {
            items: {
              item: {
                contentid: '3310483',
                title: 'Seoul Event',
                addr1: 'Seoul Plaza',
                eventstartdate: '20260617',
                eventenddate: '20260620',
                mapy: '37.5667',
                mapx: '126.9782',
              },
            },
          },
        },
      })),
    );
    vi.stubGlobal('fetch', mockFetch);

    const res = await GET(
      makeRequest({ lat: '37.5665', lng: '126.978', radius: '500', type: 'popup', locale: 'ko' })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('tourapi');
    expect(data.cache_key).toBe('facilities:ko:37.5665:126.9780:500:popup');
    expect(data.facilities.some((facility: { id: string }) => facility.id === 'tourapi_popup_3310483')).toBe(true);
    expect(String(mockFetch.mock.calls[0][0])).toContain('/KorService2/searchFestival2?');
    expect(String(mockFetch.mock.calls[0][0])).toContain('eventStartDate=');
  });
});
