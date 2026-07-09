import { NextResponse, type NextRequest } from 'next/server';
import { generateRouteFromRequestBody } from '@/backend/business_services/route-generation';

export async function postGenerateRoute(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  const result = generateRouteFromRequestBody(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    plan: result.plan,
    cached: result.cached,
    source: result.source,
  });
}
