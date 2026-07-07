import { NextResponse, type NextRequest } from 'next/server';
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
} from '@/lib/tourapi';
import { getTourApiKey } from '@/backend/dependency';
import { backendConfig } from '@/backend/config/configure';
import { parseCoordinate } from '@/backend/business_services/guards';

function parseRadius(value: string | null) {
  if (!value) return backendConfig.places.defaultRadius;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= backendConfig.places.maxRadius ? Math.round(num) : null;
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

function mockResponse(
  lat: number,
  lng: number,
  radius: number,
  category: PlaceCategory,
  locale: TourApiLocale,
) {
  return NextResponse.json({
    places: mockPlaces(lat, lng, category),
    cached: false,
    source: 'mock',
    cache_key: buildPlacesCacheKey({ lat, lng, radius, category, locale }),
  });
}

export async function getPlaces(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get('lat'), -90, 90);
  const lng = parseCoordinate(searchParams.get('lng'), -180, 180);
  const radius = parseRadius(searchParams.get('radius'));
  const categoryParam = searchParams.get('category') ?? 'all';
  const localeParam = searchParams.get('locale') ?? 'ko';

  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'INVALID_COORDINATES' }, { status: 400 });
  }

  if (radius === null) {
    return NextResponse.json({ error: 'INVALID_RADIUS' }, { status: 400 });
  }

  if (!isPlaceCategory(categoryParam)) {
    return NextResponse.json({ error: 'INVALID_CATEGORY' }, { status: 400 });
  }

  if (!isTourApiLocale(localeParam)) {
    return NextResponse.json({ error: 'INVALID_LOCALE' }, { status: 400 });
  }

  const category = categoryParam;
  const locale = localeParam;
  const cacheKey = buildPlacesCacheKey({ lat, lng, radius, category, locale });
  const serviceKey = getTourApiKey();

  if (!serviceKey) {
    return mockResponse(lat, lng, radius, category, locale);
  }

  try {
    const res = await fetch(
      buildTourApiLocationUrl({ serviceKey, lat, lng, radius, category, locale }),
      { signal: AbortSignal.timeout(backendConfig.tourApiTimeoutMs) },
    );

    if (!res.ok) {
      console.error(`[places] TourAPI fallback: HTTP ${res.status}`);
      return mockResponse(lat, lng, radius, category, locale);
    }

    const payload = await res.json().catch(() => null);
    if (!payload) {
      console.error('[places] TourAPI fallback: invalid JSON response');
      return mockResponse(lat, lng, radius, category, locale);
    }

    const places = normalizeTourApiItems({
      items: toTourApiItemArray(payload),
      originLat: lat,
      originLng: lng,
      radius,
      requestedCategory: category,
    });

    return NextResponse.json({
      places,
      cached: false,
      source: 'tourapi',
      cache_key: cacheKey,
    });
  } catch (error) {
    console.error('[places] TourAPI fallback:', error);
    return mockResponse(lat, lng, radius, category, locale);
  }
}
