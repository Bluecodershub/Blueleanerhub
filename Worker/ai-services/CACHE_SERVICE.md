# CacheService Guide

Complete guide to using the RedisCache Service in EdTech AI Services.

## Overview

CacheService provides a robust, production-ready abstraction over Redis with:
- Automatic JSON serialization/deserialization
- Comprehensive error handling with logging
- Type support for any JSON-serializable Python object
- Pattern-based operations for bulk cache management
- Counter operations for metrics and leaderboards
- Cache-aside and other common patterns built-in

## Quick Start

### Basic Usage

```python
from fastapi import Depends
from app.core import CacheService
from app.main import get_cache_service

@app.get("/api/quiz/{quiz_id}")
async def get_quiz(
    quiz_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    # Try cache
    cached = await cache.get(f"quiz:{quiz_id}")
    if cached:
        return cached
    
    # Get from database
    quiz = await db.get_quiz(quiz_id)
    
    # Store in cache (1 hour)
    await cache.set(f"quiz:{quiz_id}", quiz, ttl=3600)
    
    return quiz
```

### Import

```python
from app.core import CacheService
from app.main import get_cache_service

# In FastAPI endpoints
async def my_endpoint(cache: CacheService = Depends(get_cache_service)):
    value = await cache.get("key")
```

## API Reference

### Basic Operations

#### `get(key: str) -> Optional[Any]`

Get value from cache.

```python
value = await cache.get("quiz:123")
# Returns deserialized value or None
```

#### `set(key: str, value: Any, ttl: Optional[int] = None) -> bool`

Set value in cache with optional TTL.

```python
# Use default TTL (from settings.cache_ttl)
await cache.set("quiz:123", {"title": "Quiz 1"})

# Custom TTL (in seconds)
await cache.set("session:abc", {"user_id": 1}, ttl=1800)  # 30 minutes
```

#### `delete(key: str) -> bool`

Delete key from cache.

```python
await cache.delete("quiz:123")
```

#### `exists(key: str) -> bool`

Check if key exists in cache.

```python
if await cache.exists("quiz:123"):
    print("Key exists")
```

### Pattern Operations

#### `clear_pattern(pattern: str) -> int`

Clear all keys matching a pattern.

```python
# Clear all quiz cache
count = await cache.clear_pattern("quiz:*")
print(f"Cleared {count} keys")

# Clear user-specific cache
count = await cache.clear_pattern("user:123:*")

# Clear nested patterns
count = await cache.clear_pattern("quiz:42:question:*")
```

### Numeric Operations

#### `increment(key: str, amount: int = 1) -> Optional[int]`

Increment numeric value.

```python
# Increment score
new_score = await cache.increment("user:123:score", 10)

# Increment counter
attempts = await cache.increment("quiz:42:attempts")  # Default +1
```

#### `decrement(key: str, amount: int = 1) -> Optional[int]`

Decrement numeric value.

```python
# Decrement active users
active = await cache.decrement("stats:active_users")
```

### Expiration Management

#### `ttl(key: str) -> Optional[int]`

Get time to live for key in seconds.

```python
ttl = await cache.ttl("quiz:123")
if ttl == -1:
    print("Key has no expiration")
elif ttl == -2:
    print("Key doesn't exist")
elif ttl > 0:
    print(f"Key expires in {ttl} seconds")
```

#### `expire(key: str, ttl: int) -> bool`

Set expiration on existing key.

```python
# Set 1-hour expiration
await cache.expire("session:abc", 3600)
```

#### `persist(key: str) -> bool`

Remove expiration from key (make it permanent).

```python
# Remove expiration
await cache.persist("important:data")
```

### Bulk Operations

#### `mget(*keys: str) -> dict[str, Optional[Any]]`

Get multiple keys at once.

```python
results = await cache.mget("user:1", "user:2", "user:3")
# Returns: {"user:1": {...}, "user:2": {...}, "user:3": None}

# Filter results
found = {k: v for k, v in results.items() if v is not None}
```

#### `mset(data: dict[str, Any], ttl: Optional[int] = None) -> bool`

Set multiple keys at once.

```python
# Batch set
data = {
    "user:1": {"name": "Alice", "score": 100},
    "user:2": {"name": "Bob", "score": 85},
    "user:3": {"name": "Charlie", "score": 92},
}

await cache.mset(data, ttl=3600)
```

### Advanced Operations

#### `get_or_set(key: str, callback, ttl: Optional[int] = None) -> Optional[Any]`

Get from cache or compute value if not cached.

```python
# Define computation function
async def fetch_quiz():
    return await db.get_quiz(123)

# Get or compute
quiz = await cache.get_or_set(
    "quiz:123",
    fetch_quiz,
    ttl=3600
)
```

## Common Patterns

### Pattern 1: Cache-Aside

Load data from cache, fall back to database if not found.

```python
@app.get("/api/quiz/{quiz_id}")
async def get_quiz(
    quiz_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    key = f"quiz:{quiz_id}"
    
    # Try cache
    cached = await cache.get(key)
    if cached:
        return cached
    
    # Fall back to database
    quiz = await db.get_quiz(quiz_id)
    
    # Update cache
    await cache.set(key, quiz, ttl=3600)
    
    return quiz
```

### Pattern 2: Cache-Get-Or-Set

Simpler syntax for cache-aside pattern.

```python
@app.get("/api/quiz/{quiz_id}")
async def get_quiz(
    quiz_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    quiz = await cache.get_or_set(
        f"quiz:{quiz_id}",
        lambda: db.get_quiz(quiz_id),
        ttl=3600
    )
    return quiz
```

### Pattern 3: Write-Through Cache

Update cache when writing to database.

```python
@app.put("/api/quiz/{quiz_id}")
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizData,
    cache: CacheService = Depends(get_cache_service)
):
    # Write to database
    updated = await db.update_quiz(quiz_id, quiz_data)
    
    # Update cache
    key = f"quiz:{quiz_id}"
    await cache.set(key, updated, ttl=3600)
    
    return updated
```

### Pattern 4: Cache Invalidation

Clear cache when data changes.

```python
@app.delete("/api/quiz/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    # Delete from database
    await db.delete_quiz(quiz_id)
    
    # Clear all related cache
    await cache.clear_pattern(f"quiz:{quiz_id}:*")
    
    # Clear parent cache if needed
    await cache.delete(f"quiz:{quiz_id}")
    
    return {"status": "deleted"}
```

### Pattern 5: Leaderboards & Rankings

Use Redis sorted sets or counters for leaderboards.

```python
@app.post("/api/quiz/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    cache: CacheService = Depends(get_cache_service)
):
    # Save to database
    result = await db.save_submission(submission)
    
    # Update user score cache
    user_key = f"user:{submission.user_id}:score:total"
    await cache.increment(user_key, int(result.score))
    
    # Cache result
    result_key = f"quiz:result:{quiz_id}:user:{submission.user_id}"
    await cache.set(result_key, result, ttl=86400)  # 24 hours
    
    # Invalidate quiz cache
    await cache.clear_pattern(f"quiz:{quiz_id}:*")
    
    return result
```

### Pattern 6: Session Management

Cache user sessions with expiration.

```python
@app.post("/api/auth/login")
async def login(
    credentials: LoginData,
    cache: CacheService = Depends(get_cache_service)
):
    # Authenticate user
    user = await db.authenticate(credentials)
    
    # Create session
    session_id = generate_session_id()
    session_key = f"session:{session_id}"
    
    await cache.set(
        session_key,
        {
            "user_id": user.id,
            "email": user.email,
            "logged_in_at": datetime.now().isoformat()
        },
        ttl=86400  # 24-hour session
    )
    
    return {"session_id": session_id, "user": user}


@app.get("/api/auth/me")
async def get_current_user(
    session_id: str,
    cache: CacheService = Depends(get_cache_service)
):
    # Get session from cache
    session = await cache.get(f"session:{session_id}")
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return session
```

## Configuration

Cache service uses settings from `app/config.py`:

```python
# Default cache TTL (seconds)
cache_ttl = 3600  # 1 hour

# Redis connection
redis_url = "redis://localhost:6379"
```

Override TTL:

```python
# Use custom TTL
await cache.set("short_lived", data, ttl=60)  # 1 minute

# Long-lived cache
await cache.set("permanent", data, ttl=604800)  # 1 week

# No expiration (not recommended in production)
await cache.set("no_expiry", data, ttl=-1)
```

## Best Practices

### 1. Use Meaningful Key Names

Use hierarchical keys with colons as separators:

```python
# Good
"quiz:123:questions"
"user:456:sessions"
"department:789:stats"

# Avoid
"q123"  # Too ambiguous
"user456"  # Hard to match patterns
```

### 2. Set Appropriate TTL

```python
# Short-lived: API responses, frequently changing data
await cache.set("api:response:key", data, ttl=300)  # 5 minutes

# Medium-lived: User data, quiz questions
await cache.set("quiz:123", data, ttl=3600)  # 1 hour

# Long-lived: Static content, configuration
await cache.set("config:feature_flags", data, ttl=86400)  # 1 day
```

### 3. Handle Cache Misses Gracefully

```python
value = await cache.get("some_key")

if value is None:
    # Cache miss - fetch from source
    value = await expensive_operation()
    # Cache for next time
    await cache.set("some_key", value)

return value
```

### 4. Log Cache Operations

Service automatically logs all operations. Monitor logs for:
- Cache misses
- Serialization errors
- Expiration updates

### 5. Use Patterns for Related Data

```python
# Clear all cache for a specific quiz
await cache.clear_pattern(f"quiz:123:*")

# Get all user data
results = await cache.mget(*[f"user:{uid}" for uid in user_ids])
```

### 6. Avoid Caching Sensitive Data

```python
# ❌ Don't cache
await cache.set("password:hash", user.password_hash)

# ✅ Do cache non-sensitive data
await cache.set("user:profile", {
    "name": user.name,
    "email": user.email,
    "avatar": user.avatar_url
})
```

### 7. Cache Invalidation Strategy

Plan how to invalidate cache when data changes:

```python
# Delete specific key
await cache.delete(f"quiz:{quiz_id}")

# Clear related keys
await cache.clear_pattern(f"quiz:{quiz_id}:*")

# Clear by pattern
await cache.clear_pattern(f"user:{user_id}:*")
```

### 8. Monitor Cache Performance

```python
# Check if cache is working
ttl = await cache.ttl("quiz:123")
exists = await cache.exists("quiz:123")

# Monitor hit rate in your metrics
if await cache.exists(key):
    # Cache hit
    metrics.increment("cache.hits")
else:
    # Cache miss
    metrics.increment("cache.misses")
```

## Error Handling

CacheService handles errors gracefully and logs them:

```python
# All methods handle exceptions internally
value = await cache.get("key")  # Returns None on error
success = await cache.set("key", value)  # Returns False on error
count = await cache.clear_pattern("*")  # Returns 0 on error

# Logs are available in your logging system
# Check app logs for "Cache *error" messages
```

## Performance Considerations

### 1. Batch Operations

Use `mget` and `mset` for multiple keys:

```python
# Less efficient
for key in keys:
    value = await cache.get(key)

# Better
values = await cache.mget(*keys)
```

### 2. Pipeline Operations

For many operations, consider using Redis pipelines directly:

```python
# For very high volume operations
pipeline = cache.redis.pipeline()
for key, value in data.items():
    pipeline.set(key, value)
await pipeline.execute()
```

### 3. TTL Strategy

Choose TTL based on data freshness requirements:

```python
# Quiz questions: stable, can cache longer
await cache.set("quiz:123", data, ttl=86400)  # 1 day

# User scores: change frequently, shorter TTL
await cache.set("score:user:123", score, ttl=300)  # 5 minutes

# Session data: security-sensitive
await cache.set("session:123", session, ttl=3600)  # 1 hour
```

## Debugging

### Check Cache Status

```python
# Check if key exists
exists = await cache.exists("quiz:123")

# Get TTL
ttl = await cache.ttl("quiz:123")

# Get value
value = await cache.get("quiz:123")
```

### Monitor via Redis CLI

```bash
# Connect to Redis
redis-cli

# Check keys
KEYS "quiz:*"

# Get value
GET "quiz:123"

# Check TTL
TTL "quiz:123"

# Clear pattern
DEL $(redis-cli KEYS "quiz:*")
```

## Examples

See `app/api/v1/cache_examples.py` for 8+ complete working examples:

- Simple get/set
- Cache-aside pattern
- Batch operations
- Pattern clearing
- Numeric counters
- Cache invalidation
- Quiz submission caching
- And more...

## Testing

```python
import pytest
from app.core import CacheService
from app.core.database import redis_client

@pytest.fixture
async def cache():
    """Get cache service for tests."""
    return CacheService(redis_client)

async def test_cache_set_get(cache):
    """Test basic set/get."""
    await cache.set("test:key", {"data": "value"})
    
    result = await cache.get("test:key")
    assert result == {"data": "value"}
    
    # Cleanup
    await cache.delete("test:key")

async def test_cache_pattern_clear(cache):
    """Test pattern clearing."""
    # Setup
    await cache.set("test:1", "a")
    await cache.set("test:2", "b")
    await cache.set("test:3", "c")
    
    # Clear pattern
    count = await cache.clear_pattern("test:*")
    assert count == 3
    
    # Verify
    assert await cache.get("test:1") is None
```

## Migration from Basic Utilities

If using the old cache utility functions from `database.py`, migrate to CacheService:

### Before

```python
from app.core import set_cache, get_cache

await set_cache("key", data, ttl=3600)
value = await get_cache("key")
```

### After

```python
from app.main import get_cache_service

cache = get_cache_service()
await cache.set("key", data, ttl=3600)
value = await cache.get("key")
```

## Related Documentation

- [DATABASE.md](DATABASE.md) - Database patterns
- [CONFIGURATION.md](CONFIGURATION.md) - Configuration options
- [LOGGING.md](LOGGING.md) - Logging setup

---

**Last Updated:** March 2026  
**Status:** Production Ready  
**Maintained By:** EdTech Development Team
