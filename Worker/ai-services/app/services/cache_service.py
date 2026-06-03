"""
Redis cache service for EdTech AI Services.
Provides async wrapper around Redis with JSON serialization.
"""

import json
import logging
from typing import Any, Optional

from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)


class CacheService:
    """
    Redis cache service.
    
    Handles caching with automatic JSON serialization/deserialization
    and error handling.
    """
    
    def __init__(self, redis_client: Redis):
        """
        Initialize cache service.
        
        Args:
            redis_client: Redis async client instance
        """
        self.redis = redis_client
        self.default_ttl = settings.cache_ttl
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Failed to deserialize cache value for key '{key}': {e}")
            return None
        except Exception as e:
            logger.error(f"Cache get error for key '{key}': {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (uses default if not provided)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            ttl = ttl or self.default_ttl
            serialized = json.dumps(value)
            await self.redis.setex(key, ttl, serialized)
            logger.debug(f"Cache set key '{key}' (ttl={ttl}s)")
            return True
        except TypeError as e:
            logger.error(f"Cannot serialize value for key '{key}': {e}")
            return False
        except Exception as e:
            logger.error(f"Cache set error for key '{key}': {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """
        Delete key from cache.
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            await self.redis.delete(key)
            logger.debug(f"Cache deleted key '{key}'")
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key '{key}': {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """
        Check if key exists in cache.
        
        Args:
            key: Cache key to check
            
        Returns:
            True if key exists, False otherwise
        """
        try:
            exists = await self.redis.exists(key) > 0
            logger.debug(f"Cache exists check for key '{key}': {exists}")
            return exists
        except Exception as e:
            logger.error(f"Cache exists error for key '{key}': {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """
        Clear all keys matching pattern.
        
        Args:
            pattern: Pattern to match (e.g., 'quiz:*', 'user:123:*')
            
        Returns:
            Number of keys deleted
        """
        try:
            keys = []
            async for key in self.redis.scan_iter(match=pattern):
                keys.append(key)
            
            if keys:
                count = await self.redis.delete(*keys)
                logger.info(f"Cache cleared {count} keys matching pattern '{pattern}'")
                return count
            
            logger.debug(f"No cache keys found for pattern '{pattern}'")
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error for pattern '{pattern}': {e}")
            return 0
    
    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """
        Increment numeric value in cache.
        
        Args:
            key: Cache key
            amount: Amount to increment (default 1)
            
        Returns:
            New value or None if error
        """
        try:
            result = await self.redis.incrby(key, amount)
            logger.debug(f"Cache incremented key '{key}' by {amount}, new value: {result}")
            return result
        except Exception as e:
            logger.error(f"Cache increment error for key '{key}': {e}")
            return None
    
    async def decrement(self, key: str, amount: int = 1) -> Optional[int]:
        """
        Decrement numeric value in cache.
        
        Args:
            key: Cache key
            amount: Amount to decrement (default 1)
            
        Returns:
            New value or None if error
        """
        try:
            result = await self.redis.decrby(key, amount)
            logger.debug(f"Cache decremented key '{key}' by {amount}, new value: {result}")
            return result
        except Exception as e:
            logger.error(f"Cache decrement error for key '{key}': {e}")
            return None
    
    async def ttl(self, key: str) -> Optional[int]:
        """
        Get time to live for key.
        
        Args:
            key: Cache key
            
        Returns:
            TTL in seconds, -1 if no expiry, -2 if not exists, None if error
        """
        try:
            ttl_seconds = await self.redis.ttl(key)
            logger.debug(f"Cache TTL for key '{key}': {ttl_seconds}s")
            return ttl_seconds
        except Exception as e:
            logger.error(f"Cache ttl error for key '{key}': {e}")
            return None
    
    async def expire(self, key: str, ttl: int) -> bool:
        """
        Set expiration on existing key.
        
        Args:
            key: Cache key
            ttl: Time to live in seconds
            
        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.redis.expire(key, ttl)
            if result:
                logger.debug(f"Cache expiration set for key '{key}' (ttl={ttl}s)")
            return bool(result)
        except Exception as e:
            logger.error(f"Cache expire error for key '{key}': {e}")
            return False
    
    async def persist(self, key: str) -> bool:
        """
        Remove expiration from key.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.redis.persist(key)
            if result:
                logger.debug(f"Cache expiration removed for key '{key}'")
            return bool(result)
        except Exception as e:
            logger.error(f"Cache persist error for key '{key}': {e}")
            return False
    
    async def mget(self, *keys: str) -> dict[str, Optional[Any]]:
        """
        Get multiple values from cache.
        
        Args:
            *keys: Cache keys to retrieve
            
        Returns:
            Dictionary mapping keys to values (None if not found)
        """
        try:
            values = await self.redis.mget(keys)
            result = {}
            
            for key, value in zip(keys, values):
                if value:
                    try:
                        result[key] = json.loads(value)
                    except json.JSONDecodeError:
                        logger.warning(f"Failed to deserialize value for key '{key}'")
                        result[key] = None
                else:
                    result[key] = None
            
            logger.debug(f"Cache mget retrieved {len([v for v in result.values() if v is not None])}/{len(keys)} values")
            return result
        except Exception as e:
            logger.error(f"Cache mget error: {e}")
            return {key: None for key in keys}
    
    async def mset(self, data: dict[str, Any], ttl: Optional[int] = None) -> bool:
        """
        Set multiple values in cache.
        
        Args:
            data: Dictionary of key-value pairs
            ttl: Time to live in seconds (uses default if not provided)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            ttl = ttl or self.default_ttl
            pipeline = self.redis.pipeline()
            
            for key, value in data.items():
                serialized = json.dumps(value)
                pipeline.setex(key, ttl, serialized)
            
            await pipeline.execute()
            logger.debug(f"Cache mset set {len(data)} keys (ttl={ttl}s)")
            return True
        except Exception as e:
            logger.error(f"Cache mset error: {e}")
            return False
    
    async def get_or_set(
        self,
        key: str,
        callback,
        ttl: Optional[int] = None
    ) -> Optional[Any]:
        """
        Get value from cache or compute and cache it.
        
        Args:
            key: Cache key
            callback: Async function to compute value if not cached
            ttl: Time to live in seconds
            
        Returns:
            Cached or computed value
        """
        try:
            # Try to get from cache
            cached = await self.get(key)
            if cached is not None:
                logger.debug(f"Cache hit for key '{key}'")
                return cached
            
            # Compute value
            logger.debug(f"Cache miss for key '{key}', computing value")
            value = await callback()
            
            # Cache it
            await self.set(key, value, ttl)
            return value
        except Exception as e:
            logger.error(f"Cache get_or_set error for key '{key}': {e}")
            # Fall back to callback
            try:
                return await callback()
            except Exception as e2:
                logger.error(f"Callback execution failed for key '{key}': {e2}")
                return None
