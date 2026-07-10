import {
  generateMockRoutePlan,
  isRouteDetailForTheme,
  isRouteTheme,
  parseStartTime,
  type RoutePlan,
} from '@/lib/domain';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';
import { isRecord } from './guards';

export type GenerateRouteError = 'INVALID_BODY' | 'INVALID_THEME' | 'INVALID_DETAIL' | 'INVALID_START_TIME';

interface GenerateRouteSuccess {
  ok: true;
  plan: RoutePlan;
  cached: false;
  source: 'mock';
}

interface GenerateRouteFailure {
  ok: false;
  error: GenerateRouteError;
}

export type GenerateRouteResult = GenerateRouteSuccess | GenerateRouteFailure;

export function generateRouteFromRequestBody(body: unknown): GenerateRouteResult {
  if (!isRecord(body)) {
    return { ok: false, error: 'INVALID_BODY' };
  }

  const theme = typeof body['theme'] === 'string' ? body['theme'] : '';
  const detail = typeof body['detail'] === 'string' ? body['detail'] : '';
  const startTime = typeof body['start_time'] === 'string' ? body['start_time'] : '10:00';
  const locale = normalizeUiLocale(typeof body['locale'] === 'string' ? body['locale'] : undefined);

  if (!isRouteTheme(theme)) {
    return { ok: false, error: 'INVALID_THEME' };
  }

  if (!isRouteDetailForTheme(theme, detail)) {
    return { ok: false, error: 'INVALID_DETAIL' };
  }

  if (parseStartTime(startTime) === null) {
    return { ok: false, error: 'INVALID_START_TIME' };
  }

  return {
    ok: true,
    plan: generateMockRoutePlan({ theme, detail, startTime, copy: getUiCopy(locale).persona }),
    cached: false,
    source: 'mock',
  };
}
