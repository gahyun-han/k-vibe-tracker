export const LAST_KNOWN_LOCATION_STORAGE_KEY = 'k-vibe-last-known-location';
export const LAST_KNOWN_LOCATION_TTL_MS = 30 * 60 * 1000;

export interface LastKnownLocation {
  lat: number;
  lng: number;
  accuracyM?: number;
  timestamp: number;
}

type LocationStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function isValidCoordinate(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function readLastKnownLocation(storage: LocationStorage, now = Date.now()): LastKnownLocation | null {
  try {
    const rawValue = storage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<LastKnownLocation>;
    const lat = Number(parsed.lat);
    const lng = Number(parsed.lng);
    const timestamp = Number(parsed.timestamp);
    const accuracyM = parsed.accuracyM === undefined ? undefined : Number(parsed.accuracyM);

    if (!isValidCoordinate(lat, lng) || !Number.isFinite(timestamp)) {
      storage.removeItem(LAST_KNOWN_LOCATION_STORAGE_KEY);
      return null;
    }

    if (now - timestamp > LAST_KNOWN_LOCATION_TTL_MS) {
      storage.removeItem(LAST_KNOWN_LOCATION_STORAGE_KEY);
      return null;
    }

    return {
      lat,
      lng,
      timestamp,
      ...(Number.isFinite(accuracyM) ? { accuracyM } : {}),
    };
  } catch {
    storage.removeItem(LAST_KNOWN_LOCATION_STORAGE_KEY);
    return null;
  }
}

export function writeLastKnownLocation(
  storage: LocationStorage,
  location: { lat: number; lng: number; accuracyM?: number },
  timestamp = Date.now(),
) {
  if (!isValidCoordinate(location.lat, location.lng)) return false;

  try {
    const payload: LastKnownLocation = {
      lat: location.lat,
      lng: location.lng,
      timestamp,
      ...(Number.isFinite(location.accuracyM) ? { accuracyM: location.accuracyM } : {}),
    };
    storage.setItem(LAST_KNOWN_LOCATION_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}
