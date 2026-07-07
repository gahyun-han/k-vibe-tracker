from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from business_services.locationService import run_location_refresh
from business_services.queueScheduler import queue_scheduler
from business_services.youtube_helpers import cache_key, extract_video_id
from config.configure import get_settings
from presentation_api.route import router

settings = get_settings()
app = FastAPI(title="K-Vibe AI Worker", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
def startup_event() -> None:
    queue_scheduler.start()
    queue_scheduler.register_interval_job(
        job_id="location-refresh-7d",
        func=run_location_refresh,
        days=7,
    )


@app.on_event("shutdown")
def shutdown_event() -> None:
    queue_scheduler.stop()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
