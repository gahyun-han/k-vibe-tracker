import { NextResponse, type NextRequest } from 'next/server';
import {
  buildFacilitiesCacheKey,
  getMockFacilities,
  isFacilityFilter,
  normalizeTourApiFestivalFacilities,
  type FacilityFilter,
} from '@/lib/facilities';
import {
  buildTourApiFestivalUrl,
  isTourApiLocale,
  toTourApiArray,
  type TourApiFestivalItem,
} from '@/lib/tourapi';
import { getTourApiKey } from '@/backend/dependency';
import { backendConfig } from '@/backend/config/configure';
import { parseCoordinate } from '@/backend/business_services/guards';

function parseRadius(value: string | null) {
  if (!value) return backendConfig.facilities.defaultRadius;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= backendConfig.facilities.maxRadius ? Math.round(num) : null;
}

export async function getFacilities(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get('lat'), -90, 90);
  const lng = parseCoordinate(searchParams.get('lng'), -180, 180);
  const radius = parseRadius(searchParams.get('radius'));
  const typeParam = searchParams.get('type') ?? 'all';
  const localeParam = searchParams.get('locale') ?? 'ko';

  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'INVALID_COORDINATES' }, { status: 400 });
  }

  if (radius === null) {
    return NextResponse.json({ error: 'INVALID_RADIUS' }, { status: 400 });
  }

  if (!isFacilityFilter(typeParam)) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 });
  }

  if (!isTourApiLocale(localeParam)) {
    return NextResponse.json({ error: 'INVALID_LOCALE' }, { status: 400 });
  }

  const type: FacilityFilter = typeParam;
  const baseFacilities = getMockFacilities({ lat, lng, radius, type });
  let facilities = baseFacilities;
  let source: 'mock' | 'tourapi' = 'mock';
  const serviceKey = getTourApiKey();

  if (serviceKey && (type === 'all' || type === 'popup')) {
    try {
      const now = new Date();
      const res = await fetch(
        buildTourApiFestivalUrl({
          serviceKey,
          locale: localeParam,
          startDate: toTourApiDate(now),
          endDate: toTourApiDate(addDays(now, backendConfig.facilities.festivalLookaheadDays)),
        }),
      );
      if (res.ok) {
        const payload = await res.json();
        const livePopups = normalizeTourApiFestivalFacilities({
          items: toTourApiArray<TourApiFestivalItem>(payload),
          lat,
          lng,
          radius,
          type,
        });
        if (livePopups.length) {
          facilities = [...baseFacilities, ...livePopups].sort((a, b) => a.distance - b.distance);
          source = 'tourapi';
        }
      }
    } catch {
      facilities = baseFacilities;
      source = 'mock';
    }
  }

  return NextResponse.json({
    facilities,
    cached: false,
    source,
    cache_key: buildFacilitiesCacheKey({ lat, lng, radius, type, locale: localeParam }),
  });
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function toTourApiDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}${get('month')}${get('day')}`;
}
