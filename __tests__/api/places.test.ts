import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/places/route';

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/places');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe('GET /api/places', () => {
  it('lat, lng 모두 제공 → 200 + places 배열', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.places)).toBe(true);
    expect(data.places.length).toBeGreaterThan(0);
  });

  it('lat 없음 → 400', async () => {
    const res = await GET(makeRequest({ lng: '126.978' }));
    expect(res.status).toBe(400);
  });

  it('lng 없음 → 400', async () => {
    const res = await GET(makeRequest({ lat: '37.5665' }));
    expect(res.status).toBe(400);
  });

  it('둘 다 없음 → 400', async () => {
    const res = await GET(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('mock 응답에 content_id, name_en, lat, lng 포함', async () => {
    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    const data = await res.json();
    const place = data.places[0];

    expect(place).toHaveProperty('content_id');
    expect(place).toHaveProperty('name_en');
    expect(place).toHaveProperty('lat');
    expect(place).toHaveProperty('lng');
  });

  it('응답의 lat/lng는 입력 기준 오프셋 값', async () => {
    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    const data = await res.json();

    // mock은 +0.001/-0.002 오프셋 사용
    expect(data.places[0].lat).toBeCloseTo(37.501, 3);
    expect(data.places[1].lng).toBeCloseTo(127.002, 3);
  });

  it('category 파라미터 없어도 동작', async () => {
    const res = await GET(makeRequest({ lat: '37.5', lng: '127.0' }));
    expect(res.status).toBe(200);
  });

  it('source 필드가 mock', async () => {
    const res = await GET(makeRequest({ lat: '37.0', lng: '127.0' }));
    const data = await res.json();
    expect(data.source).toBe('mock');
  });
});
