import { NextRequest, NextResponse } from 'next/server';
import { buildMockAnalysis, isAnalysisLocale, shouldCallAiWorker, type AnalysisResult } from '@/lib/analysis';
import { extractVideoId } from '@/lib/youtube';

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  const youtubeUrl = typeof body.youtube_url === 'string' ? body.youtube_url : '';
  const localeParam = typeof body.locale === 'string' ? body.locale : 'en';
  const videoId = extractVideoId(youtubeUrl);

  if (!videoId) {
    return NextResponse.json({ error: 'INVALID_YOUTUBE_URL' }, { status: 400 });
  }

  if (!isAnalysisLocale(localeParam)) {
    return NextResponse.json({ error: 'INVALID_LOCALE' }, { status: 400 });
  }

  if (!shouldCallAiWorker()) {
    return NextResponse.json(buildMockAnalysis(videoId, localeParam));
  }

  try {
    const res = await fetch(`${process.env.AI_WORKER_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url: youtubeUrl, locale: localeParam }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: isRecord(data) && typeof data.detail === 'string' ? data.detail : 'AI_WORKER_ERROR' },
        { status: res.status }
      );
    }

    const data = (await res.json()) as Partial<AnalysisResult>;
    return NextResponse.json({
      ...data,
      video_id: data.video_id ?? videoId,
      cached: Boolean(data.cached),
      source: 'worker',
    });
  } catch (error) {
    console.error('[analyze] AI worker fallback:', error);
    return NextResponse.json(buildMockAnalysis(videoId, localeParam));
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
