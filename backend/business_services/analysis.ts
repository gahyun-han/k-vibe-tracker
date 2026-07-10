import { buildMockAnalysis, detectSnsPlatform, extractVideoId, isAnalysisLocale, type AnalysisResult } from '@/lib/domain';
import { backendConfig } from '@/backend/config/configure';
import { getAiWorkerUrl, isAiWorkerAnalysisEnabled } from '@/backend/dependency';
import { isGeminiEnabled, extractSpotsFromTitle } from '@/backend/ai_services/gemini';
import { geocodePlace } from '@/backend/ai_services/kakao-geocode';
import { getYoutubeTitleFromUrl } from '@/backend/ai_services/youtube-meta';
import { isRecord } from './guards';

export type AnalyzeError =
  | 'INVALID_BODY'
  | 'INSTAGRAM_ANALYSIS_DEFERRED'
  | 'INVALID_YOUTUBE_URL'
  | 'INVALID_LOCALE'
  | 'AI_WORKER_ERROR'
  | string;

interface AnalyzeSuccess {
  ok: true;
  data: AnalyzeResponseData;
}

interface AnalyzeFailure {
  ok: false;
  error: AnalyzeError;
  status: number;
}

export type AnalyzeResult = AnalyzeSuccess | AnalyzeFailure;
type AnalyzeResponseData = Partial<AnalysisResult> & Pick<AnalysisResult, 'video_id' | 'cached' | 'source'>;
type ParseAnalyzeInputResult = AnalyzeFailure | { ok: true; input: ValidAnalyzeInput };

interface ValidAnalyzeInput {
  snsUrl: string;
  locale: 'en' | 'ko' | 'ja' | 'zh';
  videoId: string;
}

export async function analyzeFromRequestBody(body: unknown): Promise<AnalyzeResult> {
  const parsed = parseAnalyzeInput(body);
  if (!parsed.ok) return parsed;

  const workerResult = await analyzeWithWorker(parsed.input);
  if (workerResult) return workerResult;

  const directAiResult = await analyzeWithDirectAi(parsed.input);
  if (directAiResult) return directAiResult;

  return { ok: true, data: buildMockAnalysis(parsed.input.videoId, parsed.input.locale) };
}

function parseAnalyzeInput(body: unknown): ParseAnalyzeInputResult {
  if (!isRecord(body)) {
    return { ok: false, error: 'INVALID_BODY', status: 400 };
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
    return { ok: false, error: 'INSTAGRAM_ANALYSIS_DEFERRED', status: 400 };
  }

  if (!videoId) {
    return { ok: false, error: 'INVALID_YOUTUBE_URL', status: 400 };
  }

  if (!isAnalysisLocale(localeParam)) {
    return { ok: false, error: 'INVALID_LOCALE', status: 400 };
  }

  return { ok: true, input: { snsUrl, locale: localeParam, videoId } };
}

async function analyzeWithWorker(input: ValidAnalyzeInput): Promise<AnalyzeResult | null> {
  if (!isAiWorkerAnalysisEnabled()) return null;

  const aiWorkerUrl = getAiWorkerUrl();
  if (!aiWorkerUrl) return null;

  try {
    const res = await fetch(`${aiWorkerUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url: input.snsUrl, locale: input.locale }),
      signal: AbortSignal.timeout(backendConfig.aiWorkerTimeoutMs),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: isRecord(data) && typeof data['detail'] === 'string' ? data['detail'] : 'AI_WORKER_ERROR',
        status: res.status,
      };
    }

    const data = (await res.json()) as Partial<AnalysisResult>;
    return {
      ok: true,
      data: {
        ...data,
        video_id: data.video_id ?? input.videoId,
        cached: Boolean(data.cached),
        source: 'worker',
      },
    };
  } catch (error) {
    console.error('[analyze] AI worker fallback:', error);
    return null;
  }
}

async function analyzeWithDirectAi(input: ValidAnalyzeInput): Promise<AnalyzeResult | null> {
  if (!isGeminiEnabled()) return null;

  try {
    const title = await getYoutubeTitleFromUrl(input.snsUrl);
    const rawSpots = await extractSpotsFromTitle(title || input.videoId);

    if (rawSpots.length === 0) return null;

    const places = await Promise.all(
      rawSpots.map(async (spot) => {
        const name = typeof spot.name === 'string' ? spot.name : '';
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

    return {
      ok: true,
      data: {
        video_id: input.videoId,
        title,
        places,
        cached: false,
        source: 'groq',
      },
    };
  } catch (error) {
    console.error('[analyze] AI direct fallback:', error);
    return null;
  }
}
