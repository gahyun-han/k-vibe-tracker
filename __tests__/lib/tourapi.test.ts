import { describe, expect, it } from 'vitest';
import {
  buildPlacesCacheKey,
  buildTourApiLocationUrl,
  getContentTypeIdForCategory,
  normalizeTourApiItems,
  toTourApiItemArray,
} from '@/lib/tourapi';

describe('tourapi helpers', () => {
  it('builds stable quantized cache keys', () => {
    expect(
      buildPlacesCacheKey({ lat: 37.56649, lng: 126.97803, radius: 1000, category: 'all' })
    ).toBe('places:37.57:126.98:r1000:call');
  });

  it('maps app categories to TourAPI content type ids', () => {
    expect(getContentTypeIdForCategory('food')).toBe(39);
    expect(getContentTypeIdForCategory('cafe')).toBe(39);
    expect(getContentTypeIdForCategory('culture')).toBe(14);
    expect(getContentTypeIdForCategory('stay')).toBe(32);
    expect(getContentTypeIdForCategory('all')).toBeUndefined();
  });

  it('does not double encode already encoded service keys', () => {
    const url = buildTourApiLocationUrl({
      serviceKey: 'abc%2B123%3D',
      lat: 37.5,
      lng: 127,
      radius: 1000,
      category: 'food',
    });

    expect(url).toContain('serviceKey=abc%2B123%3D');
    expect(url).toContain('mapX=127');
    expect(url).toContain('mapY=37.5');
    expect(url).toContain('contentTypeId=39');
  });

  it('normalizes single-object TourAPI item payloads', () => {
    const items = toTourApiItemArray({
      response: {
        body: {
          items: {
            item: {
              contentid: '1',
              contenttypeid: '14',
              title: 'Museum',
              mapx: '127.001',
              mapy: '37.501',
            },
          },
        },
      },
    });

    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Museum');
  });

  it('filters out malformed or out-of-radius TourAPI items', () => {
    const places = normalizeTourApiItems({
      originLat: 37.5,
      originLng: 127,
      radius: 500,
      requestedCategory: 'all',
      items: [
        {
          contentid: 'near',
          contenttypeid: '12',
          title: 'Near Spot',
          mapx: '127.001',
          mapy: '37.501',
        },
        {
          contentid: 'far',
          contenttypeid: '12',
          title: 'Far Spot',
          mapx: '128',
          mapy: '38',
        },
        {
          contentid: '',
          title: 'Malformed',
          mapx: '127',
          mapy: '37.5',
        },
      ],
    });

    expect(places).toHaveLength(1);
    expect(places[0].content_id).toBe('near');
    expect(places[0].category).toBe('culture');
  });
});
