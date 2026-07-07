import { haversineKm } from '@/lib/haversine';
import type { TourApiFestivalItem, TourApiLocale } from '@/lib/tourapi';

export const FACILITY_TYPES = [
  'restroom',
  'atm',
  'medical',
  'transit',
  'pharmacy',
  'cafe_toilet',
  'convenience',
  'popup',
] as const;

export type FacilityType = (typeof FACILITY_TYPES)[number];
export type FacilityFilter = FacilityType | 'all';

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  address: string;
  distance: number;
  is24h?: boolean;
  isOpen?: boolean;
  hasDisabled?: boolean;
  floor?: string;
  lat: number;
  lng: number;
  extra?: string;
}

interface FacilityBlueprint extends Omit<Facility, 'lat' | 'lng' | 'distance'> {
  offsetLat: number;
  offsetLng: number;
}

interface FacilityQuery {
  lat: number;
  lng: number;
  radius: number;
  type: FacilityFilter;
  locale?: TourApiLocale;
}

const FACILITY_BLUEPRINTS: FacilityBlueprint[] = [
  {
    id: 'facility_restroom_station',
    type: 'restroom',
    name: 'Seongsu Station Public Restroom',
    address: 'Seongsu Station Exit 3, B1',
    is24h: true,
    hasDisabled: true,
    floor: 'B1',
    offsetLat: 0.0006,
    offsetLng: 0.0004,
  },
  {
    id: 'facility_pharmacy_main',
    type: 'pharmacy',
    name: 'Seongsu Onnuri Pharmacy',
    address: '77 Seongsui-ro, Seongdong-gu',
    isOpen: true,
    offsetLat: 0.0016,
    offsetLng: 0.0012,
  },
  {
    id: 'facility_atm_bank',
    type: 'atm',
    name: 'KB ATM Seongsu Branch',
    address: '82 Seongsui-ro, Seongdong-gu',
    is24h: true,
    extra: 'International cards may vary by issuer',
    offsetLat: 0.001,
    offsetLng: -0.0009,
  },
  {
    id: 'facility_medical_clinic',
    type: 'medical',
    name: 'Seongsu 24h Travel Clinic',
    address: '91 Seongsui-ro, Seongdong-gu',
    isOpen: true,
    extra: '24h emergency desk / English help desk',
    offsetLat: 0.0019,
    offsetLng: -0.0013,
  },
  {
    id: 'facility_transit_station',
    type: 'transit',
    name: 'Seongsu Station Exit 3',
    address: 'Seongsu Station, Line 2',
    isOpen: true,
    extra: 'Line 2 / airport transfer via Hongik Univ.',
    offsetLat: 0.0014,
    offsetLng: 0.0003,
  },
  {
    id: 'facility_convenience_cu',
    type: 'convenience',
    name: 'CU Seongsu Cafe Street',
    address: '68 Seongsu-ro, Seongdong-gu',
    is24h: true,
    offsetLat: -0.0021,
    offsetLng: 0.0015,
  },
  {
    id: 'facility_popup_musinsa',
    type: 'popup',
    name: 'Musinsa Pop-up Store',
    address: '113 Achasan-ro, Seongdong-gu',
    isOpen: true,
    extra: 'Runs through 2026-06-30',
    offsetLat: 0.003,
    offsetLng: 0.0022,
  },
  {
    id: 'facility_cafe_toilet',
    type: 'cafe_toilet',
    name: 'Partner Cafe Restroom',
    address: '99 Seongsu-ro, Seongdong-gu',
    isOpen: true,
    extra: 'Available to paying customers',
    offsetLat: -0.0041,
    offsetLng: -0.0022,
  },
  {
    id: 'facility_restroom_park',
    type: 'restroom',
    name: 'Ttukseom Park Public Restroom',
    address: 'Ttukseom Hangang Park, B1',
    is24h: false,
    hasDisabled: true,
    floor: 'B1',
    offsetLat: 0.0065,
    offsetLng: 0.003,
  },
];

export function isFacilityType(value: string): value is FacilityType {
  return FACILITY_TYPES.includes(value as FacilityType);
}

export function isFacilityFilter(value: string): value is FacilityFilter {
  return value === 'all' || isFacilityType(value);
}

export function buildFacilitiesCacheKey({ lat, lng, radius, type, locale = 'ko' }: FacilityQuery) {
  return `facilities:${locale}:${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}:${type}`;
}

export function getMockFacilities({ lat, lng, radius, type }: FacilityQuery): Facility[] {
  return FACILITY_BLUEPRINTS.map((facility) => {
    const facilityLat = roundCoordinate(lat + facility.offsetLat);
    const facilityLng = roundCoordinate(lng + facility.offsetLng);
    const distance = Math.round(haversineKm(lat, lng, facilityLat, facilityLng) * 1000);
    const { offsetLat: _offsetLat, offsetLng: _offsetLng, ...rest } = facility;

    return {
      ...rest,
      lat: facilityLat,
      lng: facilityLng,
      distance,
    };
  })
    .filter((facility) => facility.distance <= radius)
    .filter((facility) => type === 'all' || facility.type === type)
    .sort((a, b) => a.distance - b.distance);
}

export function normalizeTourApiFestivalFacilities({
  items,
  lat,
  lng,
  radius,
  type,
}: {
  items: TourApiFestivalItem[];
  lat: number;
  lng: number;
  radius: number;
  type: FacilityFilter;
}): Facility[] {
  if (type !== 'all' && type !== 'popup') return [];

  return items
    .map((item) => {
      const contentId = String(item.contentid ?? '').trim();
      const title = String(item.title ?? '').trim();
      const facilityLat = Number(item.mapy);
      const facilityLng = Number(item.mapx);

      if (!contentId || !title || !Number.isFinite(facilityLat) || !Number.isFinite(facilityLng)) {
        return null;
      }

      const distance = Math.round(haversineKm(lat, lng, facilityLat, facilityLng) * 1000);
      const address = [item.addr1, item.addr2]
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .join(' ');
      const extra = [
        formatTourApiDateRange(item.eventstartdate, item.eventenddate),
        String(item.progresstype ?? '').trim(),
        String(item.festivaltype ?? '').trim(),
      ]
        .filter(Boolean)
        .join(' / ');

      const facility: Facility = {
        id: `tourapi_popup_${contentId}`,
        type: 'popup' as const,
        name: title,
        address: address || 'TourAPI event location',
        distance,
        isOpen: true,
        lat: roundCoordinate(facilityLat),
        lng: roundCoordinate(facilityLng),
        extra: extra || undefined,
      };
      return facility;
    })
    .filter((facility): facility is Facility => Boolean(facility))
    .filter((facility) => facility.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export function buildGoogleMapsFacilityUrl(facility: Pick<Facility, 'lat' | 'lng'>) {
  const url = new URL('https://www.google.com/maps/search/');
  url.searchParams.set('api', '1');
  url.searchParams.set('query', `${facility.lat},${facility.lng}`);
  return url.toString();
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function formatTourApiDateRange(start: unknown, end: unknown) {
  const startDate = formatTourApiDate(start);
  const endDate = formatTourApiDate(end);
  if (startDate && endDate && startDate !== endDate) return `${startDate} - ${endDate}`;
  return startDate ?? endDate ?? '';
}

function formatTourApiDate(value: unknown) {
  const text = String(value ?? '').replace(/\D/g, '');
  if (text.length !== 8) return '';
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}
