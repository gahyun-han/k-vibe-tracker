import { describe, it, expect } from 'vitest';
import { haversineKm, walkingMinutes, totalRouteMinutes } from '@/lib/haversine';

describe('haversineKm', () => {
  it('같은 좌표는 0km', () => {
    expect(haversineKm(37.5665, 126.978, 37.5665, 126.978)).toBe(0);
  });

  it('서울↔부산 직선거리는 약 320~330km', () => {
    const dist = haversineKm(37.5665, 126.978, 35.1796, 129.0756);
    expect(dist).toBeGreaterThan(320);
    expect(dist).toBeLessThan(340);
  });

  it('적도 위 경도 1도 차이 ≈ 111km', () => {
    const dist = haversineKm(0, 0, 0, 1);
    expect(dist).toBeCloseTo(111.19, 0);
  });

  it('남북 위도 1도 차이 ≈ 111km', () => {
    const dist = haversineKm(0, 0, 1, 0);
    expect(dist).toBeCloseTo(111.19, 0);
  });

  it('인자 순서 반전해도 같은 거리 (대칭성)', () => {
    const d1 = haversineKm(37.5, 127.0, 35.1, 129.0);
    const d2 = haversineKm(35.1, 129.0, 37.5, 127.0);
    expect(d1).toBeCloseTo(d2, 5);
  });

  it('음수 좌표 처리 (남반구↔북반구)', () => {
    const dist = haversineKm(-33.868, 151.209, 37.5665, 126.978); // 시드니↔서울
    expect(dist).toBeGreaterThan(8000);
    expect(dist).toBeLessThan(9000);
  });
});

describe('walkingMinutes', () => {
  it('0km → 0분', () => {
    expect(walkingMinutes(0)).toBe(0);
  });

  it('1km → 15분 (4km/h)', () => {
    expect(walkingMinutes(1)).toBe(15);
  });

  it('0.1km(100m) → 올림 2분', () => {
    expect(walkingMinutes(0.1)).toBe(2); // 0.1/4*60 = 1.5 → ceil = 2
  });

  it('소수 거리 올림 처리', () => {
    expect(walkingMinutes(0.5)).toBe(8); // 0.5/4*60 = 7.5 → 8
  });
});

describe('totalRouteMinutes', () => {
  it('waypoint 1개 → 0분', () => {
    expect(totalRouteMinutes([{ lat: 37.5, lng: 127.0 }])).toBe(0);
  });

  it('빈 배열 → 0분', () => {
    expect(totalRouteMinutes([])).toBe(0);
  });

  it('2개 지점 합산 = 단일 구간 시간', () => {
    const a = { lat: 37.5665, lng: 126.978 };
    const b = { lat: 37.5747, lng: 126.9768 };
    const expected = walkingMinutes(haversineKm(a.lat, a.lng, b.lat, b.lng));
    expect(totalRouteMinutes([a, b])).toBe(expected);
  });

  it('3개 지점: A→B + B→C 합산', () => {
    const a = { lat: 37.5, lng: 127.0 };
    const b = { lat: 37.51, lng: 127.01 };
    const c = { lat: 37.52, lng: 127.02 };
    const ab = walkingMinutes(haversineKm(a.lat, a.lng, b.lat, b.lng));
    const bc = walkingMinutes(haversineKm(b.lat, b.lng, c.lat, c.lng));
    expect(totalRouteMinutes([a, b, c])).toBe(ab + bc);
  });
});
