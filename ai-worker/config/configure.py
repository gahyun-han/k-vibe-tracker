from dataclasses import dataclass
import os

try:
    from config.configure_local import LOCAL_API_KEYS  # type: ignore
except Exception:
    LOCAL_API_KEYS = {}


@dataclass(frozen=True)
class Settings:
    allowed_origins: list[str]
    api_limit_per_minute: int
    tour_api_key: str
    kakao_map_rest_key: str
    google_search_api_key: str
    naver_search_api_key: str
    tts_api_key: str


def get_settings() -> Settings:
    origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
    return Settings(
        allowed_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
        api_limit_per_minute=int(os.getenv("API_LIMIT_PER_MINUTE", "60")),
        tour_api_key=LOCAL_API_KEYS.get("TOUR_API_KEY", os.getenv("TOUR_API_KEY", "")),
        kakao_map_rest_key=LOCAL_API_KEYS.get("KAKAO_MAP_REST_KEY", os.getenv("KAKAO_MAP_REST_KEY", "")),
        google_search_api_key=LOCAL_API_KEYS.get("GOOGLE_SEARCH_API_KEY", os.getenv("GOOGLE_SEARCH_API_KEY", "")),
        naver_search_api_key=LOCAL_API_KEYS.get("NAVER_SEARCH_API_KEY", os.getenv("NAVER_SEARCH_API_KEY", "")),
        tts_api_key=LOCAL_API_KEYS.get("TTS_API_KEY", os.getenv("TTS_API_KEY", "")),
    )
