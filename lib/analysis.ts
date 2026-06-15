export interface AnalysisPlace {
  name: string;
  lat: number | null;
  lng: number | null;
  confidence: number;
  reason: string;
}

export interface AnalysisResult {
  video_id: string;
  title: string;
  places: AnalysisPlace[];
  cached: boolean;
  source: 'mock' | 'worker';
}

export function buildMockAnalysis(videoId: string): AnalysisResult {
  return {
    video_id: videoId,
    title: 'Local K-content spot preview',
    cached: false,
    source: 'mock',
    places: [
      {
        name: 'Seongsu Cafe Street',
        lat: 37.5447,
        lng: 127.0564,
        confidence: 0.92,
        reason: 'Common visual match for cafe streets, pop-up shops, and creator travel clips.',
      },
      {
        name: 'Gyeongbokgung Palace',
        lat: 37.5796,
        lng: 126.977,
        confidence: 0.87,
        reason: 'High-signal Seoul landmark frequently shown in K-drama and tourism videos.',
      },
      {
        name: 'Gwangjang Market Food Alley',
        lat: 37.5701,
        lng: 126.9996,
        confidence: 0.78,
        reason: 'Food-market fallback candidate for snack, street-food, and market-scene content.',
      },
    ],
  };
}

export function shouldCallAiWorker() {
  return process.env.ENABLE_AI_WORKER_ANALYSIS === 'true' && Boolean(process.env.AI_WORKER_URL);
}
