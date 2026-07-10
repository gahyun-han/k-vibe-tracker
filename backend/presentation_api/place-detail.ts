import { NextResponse, type NextRequest } from 'next/server';
import { getPlaceDetailData } from '@/backend/business_services/place-detail';

interface PlaceDetailRouteContext {
  params: {
    contentId: string;
  };
}

export async function getPlaceDetail(request: NextRequest, { params }: PlaceDetailRouteContext) {
  const { searchParams } = new URL(request.url);
  const result = await getPlaceDetailData({
    contentId: params.contentId,
    contentTypeId: searchParams.get('contentTypeId'),
    locale: searchParams.get('locale'),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
