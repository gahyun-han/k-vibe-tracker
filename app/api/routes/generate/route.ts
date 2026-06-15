import { NextResponse, type NextRequest } from 'next/server';
import {
  generateMockRoutePlan,
  isRouteDetailForTheme,
  isRouteTheme,
  parseStartTime,
} from '@/lib/routes';

export async function POST(request: NextRequest) {
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
    plan: generateMockRoutePlan({ theme, detail, startTime }),
    cached: false,
    source: 'mock',
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
