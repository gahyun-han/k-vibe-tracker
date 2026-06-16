import { describe, expect, it } from 'vitest';
import { getUiCopy, SUPPORTED_LOCALES } from '@/lib/ui-copy';

describe('ui copy', () => {
  it('provides Analyze and Radar copy for every supported locale', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const copy = getUiCopy(locale);

      expect(copy.analyze.title.length).toBeGreaterThan(0);
      expect(copy.analyze.loadingSteps).toHaveLength(3);
      expect(copy.analyze.viewOnMap.length).toBeGreaterThan(0);
      expect(copy.analyze.buildRoute.length).toBeGreaterThan(0);

      expect(copy.radar.title.length).toBeGreaterThan(0);
      expect(copy.radar.filters.all.length).toBeGreaterThan(0);
      expect(copy.radar.facilityTypes.restroom.length).toBeGreaterThan(0);
      expect(copy.radar.viewOnMap.length).toBeGreaterThan(0);
    }
  });
});
