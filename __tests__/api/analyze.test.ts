import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/analyze/route';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeRequest(body: object | string) {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.ENABLE_AI_WORKER_ANALYSIS;
    delete process.env.AI_WORKER_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns local mock analysis by default without calling the worker', async () => {
    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.video_id).toBe('dQw4w9WgXcQ');
    expect(data.title).toBe('Local K-content spot preview');
    expect(data.source).toBe('mock');
    expect(data.places).toHaveLength(3);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns localized mock analysis when a supported locale is provided', async () => {
    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', locale: 'ko' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.title).toBe('로컬 K-콘텐츠 스팟 미리보기');
    expect(data.places[0].name).toBe('성수 카페거리');
    expect(data.places[0].reason).toContain('카페 거리');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects unsupported locales', async () => {
    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', locale: 'fr' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_LOCALE');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects invalid YouTube URLs', async () => {
    const res = await POST(makeRequest({ youtube_url: 'https://google.com' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_YOUTUBE_URL');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('rejects missing YouTube URLs', async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_YOUTUBE_URL');
  });

  it('rejects malformed JSON', async () => {
    const res = await POST(makeRequest('{'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_BODY');
  });

  it('calls the worker only when explicitly enabled', async () => {
    process.env.ENABLE_AI_WORKER_ANALYSIS = 'true';
    process.env.AI_WORKER_URL = 'http://localhost:8000';
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          video_id: 'short1',
          title: 'Worker result',
          places: [{ name: 'Seongsu', lat: 37.5447, lng: 127.0564, confidence: 0.9 }],
          cached: true,
        }),
        { status: 200 }
      )
    );

    const res = await POST(makeRequest({ youtube_url: 'https://youtu.be/short1', locale: 'ja' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(String(mockFetch.mock.calls[0][0])).toBe('http://localhost:8000/analyze');
    expect(JSON.parse(String(mockFetch.mock.calls[0][1]?.body))).toEqual({
      youtube_url: 'https://youtu.be/short1',
      locale: 'ja',
    });
    expect(data.source).toBe('worker');
    expect(data.cached).toBe(true);
    expect(data.title).toBe('Worker result');
  });

  it('passes worker errors through when the worker is enabled', async () => {
    process.env.ENABLE_AI_WORKER_ANALYSIS = 'true';
    process.env.AI_WORKER_URL = 'http://localhost:8000';
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'WORKER_CRASH' }), { status: 500 })
    );

    const res = await POST(makeRequest({ youtube_url: 'https://youtu.be/abc123' }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe('WORKER_CRASH');
  });

  it('falls back to mock analysis when the enabled worker cannot be reached', async () => {
    process.env.ENABLE_AI_WORKER_ANALYSIS = 'true';
    process.env.AI_WORKER_URL = 'http://localhost:8000';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch.mockRejectedValue(new TypeError('fetch failed'));

    const res = await POST(makeRequest({ youtube_url: 'https://www.youtube.com/watch?v=mocktest1', locale: 'zh' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.title).toBe('本地K内容地点预览');
    expect(data.places.length).toBeGreaterThan(0);
  });
});
