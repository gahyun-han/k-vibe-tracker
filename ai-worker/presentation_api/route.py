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
from config.logger import get_logger
from config.exceptions import K_VibeException, handle_api_exception
from dependency import route_repository, youtube_client

logger = get_logger(__name__)
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
    logger.debug("Health check requested")
    return {"status": "ok", "service": "k-vibe-ai-worker"}


@router.post("/analyze")
def analyze(req: AnalyzeRequest) -> dict:
    try:
        logger.info(f"Analyzing YouTube URL for user {req.user_id}")
        _check_rate_limit(req.user_id)
        video_id = extract_video_id(req.youtube_url)
        if not video_id:
            logger.warning(f"Invalid YouTube URL: {req.youtube_url}")
            raise HTTPException(status_code=400, detail="INVALID_YOUTUBE_URL")

        result = {
            "video_id": video_id,
            "title": "[API 키 연동 전 목 데이터]",
            "places": youtube_client.extract_places(video_id),
            "cached": False,
            "cache_key": cache_key(video_id),
        }
        logger.info(f"Analysis completed for video {video_id}")
        return result
    except HTTPException:
        raise
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /analyze: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /analyze: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.post("/route")
def upsert_route(req: RouteRequest) -> dict:
    try:
        logger.info(f"Upserting route for user {req.user_id}")
        existing = route_repository.select(req.user_id)
        if existing and req.edited:
            route = route_repository.update(req.user_id, req.route)
            logger.info(f"Route updated for user {req.user_id}")
        elif existing:
            route = existing
            logger.debug(f"Using existing route for user {req.user_id}")
        else:
            route = route_repository.insert(req.user_id, req.route)
            logger.info(f"New route created for user {req.user_id}")

        duration = estimate_route_duration(route.get("waypoints", []))
        return {"route": route, "duration": duration}
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /route: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /route: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.post("/amenities")
def amenities(req: AmenitiesRequest) -> dict:
    try:
        logger.info(f"Finding amenities for keyword: {req.keyword}")
        return {"items": find_amenities(req.keyword)}
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /amenities: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /amenities: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.post("/persona")
def persona(req: PersonaRequest) -> dict:
    try:
        logger.info(f"Getting persona for user {req.user_id}")
        return show_persona_route(req.user_id)
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /persona: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /persona: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.post("/docent/play")
def docent_play(req: DocentPlayRequest) -> dict:
    try:
        logger.info(f"Playing docent voice for place {req.place_id} in {req.language}")
        return play_docent_voice(req.place_id, req.language)
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /docent/play: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /docent/play: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.post("/docent/create")
def docent_create(req: DocentCreateRequest) -> dict:
    try:
        logger.info(f"Creating docent voice for {req.place_name} in {req.languages}")
        return create_docent_voice(req.place_id, req.place_name, req.languages)
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /docent/create: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /docent/create: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.post("/queue/location-refresh")
def queue_location_refresh() -> dict:
    try:
        logger.info("Queueing location refresh job")
        job_id = f"location-refresh-{int(time())}"
        from business_services.locationService import run_location_refresh

        queue_scheduler.enqueue(job_id, run_location_refresh)
        logger.info(f"Job {job_id} queued successfully")
        return {"job_id": job_id, "status": "queued"}
    except K_VibeException as e:
        logger.error(f"K-Vibe error in /queue/location-refresh: {e.message}")
        raise handle_api_exception(e)
    except Exception as e:
        logger.error(f"Unexpected error in /queue/location-refresh: {str(e)}")
        raise HTTPException(status_code=500, detail="INTERNAL_SERVER_ERROR")


@router.get("/queue/{job_id}")
def queue_status(job_id: str) -> dict:
    logger.debug(f"Querying status for job {job_id}")
    return {"job_id": job_id, "status": queue_scheduler.status(job_id)}
