/**
 * YouTube oEmbed — fetch video title without a YouTube Data API key.
 * Falls back to an empty string when the request fails.
 */

const OEMBED_URL = 'https://www.youtube.com/oembed';
const OEMBED_TIMEOUT_MS = 5_000;

interface OEmbedResponse {
  title?: string;
  author_name?: string;
}

/**
 * Return the video title for a given YouTube URL.
 * Uses the public oEmbed endpoint — no API key required.
 */
export async function getYoutubeTitleFromUrl(youtubeUrl: string): Promise<string> {
  if (!youtubeUrl) return '';
  try {
    const params = new URLSearchParams({ url: youtubeUrl, format: 'json' });
    const res = await fetch(`${OEMBED_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    });
    if (!res.ok) return '';
    const data = (await res.json()) as OEmbedResponse;
    return data.title ?? '';
  } catch {
    return '';
  }
}
