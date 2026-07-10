import { describe, expect, it } from 'vitest';
import { buildMapPinAccessibleLabel } from '@/lib/features';

describe('Kakao map view helpers', () => {
  it('builds accessible map pin labels with place, category, and distance context', () => {
    expect(buildMapPinAccessibleLabel('Seongsu Cafe Street', 'Food', '320m')).toBe(
      'Seongsu Cafe Street · Food · 320m',
    );
    expect(buildMapPinAccessibleLabel('경복궁', '문화', '')).toBe('경복궁 · 문화');
  });
});
