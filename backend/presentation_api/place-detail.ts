import { NextResponse, type NextRequest } from 'next/server';
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
import { getTourApiKey } from '@/backend/dependency';
import { backendConfig } from '@/backend/config/configure';

interface PlaceDetailRouteContext {
  params: {
    contentId: string;
  };
}

function parseContentTypeId(value: string | null) {
  if (!value) return null;
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
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

function mockResponse(contentId: string, contentTypeId: number | null, locale: TourApiLocale) {
  return NextResponse.json({
    detail: mockPlaceDetail(contentId, contentTypeId),
    cached: false,
    source: 'mock',
    cache_key: buildPlaceDetailCacheKey({ contentId, contentTypeId, locale }),
  });
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

export async function getPlaceDetail(request: NextRequest, { params }: PlaceDetailRouteContext) {
  const contentId = decodeURIComponent(params.contentId ?? '').trim();
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get('locale') ?? 'ko';
  const contentTypeIdParam = parseContentTypeId(searchParams.get('contentTypeId'));

  if (!contentId || !/^[\w-]+$/.test(contentId)) {
    return NextResponse.json({ error: 'INVALID_CONTENT_ID' }, { status: 400 });
  }

  if (!isTourApiLocale(localeParam)) {
    return NextResponse.json({ error: 'INVALID_LOCALE' }, { status: 400 });
  }

  const locale = localeParam;
  const serviceKey = getTourApiKey();
  const initialCacheKey = buildPlaceDetailCacheKey({
    contentId,
    contentTypeId: contentTypeIdParam,
    locale,
  });

  if (!serviceKey) {
    return mockResponse(contentId, contentTypeIdParam, locale);
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('[place-detail] TourAPI fallback:', error);
    return NextResponse.json({
      detail: mockPlaceDetail(contentId, contentTypeIdParam),
      cached: false,
      source: 'mock',
      cache_key: initialCacheKey,
    });
  }
}
