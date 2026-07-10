import type { AnalysisResult } from '@/lib/domain';
import { requestJson } from '@/frontend/api/client';

export interface AnalyzeRequestPayload {
  youtube_url: string;
  locale: string;
}

export function postAnalyze(payload: AnalyzeRequestPayload) {
  return requestJson<AnalysisResult>('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
