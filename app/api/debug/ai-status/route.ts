import { NextResponse } from 'next/server';
import { isGeminiEnabled, geminiComplete, extractSpotsFromTitle } from '@/backend/ai_services/gemini';
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

  // Step: call Gemini directly
  const titleOrId = title || 'BKorP55Aqvg';
  try {
    const rawText = await geminiComplete(
      `아래 YouTube 영상 제목에서 한국 여행 장소를 JSON 배열로 추출하세요.\n제목: ${titleOrId}`,
    );
    steps['6_gemini_raw_response'] = rawText.slice(0, 500) || '(empty)';
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
