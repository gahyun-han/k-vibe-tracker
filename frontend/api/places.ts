import type { NormalizedPlace, NormalizedPlaceDetail } from '@/lib/domain';
import { requestJson } from '@/frontend/api/client';

type ApiSource = 'mock' | 'tourapi' | 'cache';

export interface PlacesApiResponse {
  places: NormalizedPlace[];
  cached: boolean;
  source: ApiSource;
  cache_key: string;
}

export interface PlaceDetailApiResponse {
  detail: NormalizedPlaceDetail;
  cached: boolean;
  source: ApiSource;
  cache_key: string;
}

export function fetchPlaces(searchParams: URLSearchParams, signal?: AbortSignal) {
  return requestJson<PlacesApiResponse>(`/api/places?${searchParams.toString()}`, { signal });
}

export function fetchPlaceDetail(contentId: string, searchParams: URLSearchParams, signal?: AbortSignal) {
  return requestJson<PlaceDetailApiResponse>(
    `/api/places/${encodeURIComponent(contentId)}?${searchParams.toString()}`,
    { signal },
  );
}
