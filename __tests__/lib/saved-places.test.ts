import { describe, expect, it } from 'vitest';
import {
  createSavedPlace,
  hasSavedPlace,
  parseSavedPlaces,
  removeSavedPlace,
  SAVED_PLACES_STORAGE_KEY,
  serializeSavedPlaces,
  upsertSavedPlace,
  type SaveablePlace,
} from '@/lib/saved-places';

const PLACE: SaveablePlace = {
  id: 'map-1',
  contentId: '123',
  contentTypeId: 12,
  name: 'Seoul Forest',
  category: 'culture',
  address: 'Seongdong-gu, Seoul',
  lat: 37.5443,
  lng: 127.0374,
  imageUrl: 'https://example.com/forest.jpg',
  overview: 'A park stop.',
  tags: ['park', 'healing'],
};

describe('saved place helpers', () => {
  it('uses a stable storage key', () => {
    expect(SAVED_PLACES_STORAGE_KEY).toBe('k-vibe-saved-places');
  });

  it('creates saved places using TourAPI content ids when available', () => {
    const saved = createSavedPlace(PLACE, '2026-06-16T00:00:00.000Z');

    expect(saved.id).toBe('123');
    expect(saved.contentTypeId).toBe(12);
    expect(saved.savedAt).toBe('2026-06-16T00:00:00.000Z');
  });

  it('parses valid saved places and drops malformed entries', () => {
    const saved = createSavedPlace(PLACE, '2026-06-16T00:00:00.000Z');
    const parsed = parseSavedPlaces(JSON.stringify([saved, { id: '', name: 'bad' }]));

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Seoul Forest');
    expect(parseSavedPlaces('not json')).toEqual([]);
  });

  it('upserts, detects, serializes, and removes saved places', () => {
    const saved = upsertSavedPlace([], PLACE, '2026-06-16T00:00:00.000Z');
    const updated = upsertSavedPlace(saved, { ...PLACE, name: 'Updated Seoul Forest' }, '2026-06-17T00:00:00.000Z');

    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe('Updated Seoul Forest');
    expect(hasSavedPlace(updated, PLACE)).toBe(true);
    expect(parseSavedPlaces(serializeSavedPlaces(updated))).toHaveLength(1);
    expect(removeSavedPlace(updated, PLACE)).toEqual([]);
  });
});
