"""Custom exception and error handling utilities."""

from fastapi import HTTPException, status
from config.logger import get_logger

logger = get_logger(__name__)


class K_VibeException(Exception):
    """Base exception for K-Vibe AI Worker."""
    
    def __init__(self, message: str, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class ExternalAPIException(K_VibeException):
    """Exception raised when external API calls fail."""
    
    def __init__(self, service: str, message: str):
        super().__init__(f"External API Error ({service}): {message}", "EXTERNAL_API_ERROR")
        self.service = service
        logger.error(f"External API failure in {service}: {message}")


class DataRepositoryException(K_VibeException):
    """Exception raised when data repository operations fail."""
    
    def __init__(self, operation: str, message: str):
        super().__init__(f"Data Repository Error ({operation}): {message}", "REPOSITORY_ERROR")
        self.operation = operation
        logger.error(f"Repository error during {operation}: {message}")


class SchedulerException(K_VibeException):
    """Exception raised when scheduler operations fail."""
    
    def __init__(self, job_id: str, message: str):
        super().__init__(f"Scheduler Error (Job: {job_id}): {message}", "SCHEDULER_ERROR")
        self.job_id = job_id
        logger.error(f"Scheduler error for job {job_id}: {message}")


def create_error_response(exception: K_VibeException, status_code: int = 500) -> dict:
    """Convert exception to HTTP error response."""
    return {
        "error": True,
        "code": exception.error_code,
        "message": exception.message,
    }


def handle_api_exception(exc: K_VibeException) -> HTTPException:
    """Convert K-Vibe exception to HTTPException."""
    logger.error(f"API Error [{exc.error_code}]: {exc.message}")
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=create_error_response(exc)
    )
