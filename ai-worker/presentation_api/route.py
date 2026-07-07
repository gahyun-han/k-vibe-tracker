from collections import defaultdict, deque
from time import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from business_services.createDocentVoice import create_docent_voice
from business_services.findAmenities import find_amenities
from business_services.playDocentVoice import play_docent_voice
from business_services.queueScheduler import queue_scheduler
from business_services.routingService import estimate_route_duration
from business_services.showPersona import show_persona_route
from business_services.youtube_helpers import cache_key, extract_video_id
from config.configure import get_settings
from dependency import route_repository, youtube_client

router = APIRouter()
settings = get_settings()
_rate_limiter: dict[str, deque[float]] = defaultdict(deque)


class AnalyzeRequest(BaseModel):
    youtube_url: str
    user_id: str = "anonymous"


class RouteRequest(BaseModel):
    user_id: str
    route: dict
    edited: bool = False


class AmenitiesRequest(BaseModel):
    keyword: str


class PersonaRequest(BaseModel):
    user_id: str


class DocentPlayRequest(BaseModel):
    place_id: str
    language: str = "en"


class DocentCreateRequest(BaseModel):
    place_id: str
    place_name: str
    languages: list[str] = ["ko", "en", "ja", "zh"]


def _check_rate_limit(user_id: str) -> None:
    now = time()
    history = _rate_limiter[user_id]
    while history and now - history[0] > 60:
        history.popleft()

    if len(history) >= settings.api_limit_per_minute:
        raise HTTPException(status_code=429, detail="RATE_LIMIT_EXCEEDED")

    history.append(now)


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "k-vibe-ai-worker"}


@router.post("/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    _check_rate_limit(req.user_id)
    video_id = extract_video_id(req.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="INVALID_YOUTUBE_URL")

    return {
        "video_id": video_id,
        "title": "[API 키 연동 전 목 데이터]",
        "places": youtube_client.extract_places(video_id),
        "cached": False,
        "cache_key": cache_key(video_id),
    }


@router.post("/route")
def upsert_route(req: RouteRequest) -> dict:
    existing = route_repository.select(req.user_id)
    if existing and req.edited:
        route = route_repository.update(req.user_id, req.route)
    elif existing:
        route = existing
    else:
        route = route_repository.insert(req.user_id, req.route)

    duration = estimate_route_duration(route.get("waypoints", []))
    return {"route": route, "duration": duration}


@router.post("/amenities")
def amenities(req: AmenitiesRequest) -> dict:
    return {"items": find_amenities(req.keyword)}


@router.post("/persona")
def persona(req: PersonaRequest) -> dict:
    return show_persona_route(req.user_id)


@router.post("/docent/play")
def docent_play(req: DocentPlayRequest) -> dict:
    return play_docent_voice(req.place_id, req.language)


@router.post("/docent/create")
def docent_create(req: DocentCreateRequest) -> dict:
    return create_docent_voice(req.place_id, req.place_name, req.languages)


@router.post("/queue/location-refresh")
def queue_location_refresh() -> dict:
    job_id = f"location-refresh-{int(time())}"
    from business_services.locationService import run_location_refresh

    queue_scheduler.enqueue(job_id, run_location_refresh)
    return {"job_id": job_id, "status": "queued"}


@router.get("/queue/{job_id}")
def queue_status(job_id: str) -> dict:
    return {"job_id": job_id, "status": queue_scheduler.status(job_id)}
