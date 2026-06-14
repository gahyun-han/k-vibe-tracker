import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';

const AI_WORKER_URL = process.env.AI_WORKER_URL ?? 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const { youtube_url } = await req.json();

    const videoId = extractVideoId(youtube_url ?? '');
    if (!videoId) {
      return NextResponse.json({ error: 'INVALID_YOUTUBE_URL' }, { status: 400 });
    }

    // AI 워커 호출 (Render.com 배포 후 AI_WORKER_URL 환경변수로 교체)
    const res = await fetch(`${AI_WORKER_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtube_url }),
      signal: AbortSignal.timeout(15_000), // 15초 타임아웃
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.detail ?? 'AI_WORKER_ERROR' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    // AI 워커 미배포 상태 — 목 응답 반환
    if (e instanceof TypeError && e.message.includes('fetch')) {
      const videoId = extractVideoId((await req.clone().json().catch(() => ({ youtube_url: '' }))).youtube_url ?? '');
      return NextResponse.json({
        video_id: videoId ?? 'unknown',
        title: '[AI 워커 미연결 — 목 데이터]',
        places: [
          { name: '성수동 카페거리', lat: 37.5447, lng: 127.0564, confidence: 0.92 },
          { name: '경복궁',          lat: 37.5796, lng: 126.9770, confidence: 0.87 },
          { name: '광장시장',        lat: 37.5700, lng: 126.9996, confidence: 0.78 },
        ],
        cached: false,
      });
    }
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
