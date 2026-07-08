/**
 * Kakao Local Search API — geocoding by place name (server-side REST key).
 *
 * KAKAO_MAP_REST_KEY must be set as an environment variable.
 * Returns null when the key is absent or the search yields no results.
 */

const KAKAO_LOCAL_SEARCH = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const GEOCODE_TIMEOUT_MS = 4_000;

interface KakaoDoc {
  x: string;
  y: string;
  place_name: string;
}

interface KakaoSearchResponse {
  documents?: KakaoDoc[];
}

function getKakaoRestKey(): string {
  return process.env['KAKAO_MAP_REST_KEY'] ?? '';
}

/** Hardcoded fallback coordinates for common Seoul landmarks */
const FALLBACK_COORDS: Record<string, { lat: number; lng: number }> = {
  성수: { lat: 37.5447, lng: 127.0564 },
  경복궁: { lat: 37.5796, lng: 126.977 },
  홍대: { lat: 37.5563, lng: 126.9237 },
  강남: { lat: 37.4979, lng: 127.0276 },
  이태원: { lat: 37.5348, lng: 126.9947 },
  명동: { lat: 37.5607, lng: 126.9863 },
  북촌: { lat: 37.5826, lng: 126.9816 },
  인사동: { lat: 37.5742, lng: 126.9845 },
  광장시장: { lat: 37.57, lng: 126.9998 },
  남산: { lat: 37.5512, lng: 126.9882 },
  을지로: { lat: 37.5664, lng: 126.9997 },
  합정: { lat: 37.5498, lng: 126.9137 },
  압구정: { lat: 37.5276, lng: 127.0286 },
  신촌: { lat: 37.5556, lng: 126.9367 },
  동대문: { lat: 37.5717, lng: 127.0092 },
};

function fallbackCoords(name: string): { lat: number; lng: number } | null {
  for (const [keyword, coords] of Object.entries(FALLBACK_COORDS)) {
    if (name.includes(keyword)) return coords;
  }
  return null;
}

/**
 * Search for a place by name via Kakao Local API.
 * Falls back to hardcoded coords for common Seoul landmarks.
 */
export async function geocodePlace(name: string): Promise<{ lat: number; lng: number } | null> {
  const key = getKakaoRestKey();

  if (key) {
    try {
      const params = new URLSearchParams({
        query: name,
        x: '126.9784',
        y: '37.5665',
        radius: '50000',
        size: '1',
      });
      const res = await fetch(`${KAKAO_LOCAL_SEARCH}?${params.toString()}`, {
        headers: { Authorization: `KakaoAK ${key}` },
        signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
      });

      if (res.ok) {
        const data = (await res.json()) as KakaoSearchResponse;
        const doc = data.documents?.[0];
        if (doc) {
          return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
        }
      }
    } catch (e) {
      console.error(`[kakao-geocode] failed for "${name}":`, e);
    }
  }

  return fallbackCoords(name);
}
