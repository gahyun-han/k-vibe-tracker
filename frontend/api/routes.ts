import type { RoutePlan, RouteTheme } from '@/lib/routes';
import { requestJson } from '@/frontend/api/client';

export interface GenerateRouteRequestPayload {
  theme: RouteTheme;
  detail: string;
  start_time: string;
  locale: string;
}

export interface GenerateRouteResponse {
  plan: RoutePlan;
  cached: boolean;
  source: 'mock';
}

export function generateRoutePlan(payload: GenerateRouteRequestPayload) {
  return requestJson<GenerateRouteResponse>('/api/routes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
