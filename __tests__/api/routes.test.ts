import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/routes/generate/route';

function makeRequest(body: object | string) {
  return new NextRequest('http://localhost/api/routes/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/routes/generate', () => {
  it('generates a deterministic mock route plan', async () => {
    const res = await POST(makeRequest({ theme: 'mood', detail: 'cafe', start_time: '09:30' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.source).toBe('mock');
    expect(data.cached).toBe(false);
    expect(data.plan.title).toBe('Cafe day Seoul Route');
    expect(data.plan.stops).toHaveLength(4);
    expect(data.plan.stops[0].startTime).toBe('09:30');
    expect(data.plan.walkingMinutes).toBeGreaterThan(0);
    expect(data.plan.totalMinutes).toBe(data.plan.walkingMinutes + data.plan.stayMinutes);
  });

  it('localizes generated mock route titles when locale is provided', async () => {
    const res = await POST(makeRequest({ theme: 'mood', detail: 'cafe', start_time: '09:30', locale: 'ko' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.plan.title).toBe('카페 데이 서울 루트');
    expect(data.plan.summary).toContain('로컬 미리보기 루트');
  });

  it('rejects invalid themes', async () => {
    const res = await POST(makeRequest({ theme: 'sports', detail: 'cafe' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_THEME');
  });

  it('rejects details outside the selected theme', async () => {
    const res = await POST(makeRequest({ theme: 'kpop', detail: 'cafe' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_DETAIL');
  });

  it('rejects invalid start times', async () => {
    const res = await POST(makeRequest({ theme: 'drama', detail: 'palace', start_time: '25:99' }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_START_TIME');
  });

  it('rejects malformed JSON', async () => {
    const res = await POST(makeRequest('{'));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('INVALID_BODY');
  });
});
