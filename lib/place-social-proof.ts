export interface PlaceSocialProofTarget {
  id: string;
  contentId?: string;
  name: string;
  category: string;
  tags?: string[];
}

export interface PlaceSeenInStats {
  youtubeVideos: number;
  instagramPosts: number;
}

const SOCIAL_TAG_PATTERN = /(sns|k-?pop|drama|music|photo|cafe|food|market|street|heritage|creator|short-form)/i;

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function formatCompactSocialCount(value: number) {
  if (value < 1000) return String(value);

  const compact = value / 1000;
  return compact >= 10 ? `${Math.round(compact)}k` : `${compact.toFixed(1)}k`;
}

export function buildPlaceSeenInStats(place: PlaceSocialProofTarget): PlaceSeenInStats {
  const tags = place.tags ?? [];
  const hash = stableHash([
    place.contentId,
    place.id,
    place.name,
    place.category,
    tags.join(','),
  ].filter(Boolean).join('|'));
  const socialTagBonus = tags.some((tag) => SOCIAL_TAG_PATTERN.test(tag)) ? 1 : 0;

  return {
    youtubeVideos: 8 + (hash % 45) + socialTagBonus * 10,
    instagramPosts: 900 + ((hash >>> 5) % 9200) + socialTagBonus * 500,
  };
}
