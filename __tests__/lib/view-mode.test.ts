import { describe, expect, it } from 'vitest';
import { getInitialViewMode, normalizeViewMode, VIEW_MODE_STORAGE_KEY } from '@/lib/view-mode';

describe('view mode helpers', () => {
  it('normalizes unknown values to mobile', () => {
    expect(normalizeViewMode('desktop')).toBe('desktop');
    expect(normalizeViewMode('mobile')).toBe('mobile');
    expect(normalizeViewMode('wide')).toBe('mobile');
    expect(normalizeViewMode(null)).toBe('mobile');
  });

  it('prefers the stored mode before viewport width', () => {
    expect(getInitialViewMode(390, 'desktop')).toBe('desktop');
    expect(getInitialViewMode(1440, 'mobile')).toBe('mobile');
  });

  it('uses desktop as the default for PC-width screens', () => {
    expect(getInitialViewMode(390)).toBe('mobile');
    expect(getInitialViewMode(1024)).toBe('desktop');
    expect(getInitialViewMode(1440)).toBe('desktop');
    expect(VIEW_MODE_STORAGE_KEY).toBe('k-vibe-view-mode');
  });
});
