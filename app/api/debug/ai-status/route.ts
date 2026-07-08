import { NextResponse } from 'next/server';
import { isGeminiEnabled, extractSpotsFromTitle } from '@/backend/ai_services/gemini';
import { isAiWorkerAnalysisEnabled, getAiWorkerUrl } from '@/backend/dependency';
import { getYoutubeTitleFromUrl } from '@/backend/ai_services/youtube-meta';

/**
 * GET /api/debug/ai-status?url=<youtube-url>
 * Diagnostic endpoint — traces the full Gemini pipeline step by step.
 * No secrets returned, but key existence/validity is checked.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const testUrl = searchParams.get('url') ?? 'https://youtu.be/BKorP55Aqvg';

  const geminiEnabled = isGeminiEnabled();
  const aiWorkerEnabled = isAiWorkerAnalysisEnabled();
  const aiWorkerUrl = getAiWorkerUrl();

  const steps: Record<string, unknown> = {
    '1_gemini_enabled': geminiEnabled,
    '2_ai_worker_enabled': aiWorkerEnabled,
    '3_ai_worker_url_set': Boolean(aiWorkerUrl),
    '4_test_url': testUrl,
  };

  if (!geminiEnabled) {
    return NextResponse.json({ ...steps, active_path: 'mock — GOOGLE_AI_API_KEY not set' });
  }

  // Step: fetch YouTube title via oEmbed
  let title = '';
  try {
    title = await getYoutubeTitleFromUrl(testUrl);
    steps['5_youtube_title'] = title || '(empty — oEmbed failed)';
  } catch (e) {
    steps['5_youtube_title_error'] = String(e);
  }

  // Step: call Gemini directly and expose actual HTTP status/error
  const titleOrId = title || 'BKorP55Aqvg';
  try {
    const apiKey = process.env['GOOGLE_AI_API_KEY'] ?? '';
    const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const res = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `제목: ${titleOrId} — 한국 여행 장소 1개만 JSON으로 반환` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const responseText = await res.text();
    steps['6_gemini_http_status'] = res.status;
    steps['6_gemini_raw_response'] = responseText.slice(0, 800) || '(empty)';
  } catch (e) {
    steps['6_gemini_raw_error'] = String(e);
  }

  // Step: extract spots using full pipeline
  let spots: unknown[] = [];
  try {
    spots = await extractSpotsFromTitle(titleOrId);
    steps['7_extracted_spots_count'] = spots.length;
    steps['7_extracted_spots'] = spots;
  } catch (e) {
    steps['7_extract_error'] = String(e);
  }

  steps['8_final_result'] = spots.length > 0 ? 'gemini ✅' : 'mock (spots array empty — check Gemini response)';

  return NextResponse.json(steps);
}
