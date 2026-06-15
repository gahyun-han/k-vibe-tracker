import { haversineKm } from '@/lib/haversine';

export const FACILITY_TYPES = [
  'restroom',
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

export function buildFacilitiesCacheKey({ lat, lng, radius, type }: FacilityQuery) {
  return `facilities:${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}:${type}`;
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

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}
