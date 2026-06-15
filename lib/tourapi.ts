import { haversineKm } from '@/lib/haversine';

export type PlaceCategory = 'all' | 'cafe' | 'photo' | 'fun' | 'culture' | 'food' | 'stay';

export interface NormalizedPlace {
  id: string;
  content_id: string;
  content_type: number;
  name: string;
  name_ko: string;
  name_en: string | null;
  name_ja: string | null;
  name_zh: string | null;
  lat: number;
  lng: number;
  address: string | null;
  category: PlaceCategory;
  image_url: string | null;
  imageUrl?: string;
  crowd_level: number | null;
  distance_m?: number;
}

export interface TourApiItem {
  contentid?: string | number;
  contenttypeid?: string | number;
  title?: string;
  mapx?: string | number;
  mapy?: string | number;
  addr1?: string;
  firstimage?: string;
  dist?: string | number;
}

export const PLACE_CATEGORIES: PlaceCategory[] = [
  'all',
  'cafe',
  'photo',
  'fun',
  'culture',
  'food',
  'stay',
];

const CATEGORY_TO_CONTENT_TYPE: Partial<Record<PlaceCategory, number>> = {
  cafe: 39,
  food: 39,
  photo: 12,
  fun: 28,
  culture: 14,
  stay: 32,
};

const CONTENT_TYPE_TO_CATEGORY: Record<number, PlaceCategory> = {
  12: 'culture',
  14: 'culture',
  15: 'fun',
  25: 'fun',
  28: 'fun',
  32: 'stay',
  38: 'fun',
  39: 'food',
};

export function isPlaceCategory(value: string | null): value is PlaceCategory {
  return value !== null && PLACE_CATEGORIES.includes(value as PlaceCategory);
}

export function getContentTypeIdForCategory(category: PlaceCategory): number | undefined {
  return CATEGORY_TO_CONTENT_TYPE[category];
}

export function buildPlacesCacheKey({
  lat,
  lng,
  radius,
  category = 'all',
}: {
  lat: number;
  lng: number;
  radius: number;
  category?: PlaceCategory;
}) {
  return `places:${lat.toFixed(2)}:${lng.toFixed(2)}:r${radius}:c${category}`;
}

export function buildTourApiLocationUrl({
  serviceKey,
  lat,
  lng,
  radius,
  category = 'all',
  rows = 20,
}: {
  serviceKey: string;
  lat: number;
  lng: number;
  radius: number;
  category?: PlaceCategory;
  rows?: number;
}) {
  const params = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'K-Vibe-Tracker',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
    arrange: 'E',
    mapX: String(lng),
    mapY: String(lat),
    radius: String(radius),
  });

  const contentTypeId = getContentTypeIdForCategory(category);
  if (contentTypeId) {
    params.set('contentTypeId', String(contentTypeId));
  }

  const encodedKey = /%[0-9A-Fa-f]{2}/.test(serviceKey)
    ? serviceKey
    : encodeURIComponent(serviceKey);

  return `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?serviceKey=${encodedKey}&${params.toString()}`;
}

export function normalizeTourApiItems({
  items,
  originLat,
  originLng,
  radius,
  requestedCategory = 'all',
}: {
  items: TourApiItem[];
  originLat: number;
  originLng: number;
  radius: number;
  requestedCategory?: PlaceCategory;
}): NormalizedPlace[] {
  return items
    .map((item) => normalizeTourApiItem(item, requestedCategory, originLat, originLng))
    .filter((place): place is NormalizedPlace => Boolean(place))
    .filter((place) => haversineKm(originLat, originLng, place.lat, place.lng) <= radius / 1000)
    .sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));
}

export function normalizeTourApiItem(
  item: TourApiItem,
  requestedCategory: PlaceCategory,
  originLat: number,
  originLng: number,
): NormalizedPlace | null {
  const contentId = String(item.contentid ?? '').trim();
  const title = String(item.title ?? '').trim();
  const lat = Number(item.mapy);
  const lng = Number(item.mapx);

  if (!contentId || !title || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const contentType = Number(item.contenttypeid ?? 12);
  const category =
    requestedCategory !== 'all'
      ? requestedCategory
      : CONTENT_TYPE_TO_CATEGORY[contentType] ?? 'culture';
  const imageUrl = item.firstimage ? String(item.firstimage) : null;
  const distanceM = Number.isFinite(Number(item.dist))
    ? Math.round(Number(item.dist))
    : Math.round(haversineKm(originLat, originLng, lat, lng) * 1000);

  return {
    id: contentId,
    content_id: contentId,
    content_type: Number.isFinite(contentType) ? contentType : 12,
    name: title,
    name_ko: title,
    name_en: null,
    name_ja: null,
    name_zh: null,
    lat,
    lng,
    address: item.addr1 ? String(item.addr1) : null,
    category,
    image_url: imageUrl,
    imageUrl: imageUrl ?? undefined,
    crowd_level: null,
    distance_m: distanceM,
  };
}

export function toTourApiItemArray(payload: unknown): TourApiItem[] {
  const item = (payload as {
    response?: { body?: { items?: { item?: TourApiItem | TourApiItem[] } | '' } };
  })?.response?.body?.items;

  if (!item || typeof item === 'string') return [];

  const raw = item.item;
  if (!raw) return [];

  return Array.isArray(raw) ? raw : [raw];
}
