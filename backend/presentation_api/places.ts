import { NextResponse, type NextRequest } from 'next/server';
import { getPlacesData } from '@/backend/business_services/places';

export async function getPlaces(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getPlacesData({
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
    radius: searchParams.get('radius'),
    category: searchParams.get('category'),
    locale: searchParams.get('locale'),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
