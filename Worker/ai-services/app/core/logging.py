"""
Logging configuration for EdTech AI Services.
Sets up structured JSON logging with proper levels and handlers.
"""

import logging
import sys
from pythonjsonlogger import jsonlogger
from app.config import settings


def setup_logging():
    """
    Configure application-wide logging.
    
    Returns structured JSON logs to stdout in production,
    readable format in development.
    """
    # Get root logger
    logger = logging.getLogger()
    logger.setLevel(settings.log_level.upper())
    
    # Remove any existing handlers
    logger.handlers = []
    
    # Create console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(settings.log_level.upper())
    
    # Configure formatter based on environment
    if settings.debug:
        # Development: readable format
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    else:
        # Production: JSON format for log aggregation
        formatter = jsonlogger.JsonFormatter(
            fmt="%(asctime)s %(name)s %(levelname)s %(message)s",
            timestamp=True,
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(settings.log_level.upper())
    logging.getLogger("sqlalchemy").setLevel(settings.log_level.upper())
    logging.getLogger("celery").setLevel(settings.log_level.upper())
    
    return logger


# Initialize logger on module import
logger = setup_logging()

