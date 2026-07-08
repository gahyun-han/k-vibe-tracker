/**
 * Direct Gemini integration for the Next.js API layer.
 *
 * Used when GOOGLE_AI_API_KEY is set in the environment but an ai-worker
 * is not deployed (e.g. Vercel production).
 *
 * Tries models in order: gemini-2.0-flash → gemini-2.0-flash-lite → gemini-1.5-flash-latest
 * Falls back to empty string on any error.
 */

const GEMINI_API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
];
const GEMINI_TIMEOUT_MS = 20_000;

interface GeminiCandidate {
  content: { parts: { text: string }[] };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

interface RawSpot {
  name?: unknown;
  category?: unknown;
  confidence?: unknown;
  reason?: unknown;
}

export function getGoogleAiApiKey(): string {
  return process.env['GOOGLE_AI_API_KEY'] ?? '';
}

export function isGeminiEnabled(): boolean {
  return Boolean(getGoogleAiApiKey());
}

/**
 * Call Gemini and return the text response.
 * Tries multiple models in order until one succeeds.
 * Returns empty string on all failures.
 */
export async function geminiComplete(prompt: string): Promise<string> {
  const apiKey = getGoogleAiApiKey();
  if (!apiKey) return '';

  for (const model of GEMINI_MODELS) {
    try {
      const url = `${GEMINI_API_ROOT}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      });

      if (!res.ok) {
        const err = await res.text().catch(() => '');
        console.error(`[gemini] ${model} error ${res.status}: ${err.slice(0, 200)}`);
        // 429 = quota exhausted, 404 = model not found → try next model
        if (res.status === 429 || res.status === 404) continue;
        return '';
      }

      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content.parts[0]?.text ?? '';
      if (text) console.log(`[gemini] success with model: ${model}`);
      return text;
    } catch (e) {
      console.error(`[gemini] ${model} fetch failed:`, e);
    }
  }

  console.error('[gemini] all models exhausted');
  return '';
}

const SPOT_EXTRACTION_PROMPT = `당신은 한국 여행 장소 추천 전문가입니다.
아래 YouTube 영상 정보에서 등장하는 한국의 실제 여행 스팟(장소)을 추출하세요.

## 영상 제목
{title}

## 지시사항
- 영상에서 유추할 수 있는 실제 한국 여행 장소를 최대 6개 추출하세요
- 추상적인 광역 지명(서울, 부산 등)은 제외하고 구체적인 장소명을 추출하세요
- 각 장소의 카테고리: cafe, restaurant, landmark, park, shopping, culture, nature, other
- confidence는 0.0~1.0 (제목에서 얼마나 명확히 유추 가능한지)
- 반드시 아래 JSON 배열만 반환하세요 (추가 텍스트 없이)

\`\`\`json
[
  {"name": "장소명 (한국어)", "category": "cafe", "confidence": 0.9, "reason": "제목 언급"}
]
\`\`\``;

/**
 * Extract Korean tourist spots from a YouTube video title using Gemini.
 */
export async function extractSpotsFromTitle(title: string): Promise<RawSpot[]> {
  if (!title) return [];

  const prompt = SPOT_EXTRACTION_PROMPT.replace('{title}', title);
  const text = await geminiComplete(prompt);
  if (!text) return [];

  try {
    const match = /```(?:json)?\s*(\[.*?\])\s*```/s.exec(text);
    const jsonStr = match ? match[1] : text.trim();
    const parsed = JSON.parse(jsonStr ?? '') as unknown;
    if (Array.isArray(parsed)) return parsed as RawSpot[];
  } catch {
    console.error('[gemini] JSON parse error:', text.slice(0, 200));
  }

  return [];
}
