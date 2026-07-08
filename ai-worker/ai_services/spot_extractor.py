"""
SpotExtractorService
--------------------
Full pipeline: YouTube video → Gemini 1.5 Flash NER → Kakao Local geocoding

When API keys are not set the service falls back to the YoutubeClient mock so
the application stays functional during development / CI.
"""

import json
import re
from typing import TYPE_CHECKING

from ai_services.gemini_client import GeminiClient
from ai_services.prompttemplate import PROMPT_TEMPLATES
from config.logger import get_logger

if TYPE_CHECKING:
    from externelAPI_services.kakaomap import KakaoMapClient
    from externelAPI_services.youtube import YoutubeClient

logger = get_logger(__name__)

# Rough centroid of central Seoul — used as the Kakao search origin
_SEOUL_CENTER = {"x": "126.9784", "y": "37.5665"}

# Hardcoded fallbacks for common spots that might appear without coordinates
_FALLBACK_COORDS: dict[str, dict[str, float]] = {
    "성수": {"lat": 37.5447, "lng": 127.0564},
    "경복궁": {"lat": 37.5796, "lng": 126.9770},
    "홍대": {"lat": 37.5563, "lng": 126.9237},
    "강남": {"lat": 37.4979, "lng": 127.0276},
    "이태원": {"lat": 37.5348, "lng": 126.9947},
    "명동": {"lat": 37.5607, "lng": 126.9863},
    "북촌": {"lat": 37.5826, "lng": 126.9816},
    "인사동": {"lat": 37.5742, "lng": 126.9845},
    "합정": {"lat": 37.5498, "lng": 126.9137},
    "을지로": {"lat": 37.5664, "lng": 126.9997},
    "광장시장": {"lat": 37.5700, "lng": 126.9998},
    "남산": {"lat": 37.5512, "lng": 126.9882},
}


class SpotExtractorService:
    """Orchestrates YouTube → Gemini → Kakao pipeline."""

    def __init__(
        self,
        gemini_client: "GeminiClient",
        youtube_client: "YoutubeClient",
        kakao_client: "KakaoMapClient",
    ) -> None:
        self._gemini = gemini_client
        self._youtube = youtube_client
        self._kakao = kakao_client

    def extract(self, video_id: str) -> list[dict]:
        """
        Return a list of place dicts with keys:
          name, lat, lng, confidence, category, reason
        Falls back to YoutubeClient.extract_places() when Gemini is unavailable.
        """
        if not self._gemini.is_available():
            logger.info("Gemini not configured — using mock fallback")
            return self._youtube.extract_places(video_id)

        metadata = self._youtube.get_video_metadata(video_id)
        transcript = self._youtube.get_transcript(video_id)

        prompt = PROMPT_TEMPLATES["spot_extraction"].format(
            title=metadata.get("title") or "(제목 없음)",
            description=(metadata.get("description") or "")[:2000],
            transcript=transcript[:3000] if transcript else "(자막 없음)",
        )

        raw_text = self._gemini.complete(prompt)
        places_raw = self._parse_json(raw_text)

        if not places_raw:
            logger.warning(f"Gemini returned no parseable places for {video_id} — using mock fallback")
            return self._youtube.extract_places(video_id)

        return self._geocode_places(places_raw)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _parse_json(self, text: str) -> list[dict]:
        if not text:
            return []
        try:
            match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", text, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            return json.loads(text.strip())
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse Gemini JSON response (first 200 chars): {text[:200]}")
            return []

    def _geocode_places(self, places_raw: list[dict]) -> list[dict]:
        results: list[dict] = []
        for place in places_raw:
            name: str = (place.get("name") or "").strip()
            if not name:
                continue
            coords = self._kakao.search_place(name) or self._fallback_coords(name)
            if not coords:
                logger.debug(f"No coordinates found for '{name}' — skipping")
                continue
            results.append(
                {
                    "name": name,
                    "lat": coords["lat"],
                    "lng": coords["lng"],
                    "confidence": float(place.get("confidence") or 0.7),
                    "category": place.get("category") or "other",
                    "reason": place.get("reason") or "",
                }
            )
        logger.info(f"SpotExtractor geocoded {len(results)}/{len(places_raw)} places")
        return results

    def _fallback_coords(self, name: str) -> dict | None:
        for keyword, coords in _FALLBACK_COORDS.items():
            if keyword in name:
                return coords
        return None
