import logging
import logging.config
import json
from pathlib import Path
from pythonjsonlogger import jsonlogger

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)


def setup_logging(log_level: str = "INFO") -> None:
    """Setup centralized logging configuration with JSON output."""
    
    logging.config.dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": jsonlogger.JsonFormatter,
                "format": "%(timestamp)s %(level)s %(name)s %(message)s",
            },
            "standard": {
                "format": "[%(asctime)s] %(levelname)s [%(name)s] %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "standard",
                "stream": "ext://sys.stdout",
            },
            "file": {
                "class": "logging.FileHandler",
                "formatter": "json",
                "filename": LOG_DIR / "k-vibe-ai-worker.log",
                "mode": "a",
            },
        },
        "root": {
            "level": log_level,
            "handlers": ["console", "file"],
        },
    })


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(name)
