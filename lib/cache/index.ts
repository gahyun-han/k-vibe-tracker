/**
 * Cache utilities - API response and location caching
 */

export {
  buildLocalApiCacheKey,
  readLocalApiCache,
  writeLocalApiCache,
  LOCAL_API_CACHE_TTL_MS,
  type CachedApiResponse,
} from './local-api-cache';
export {
  LAST_KNOWN_LOCATION_STORAGE_KEY,
  LAST_KNOWN_LOCATION_TTL_MS,
  readLastKnownLocation,
  writeLastKnownLocation,
  type LastKnownLocation,
} from './location-cache';
