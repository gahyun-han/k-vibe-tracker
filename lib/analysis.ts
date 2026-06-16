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

export type AnalysisLocale = 'en' | 'ko' | 'ja' | 'zh';

const ANALYSIS_LOCALES = ['en', 'ko', 'ja', 'zh'] as const;

const MOCK_ANALYSIS_COPY: Record<AnalysisLocale, Omit<AnalysisResult, 'video_id' | 'cached' | 'source'>> = {
  en: {
    title: 'Local K-content spot preview',
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
  },
  ko: {
    title: '로컬 K-콘텐츠 스팟 미리보기',
    places: [
      {
        name: '성수 카페거리',
        lat: 37.5447,
        lng: 127.0564,
        confidence: 0.92,
        reason: '카페 거리, 팝업 스토어, 크리에이터 여행 영상에서 자주 보이는 장면과 잘 맞는 후보입니다.',
      },
      {
        name: '경복궁',
        lat: 37.5796,
        lng: 126.977,
        confidence: 0.87,
        reason: 'K-드라마와 관광 영상에 자주 등장하는 서울 대표 랜드마크 후보입니다.',
      },
      {
        name: '광장시장 먹자골목',
        lat: 37.5701,
        lng: 126.9996,
        confidence: 0.78,
        reason: '간식, 길거리 음식, 시장 장면이 포함된 콘텐츠에 어울리는 음식시장 후보입니다.',
      },
    ],
  },
  ja: {
    title: 'ローカルKコンテンツスポットのプレビュー',
    places: [
      {
        name: '聖水カフェ通り',
        lat: 37.5447,
        lng: 127.0564,
        confidence: 0.92,
        reason: 'カフェ通り、ポップアップショップ、クリエイターの旅行動画によく合う候補です。',
      },
      {
        name: '景福宮',
        lat: 37.5796,
        lng: 126.977,
        confidence: 0.87,
        reason: 'Kドラマや観光動画に頻繁に登場するソウルの代表的なランドマーク候補です。',
      },
      {
        name: '広蔵市場グルメ通り',
        lat: 37.5701,
        lng: 126.9996,
        confidence: 0.78,
        reason: '軽食、屋台グルメ、市場シーンのコンテンツに合うフードマーケット候補です。',
      },
    ],
  },
  zh: {
    title: '本地K内容地点预览',
    places: [
      {
        name: '圣水咖啡街',
        lat: 37.5447,
        lng: 127.0564,
        confidence: 0.92,
        reason: '常见于咖啡街、快闪店和创作者旅行视频的画面候选。',
      },
      {
        name: '景福宫',
        lat: 37.5796,
        lng: 126.977,
        confidence: 0.87,
        reason: '经常出现在K剧和旅游视频中的首尔代表性地标候选。',
      },
      {
        name: '广藏市场美食街',
        lat: 37.5701,
        lng: 126.9996,
        confidence: 0.78,
        reason: '适合小吃、街头美食和市场场景内容的美食市场候选。',
      },
    ],
  },
};

export function isAnalysisLocale(value: string): value is AnalysisLocale {
  return ANALYSIS_LOCALES.includes(value as AnalysisLocale);
}

export function buildMockAnalysis(videoId: string, locale: AnalysisLocale = 'en'): AnalysisResult {
  const copy = MOCK_ANALYSIS_COPY[locale];

  return {
    video_id: videoId,
    title: copy.title,
    cached: false,
    source: 'mock',
    places: copy.places.map((place) => ({ ...place })),
  };
}

export function shouldCallAiWorker() {
  return process.env.ENABLE_AI_WORKER_ANALYSIS === 'true' && Boolean(process.env.AI_WORKER_URL);
}
