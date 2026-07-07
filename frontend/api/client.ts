export class FrontendApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'FrontendApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.error === 'string'
        ? payload.error
        : `REQUEST_FAILED_${response.status}`;
    throw new FrontendApiError(message, response.status);
  }

  return payload as T;
}
