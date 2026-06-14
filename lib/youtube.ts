/**
 * YouTube URL에서 videoId 추출
 * 지원 형식:
 *   https://www.youtube.com/watch?v=VIDEOID
 *   https://youtu.be/VIDEOID
 *   https://youtube.com/shorts/VIDEOID
 *   https://www.youtube.com/embed/VIDEOID
 */
export function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1) || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/');
      const idx = parts.findIndex((p) => p === 'shorts' || p === 'embed');
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidYoutubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
