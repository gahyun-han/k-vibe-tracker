import { NextResponse, type NextRequest } from 'next/server';
import {
  buildFacilitiesCacheKey,
  getMockFacilities,
  isFacilityFilter,
  type FacilityFilter,
} from '@/lib/facilities';

const DEFAULT_RADIUS = 500;
const MAX_RADIUS = 3_000;

function parseCoordinate(value: string | null, min: number, max: number) {
  if (value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) && num >= min && num <= max ? num : null;
}

function parseRadius(value: string | null) {
  if (!value) return DEFAULT_RADIUS;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && num <= MAX_RADIUS ? Math.round(num) : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get('lat'), -90, 90);
  const lng = parseCoordinate(searchParams.get('lng'), -180, 180);
  const radius = parseRadius(searchParams.get('radius'));
  const typeParam = searchParams.get('type') ?? 'all';

  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'INVALID_COORDINATES' }, { status: 400 });
  }

  if (radius === null) {
    return NextResponse.json({ error: 'INVALID_RADIUS' }, { status: 400 });
  }

  if (!isFacilityFilter(typeParam)) {
    return NextResponse.json({ error: 'INVALID_TYPE' }, { status: 400 });
  }

  const type: FacilityFilter = typeParam;

  return NextResponse.json({
    facilities: getMockFacilities({ lat, lng, radius, type }),
    cached: false,
    source: 'mock',
    cache_key: buildFacilitiesCacheKey({ lat, lng, radius, type }),
  });
}
