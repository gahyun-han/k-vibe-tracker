import { NextRequest, NextResponse } from 'next/server';
import { analyzeFromRequestBody } from '@/backend/business_services/analysis';

export async function postAnalyze(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  const result = await analyzeFromRequestBody(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
