export interface PlaceDetailShareTarget {
  contentId?: string;
  contentTypeId?: number;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  overview?: string;
  tags?: string[];
}

export function buildPlaceDetailShareUrl(
  place: PlaceDetailShareTarget,
  locale: string,
  currentHref: string,
) {
  const baseUrl = new URL(currentHref);
  const url = new URL(`/${locale}/map`, baseUrl.origin);
  url.searchParams.set('lat', String(place.lat));
  url.searchParams.set('lng', String(place.lng));
  url.searchParams.set('q', place.name);
  url.searchParams.set('source', 'share');
  url.searchParams.set('detail', '1');
  url.searchParams.set('category', place.category);
  url.searchParams.set('address', place.address);

  if (place.contentId) url.searchParams.set('contentId', place.contentId);
  if (place.contentTypeId) url.searchParams.set('contentTypeId', String(place.contentTypeId));
  if (place.imageUrl) url.searchParams.set('imageUrl', place.imageUrl);
  if (place.overview) url.searchParams.set('description', place.overview);
  if (place.tags?.length) url.searchParams.set('tags', place.tags.join(','));

  return url.toString();
}
