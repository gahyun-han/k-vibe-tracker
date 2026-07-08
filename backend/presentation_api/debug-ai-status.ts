import { NextResponse } from 'next/server';
import { isGeminiEnabled, extractSpotsFromTitle, getGroqApiKey } from '@/backend/ai_services/gemini';
import { getYoutubeTitleFromUrl } from '@/backend/ai_services/youtube-meta';
import { isAiWorkerAnalysisEnabled, getAiWorkerUrl } from '@/backend/dependency';

/**
 * GET /api/debug/ai-status?url=<youtube-url>
 * Diagnostic endpoint — traces the full AI pipeline step by step.
 */
export async function getAiStatus(req: Request) {
  const { searchParams } = new URL(req.url);
  const testUrl = searchParams.get('url') ?? 'https://youtu.be/BKorP55Aqvg';

  const groqKey = getGroqApiKey();
  const aiEnabled = isGeminiEnabled();

  const steps: Record<string, unknown> = {
    '1_groq_key_set': Boolean(groqKey),
    '2_ai_enabled': aiEnabled,
    '3_ai_worker_enabled': isAiWorkerAnalysisEnabled(),
    '4_ai_worker_url_set': Boolean(getAiWorkerUrl()),
    '5_test_url': testUrl,
  };

  // Fetch YouTube title
  let title = '';
  try {
    title = await getYoutubeTitleFromUrl(testUrl);
    steps['6_youtube_title'] = title || '(empty — oEmbed failed)';
  } catch (e) {
    steps['6_youtube_title_error'] = String(e);
  }

  // Quick Groq connectivity check
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'reply: ok' }],
          max_tokens: 8,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      steps['7_groq_http_status'] = res.status;
      if (res.ok) {
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        steps['7_groq_response'] = data.choices?.[0]?.message?.content ?? '(empty)';
      } else {
        steps['7_groq_error'] = (await res.text()).slice(0, 200);
      }
    } catch (e) {
      steps['7_groq_error'] = String(e);
    }
  }

  // Full spot extraction pipeline
  const titleOrId = title || 'BKorP55Aqvg';
  let spots: unknown[] = [];
  try {
    spots = await extractSpotsFromTitle(titleOrId);
    steps['8_extracted_spots_count'] = spots.length;
    steps['8_extracted_spots'] = spots;
  } catch (e) {
    steps['8_extract_error'] = String(e);
  }

  steps['9_final_result'] = spots.length > 0 ? 'AI ✅' : 'mock (spots array empty)';

  return NextResponse.json(steps);
}
