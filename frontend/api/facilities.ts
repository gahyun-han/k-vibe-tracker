import type { Facility } from '@/lib/facilities';
import { requestJson } from '@/frontend/api/client';

type ApiSource = 'mock' | 'tourapi' | 'cache';

export interface FacilitiesApiResponse {
  facilities: Facility[];
  cached: boolean;
  source: ApiSource;
  cache_key: string;
}

export function fetchFacilities(searchParams: URLSearchParams, signal?: AbortSignal) {
  return requestJson<FacilitiesApiResponse>(`/api/facilities?${searchParams.toString()}`, { signal });
}
