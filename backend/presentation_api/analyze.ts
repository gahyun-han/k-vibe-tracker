import { NextRequest, NextResponse } from 'next/server';
import { buildMockAnalysis, isAnalysisLocale, type AnalysisResult } from '@/lib/domain';
import { detectSnsPlatform, extractVideoId } from '@/lib/domain';
import { getAiWorkerUrl, isAiWorkerAnalysisEnabled } from '@/backend/dependency';
import { backendConfig } from '@/backend/config/configure';
import { isRecord } from '@/backend/business_services/guards';

export async function postAnalyze(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  const snsUrl =
    typeof body['youtube_url'] === 'string'
      ? body['youtube_url']
      : typeof body['sns_url'] === 'string'
        ? body['sns_url']
        : '';
  const localeParam = typeof body['locale'] === 'string' ? body['locale'] : 'en';
  const platform = detectSnsPlatform(snsUrl);
  const videoId = extractVideoId(snsUrl);

  if (platform === 'instagram') {
    return NextResponse.json({ error: 'INSTAGRAM_ANALYSIS_DEFERRED' }, { status: 400 });
  }

  if (!videoId) {
    return NextResponse.json({ error: 'INVALID_YOUTUBE_URL' }, { status: 400 });
  }

  if (!isAnalysisLocale(localeParam)) {
    return NextResponse.json({ error: 'INVALID_LOCALE' }, { status: 400 });
  }

  if (!isAiWorkerAnalysisEnabled()) {
    return NextResponse.json(buildMockAnalysis(videoId, localeParam));
  }

  const aiWorkerUrl = getAiWorkerUrl();
  if (!aiWorkerUrl) {
    return NextResponse.json(buildMockAnalysis(videoId, localeParam));
  }

  try {
    const res = await fetch(`${aiWorkerUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url: snsUrl, locale: localeParam }),
      signal: AbortSignal.timeout(backendConfig.aiWorkerTimeoutMs),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: isRecord(data) && typeof data['detail'] === 'string' ? data['detail'] : 'AI_WORKER_ERROR' },
        { status: res.status },
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
