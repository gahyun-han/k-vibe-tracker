import httpx

from config.logger import get_logger

logger = get_logger(__name__)

_KAKAO_LOCAL_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
_SEOUL_CENTER = {"x": "126.9784", "y": "37.5665"}


class KakaoMapClient:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    def estimate_duration_minutes(self, waypoints: list[dict]) -> int:
        if len(waypoints) <= 1:
            return 0
        return max((len(waypoints) - 1) * 20, 20)

    def search_place(self, place_name: str) -> dict | None:
        """Search for a place by name using Kakao Local Keyword Search API.

        Returns {"lat": float, "lng": float} for the top result, or None if
        no results are found or the API key is not set.
        """
        if not self.api_key or not place_name:
            return None
        try:
            response = httpx.get(
                _KAKAO_LOCAL_SEARCH_URL,
                params={
                    "query": place_name,
                    "x": _SEOUL_CENTER["x"],
                    "y": _SEOUL_CENTER["y"],
                    "radius": 50000,  # 50 km radius around central Seoul
                    "size": 1,
                },
                headers={"Authorization": f"KakaoAK {self.api_key}"},
                timeout=5.0,
            )
            response.raise_for_status()
            docs = response.json().get("documents", [])
            if docs:
                return {"lat": float(docs[0]["y"]), "lng": float(docs[0]["x"])}
        except Exception as e:
            logger.warning(f"Kakao place search failed for '{place_name}': {e}")
        return None
