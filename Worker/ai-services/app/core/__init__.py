"""
Core module for EdTech AI Services.
Contains shared utilities, configuration, and base classes.
"""

from app.core.config import Settings, get_settings, settings
from app.core.logging import setup_logging
from app.core.database import (
    Base,
    SessionLocal,
    get_db,
    get_redis,
    init_db,
    close_db,
    init_redis,
    close_redis,
    set_cache,
    get_cache,
    delete_cache,
    clear_cache_pattern,
    test_db_connection,
    test_redis_connection,
    startup_events,
    shutdown_events,
)
from app.services import CacheService

__all__ = [
    # Config
    "Settings",
    "get_settings",
    "settings",
    # Logging
    "setup_logging",
    # Database
    "Base",
    "SessionLocal",
    "get_db",
    "get_redis",
    "init_db",
    "close_db",
    "init_redis",
    "close_redis",
    # Cache
    "set_cache",
    "get_cache",
    "delete_cache",
    "clear_cache_pattern",
    # Services
    "CacheService",
    # Health checks
    "test_db_connection",
    "test_redis_connection",
    # Lifecycle
    "startup_events",
    "shutdown_events",
]
