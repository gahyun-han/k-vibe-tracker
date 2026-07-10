import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/places/[contentId]/route';

const originalTourApiKey = process.env.TOUR_API_KEY;
const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/places/123');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makeContext(contentId = '123') {
  return { params: { contentId } };
}

describe('GET /api/places/[contentId]', () => {
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

  it('returns a credential-less mock detail without calling TourAPI', async () => {
    const res = await GET(makeRequest({ contentTypeId: '12' }), makeContext('126128'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.detail.content_id).toBe('126128');
    expect(data.detail.content_type).toBe(12);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects invalid content ids and locales', async () => {
    expect((await GET(makeRequest(), makeContext('../secret'))).status).toBe(400);
    expect((await GET(makeRequest({ locale: 'fr' }), makeContext('123'))).status).toBe(400);
  });

  it('calls TourAPI detail endpoints and normalizes detail data', async () => {
    process.env.TOUR_API_KEY = 'encoded%2Bkey';
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('detailCommon2')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              response: {
                body: {
                  items: {
                    item: {
                      contentid: '126128',
                      contenttypeid: '12',
                      title: 'Dongchon Resort',
                      mapx: '128.65',
                      mapy: '35.88',
                      addr1: 'Dong-gu, Daegu',
                      firstimage: 'https://example.com/hero.jpg',
                      tel: '053-000-0000',
                      overview: '<p>A riverside travel spot.</p>',
                    },
                  },
                },
              },
            }),
            { status: 200 },
          ),
        );
      }

      if (url.includes('detailIntro2')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              response: {
                body: {
                  items: {
                    item: {
                      contentid: '126128',
                      contenttypeid: '12',
                      usetime: '09:00-18:00',
                      restdate: 'Open year-round',
                      parking: 'Available',
                    },
                  },
                },
              },
            }),
            { status: 200 },
          ),
        );
      }

      if (url.includes('detailImage2')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              response: {
                body: {
                  items: {
                    item: [
                      {
                        contentid: '126128',
                        originimgurl: 'https://example.com/detail-1.jpg',
                      },
                    ],
                  },
                },
              },
            }),
            { status: 200 },
          ),
        );
      }

      return Promise.resolve(new Response('not found', { status: 404 }));
    });

    const res = await GET(makeRequest({ locale: 'en', contentTypeId: '12' }), makeContext('126128'));
    const data = await res.json();
    const calledUrls = mockFetch.mock.calls.map((call) => String(call[0]));

    expect(res.status).toBe(200);
    expect(data.source).toBe('tourapi');
    expect(calledUrls.some((url) => url.includes('/EngService2/detailCommon2'))).toBe(true);
    expect(calledUrls.some((url) => url.includes('/EngService2/detailIntro2'))).toBe(true);
    expect(calledUrls.some((url) => url.includes('/EngService2/detailImage2'))).toBe(true);
    expect(data.detail).toMatchObject({
      content_id: '126128',
      content_type: 12,
      name: 'Dongchon Resort',
      address: 'Dong-gu, Daegu',
      overview: 'A riverside travel spot.',
      image_url: 'https://example.com/hero.jpg',
      tel: '053-000-0000',
      open_hours: '09:00-18:00',
      rest_date: 'Open year-round',
      parking: 'Available',
    });
    expect(data.detail.images).toEqual([
      'https://example.com/hero.jpg',
      'https://example.com/detail-1.jpg',
    ]);
    expect(JSON.stringify(data)).not.toContain('encoded%2Bkey');
  });

  it('falls back to mock detail when TourAPI fails', async () => {
    process.env.TOUR_API_KEY = 'test-key';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    const res = await GET(makeRequest({ locale: 'ko', contentTypeId: '39' }), makeContext('777'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.detail.content_id).toBe('777');
    expect(data.detail.content_type).toBe(39);
  });
});
