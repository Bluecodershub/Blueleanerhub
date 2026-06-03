"""
Database connections for EdTech AI Services.
Handles PostgreSQL, MongoDB, and Redis connections with proper pooling and lifecycle management.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import redis.asyncio as redis
from typing import AsyncGenerator, Generator
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# ============================================================================
# PostgreSQL Configuration
# ============================================================================

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=10,  # Number of persistent connections
    max_overflow=20,  # Additional connections allowed
    pool_pre_ping=True,  # Test connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=settings.debug,  # Log SQL statements in debug mode
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

# Declarative base for ORM models
Base = declarative_base()


# Event listener for connection pool
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Set session timezone and other connection settings."""
    if hasattr(dbapi_conn, "set_isolation_level"):
        pass  # Can add isolation level settings here


@event.listens_for(engine, "checkin")
def receive_pool_checkin(dbapi_conn, connection_record):
    """Called when a connection is returned to the pool."""
    pass


@event.listens_for(engine, "checkout")
def receive_pool_checkout(dbapi_conn, connection_record, connection_proxy):
    """Called when a connection is checked out from the pool."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI.
    Use with FastAPI depends() for automatic session management.
    
    Example:
        @app.get("/items")
        async def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


async def init_db():
    """Initialize database (create tables)."""
    logger.info("Initializing database...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")


async def close_db():
    """Close database connections."""
    logger.info("Closing database connections...")
    engine.dispose()
    logger.info("Database connections closed")


# ============================================================================
# Redis Configuration
# ============================================================================

# Redis client for async operations
redis_client: redis.Redis = None


async def init_redis():
    """Initialize Redis connection."""
    global redis_client
    try:
        logger.info("Initializing Redis connection...")
        redis_client = await redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_keepalive=True,
            health_check_interval=30,
        )
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection established successfully")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        raise


async def close_redis():
    """Close Redis connection."""
    global redis_client
    if redis_client:
        logger.info("Closing Redis connection...")
        await redis_client.close()
        redis_client = None
        logger.info("Redis connection closed")


async def get_redis() -> redis.Redis:
    """
    Redis client dependency for FastAPI.
    Use with FastAPI depends() for automatic client injection.
    
    Example:
        @app.get("/cache")
        async def get_cached(cache: redis.Redis = Depends(get_redis)):
            value = await cache.get("key")
            return {"value": value}
    """
    if redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return redis_client


# ============================================================================
# Cache Utilities
# ============================================================================

async def set_cache(key: str, value: str, ttl: int = None) -> bool:
    """
    Set a value in Redis cache.
    
    Args:
        key: Cache key
        value: Value to cache (should be JSON-serializable)
        ttl: Time to live in seconds (None = use default from settings)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        ttl = ttl or settings.cache_ttl
        await redis_client.setex(key, ttl, value)
        logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
        return True
    except Exception as e:
        logger.error(f"Failed to set cache for {key}: {e}")
        return False


async def get_cache(key: str) -> str:
    """
    Get a value from Redis cache.
    
    Args:
        key: Cache key
    
    Returns:
        Cached value or None if not found
    """
    try:
        value = await redis_client.get(key)
        logger.debug(f"Cache {'hit' if value else 'miss'}: {key}")
        return value
    except Exception as e:
        logger.error(f"Failed to get cache for {key}: {e}")
        return None


async def delete_cache(key: str) -> bool:
    """
    Delete a value from Redis cache.
    
    Args:
        key: Cache key
    
    Returns:
        True if successful, False otherwise
    """
    try:
        await redis_client.delete(key)
        logger.debug(f"Cache deleted: {key}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete cache for {key}: {e}")
        return False


async def clear_cache_pattern(pattern: str) -> int:
    """
    Clear all cache keys matching a pattern.
    
    Args:
        pattern: Pattern to match (e.g., "user:*", "quiz:*")
    
    Returns:
        Number of keys deleted
    """
    try:
        keys = await redis_client.keys(pattern)
        if keys:
            count = await redis_client.delete(*keys)
            logger.debug(f"Cleared {count} cache keys matching pattern: {pattern}")
            return count
        return 0
    except Exception as e:
        logger.error(f"Failed to clear cache pattern {pattern}: {e}")
        return 0


# ============================================================================
# Database Health Checks
# ============================================================================

def test_db_connection() -> bool:
    """
    Test PostgreSQL connection.
    
    Returns:
        True if connection successful, False otherwise
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        logger.info("PostgreSQL connection test: OK")
        return True
    except Exception as e:
        logger.error(f"PostgreSQL connection test failed: {e}")
        return False


async def test_redis_connection() -> bool:
    """
    Test Redis connection.
    
    Returns:
        True if connection successful, False otherwise
    """
    try:
        if redis_client:
            pong = await redis_client.ping()
            logger.info("Redis connection test: OK")
            return True
        logger.error("Redis client not initialized")
        return False
    except Exception as e:
        logger.error(f"Redis connection test failed: {e}")
        return False


# ============================================================================
# Startup and Shutdown Events
# ============================================================================

async def startup_events():
    """Called on application startup."""
    logger.info("Running startup events...")
    
    # Test database
    if test_db_connection():
        await init_db()
    else:
        raise RuntimeError("Failed to connect to PostgreSQL")
    
    # Initialize Redis
    await init_redis()
    
    logger.info("Startup events completed successfully")


async def shutdown_events():
    """Called on application shutdown."""
    logger.info("Running shutdown events...")
    
    await close_redis()
    await close_db()
    
    logger.info("Shutdown events completed successfully")
