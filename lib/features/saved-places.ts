import { isCrowdLevel, type CrowdLevel } from '@/lib/domain';

export const SAVED_PLACES_STORAGE_KEY = 'k-vibe-saved-places';

export interface SaveablePlace {
  id: string;
  contentId?: string;
  contentTypeId?: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  overview?: string;
  tags?: string[];
  crowdLevel?: CrowdLevel;
}

export interface SavedPlace extends SaveablePlace {
  savedAt: string;
}

function cleanOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeSavedPlace(value: unknown): SavedPlace | null {
  const item = value as Partial<SavedPlace>;
  const id = cleanOptionalString(item.contentId) ?? cleanOptionalString(item.id);
  const name = cleanOptionalString(item.name);
  const category = cleanOptionalString(item.category);
  const address = cleanOptionalString(item.address);
  const lat = Number(item.lat);
  const lng = Number(item.lng);

  if (!id || !name || !category || !address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const contentTypeId = Number(item.contentTypeId);

  return {
    id,
    contentId: cleanOptionalString(item.contentId),
    contentTypeId: Number.isFinite(contentTypeId) ? contentTypeId : undefined,
    name,
    category,
    address,
    lat,
    lng,
    imageUrl: cleanOptionalString(item.imageUrl),
    overview: cleanOptionalString(item.overview),
    tags: Array.isArray(item.tags)
      ? item.tags.map(cleanOptionalString).filter((tag): tag is string => Boolean(tag))
      : [],
    crowdLevel: isCrowdLevel(item.crowdLevel) ? item.crowdLevel : undefined,
    savedAt: cleanOptionalString(item.savedAt) ?? new Date(0).toISOString(),
  };
}

export function createSavedPlace(place: SaveablePlace, savedAt = new Date().toISOString()): SavedPlace {
  const id = place.contentId?.trim() || place.id;

  return {
    id,
    contentId: place.contentId,
    contentTypeId: place.contentTypeId,
    name: place.name,
    category: place.category,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    imageUrl: place.imageUrl,
    overview: place.overview,
    tags: place.tags ?? [],
    crowdLevel: place.crowdLevel,
    savedAt,
  };
}

export function parseSavedPlaces(value: string | null): SavedPlace[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSavedPlace)
      .filter((place): place is SavedPlace => Boolean(place))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

export function serializeSavedPlaces(places: SavedPlace[]) {
  return JSON.stringify(places);
}

export function getSavedPlaceId(place: Pick<SaveablePlace, 'id' | 'contentId'> | string) {
  if (typeof place === 'string') return place;
  return place.contentId?.trim() || place.id;
}

export function hasSavedPlace(places: SavedPlace[], place: Pick<SaveablePlace, 'id' | 'contentId'> | string) {
  const id = getSavedPlaceId(place);
  return places.some((saved) => saved.id === id || saved.contentId === id);
}

export function upsertSavedPlace(places: SavedPlace[], place: SaveablePlace, savedAt?: string) {
  const saved = createSavedPlace(place, savedAt);
  return [saved, ...places.filter((item) => item.id !== saved.id && item.contentId !== saved.id)];
}

export function removeSavedPlace(places: SavedPlace[], place: Pick<SaveablePlace, 'id' | 'contentId'> | string) {
  const id = getSavedPlaceId(place);
  return places.filter((item) => item.id !== id && item.contentId !== id);
}
