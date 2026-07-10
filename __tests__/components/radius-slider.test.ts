import { describe, expect, it } from 'vitest';
import { getNextRadarRadius, RADAR_RADIUS_STEPS } from '@/lib/ui-state';

describe('radar radius controls', () => {
  it('advances to the next configured radius step', () => {
    expect(RADAR_RADIUS_STEPS).toEqual([300, 500, 800, 1000, 1500]);
    expect(getNextRadarRadius(300)).toBe(500);
    expect(getNextRadarRadius(500)).toBe(800);
    expect(getNextRadarRadius(1499)).toBe(1500);
    expect(getNextRadarRadius(1500)).toBeNull();
  });
});
