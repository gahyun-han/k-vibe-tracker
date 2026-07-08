import { NextResponse, type NextRequest } from 'next/server';
import {
  generateMockRoutePlan,
  isRouteDetailForTheme,
  isRouteTheme,
  parseStartTime,
} from '@/lib/domain';
import { getUiCopy, normalizeUiLocale } from '@/lib/ui-copy';
import { isRecord } from '@/backend/business_services/guards';

export async function postGenerateRoute(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  const theme = typeof body.theme === 'string' ? body.theme : '';
  const detail = typeof body.detail === 'string' ? body.detail : '';
  const startTime = typeof body.start_time === 'string' ? body.start_time : '10:00';
  const locale = normalizeUiLocale(typeof body.locale === 'string' ? body.locale : undefined);

  if (!isRouteTheme(theme)) {
    return NextResponse.json({ error: 'INVALID_THEME' }, { status: 400 });
  }

  if (!isRouteDetailForTheme(theme, detail)) {
    return NextResponse.json({ error: 'INVALID_DETAIL' }, { status: 400 });
  }

  if (parseStartTime(startTime) === null) {
    return NextResponse.json({ error: 'INVALID_START_TIME' }, { status: 400 });
  }

  return NextResponse.json({
    plan: generateMockRoutePlan({ theme, detail, startTime, copy: getUiCopy(locale).persona }),
    cached: false,
    source: 'mock',
  });
}
