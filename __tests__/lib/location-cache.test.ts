import { describe, expect, it } from 'vitest';
import {
  LAST_KNOWN_LOCATION_STORAGE_KEY,
  LAST_KNOWN_LOCATION_TTL_MS,
  readLastKnownLocation,
  writeLastKnownLocation,
} from '@/lib/location-cache';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

describe('location cache', () => {
  it('stores and reads a valid last known location within the TTL', () => {
    const storage = new MemoryStorage();
    const timestamp = 1_000_000;

    expect(writeLastKnownLocation(storage, { lat: 37.5665, lng: 126.978, accuracyM: 25 }, timestamp)).toBe(true);

    expect(readLastKnownLocation(storage, timestamp + 60_000)).toEqual({
      lat: 37.5665,
      lng: 126.978,
      accuracyM: 25,
      timestamp,
    });
  });

  it('expires stale locations after 30 minutes', () => {
    const storage = new MemoryStorage();
    const timestamp = 1_000_000;

    writeLastKnownLocation(storage, { lat: 37.5665, lng: 126.978 }, timestamp);

    expect(readLastKnownLocation(storage, timestamp + LAST_KNOWN_LOCATION_TTL_MS + 1)).toBeNull();
    expect(storage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY)).toBeNull();
  });

  it('removes malformed cache payloads', () => {
    const storage = new MemoryStorage();
    storage.setItem(LAST_KNOWN_LOCATION_STORAGE_KEY, '{bad json');

    expect(readLastKnownLocation(storage)).toBeNull();
    expect(storage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY)).toBeNull();
  });

  it('rejects invalid coordinates', () => {
    const storage = new MemoryStorage();

    expect(writeLastKnownLocation(storage, { lat: 123, lng: 126.978 })).toBe(false);
    expect(storage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY)).toBeNull();
  });
});
