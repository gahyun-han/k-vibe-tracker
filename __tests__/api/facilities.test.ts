import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/facilities/route';

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/facilities');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

describe('GET /api/facilities', () => {
  it('returns mock facilities sorted by distance for valid coordinates', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978', radius: '500' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.cached).toBe(false);
    expect(data.cache_key).toBe('facilities:37.5665:126.9780:500:all');
    expect(data.facilities.length).toBeGreaterThan(0);
    expect(data.facilities.every((facility: { distance: number }) => facility.distance <= 500)).toBe(true);

    const distances = data.facilities.map((facility: { distance: number }) => facility.distance);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it('filters facilities by type', async () => {
    const res = await GET(
      makeRequest({ lat: '37.5665', lng: '126.978', radius: '1500', type: 'pharmacy' })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.facilities.length).toBeGreaterThan(0);
    expect(data.facilities.every((facility: { type: string }) => facility.type === 'pharmacy')).toBe(true);
  });

  it('uses a default radius when none is provided', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cache_key).toBe('facilities:37.5665:126.9780:500:all');
  });

  it('rejects invalid coordinates', async () => {
    const res = await GET(makeRequest({ lat: '120', lng: '126.978' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_COORDINATES');
  });

  it('rejects invalid radius values', async () => {
    const res = await GET(makeRequest({ lat: '37.5665', lng: '126.978', radius: '5000' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_RADIUS');
  });

  it('rejects invalid facility types', async () => {
    const res = await GET(
      makeRequest({ lat: '37.5665', lng: '126.978', radius: '500', type: 'karaoke' })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_TYPE');
  });
});
