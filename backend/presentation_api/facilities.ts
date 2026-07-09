import { NextResponse, type NextRequest } from 'next/server';
import { getFacilitiesData } from '@/backend/business_services/facilities';

export async function getFacilities(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getFacilitiesData({
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
    radius: searchParams.get('radius'),
    type: searchParams.get('type'),
    locale: searchParams.get('locale'),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
