import {
  buildPlacesCacheKey,
  buildTourApiLocationUrl,
  isPlaceCategory,
  isTourApiLocale,
  normalizeTourApiItems,
  toTourApiItemArray,
  type NormalizedPlace,
  type PlaceCategory,
  type TourApiLocale,
} from '@/lib/domain';
import { backendConfig } from '@/backend/config/configure';
import { getTourApiKey } from '@/backend/dependency';
import { parseCoordinate } from './guards';

type PlacesError = 'INVALID_COORDINATES' | 'INVALID_RADIUS' | 'INVALID_CATEGORY' | 'INVALID_LOCALE';
type PlacesSource = 'mock' | 'tourapi';

interface PlacesData {
  places: NormalizedPlace[];
  cached: false;
  source: PlacesSource;
  cache_key: string;
}

interface PlacesSuccess {
  ok: true;
  data: PlacesData;
}

interface PlacesFailure {
  ok: false;
  error: PlacesError;
  status: 400;
}

interface GetPlacesInput {
  lat: string | null;
  lng: string | null;
  radius: string | null;
  category: string | null;
  locale: string | null;
}

export type PlacesResult = PlacesSuccess | PlacesFailure;

export async function getPlacesData({
  lat: rawLat,
  lng: rawLng,
  radius: rawRadius,
  category: rawCategory,
  locale: rawLocale,
}: GetPlacesInput): Promise<PlacesResult> {
  const lat = parseCoordinate(rawLat, -90, 90);
  const lng = parseCoordinate(rawLng, -180, 180);
  const radius = parseRadius(rawRadius);
  const categoryParam = rawCategory ?? 'all';
  const localeParam = rawLocale ?? 'ko';

  if (lat === null || lng === null) {
    return { ok: false, error: 'INVALID_COORDINATES', status: 400 };
  }

  if (radius === null) {
    return { ok: false, error: 'INVALID_RADIUS', status: 400 };
  }

  if (!isPlaceCategory(categoryParam)) {
    return { ok: false, error: 'INVALID_CATEGORY', status: 400 };
  }

  if (!isTourApiLocale(localeParam)) {
    return { ok: false, error: 'INVALID_LOCALE', status: 400 };
  }

  const category = categoryParam;
  const locale = localeParam;
  const cacheKey = buildPlacesCacheKey({ lat, lng, radius, category, locale });
  const serviceKey = getTourApiKey();

  if (!serviceKey) {
    return { ok: true, data: buildMockPlacesData(lat, lng, radius, category, locale, cacheKey) };
  }

  try {
    const res = await fetch(
      buildTourApiLocationUrl({ serviceKey, lat, lng, radius, category, locale }),
      { signal: AbortSignal.timeout(backendConfig.tourApiTimeoutMs) },
    );

    if (!res.ok) {
      console.error(`[places] TourAPI fallback: HTTP ${res.status}`);
      return { ok: true, data: buildMockPlacesData(lat, lng, radius, category, locale, cacheKey) };
    }

    const payload = await res.json().catch(() => null);
    if (!payload) {
      console.error('[places] TourAPI fallback: invalid JSON response');
      return { ok: true, data: buildMockPlacesData(lat, lng, radius, category, locale, cacheKey) };
    }

    return {
      ok: true,
      data: {
        places: normalizeTourApiItems({
          items: toTourApiItemArray(payload),
          originLat: lat,
          originLng: lng,
          radius,
          requestedCategory: category,
        }),
        cached: false,
        source: 'tourapi',
        cache_key: cacheKey,
      },
    };
  } catch (error) {
    console.error('[places] TourAPI fallback:', error);
    return { ok: true, data: buildMockPlacesData(lat, lng, radius, category, locale, cacheKey) };
  }
}

function parseRadius(value: string | null) {
  if (!value) return backendConfig.places.defaultRadius;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= backendConfig.places.maxRadius ? Math.round(num) : null;
}

function buildMockPlacesData(
  lat: number,
  lng: number,
  radius: number,
  category: PlaceCategory,
  locale: TourApiLocale,
  cacheKey = buildPlacesCacheKey({ lat, lng, radius, category, locale }),
): PlacesData {
  return {
    places: mockPlaces(lat, lng, category),
    cached: false,
    source: 'mock',
    cache_key: cacheKey,
  };
}

function mockPlaces(lat: number, lng: number, category: PlaceCategory): NormalizedPlace[] {
  const places: NormalizedPlace[] = [
    {
      id: 'mock_1',
      content_id: 'mock_1',
      content_type: 39,
      name: 'Seongsu Cafe Street',
      name_ko: 'Seongsu Cafe Street',
      name_en: 'Seongsu Cafe Street',
      name_ja: null,
      name_zh: null,
      lat: lat + 0.001,
      lng: lng + 0.001,
      address: 'Seongsu-dong, Seoul',
      category: 'cafe',
      image_url: null,
      crowd_level: 72,
      distance_m: 140,
    },
    {
      id: 'mock_2',
      content_id: 'mock_2',
      content_type: 12,
      name: 'Hongdae Photo Booth',
      name_ko: 'Hongdae Photo Booth',
      name_en: 'Hongdae Photo Booth',
      name_ja: null,
      name_zh: null,
      lat: lat - 0.002,
      lng: lng + 0.002,
      address: 'Hongdae, Seoul',
      category: 'photo',
      image_url: null,
      crowd_level: 45,
      distance_m: 280,
    },
    {
      id: 'mock_3',
      content_id: 'mock_3',
      content_type: 14,
      name: 'Gyeongbokgung Palace',
      name_ko: 'Gyeongbokgung Palace',
      name_en: 'Gyeongbokgung Palace',
      name_ja: null,
      name_zh: null,
      lat: lat + 0.004,
      lng: lng - 0.003,
      address: 'Jongno-gu, Seoul',
      category: 'culture',
      image_url: null,
      crowd_level: 84,
      distance_m: 520,
    },
    {
      id: 'mock_4',
      content_id: 'mock_4',
      content_type: 39,
      name: 'Gwangjang Market Food Alley',
      name_ko: 'Gwangjang Market Food Alley',
      name_en: 'Gwangjang Market Food Alley',
      name_ja: null,
      name_zh: null,
      lat: lat - 0.004,
      lng: lng - 0.002,
      address: 'Jongno-gu, Seoul',
      category: 'food',
      image_url: null,
      crowd_level: 61,
      distance_m: 570,
    },
  ];

  return category === 'all' ? places : places.filter((place) => place.category === category);
}
