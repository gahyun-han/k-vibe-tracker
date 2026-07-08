import { describe, expect, it } from 'vitest';
import { buildPlaceSeenInStats, formatCompactSocialCount } from '@/lib/features';

describe('place social proof helpers', () => {
  it('builds deterministic local seen-in stats from place metadata', () => {
    const place = {
      id: 'hongdae-street',
      contentId: '126128',
      name: 'Hongdae Street',
      category: 'photo',
      tags: ['SNS', 'street'],
    };

    expect(buildPlaceSeenInStats(place)).toEqual(buildPlaceSeenInStats(place));

    const stats = buildPlaceSeenInStats(place);
    expect(stats.youtubeVideos).toBeGreaterThanOrEqual(18);
    expect(stats.instagramPosts).toBeGreaterThanOrEqual(1400);
  });

  it('formats social counts compactly for badges', () => {
    expect(formatCompactSocialCount(999)).toBe('999');
    expect(formatCompactSocialCount(1200)).toBe('1.2k');
    expect(formatCompactSocialCount(12_400)).toBe('12k');
  });
});
