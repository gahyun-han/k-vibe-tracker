import {
  buildPlaceDetailCacheKey,
  buildTourApiDetailCommonUrl,
  buildTourApiDetailImageUrl,
  buildTourApiDetailIntroUrl,
  isTourApiLocale,
  normalizeTourApiPlaceDetail,
  toTourApiArray,
  type NormalizedPlaceDetail,
  type TourApiCommonItem,
  type TourApiImageItem,
  type TourApiIntroItem,
  type TourApiLocale,
} from '@/lib/domain';
import { backendConfig } from '@/backend/config/configure';
import { getTourApiKey } from '@/backend/dependency';

type PlaceDetailError = 'INVALID_CONTENT_ID' | 'INVALID_LOCALE';
type PlaceDetailSource = 'mock' | 'tourapi';

interface PlaceDetailData {
  detail: NormalizedPlaceDetail;
  cached: false;
  source: PlaceDetailSource;
  cache_key: string;
}

interface PlaceDetailSuccess {
  ok: true;
  data: PlaceDetailData;
}

interface PlaceDetailFailure {
  ok: false;
  error: PlaceDetailError;
  status: 400;
}

interface GetPlaceDetailInput {
  contentId: string;
  contentTypeId: string | null;
  locale: string | null;
}

export type PlaceDetailResult = PlaceDetailSuccess | PlaceDetailFailure;

export async function getPlaceDetailData({
  contentId: rawContentId,
  contentTypeId: rawContentTypeId,
  locale: rawLocale,
}: GetPlaceDetailInput): Promise<PlaceDetailResult> {
  const contentId = decodeURIComponent(rawContentId ?? '').trim();
  const localeParam = rawLocale ?? 'ko';
  const contentTypeIdParam = parseContentTypeId(rawContentTypeId);

  if (!contentId || !/^[\w-]+$/.test(contentId)) {
    return { ok: false, error: 'INVALID_CONTENT_ID', status: 400 };
  }

  if (!isTourApiLocale(localeParam)) {
    return { ok: false, error: 'INVALID_LOCALE', status: 400 };
  }

  const locale = localeParam;
  const serviceKey = getTourApiKey();
  const initialCacheKey = buildPlaceDetailCacheKey({
    contentId,
    contentTypeId: contentTypeIdParam,
    locale,
  });

  if (!serviceKey) {
    return {
      ok: true,
      data: buildMockPlaceDetailData(contentId, contentTypeIdParam, locale, initialCacheKey),
    };
  }

  try {
    const commonPayload = await fetchTourApiJson(
      buildTourApiDetailCommonUrl({ serviceKey, contentId, locale }),
    );
    const common = toTourApiArray<TourApiCommonItem>(commonPayload)[0] ?? null;
    const contentTypeId = parseContentTypeId(String(common?.contenttypeid ?? contentTypeIdParam ?? ''));

    const [introPayload, imagePayload] = await Promise.all([
      contentTypeId
        ? fetchTourApiJson(buildTourApiDetailIntroUrl({ serviceKey, contentId, contentTypeId, locale }))
        : Promise.resolve(null),
      fetchTourApiJson(buildTourApiDetailImageUrl({ serviceKey, contentId, locale })),
    ]);

    const intro = introPayload ? toTourApiArray<TourApiIntroItem>(introPayload)[0] ?? null : null;
    const images = imagePayload ? toTourApiArray<TourApiImageItem>(imagePayload) : [];

    return {
      ok: true,
      data: {
        detail: normalizeTourApiPlaceDetail({
          common,
          intro,
          images,
          contentId,
          contentTypeId,
        }),
        cached: false,
        source: 'tourapi',
        cache_key: buildPlaceDetailCacheKey({ contentId, contentTypeId, locale }),
      },
    };
  } catch (error) {
    console.error('[place-detail] TourAPI fallback:', error);
    return {
      ok: true,
      data: buildMockPlaceDetailData(contentId, contentTypeIdParam, locale, initialCacheKey),
    };
  }
}

function parseContentTypeId(value: string | null) {
  if (!value) return null;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function buildMockPlaceDetailData(
  contentId: string,
  contentTypeId: number | null,
  locale: TourApiLocale,
  cacheKey = buildPlaceDetailCacheKey({ contentId, contentTypeId, locale }),
): PlaceDetailData {
  return {
    detail: mockPlaceDetail(contentId, contentTypeId),
    cached: false,
    source: 'mock',
    cache_key: cacheKey,
  };
}

function mockPlaceDetail(contentId: string, contentTypeId: number | null): NormalizedPlaceDetail {
  return {
    content_id: contentId,
    content_type: contentTypeId,
    name: null,
    address: null,
    lat: null,
    lng: null,
    overview: 'TourAPI detail is unavailable in local fallback mode.',
    image_url: null,
    images: [],
    tel: null,
    homepage: null,
    open_hours: null,
    rest_date: null,
    parking: null,
    use_time: null,
  };
}

async function fetchTourApiJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(backendConfig.tourApiTimeoutMs) });
  if (!res.ok) {
    throw new Error(`TourAPI detail request failed with HTTP ${res.status}`);
  }

  const payload = await res.json().catch(() => null);
  if (!payload) {
    throw new Error('TourAPI detail returned invalid JSON');
  }

  return payload;
}
