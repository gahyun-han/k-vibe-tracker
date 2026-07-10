/**
 * Coordinate pair type
 */
type Coordinate = { lat: number; lng: number };

/**
 * Haversine 공식으로 두 좌표 간 직선 거리 계산 (km)
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 두 좌표 간 거리 계산 (km) - coordinate pair 형식 지원
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  return haversineKm(coord1.lat, coord1.lng, coord2.lat, coord2.lng);
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * 도보 이동 시간 (분) — 평균 4km/h 기준
 */
export function walkingMinutes(distKm: number): number {
  return Math.ceil((distKm / 4) * 60);
}

/**
 * 루트 전체 이동 시간 합산 (분)
 */
export function totalRouteMinutes(
  waypoints: { lat: number; lng: number }[],
): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    if (!from || !to) continue;
    const dist = haversineKm(
      from.lat, from.lng,
      to.lat, to.lng,
    );
    total += walkingMinutes(dist);
  }
  return total;
}
