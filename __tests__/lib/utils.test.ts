import { describe, it, expect } from 'vitest';
import { formatDistance, formatTime } from '@/lib/utils';

describe('formatDistance', () => {
  it('999m → "999m"', () => {
    expect(formatDistance(999)).toBe('999m');
  });

  it('1000m → "1.0km"', () => {
    expect(formatDistance(1000)).toBe('1.0km');
  });

  it('0m → "0m"', () => {
    expect(formatDistance(0)).toBe('0m');
  });

  it('500m → "500m"', () => {
    expect(formatDistance(500)).toBe('500m');
  });

  it('1500m → "1.5km"', () => {
    expect(formatDistance(1500)).toBe('1.5km');
  });

  it('2345m → 반올림 "2.3km"', () => {
    expect(formatDistance(2345)).toBe('2.3km');
  });

  it('999.4m → round → "999m"', () => {
    expect(formatDistance(999.4)).toBe('999m');
  });

  it('999.6m → round → "1000m" (1000m 미만 조건)', () => {
    expect(formatDistance(999.6)).toBe('1000m');
  });
});

describe('formatTime', () => {
  it('0분 → "0min"', () => {
    expect(formatTime(0)).toBe('0min');
  });

  it('59분 → "59min"', () => {
    expect(formatTime(59)).toBe('59min');
  });

  it('60분 → "1h"', () => {
    expect(formatTime(60)).toBe('1h');
  });

  it('90분 → "1h 30min"', () => {
    expect(formatTime(90)).toBe('1h 30min');
  });

  it('120분 → "2h"', () => {
    expect(formatTime(120)).toBe('2h');
  });

  it('125분 → "2h 5min"', () => {
    expect(formatTime(125)).toBe('2h 5min');
  });
});
