interface PlaceImageSource {
  imageUrl?: string | null;
  images?: readonly (string | null | undefined)[];
}

function cleanImageUrl(url: string | null | undefined) {
  const value = url?.trim();
  return value && /^https?:\/\//i.test(value) ? value : null;
}

export function buildPlaceImageGallery(source: PlaceImageSource | null | undefined, limit = 6) {
  if (!source) return [];

  const urls = [...(source.images ?? []), source.imageUrl]
    .map(cleanImageUrl)
    .filter((url): url is string => Boolean(url));

  return Array.from(new Set(urls)).slice(0, limit);
}
