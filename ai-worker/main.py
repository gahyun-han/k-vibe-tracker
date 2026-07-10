from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from business_services.locationService import run_location_refresh
from business_services.queueScheduler import queue_scheduler
from business_services.youtube_helpers import cache_key, extract_video_id
from config.configure import get_settings
from config.logger import setup_logging, get_logger
from presentation_api.route import router

setup_logging()
logger = get_logger(__name__)

settings = get_settings()
app = FastAPI(title="K-Vibe AI Worker", version="2.0.0")

logger.info(f"Initializing K-Vibe AI Worker - Version {app.version}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(router)

logger.info(f"CORS configured for origins: {settings.allowed_origins}")


@app.on_event("startup")
def startup_event() -> None:
    logger.info("Starting K-Vibe AI Worker...")
    queue_scheduler.start()
    queue_scheduler.register_interval_job(
        job_id="location-refresh-7d",
        func=run_location_refresh,
        days=7,
    )
    logger.info("Scheduler started. Location refresh job registered (every 7 days)")


@app.on_event("shutdown")
def shutdown_event() -> None:
    logger.info("Shutting down K-Vibe AI Worker...")
    queue_scheduler.stop()
    logger.info("Scheduler stopped")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
