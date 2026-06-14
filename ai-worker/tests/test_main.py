import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from main import app, extract_video_id, cache_key

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
