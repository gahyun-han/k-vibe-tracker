"""
K-Vibe AI Worker — FastAPI
배포: Render.com Free Tier (https://render.com)

환경변수 (Render 대시보드에 설정):
  OPENAI_API_KEY      — OpenAI API 키
  YOUTUBE_API_KEY     — YouTube Data API v3 키
  TOUR_API_KEY        — 한국관광공사 TourAPI 키
  UPSTASH_REDIS_URL   — Upstash Redis REST URL
  UPSTASH_REDIS_TOKEN — Upstash Redis REST 토큰
  ALLOWED_ORIGINS     — Next.js 앱 URL (CORS)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import os, hashlib, json

app = FastAPI(title="K-Vibe AI Worker", version="1.0.0")

# ─── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─── 요청/응답 스키마 ───────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    youtube_url: str

class PlaceResult(BaseModel):
    name: str
    lat: float | None = None
    lng: float | None = None
    content_id: str | None = None
    confidence: float = 0.0

class AnalyzeResponse(BaseModel):
    video_id: str
    title: str
    places: list[PlaceResult]
    cached: bool = False


# ─── 유틸 ──────────────────────────────────────────────────────────────────────
def extract_video_id(url: str) -> str | None:
    """YouTube URL에서 videoId 추출"""
    from urllib.parse import urlparse, parse_qs
    try:
        u = urlparse(url)
        if u.hostname == "youtu.be":
            return u.path.lstrip("/")
        if "youtube.com" in (u.hostname or ""):
            qs = parse_qs(u.query)
            if "v" in qs:
                return qs["v"][0]
            parts = u.path.split("/")
            for keyword in ("shorts", "embed"):
                if keyword in parts:
                    idx = parts.index(keyword)
                    if idx + 1 < len(parts):
                        return parts[idx + 1]
    except Exception:
        pass
    return None


def cache_key(video_id: str) -> str:
    return f"kvibe:analysis:{hashlib.sha256(video_id.encode()).hexdigest()[:16]}"


# ─── 엔드포인트 ────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "k-vibe-ai-worker"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    video_id = extract_video_id(req.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="INVALID_YOUTUBE_URL")

    # TODO: Redis 캐시 조회 (Upstash 연동 시 활성화)
    # cached = await redis.get(cache_key(video_id))
    # if cached:
    #     return AnalyzeResponse(**json.loads(cached), cached=True)

    # TODO: YouTube Data API로 영상 메타데이터 취득 (API 키 연동 시 활성화)
    # snippet = await youtube_videos_list(video_id)

    # TODO: OpenAI gpt-4o-mini로 장소명 추출 (API 키 연동 시 활성화)
    # places_raw = await openai_extract_places(snippet["title"] + " " + snippet["description"])

    # TODO: TourAPI searchKeyword로 좌표 매핑 (API 키 연동 시 활성화)

    # ── 개발용 목 응답 ──────────────────────────────────────────────────────────
    mock_response = AnalyzeResponse(
        video_id=video_id,
        title="[API 키 연동 전 목 데이터]",
        places=[
            PlaceResult(name="성수동 카페거리", lat=37.5447, lng=127.0564, confidence=0.92),
            PlaceResult(name="경복궁", lat=37.5796, lng=126.977, confidence=0.87),
        ],
        cached=False,
    )
    return mock_response


# ─── 로컬 실행 ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
