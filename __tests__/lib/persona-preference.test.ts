import { describe, expect, it } from 'vitest';
import {
  createPersonaPreference,
  getPersonaFeedCategory,
  parsePersonaPreference,
  serializePersonaPreference,
} from '@/lib/persona-preference';

describe('persona preference', () => {
  it('round-trips a valid local persona preference', () => {
    const preference = createPersonaPreference('kpop', 'bts', '2026-06-17T00:00:00.000Z');
    const parsed = parsePersonaPreference(serializePersonaPreference(preference));

    expect(parsed).toEqual(preference);
    expect(getPersonaFeedCategory(preference)).toBe('fun');
  });

  it('uses detail-level feed categories when they are more specific', () => {
    expect(getPersonaFeedCategory(createPersonaPreference('mood', 'food'))).toBe('food');
    expect(getPersonaFeedCategory(createPersonaPreference('creator', 'design'))).toBe('photo');
  });

  it('rejects invalid preference payloads', () => {
    expect(parsePersonaPreference(null)).toBeNull();
    expect(parsePersonaPreference('{')).toBeNull();
    expect(
      parsePersonaPreference(JSON.stringify({ theme: 'kpop', detail: 'bad', updatedAt: new Date().toISOString() })),
    ).toBeNull();
    expect(
      parsePersonaPreference(JSON.stringify({ theme: 'unknown', detail: 'bts', updatedAt: new Date().toISOString() })),
    ).toBeNull();
    expect(parsePersonaPreference(JSON.stringify({ theme: 'kpop', detail: 'bts', updatedAt: 'not-a-date' }))).toBeNull();
  });
});
