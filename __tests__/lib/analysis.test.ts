import { describe, expect, it } from 'vitest';
import { buildAnalysisLocalCacheKey, buildMockAnalysis, isAnalysisLocale, type AnalysisLocale } from '@/lib/analysis';

describe('analysis helpers', () => {
  it('localizes deterministic mock analysis results', () => {
    const cases: Array<{ locale: AnalysisLocale; expectedTitle: string; expectedFirstPlace: string }> = [
      { locale: 'en', expectedTitle: 'Local K-content spot preview', expectedFirstPlace: 'Seongsu Cafe Street' },
      { locale: 'ko', expectedTitle: '로컬 K-콘텐츠 스팟 미리보기', expectedFirstPlace: '성수 카페거리' },
      { locale: 'ja', expectedTitle: 'ローカルKコンテンツスポットのプレビュー', expectedFirstPlace: '聖水カフェ通り' },
      { locale: 'zh', expectedTitle: '本地K内容地点预览', expectedFirstPlace: '圣水咖啡街' },
    ];

    for (const { locale, expectedTitle, expectedFirstPlace } of cases) {
      const result = buildMockAnalysis('video123', locale);

      expect(result.video_id).toBe('video123');
      expect(result.title).toBe(expectedTitle);
      expect(result.places[0].name).toBe(expectedFirstPlace);
      expect(result.places.every((place) => place.reason.length > 0)).toBe(true);
    }
  });

  it('validates supported analysis locales', () => {
    expect(isAnalysisLocale('en')).toBe(true);
    expect(isAnalysisLocale('ko')).toBe(true);
    expect(isAnalysisLocale('fr')).toBe(false);
  });

  it('builds locale-aware local analysis cache keys', () => {
    const key = buildAnalysisLocalCacheKey({ locale: 'ko', videoId: 'dQw4w9WgXcQ' });

    expect(key).toBe('k-vibe-api-cache:analyze?locale=ko&videoId=dQw4w9WgXcQ');
  });
});
