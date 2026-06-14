import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// fetch를 전역 mock
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// POST를 동적으로 import (전역 mock 설정 후)
const { POST } = await import('@/app/api/analyze/route');

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('유효한 YouTube URL → AI 워커 응답 200', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({
        video_id: 'dQw4w9WgXcQ',
        title: '테스트 영상',
        places: [{ name: '성수동', lat: 37.5447, lng: 127.0564, confidence: 0.9 }],
        cached: false,
      }), { status: 200 }),
    );

    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.video_id).toBe('dQw4w9WgXcQ');
    expect(data.places).toHaveLength(1);
  });

  it('잘못된 URL → 400 INVALID_YOUTUBE_URL', async () => {
    const res = await POST(makeRequest({ youtube_url: 'https://google.com' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_YOUTUBE_URL');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('빈 문자열 URL → 400', async () => {
    const res = await POST(makeRequest({ youtube_url: '' }));
    expect(res.status).toBe(400);
  });

  it('youtube_url 키 없음 → 400', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('AI 워커 500 에러 → 상위로 전달', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'WORKER_CRASH' }), { status: 500 }),
    );

    const res = await POST(makeRequest({ youtube_url: 'https://youtu.be/abc123' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('WORKER_CRASH');
  });

  it('AI 워커 미연결(TypeError) → 목 응답 반환', async () => {
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=mocktest1' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toContain('목 데이터');
    expect(Array.isArray(data.places)).toBe(true);
    expect(data.places.length).toBeGreaterThan(0);
  });

  it('youtu.be 단축 URL도 정상 처리', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ video_id: 'short1', title: 'Short', places: [], cached: false }), { status: 200 }),
    );

    const res = await POST(makeRequest({ youtube_url: 'https://youtu.be/short1' }));
    expect(res.status).toBe(200);
  });

  it('AI 워커 비-TypeError 예외 → 500 INTERNAL_ERROR', async () => {
    mockFetch.mockRejectedValue(new Error('network timeout'));

    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=errtest' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('INTERNAL_ERROR');
  });
});
