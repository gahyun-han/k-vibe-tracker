from config.logger import get_logger

logger = get_logger(__name__)


class YoutubeClient:
    """YouTube video metadata and transcript fetcher.

    - get_video_metadata: uses YouTube Data API v3 (requires api_key)
    - get_transcript: uses youtube-transcript-api (no API key needed)
    - extract_places: legacy mock — used as fallback when Gemini is unavailable
    """

    def __init__(self, api_key: str = "") -> None:
        self.api_key = api_key

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def get_video_metadata(self, video_id: str) -> dict:
        """Fetch video title and description via YouTube Data API v3."""
        if not self.api_key or not video_id:
            return {"title": "", "description": ""}
        try:
            from googleapiclient.discovery import build

            youtube = build("youtube", "v3", developerKey=self.api_key)
            response = youtube.videos().list(part="snippet", id=video_id).execute()
            items = response.get("items", [])
            if not items:
                return {"title": "", "description": ""}
            snippet = items[0].get("snippet", {})
            return {
                "title": snippet.get("title", ""),
                "description": snippet.get("description", ""),
            }
        except Exception as e:
            logger.warning(f"YouTube API metadata fetch failed for '{video_id}': {e}")
            return {"title": "", "description": ""}

    def get_transcript(self, video_id: str, languages: list[str] | None = None) -> str:
        """Fetch video transcript (captions) using youtube-transcript-api.

        No API key required — works by scraping YouTube's public caption data.
        Tries Korean first, then English as a fallback.
        """
        if not video_id:
            return ""
        if languages is None:
            languages = ["ko", "en"]
        try:
            from youtube_transcript_api import YouTubeTranscriptApi

            entries = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)
            return " ".join(entry["text"] for entry in entries)
        except Exception as e:
            logger.warning(f"Transcript fetch failed for '{video_id}': {e}")
            return ""

    def extract_places(self, video_id: str) -> list[dict]:
        """Legacy mock fallback — returns fixed Seoul spots when AI is unavailable."""
        if not video_id:
            return []
        return [
            {"name": "성수동 카페거리", "lat": 37.5447, "lng": 127.0564, "confidence": 0.92, "category": "cafe", "reason": "목 데이터"},
            {"name": "경복궁", "lat": 37.5796, "lng": 126.9770, "confidence": 0.87, "category": "landmark", "reason": "목 데이터"},
        ]
