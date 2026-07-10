import { describe, expect, it } from 'vitest';
import { isCrowdLevel, toCrowdLevel } from '@/lib/domain';

describe('crowd helpers', () => {
  it('maps numeric crowd signals to UI levels', () => {
    expect(toCrowdLevel(null)).toBeUndefined();
    expect(toCrowdLevel(undefined)).toBeUndefined();
    expect(toCrowdLevel(12)).toBe('low');
    expect(toCrowdLevel(40)).toBe('mid');
    expect(toCrowdLevel(69)).toBe('mid');
    expect(toCrowdLevel(70)).toBe('high');
  });

  it('validates persisted and query-string crowd levels', () => {
    expect(isCrowdLevel('low')).toBe(true);
    expect(isCrowdLevel('mid')).toBe(true);
    expect(isCrowdLevel('high')).toBe(true);
    expect(isCrowdLevel('busy')).toBe(false);
  });
});
