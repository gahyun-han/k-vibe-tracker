from typing import Callable
from apscheduler.schedulers.background import BackgroundScheduler


class QueueScheduler:
    def __init__(self) -> None:
        self._scheduler = BackgroundScheduler()
        self._jobs: dict[str, str] = {}

    def start(self) -> None:
        if not self._scheduler.running:
            self._scheduler.start()

    def stop(self) -> None:
        if self._scheduler.running:
            self._scheduler.shutdown(wait=False)

    def enqueue(self, job_id: str, func: Callable[[], None]) -> None:
        self._jobs[job_id] = "queued"
        self._scheduler.add_job(self._run_job, args=[job_id, func], id=job_id, replace_existing=True)

    def register_interval_job(self, job_id: str, func: Callable[[], None], days: int) -> None:
        self._scheduler.add_job(func, trigger="interval", days=days, id=job_id, replace_existing=True)
        self._jobs[job_id] = "scheduled"

    def _run_job(self, job_id: str, func: Callable[[], None]) -> None:
        self._jobs[job_id] = "running"
        func()
        self._jobs[job_id] = "done"

    def status(self, job_id: str) -> str:
        return self._jobs.get(job_id, "unknown")


queue_scheduler = QueueScheduler()
