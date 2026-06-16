import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/places/route';

const originalTourApiKey = process.env.TOUR_API_KEY;
const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/places');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/places', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.TOUR_API_KEY;
  });

  afterEach(() => {
    if (originalTourApiKey === undefined) {
      delete process.env.TOUR_API_KEY;
    } else {
      process.env.TOUR_API_KEY = originalTourApiKey;
    }
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', mockFetch);
  });

  it('returns credential-less mock places for valid coordinates', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.places)).toBe(true);
    expect(data.places.length).toBeGreaterThan(0);
    expect(data.source).toBe('mock');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects missing coordinates', async () => {
    expect((await GET(makeRequest({ lng: '126.978' }))).status).toBe(400);
    expect((await GET(makeRequest({ lat: '37.5665' }))).status).toBe(400);
    expect((await GET(makeRequest({}))).status).toBe(400);
  });

  it('rejects invalid coordinate ranges', async () => {
    expect((await GET(makeRequest({ lat: 'abc', lng: '127.0' }))).status).toBe(400);
    expect((await GET(makeRequest({ lat: '91', lng: '127.0' }))).status).toBe(400);
    expect((await GET(makeRequest({ lat: '37.5', lng: '181' }))).status).toBe(400);
  });

  it('rejects invalid radius and category params', async () => {
    expect((await GET(makeRequest({ lat: '37.5', lng: '127.0', radius: '0' }))).status).toBe(400);
    expect((await GET(makeRequest({ lat: '37.5', lng: '127.0', radius: '20001' }))).status).toBe(400);
    expect((await GET(makeRequest({ lat: '37.5', lng: '127.0', category: 'unknown' }))).status).toBe(400);
    expect((await GET(makeRequest({ lat: '37.5', lng: '127.0', locale: 'fr' }))).status).toBe(400);
  });

  it('keeps legacy mock offsets stable', async () => {
    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    const data = await res.json();

    expect(data.places[0].lat).toBeCloseTo(37.501, 3);
    expect(data.places[1].lng).toBeCloseTo(127.002, 3);
  });

  it('filters mock places by category when no TourAPI key exists', async () => {
    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0', category: 'food' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.places).toHaveLength(1);
    expect(data.places[0].category).toBe('food');
  });

  it('calls TourAPI locationBasedList2 and normalizes the response when a key exists', async () => {
    process.env.TOUR_API_KEY = 'encoded%2Bkey';
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          response: {
            body: {
              items: {
                item: [
                  {
                    contentid: '264337',
                    contenttypeid: '39',
                    title: 'Gwangjang Market',
                    mapx: '126.9996',
                    mapy: '37.57',
                    addr1: '88 Changgyeonggung-ro, Jongno-gu',
                    firstimage: 'https://example.com/market.jpg',
                    dist: '120',
                  },
                ],
              },
            },
          },
        }),
        { status: 200 }
      )
    );

    const res = await GET(
      makeRequest({ lat: '37.5701', lng: '126.9995', radius: '1000', category: 'food' })
    );
    const data = await res.json();
    const calledUrl = String(mockFetch.mock.calls[0][0]);

    expect(res.status).toBe(200);
    expect(data.source).toBe('tourapi');
    expect(calledUrl).toContain('locationBasedList2');
    expect(calledUrl).toContain('/KorService2/');
    expect(calledUrl).toContain('serviceKey=encoded%2Bkey');
    expect(calledUrl).toContain('mapX=126.9995');
    expect(calledUrl).toContain('mapY=37.5701');
    expect(calledUrl).toContain('arrange=S');
    expect(calledUrl).toContain('contentTypeId=39');
    expect(data.places[0]).toMatchObject({
      content_id: '264337',
      content_type: 39,
      name: 'Gwangjang Market',
      name_ko: 'Gwangjang Market',
      category: 'food',
      image_url: 'https://example.com/market.jpg',
      distance_m: 120,
    });
    expect(JSON.stringify(data)).not.toContain('encoded%2Bkey');
  });

  it('passes locale through to multilingual TourAPI services', async () => {
    process.env.TOUR_API_KEY = 'plain-key';
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          response: {
            body: {
              items: {
                item: {
                  contentid: '100',
                  contenttypeid: '82',
                  title: 'Myeongdong Restaurant',
                  mapx: '126.985',
                  mapy: '37.564',
                  dist: '100',
                },
              },
            },
          },
        }),
        { status: 200 }
      )
    );

    const res = await GET(
      makeRequest({
        lat: '37.564',
        lng: '126.985',
        radius: '1000',
        category: 'food',
        locale: 'en',
      })
    );
    const calledUrl = String(mockFetch.mock.calls[0][0]);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(calledUrl).toContain('/EngService2/locationBasedList2');
    expect(calledUrl).toContain('contentTypeId=82');
    expect(data.cache_key).toBe('places:en:37.56:126.98:r1000:cfood');
  });

  it('falls back to mock places when TourAPI fails', async () => {
    process.env.TOUR_API_KEY = 'test-key';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.places[0].content_id).toBe('mock_1');
  });

  it('falls back to mock places when TourAPI returns a non-OK response', async () => {
    process.env.TOUR_API_KEY = 'test-key';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch.mockResolvedValue(new Response('server error', { status: 500 }));

    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
  });

  it('falls back to mock places when TourAPI returns invalid JSON', async () => {
    process.env.TOUR_API_KEY = 'test-key';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch.mockResolvedValue(new Response('<OpenAPI_ServiceResponse />', { status: 200 }));

    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
  });
});
