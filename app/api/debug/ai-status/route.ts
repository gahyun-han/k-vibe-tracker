import { NextResponse } from 'next/server';
import { isGeminiEnabled } from '@/backend/ai_services/gemini';
import { isAiWorkerAnalysisEnabled, getAiWorkerUrl } from '@/backend/dependency';

/**
 * GET /api/debug/ai-status
 * Diagnostic endpoint — shows which AI paths are active without exposing key values.
 * Safe to call from browser: no secrets returned.
 */
export async function GET() {
  const geminiEnabled = isGeminiEnabled();
  const aiWorkerEnabled = isAiWorkerAnalysisEnabled();
  const aiWorkerUrl = getAiWorkerUrl();

  return NextResponse.json({
    gemini_enabled: geminiEnabled,
    ai_worker_enabled: aiWorkerEnabled,
    ai_worker_url_set: Boolean(aiWorkerUrl),
    active_path: aiWorkerEnabled && aiWorkerUrl
      ? 'ai-worker (→ gemini fallback → mock)'
      : geminiEnabled
        ? 'gemini'
        : 'mock (no AI key configured)',
    env: process.env['NODE_ENV'],
  });
}
