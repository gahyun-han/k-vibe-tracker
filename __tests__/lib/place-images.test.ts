import { describe, expect, it } from 'vitest';
import { buildPlaceImageGallery } from '@/lib/features';

describe('place image helpers', () => {
  it('dedupes images, keeps fallback image URLs, and limits gallery size', () => {
    const gallery = buildPlaceImageGallery(
      {
        imageUrl: 'https://example.com/fallback.jpg',
        images: [
          'https://example.com/hero.jpg',
          'https://example.com/hero.jpg',
          '',
          'ftp://example.com/skip.jpg',
          'https://example.com/detail.jpg',
          'https://example.com/extra-1.jpg',
          'https://example.com/extra-2.jpg',
          'https://example.com/extra-3.jpg',
        ],
      },
      4,
    );

    expect(gallery).toEqual([
      'https://example.com/hero.jpg',
      'https://example.com/detail.jpg',
      'https://example.com/extra-1.jpg',
      'https://example.com/extra-2.jpg',
    ]);
  });

  it('uses the imageUrl fallback when no image list is available', () => {
    expect(buildPlaceImageGallery({ imageUrl: 'https://example.com/fallback.jpg' })).toEqual([
      'https://example.com/fallback.jpg',
    ]);
  });
});
