import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from main import app, extract_video_id, cache_key
from unittest.mock import MagicMock, patch

client = TestClient(app)


# ──────────────────────────────────────────────
# extract_video_id
# ──────────────────────────────────────────────
class TestExtractVideoId:
    def test_watch_url(self):
        assert extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"

    def test_youtu_be(self):
        assert extract_video_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"

    def test_shorts(self):
        assert extract_video_id("https://www.youtube.com/shorts/abc123") == "abc123"

    def test_embed(self):
        assert extract_video_id("https://www.youtube.com/embed/testId") == "testId"

    def test_with_extra_params(self):
        assert extract_video_id("https://www.youtube.com/watch?v=abc&t=30s") == "abc"

    def test_invalid_url(self):
        assert extract_video_id("https://google.com") is None

    def test_empty_string(self):
        assert extract_video_id("") is None

    def test_not_a_url(self):
        assert extract_video_id("not-a-url") is None

    def test_youtu_be_no_path(self):
        result = extract_video_id("https://youtu.be/")
        assert result == "" or result is None  # lstrip("/") returns "" for bare "/"


# ──────────────────────────────────────────────
# cache_key
# ──────────────────────────────────────────────
class TestCacheKey:
    def test_format(self):
        key = cache_key("dQw4w9WgXcQ")
        assert key.startswith("kvibe:analysis:")

    def test_deterministic(self):
        assert cache_key("abc") == cache_key("abc")

    def test_different_ids_differ(self):
        assert cache_key("abc") != cache_key("xyz")

    def test_hash_length_16(self):
        key = cache_key("someVideoId")
        suffix = key.split(":")[-1]
        assert len(suffix) == 16


# ──────────────────────────────────────────────
# GET /health
# ──────────────────────────────────────────────
class TestHealth:
    def test_ok(self):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

    def test_service_name(self):
        res = client.get("/health")
        assert "k-vibe" in res.json()["service"]


# ──────────────────────────────────────────────
# POST /analyze
# ──────────────────────────────────────────────
class TestAnalyze:
    def test_valid_watch_url(self):
        res = client.post("/analyze", json={"youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
        assert res.status_code == 200
        data = res.json()
        assert data["video_id"] == "dQw4w9WgXcQ"
        assert "places" in data
        assert isinstance(data["places"], list)

    def test_valid_youtu_be(self):
        res = client.post("/analyze", json={"youtube_url": "https://youtu.be/short123"})
        assert res.status_code == 200
        assert res.json()["video_id"] == "short123"

    def test_invalid_url_400(self):
        res = client.post("/analyze", json={"youtube_url": "https://google.com"})
        assert res.status_code == 400
        assert res.json()["detail"] == "INVALID_YOUTUBE_URL"

    def test_empty_url_400(self):
        res = client.post("/analyze", json={"youtube_url": ""})
        assert res.status_code == 400

    def test_mock_response_structure(self):
        res = client.post("/analyze", json={"youtube_url": "https://www.youtube.com/watch?v=test1"})
        data = res.json()
        assert "video_id" in data
        assert "title" in data
        assert "places" in data
        assert "cached" in data

    def test_place_has_required_fields(self):
        res = client.post("/analyze", json={"youtube_url": "https://youtu.be/testplace"})
        place = res.json()["places"][0]
        assert "name" in place
        assert "confidence" in place

    def test_confidence_in_range(self):
        res = client.post("/analyze", json={"youtube_url": "https://youtu.be/conf1"})
        for place in res.json()["places"]:
            assert 0.0 <= place["confidence"] <= 1.0

    def test_shorts_url(self):
        res = client.post("/analyze", json={"youtube_url": "https://www.youtube.com/shorts/shortId123"})
        assert res.status_code == 200
        assert res.json()["video_id"] == "shortId123"


# ──────────────────────────────────────────────
# GeminiClient
# ──────────────────────────────────────────────
class TestGeminiClient:
    def test_no_api_key_returns_empty(self):
        from ai_services.gemini_client import GeminiClient
        gemini = GeminiClient(api_key="")
        assert gemini.complete("test prompt") == ""

    def test_is_available_false_without_key(self):
        from ai_services.gemini_client import GeminiClient
        gemini = GeminiClient(api_key="")
        assert gemini.is_available() is False

    def test_complete_with_mock_model(self):
        from ai_services.gemini_client import GeminiClient
        gemini = GeminiClient(api_key="")
        mock_model = MagicMock()
        mock_model.generate_content.return_value = MagicMock(text='[{"name":"테스트"}]')
        gemini._model = mock_model
        result = gemini.complete("test")
        assert result == '[{"name":"테스트"}]'


# ──────────────────────────────────────────────
# YoutubeClient
# ──────────────────────────────────────────────
class TestYoutubeClient:
    def test_extract_places_fallback_returns_list(self):
        from externelAPI_services.youtube import YoutubeClient
        yt = YoutubeClient()
        places = yt.extract_places("someVideoId")
        assert isinstance(places, list)
        assert len(places) > 0

    def test_extract_places_empty_video_id(self):
        from externelAPI_services.youtube import YoutubeClient
        yt = YoutubeClient()
        assert yt.extract_places("") == []

    def test_get_metadata_without_key_returns_empty(self):
        from externelAPI_services.youtube import YoutubeClient
        yt = YoutubeClient(api_key="")
        meta = yt.get_video_metadata("dQw4w9WgXcQ")
        assert meta["title"] == ""
        assert meta["description"] == ""

    def test_get_transcript_empty_video_id(self):
        from externelAPI_services.youtube import YoutubeClient
        yt = YoutubeClient()
        assert yt.get_transcript("") == ""


# ──────────────────────────────────────────────
# SpotExtractorService
# ──────────────────────────────────────────────
class TestSpotExtractorService:
    def _make_extractor(self, gemini_available: bool, gemini_response: str = ""):
        """Helper: build a SpotExtractorService with mocked dependencies."""
        from ai_services.spot_extractor import SpotExtractorService
        from ai_services.gemini_client import GeminiClient
        from externelAPI_services.youtube import YoutubeClient
        from externelAPI_services.kakaomap import KakaoMapClient

        gemini = GeminiClient(api_key="")
        if gemini_available:
            mock_model = MagicMock()
            mock_model.generate_content.return_value = MagicMock(text=gemini_response)
            gemini._model = mock_model

        youtube = YoutubeClient()
        kakao = KakaoMapClient(api_key="")  # no key → search_place returns None
        return SpotExtractorService(gemini, youtube, kakao)

    def test_fallback_when_gemini_unavailable(self):
        svc = self._make_extractor(gemini_available=False)
        places = svc.extract("someVideoId")
        assert isinstance(places, list)
        assert len(places) > 0

    def test_fallback_when_gemini_returns_empty(self):
        svc = self._make_extractor(gemini_available=True, gemini_response="")
        places = svc.extract("someVideoId")
        assert isinstance(places, list)

    def test_parse_valid_json_fenced(self):
        from ai_services.spot_extractor import SpotExtractorService
        from ai_services.gemini_client import GeminiClient
        from externelAPI_services.youtube import YoutubeClient
        from externelAPI_services.kakaomap import KakaoMapClient

        svc = SpotExtractorService(GeminiClient(), YoutubeClient(), KakaoMapClient(""))
        result = svc._parse_json('```json\n[{"name":"성수동","confidence":0.9}]\n```')
        assert result == [{"name": "성수동", "confidence": 0.9}]

    def test_parse_invalid_json_returns_empty(self):
        from ai_services.spot_extractor import SpotExtractorService
        from ai_services.gemini_client import GeminiClient
        from externelAPI_services.youtube import YoutubeClient
        from externelAPI_services.kakaomap import KakaoMapClient

        svc = SpotExtractorService(GeminiClient(), YoutubeClient(), KakaoMapClient(""))
        assert svc._parse_json("this is not json") == []

    def test_fallback_coords_match_known_keyword(self):
        from ai_services.spot_extractor import SpotExtractorService
        from ai_services.gemini_client import GeminiClient
        from externelAPI_services.youtube import YoutubeClient
        from externelAPI_services.kakaomap import KakaoMapClient

        svc = SpotExtractorService(GeminiClient(), YoutubeClient(), KakaoMapClient(""))
        coords = svc._fallback_coords("경복궁 북쪽")
        assert coords is not None
        assert coords["lat"] == pytest.approx(37.5796, abs=0.01)

    def test_gemini_places_geocoded_via_fallback(self):
        """When Kakao has no key, geocoding falls back to hardcoded coords."""
        gemini_json = (
            '```json\n'
            '[{"name":"경복궁","category":"landmark","confidence":0.95,"reason":"영상 언급"}]\n'
            '```'
        )
        svc = self._make_extractor(gemini_available=True, gemini_response=gemini_json)
        places = svc.extract("test123")
        assert len(places) == 1
        assert places[0]["name"] == "경복궁"
        assert places[0]["lat"] == pytest.approx(37.5796, abs=0.01)
        assert places[0]["confidence"] == pytest.approx(0.95)


# ──────────────────────────────────────────────
# KakaoMapClient
# ──────────────────────────────────────────────
class TestKakaoMapClient:
    def test_search_place_no_key_returns_none(self):
        from externelAPI_services.kakaomap import KakaoMapClient
        kakao = KakaoMapClient(api_key="")
        assert kakao.search_place("경복궁") is None

    def test_search_place_empty_name_returns_none(self):
        from externelAPI_services.kakaomap import KakaoMapClient
        kakao = KakaoMapClient(api_key="fake-key")
        assert kakao.search_place("") is None

    def test_estimate_duration_single_waypoint(self):
        from externelAPI_services.kakaomap import KakaoMapClient
        kakao = KakaoMapClient(api_key="")
        assert kakao.estimate_duration_minutes([{"lat": 37.5, "lng": 127.0}]) == 0

    def test_estimate_duration_two_waypoints(self):
        from externelAPI_services.kakaomap import KakaoMapClient
        kakao = KakaoMapClient(api_key="")
        assert kakao.estimate_duration_minutes([{}, {}]) == 20
