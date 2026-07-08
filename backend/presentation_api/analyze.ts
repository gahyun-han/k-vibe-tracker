import { NextRequest, NextResponse } from 'next/server';
import { buildMockAnalysis, isAnalysisLocale, type AnalysisResult } from '@/lib/domain';
import { detectSnsPlatform, extractVideoId } from '@/lib/domain';
import { getAiWorkerUrl, isAiWorkerAnalysisEnabled } from '@/backend/dependency';
import { backendConfig } from '@/backend/config/configure';
import { isRecord } from '@/backend/business_services/guards';
import { isGeminiEnabled, extractSpotsFromTitle } from '@/backend/ai_services/gemini';
import { geocodePlace } from '@/backend/ai_services/kakao-geocode';
import { getYoutubeTitleFromUrl } from '@/backend/ai_services/youtube-meta';

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

  // Path A: Dedicated ai-worker (when explicitly enabled and URL is set)
  if (isAiWorkerAnalysisEnabled()) {
    const aiWorkerUrl = getAiWorkerUrl();
    if (aiWorkerUrl) {
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
        // Fall through to Gemini or mock
      }
    }
  }

  // Path B: Direct AI call via Groq (primary) or Gemini (fallback)
  if (isGeminiEnabled()) {
    try {
      const title = await getYoutubeTitleFromUrl(snsUrl);
      const rawSpots = await extractSpotsFromTitle(title || videoId);

      if (rawSpots.length > 0) {
        const places = await Promise.all(
          rawSpots.map(async (spot) => {
            const name = typeof spot.name === 'string' ? spot.name : '';
            // Prefer coordinates from the LLM; fall back to Kakao geocoding.
            const llmLat = typeof spot.lat === 'number' && Number.isFinite(spot.lat) ? spot.lat : null;
            const llmLng = typeof spot.lng === 'number' && Number.isFinite(spot.lng) ? spot.lng : null;
            let lat = llmLat;
            let lng = llmLng;
            if ((lat === null || lng === null) && name) {
              const coords = await geocodePlace(name);
              lat = coords?.lat ?? null;
              lng = coords?.lng ?? null;
            }
            return {
              name,
              lat,
              lng,
              confidence: typeof spot.confidence === 'number' ? spot.confidence : 0.7,
              category: typeof spot.category === 'string' ? spot.category : 'other',
              reason: typeof spot.reason === 'string' ? spot.reason : '',
            };
          }),
        );

        return NextResponse.json({
          video_id: videoId,
          title,
          places,
          cached: false,
          source: 'groq',
        });
      }
    } catch (error) {
      console.error('[analyze] AI direct fallback:', error);
    }
  }

  // Path C: Mock data (always available — zero cost, zero deps)
  return NextResponse.json(buildMockAnalysis(videoId, localeParam));
}
