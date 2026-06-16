import { describe, expect, it } from 'vitest';
import {
  buildPlacesCacheKey,
  buildPlaceDetailCacheKey,
  buildTourApiDetailCommonUrl,
  buildTourApiDetailImageUrl,
  buildTourApiDetailIntroUrl,
  buildTourApiLocationUrl,
  cleanTourApiText,
  getContentTypeIdForCategory,
  getTourApiServiceForLocale,
  normalizeTourApiPlaceDetail,
  normalizeTourApiItems,
  toTourApiItemArray,
} from '@/lib/tourapi';

describe('tourapi helpers', () => {
  it('builds stable quantized cache keys', () => {
    expect(
      buildPlacesCacheKey({ lat: 37.56649, lng: 126.97803, radius: 1000, category: 'all' })
    ).toBe('places:ko:37.57:126.98:r1000:call');
  });

  it('maps app categories to TourAPI content type ids', () => {
    expect(getContentTypeIdForCategory('food')).toBe(39);
    expect(getContentTypeIdForCategory('cafe')).toBe(39);
    expect(getContentTypeIdForCategory('culture')).toBe(14);
    expect(getContentTypeIdForCategory('stay')).toBe(32);
    expect(getContentTypeIdForCategory('all')).toBeUndefined();
  });

  it('maps locale-specific TourAPI services and multilingual content type ids', () => {
    expect(getTourApiServiceForLocale('ko')).toBe('KorService2');
    expect(getTourApiServiceForLocale('en')).toBe('EngService2');
    expect(getTourApiServiceForLocale('ja')).toBe('JpnService2');
    expect(getTourApiServiceForLocale('zh')).toBe('ChsService2');
    expect(getContentTypeIdForCategory('food', 'en')).toBe(82);
    expect(getContentTypeIdForCategory('culture', 'ja')).toBe(78);
    expect(getContentTypeIdForCategory('stay', 'zh')).toBe(80);
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
    expect(url).toContain('/KorService2/locationBasedList2?');
    expect(url).toContain('mapX=127');
    expect(url).toContain('mapY=37.5');
    expect(url).toContain('arrange=S');
    expect(url).toContain('contentTypeId=39');
  });

  it('builds multilingual TourAPI location URLs', () => {
    const url = buildTourApiLocationUrl({
      serviceKey: 'abc',
      lat: 37.5,
      lng: 127,
      radius: 1000,
      category: 'food',
      locale: 'en',
    });

    expect(url).toContain('/EngService2/locationBasedList2?');
    expect(url).toContain('contentTypeId=82');
  });

  it('builds TourAPI detail URLs without exposing raw keys in cache keys', () => {
    expect(buildPlaceDetailCacheKey({ contentId: '126128', contentTypeId: 12, locale: 'en' }))
      .toBe('place-detail:en:126128:t12');

    const commonUrl = buildTourApiDetailCommonUrl({
      serviceKey: 'abc%2B123',
      contentId: '126128',
      locale: 'en',
    });
    const introUrl = buildTourApiDetailIntroUrl({
      serviceKey: 'abc%2B123',
      contentId: '126128',
      contentTypeId: 12,
      locale: 'en',
    });
    const imageUrl = buildTourApiDetailImageUrl({
      serviceKey: 'abc%2B123',
      contentId: '126128',
      locale: 'en',
    });

    expect(commonUrl).toContain('/EngService2/detailCommon2?');
    expect(commonUrl).toContain('overviewYN=Y');
    expect(introUrl).toContain('/EngService2/detailIntro2?');
    expect(introUrl).toContain('contentTypeId=12');
    expect(imageUrl).toContain('/EngService2/detailImage2?');
    expect(imageUrl).toContain('imageYN=Y');
    expect(imageUrl).toContain('subImageYN=Y');
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

  it('normalizes TourAPI place detail fields', () => {
    const detail = normalizeTourApiPlaceDetail({
      contentId: '126128',
      contentTypeId: 12,
      common: {
        contentid: '126128',
        contenttypeid: '12',
        title: 'Dongchon Resort',
        mapx: '128.65',
        mapy: '35.88',
        addr1: 'Dong-gu',
        addr2: 'Daegu',
        overview: '<p>A riverside&nbsp;spot.</p>',
        firstimage: 'https://example.com/hero.jpg',
      },
      intro: {
        contenttypeid: '12',
        usetime: '09:00-18:00',
        restdate: 'Open year-round',
        parking: 'Available',
      },
      images: [
        { originimgurl: 'https://example.com/hero.jpg' },
        { originimgurl: 'https://example.com/detail.jpg' },
      ],
    });

    expect(detail.name).toBe('Dongchon Resort');
    expect(detail.address).toBe('Dong-gu Daegu');
    expect(detail.overview).toBe('A riverside spot.');
    expect(detail.images).toEqual(['https://example.com/hero.jpg', 'https://example.com/detail.jpg']);
    expect(detail.open_hours).toBe('09:00-18:00');
    expect(detail.parking).toBe('Available');
    expect(cleanTourApiText('<b>Hello</b><br>World')).toBe('Hello\nWorld');
  });
});
