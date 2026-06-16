import { haversineKm } from '@/lib/haversine';

export type PlaceCategory = 'all' | 'cafe' | 'photo' | 'fun' | 'culture' | 'food' | 'stay';
export type TourApiLocale = 'ko' | 'en' | 'ja' | 'zh';

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

export interface NormalizedPlaceDetail {
  content_id: string;
  content_type: number | null;
  name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  overview: string | null;
  image_url: string | null;
  images: string[];
  tel: string | null;
  homepage: string | null;
  open_hours: string | null;
  rest_date: string | null;
  parking: string | null;
  use_time: string | null;
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

export interface TourApiFestivalItem extends TourApiItem {
  addr2?: string;
  eventstartdate?: string | number;
  eventenddate?: string | number;
  progresstype?: string;
  festivaltype?: string;
}

export interface TourApiCommonItem extends TourApiItem {
  addr2?: string;
  tel?: string;
  homepage?: string;
  overview?: string;
  firstimage2?: string;
}

export interface TourApiIntroItem {
  contentid?: string | number;
  contenttypeid?: string | number;
  infocenter?: string;
  infocenterculture?: string;
  infocenterfood?: string;
  infocenterlodging?: string;
  infocenterleports?: string;
  infocentershopping?: string;
  opentime?: string;
  opentimefood?: string;
  usetime?: string;
  usetimeculture?: string;
  usetimeleports?: string;
  playtime?: string;
  restdate?: string;
  restdateculture?: string;
  restdatefood?: string;
  restdateleports?: string;
  restdateshopping?: string;
  parking?: string;
  parkingculture?: string;
  parkingfood?: string;
  parkinglodging?: string;
  parkingleports?: string;
  parkingshopping?: string;
  checkintime?: string;
  checkouttime?: string;
  firstmenu?: string;
  treatmenu?: string;
  eventstartdate?: string;
  eventenddate?: string;
}

export interface TourApiImageItem {
  contentid?: string | number;
  originimgurl?: string;
  smallimageurl?: string;
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

export const TOUR_API_LOCALES: TourApiLocale[] = ['ko', 'en', 'ja', 'zh'];

const TOUR_API_SERVICE_BY_LOCALE: Record<TourApiLocale, string> = {
  ko: 'KorService2',
  en: 'EngService2',
  ja: 'JpnService2',
  zh: 'ChsService2',
};

const CATEGORY_TO_KOREAN_CONTENT_TYPE: Partial<Record<PlaceCategory, number>> = {
  cafe: 39,
  food: 39,
  photo: 12,
  fun: 28,
  culture: 14,
  stay: 32,
};

const CATEGORY_TO_MULTILINGUAL_CONTENT_TYPE: Partial<Record<PlaceCategory, number>> = {
  cafe: 82,
  food: 82,
  photo: 76,
  fun: 75,
  culture: 78,
  stay: 80,
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
  75: 'fun',
  76: 'culture',
  78: 'culture',
  80: 'stay',
  82: 'food',
  85: 'fun',
};

export function isPlaceCategory(value: string | null): value is PlaceCategory {
  return value !== null && PLACE_CATEGORIES.includes(value as PlaceCategory);
}

export function isTourApiLocale(value: string | null): value is TourApiLocale {
  return value !== null && TOUR_API_LOCALES.includes(value as TourApiLocale);
}

export function getTourApiServiceForLocale(locale: TourApiLocale = 'ko') {
  return TOUR_API_SERVICE_BY_LOCALE[locale];
}

export function getContentTypeIdForCategory(
  category: PlaceCategory,
  locale: TourApiLocale = 'ko',
): number | undefined {
  const map =
    locale === 'ko' ? CATEGORY_TO_KOREAN_CONTENT_TYPE : CATEGORY_TO_MULTILINGUAL_CONTENT_TYPE;
  return map[category];
}

export function buildPlacesCacheKey({
  lat,
  lng,
  radius,
  category = 'all',
  locale = 'ko',
}: {
  lat: number;
  lng: number;
  radius: number;
  category?: PlaceCategory;
  locale?: TourApiLocale;
}) {
  return `places:${locale}:${lat.toFixed(2)}:${lng.toFixed(2)}:r${radius}:c${category}`;
}

export function buildPlaceDetailCacheKey({
  contentId,
  contentTypeId,
  locale = 'ko',
}: {
  contentId: string;
  contentTypeId?: number | null;
  locale?: TourApiLocale;
}) {
  return `place-detail:${locale}:${contentId}:t${contentTypeId ?? 'unknown'}`;
}

function encodeServiceKey(serviceKey: string) {
  return /%[0-9A-Fa-f]{2}/.test(serviceKey)
    ? serviceKey
    : encodeURIComponent(serviceKey);
}

function buildTourApiUrl({
  serviceKey,
  locale,
  operation,
  params,
}: {
  serviceKey: string;
  locale: TourApiLocale;
  operation: string;
  params: Record<string, string>;
}) {
  const searchParams = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'K-Vibe-Tracker',
    _type: 'json',
    pageNo: '1',
    numOfRows: '10',
    ...params,
  });

  return `https://apis.data.go.kr/B551011/${getTourApiServiceForLocale(locale)}/${operation}?serviceKey=${encodeServiceKey(serviceKey)}&${searchParams.toString()}`;
}

export function buildTourApiLocationUrl({
  serviceKey,
  lat,
  lng,
  radius,
  category = 'all',
  locale = 'ko',
  rows = 20,
}: {
  serviceKey: string;
  lat: number;
  lng: number;
  radius: number;
  category?: PlaceCategory;
  locale?: TourApiLocale;
  rows?: number;
}) {
  const params = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'K-Vibe-Tracker',
    _type: 'json',
    numOfRows: String(rows),
    pageNo: '1',
    arrange: 'S',
    mapX: String(lng),
    mapY: String(lat),
    radius: String(radius),
  });

  const contentTypeId = getContentTypeIdForCategory(category, locale);
  if (contentTypeId) {
    params.set('contentTypeId', String(contentTypeId));
  }

  return `https://apis.data.go.kr/B551011/${getTourApiServiceForLocale(locale)}/locationBasedList2?serviceKey=${encodeServiceKey(serviceKey)}&${params.toString()}`;
}

export function buildTourApiDetailCommonUrl({
  serviceKey,
  contentId,
  locale = 'ko',
}: {
  serviceKey: string;
  contentId: string;
  locale?: TourApiLocale;
}) {
  return buildTourApiUrl({
    serviceKey,
    locale,
    operation: 'detailCommon2',
    params: {
      contentId,
      defaultYN: 'Y',
      firstImageYN: 'Y',
      areacodeYN: 'Y',
      catcodeYN: 'Y',
      addrinfoYN: 'Y',
      mapinfoYN: 'Y',
      overviewYN: 'Y',
    },
  });
}

export function buildTourApiDetailIntroUrl({
  serviceKey,
  contentId,
  contentTypeId,
  locale = 'ko',
}: {
  serviceKey: string;
  contentId: string;
  contentTypeId: number;
  locale?: TourApiLocale;
}) {
  return buildTourApiUrl({
    serviceKey,
    locale,
    operation: 'detailIntro2',
    params: {
      contentId,
      contentTypeId: String(contentTypeId),
    },
  });
}

export function buildTourApiDetailImageUrl({
  serviceKey,
  contentId,
  locale = 'ko',
  rows = 8,
}: {
  serviceKey: string;
  contentId: string;
  locale?: TourApiLocale;
  rows?: number;
}) {
  return buildTourApiUrl({
    serviceKey,
    locale,
    operation: 'detailImage2',
    params: {
      contentId,
      imageYN: 'Y',
      subImageYN: 'Y',
      numOfRows: String(rows),
    },
  });
}

export function buildTourApiFestivalUrl({
  serviceKey,
  locale = 'ko',
  startDate,
  endDate,
  rows = 30,
}: {
  serviceKey: string;
  locale?: TourApiLocale;
  startDate: string;
  endDate?: string;
  rows?: number;
}) {
  return buildTourApiUrl({
    serviceKey,
    locale,
    operation: 'searchFestival2',
    params: {
      arrange: 'O',
      eventStartDate: startDate,
      ...(endDate ? { eventEndDate: endDate } : {}),
      numOfRows: String(rows),
    },
  });
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
  return toTourApiArray<TourApiItem>(payload);
}

export function toTourApiArray<T>(payload: unknown): T[] {
  const item = (payload as {
    response?: { body?: { items?: { item?: T | T[] } | '' } };
  })?.response?.body?.items;

  if (!item || typeof item === 'string') return [];

  const raw = item.item;
  if (!raw) return [];

  return Array.isArray(raw) ? raw : [raw];
}

export function cleanTourApiText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const decoded = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ');
  const text = decodeHtml(decoded)
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  return text || null;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const cleaned = cleanTourApiText(value);
    if (cleaned) return cleaned;
  }
  return null;
}

function firstImage(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

function normalizeDate(value: unknown) {
  const text = cleanTourApiText(value);
  if (!text || !/^\d{8}$/.test(text)) return text;
  return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
}

export function normalizeTourApiPlaceDetail({
  common,
  intro,
  images,
  contentId,
  contentTypeId,
}: {
  common?: TourApiCommonItem | null;
  intro?: TourApiIntroItem | null;
  images?: TourApiImageItem[];
  contentId: string;
  contentTypeId?: number | null;
}): NormalizedPlaceDetail {
  const imageUrls = [
    firstImage(common?.firstimage, common?.firstimage2),
    ...(images ?? []).map((image) => firstImage(image.originimgurl, image.smallimageurl)),
  ].filter((url): url is string => Boolean(url));
  const uniqueImages = Array.from(new Set(imageUrls));
  const introContentType = Number(intro?.contenttypeid ?? common?.contenttypeid ?? contentTypeId);
  const lat = Number(common?.mapy);
  const lng = Number(common?.mapx);
  const addr1 = cleanTourApiText(common?.addr1);
  const addr2 = cleanTourApiText(common?.addr2);
  const address = [addr1, addr2].filter(Boolean).join(' ') || null;
  const openHours = firstText(
    intro?.opentime,
    intro?.opentimefood,
    intro?.usetime,
    intro?.usetimeculture,
    intro?.usetimeleports,
    intro?.playtime,
  );
  const restDate = firstText(
    intro?.restdate,
    intro?.restdateculture,
    intro?.restdatefood,
    intro?.restdateleports,
    intro?.restdateshopping,
  );
  const parking = firstText(
    intro?.parking,
    intro?.parkingculture,
    intro?.parkingfood,
    intro?.parkinglodging,
    intro?.parkingleports,
    intro?.parkingshopping,
  );
  const eventDates = [normalizeDate(intro?.eventstartdate), normalizeDate(intro?.eventenddate)]
    .filter(Boolean)
    .join(' - ');
  const checkInOut = [firstText(intro?.checkintime), firstText(intro?.checkouttime)]
    .filter(Boolean)
    .join(' - ');

  return {
    content_id: String(common?.contentid ?? intro?.contentid ?? contentId),
    content_type: Number.isFinite(introContentType) ? introContentType : contentTypeId ?? null,
    name: cleanTourApiText(common?.title),
    address,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    overview: cleanTourApiText(common?.overview),
    image_url: uniqueImages[0] ?? null,
    images: uniqueImages,
    tel: firstText(
      common?.tel,
      intro?.infocenter,
      intro?.infocenterculture,
      intro?.infocenterfood,
      intro?.infocenterlodging,
      intro?.infocenterleports,
      intro?.infocentershopping,
    ),
    homepage: cleanTourApiText(common?.homepage),
    open_hours: openHours,
    rest_date: restDate,
    parking,
    use_time: eventDates || checkInOut || openHours,
  };
}
