import { describe, expect, it } from 'vitest';
import { buildPlaceDetailShareUrl } from '@/lib/place-detail-share';

describe('place detail share url', () => {
  it('builds a same-origin map detail URL with place context', () => {
    const url = new URL(
      buildPlaceDetailShareUrl(
        {
          contentId: '3518593',
          contentTypeId: 15,
          name: '서울 페스타',
          category: 'culture',
          address: '서울특별시 중구',
          lat: 37.5662570431,
          lng: 126.9777210995,
          imageUrl: 'https://example.com/place.jpg',
          overview: '서울 축제 상세',
          tags: ['festival', 'night'],
        },
        'ko',
        'http://localhost:3000/ko/map?old=1',
      ),
    );

    expect(url.origin).toBe('http://localhost:3000');
    expect(url.pathname).toBe('/ko/map');
    expect(url.searchParams.get('lat')).toBe('37.5662570431');
    expect(url.searchParams.get('lng')).toBe('126.9777210995');
    expect(url.searchParams.get('q')).toBe('서울 페스타');
    expect(url.searchParams.get('source')).toBe('share');
    expect(url.searchParams.get('detail')).toBe('1');
    expect(url.searchParams.get('category')).toBe('culture');
    expect(url.searchParams.get('address')).toBe('서울특별시 중구');
    expect(url.searchParams.get('contentId')).toBe('3518593');
    expect(url.searchParams.get('contentTypeId')).toBe('15');
    expect(url.searchParams.get('imageUrl')).toBe('https://example.com/place.jpg');
    expect(url.searchParams.get('description')).toBe('서울 축제 상세');
    expect(url.searchParams.get('tags')).toBe('festival,night');
  });
});
