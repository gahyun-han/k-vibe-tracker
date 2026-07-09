import {
  buildFacilitiesCacheKey,
  buildTourApiFestivalUrl,
  getMockFacilities,
  isFacilityFilter,
  isTourApiLocale,
  normalizeTourApiFestivalFacilities,
  toTourApiArray,
  type Facility,
  type FacilityFilter,
  type TourApiFestivalItem,
} from '@/lib/domain';
import { backendConfig } from '@/backend/config/configure';
import { getTourApiKey } from '@/backend/dependency';
import { parseCoordinate } from './guards';

type FacilitiesError = 'INVALID_COORDINATES' | 'INVALID_RADIUS' | 'INVALID_TYPE' | 'INVALID_LOCALE';
type FacilitiesSource = 'mock' | 'tourapi';

interface FacilitiesData {
  facilities: Facility[];
  cached: false;
  source: FacilitiesSource;
  cache_key: string;
}

interface FacilitiesSuccess {
  ok: true;
  data: FacilitiesData;
}

interface FacilitiesFailure {
  ok: false;
  error: FacilitiesError;
  status: 400;
}

interface GetFacilitiesInput {
  lat: string | null;
  lng: string | null;
  radius: string | null;
  type: string | null;
  locale: string | null;
}

export type FacilitiesResult = FacilitiesSuccess | FacilitiesFailure;

export async function getFacilitiesData({
  lat: rawLat,
  lng: rawLng,
  radius: rawRadius,
  type: rawType,
  locale: rawLocale,
}: GetFacilitiesInput): Promise<FacilitiesResult> {
  const lat = parseCoordinate(rawLat, -90, 90);
  const lng = parseCoordinate(rawLng, -180, 180);
  const radius = parseRadius(rawRadius);
  const typeParam = rawType ?? 'all';
  const localeParam = rawLocale ?? 'ko';

  if (lat === null || lng === null) {
    return { ok: false, error: 'INVALID_COORDINATES', status: 400 };
  }

  if (radius === null) {
    return { ok: false, error: 'INVALID_RADIUS', status: 400 };
  }

  if (!isFacilityFilter(typeParam)) {
    return { ok: false, error: 'INVALID_TYPE', status: 400 };
  }

  if (!isTourApiLocale(localeParam)) {
    return { ok: false, error: 'INVALID_LOCALE', status: 400 };
  }

  const type: FacilityFilter = typeParam;
  const baseFacilities = getMockFacilities({ lat, lng, radius, type });
  let facilities = baseFacilities;
  let source: FacilitiesSource = 'mock';
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

  return {
    ok: true,
    data: {
      facilities,
      cached: false,
      source,
      cache_key: buildFacilitiesCacheKey({ lat, lng, radius, type, locale: localeParam }),
    },
  };
}

function parseRadius(value: string | null) {
  if (!value) return backendConfig.facilities.defaultRadius;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= backendConfig.facilities.maxRadius ? Math.round(num) : null;
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
