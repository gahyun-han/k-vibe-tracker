export class FrontendApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'FrontendApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Core request function with optional fallback support
 * Throws FrontendApiError if both request and fallback fail
 */
export async function requestJson<T>(
  input: string,
  init?: RequestInit,
  fallbackData?: T,
): Promise<T> {
  try {
    const response = await fetch(input, init);
    const payload = (await response.json().catch(() => ({}))) as unknown;

    if (!response.ok) {
      const message =
        isRecord(payload) && typeof payload['error'] === 'string'
          ? payload['error']
          : `REQUEST_FAILED_${response.status}`;
      throw new FrontendApiError(message, response.status);
    }

    return payload as T;
  } catch (error) {
    // If fallback data is provided and API fails, return it
    if (fallbackData !== undefined) {
      console.warn(
        `[API] Request to ${input} failed, using fallback data`,
        error instanceof Error ? error.message : error,
      );
      return fallbackData;
    }
    throw error;
  }
}

/**
 * Wrapper function to easily add fallback support to any API call
 * @example
 * const places = await withFallback(
 *   () => requestJson<PlacesApiResponse>(`/api/places?${params}`),
 *   MOCK_PLACES_RESPONSE
 * )
 */
export function withFallback<T>(fetcher: () => Promise<T>, fallbackData: T): Promise<T> {
  return fetcher().catch(() => fallbackData);
}
