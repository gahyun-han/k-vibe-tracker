import { NextResponse, type NextRequest } from 'next/server';

// Sprint 1에서 TourAPI + Redis 캐시 연동 예정
// 현재는 구조만 작성 (mock 응답)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '1000';
  const category = searchParams.get('category');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat, lng 필수' }, { status: 400 });
  }

  // TODO Sprint 1: Redis 캐시 확인 → TourAPI 호출 → DB upsert
  // const cacheKey = `places:${Math.round(parseFloat(lat)*10)/10}:${Math.round(parseFloat(lng)*10)/10}:r${radius}`;

  // Mock 응답
  const mockPlaces = [
    { content_id: 'mock_1', name_en: 'Seongsu Cafe Street', lat: parseFloat(lat) + 0.001, lng: parseFloat(lng) + 0.001, category: 'cafe', crowd_level: 72 },
    { content_id: 'mock_2', name_en: 'Hongdae Photo Booth',  lat: parseFloat(lat) - 0.002, lng: parseFloat(lng) + 0.002, category: 'photo', crowd_level: 45 },
  ];

  return NextResponse.json({ places: mockPlaces, cached: false, source: 'mock' });
}
