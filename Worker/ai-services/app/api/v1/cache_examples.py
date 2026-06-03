"""
CacheService Usage Examples

This module demonstrates how to use the CacheService in your FastAPI endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.core import CacheService
from app.main import get_cache_service

router = APIRouter(tags=["cache-examples"])


class QuestionData(BaseModel):
    """Example data model."""
    id: int
    question: str
    options: list[str]
    correct_answer: int


# ============================================================================
# Example 1: Simple Get/Set Cache
# ============================================================================

@router.get("/examples/simple-get/{key}")
async def simple_get_example(
    key: str,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Get value from cache.
    
    curl http://localhost:8000/examples/simple-get/my_key
    """
    value = await cache.get(key)
    
    if value is None:
        raise HTTPException(status_code=404, detail="Key not found in cache")
    
    return {"key": key, "value": value}


@router.post("/examples/simple-set/{key}")
async def simple_set_example(
    key: str,
    value: dict,
    ttl: Optional[int] = None,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Set value in cache.
    
    curl -X POST http://localhost:8000/examples/simple-set/my_key \
      -H "Content-Type: application/json" \
      -d '{"data": "hello"}' \
      -G --data-urlencode 'ttl=3600'
    """
    success = await cache.set(key, value, ttl)
    
    return {
        "key": key,
        "success": success,
        "ttl": ttl or "default"
    }


# ============================================================================
# Example 2: Cache-Aside Pattern (Get or Compute)
# ============================================================================

async def fetch_question_from_db(question_id: int) -> QuestionData:
    """Simulate database fetch."""
    # In real application, fetch from database
    return QuestionData(
        id=question_id,
        question="What is 2 + 2?",
        options=["3", "4", "5", "6"],
        correct_answer=1
    )


@router.get("/examples/question/{question_id}")
async def get_question_cached(
    question_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Cache-aside pattern (get or compute).
    
    First request: Fetches from DB and caches result
    Subsequent requests: Returns from cache within TTL
    
    curl http://localhost:8000/examples/question/123
    """
    cache_key = f"question:{question_id}"
    
    # Try to get from cache
    cached_question = await cache.get(cache_key)
    if cached_question is not None:
        return {"source": "cache", "data": cached_question}
    
    # Not in cache, fetch from database
    question = await fetch_question_from_db(question_id)
    
    # Cache the result (3600 seconds = 1 hour)
    await cache.set(cache_key, question.model_dump(), ttl=3600)
    
    return {"source": "database", "data": question}


# ============================================================================
# Example 3: Cache with get_or_set
# ============================================================================

@router.get("/examples/quiz/{quiz_id}")
async def get_quiz_with_get_or_set(
    quiz_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Using get_or_set for automatic caching.
    
    This is a cleaner way to implement cache-aside pattern.
    
    curl http://localhost:8000/examples/quiz/42
    """
    cache_key = f"quiz:{quiz_id}"
    
    # Compute function
    async def compute_quiz():
        # Simulate expensive operation
        return {
            "id": quiz_id,
            "title": f"Quiz {quiz_id}",
            "questions": 10,
            "difficulty": "medium"
        }
    
    # Get from cache or compute
    quiz = await cache.get_or_set(cache_key, compute_quiz, ttl=3600)
    
    return {"data": quiz}


# ============================================================================
# Example 4: Multiple Keys (mget, mset)
# ============================================================================

@router.post("/examples/batch-set")
async def batch_set_example(
    data: dict,
    ttl: Optional[int] = None,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Set multiple keys at once.
    
    curl -X POST http://localhost:8000/examples/batch-set \
      -H "Content-Type: application/json" \
      -d '{
        "user:1": {"name": "Alice", "score": 100},
        "user:2": {"name": "Bob", "score": 85}
      }' \
      -G --data-urlencode 'ttl=1800'
    """
    success = await cache.mset(data, ttl)
    
    return {
        "keys_set": len(data),
        "success": success,
        "ttl": ttl or "default"
    }


@router.get("/examples/batch-get")
async def batch_get_example(
    keys: list[str],
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Get multiple keys at once.
    
    curl "http://localhost:8000/examples/batch-get?keys=user:1&keys=user:2&keys=user:3"
    """
    values = await cache.mget(*keys)
    
    found = {k: v for k, v in values.items() if v is not None}
    missing = {k: v for k, v in values.items() if v is None}
    
    return {
        "found": found,
        "missing": list(missing.keys()),
        "total_requested": len(keys),
        "total_found": len(found)
    }


# ============================================================================
# Example 5: Pattern-based Operations
# ============================================================================

@router.post("/examples/quiz/{quiz_id}/clear-cache")
async def clear_quiz_cache(
    quiz_id: int,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Clear all related cache keys with pattern.
    
    Useful when updating a quiz - clears all cached data related to that quiz.
    
    curl -X POST http://localhost:8000/examples/quiz/42/clear-cache
    """
    pattern = f"quiz:{quiz_id}:*"
    
    cleared_count = await cache.clear_pattern(pattern)
    
    return {
        "pattern": pattern,
        "keys_cleared": cleared_count
    }


@router.delete("/examples/cache/{key}")
async def delete_cache_example(
    key: str,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Delete specific key from cache.
    
    curl -X DELETE http://localhost:8000/examples/cache/my_key
    """
    success = await cache.delete(key)
    
    return {"key": key, "deleted": success}


# ============================================================================
# Example 6: Check and Expiration
# ============================================================================

@router.get("/examples/cache/{key}/info")
async def cache_info_example(
    key: str,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Get cache key information.
    
    curl http://localhost:8000/examples/cache/my_key/info
    """
    exists = await cache.exists(key)
    ttl = await cache.ttl(key)
    value = await cache.get(key) if exists else None
    
    return {
        "key": key,
        "exists": exists,
        "ttl_seconds": ttl if ttl and ttl > 0 else None,
        "has_expiry": ttl != -1 if ttl else False,
        "value": value
    }


@router.put("/examples/cache/{key}/expire")
async def set_expiration_example(
    key: str,
    ttl: int,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Set expiration on existing key.
    
    curl -X PUT http://localhost:8000/examples/cache/my_key/expire \
      -G --data-urlencode 'ttl=1800'
    """
    success = await cache.expire(key, ttl)
    
    return {
        "key": key,
        "ttl_set": ttl if success else None,
        "success": success
    }


@router.put("/examples/cache/{key}/persist")
async def persist_cache_example(
    key: str,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Remove expiration from key (make it persistent).
    
    curl -X PUT http://localhost:8000/examples/cache/my_key/persist
    """
    success = await cache.persist(key)
    
    return {
        "key": key,
        "expiration_removed": success
    }


# ============================================================================
# Example 7: Numeric Operations
# ============================================================================

@router.post("/examples/counter/{name}/increment")
async def increment_counter(
    name: str,
    amount: int = 1,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Increment numeric counter.
    
    Useful for tracking: quiz attempts, user scores, API usage, etc.
    
    curl -X POST "http://localhost:8000/examples/counter/quiz_attempts/increment?amount=5"
    """
    counter_key = f"counter:{name}"
    new_value = await cache.increment(counter_key, amount)
    
    return {
        "counter": name,
        "value": new_value,
        "incremented_by": amount
    }


@router.post("/examples/counter/{name}/decrement")
async def decrement_counter(
    name: str,
    amount: int = 1,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Decrement numeric counter.
    
    curl -X POST "http://localhost:8000/examples/counter/active_users/decrement?amount=2"
    """
    counter_key = f"counter:{name}"
    new_value = await cache.decrement(counter_key, amount)
    
    return {
        "counter": name,
        "value": new_value,
        "decremented_by": amount
    }


@router.get("/examples/counter/{name}")
async def get_counter(
    name: str,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Get counter value.
    
    curl http://localhost:8000/examples/counter/quiz_attempts
    """
    counter_key = f"counter:{name}"
    value = await cache.get(counter_key)
    
    return {
        "counter": name,
        "value": value or 0
    }


# ============================================================================
# Example 8: Real-world Use Case - Quiz Results
# ============================================================================

class QuizSubmission(BaseModel):
    """Quiz submission model."""
    user_id: int
    quiz_id: int
    score: float
    answers: list[int]
    submitted_at: str


@router.post("/examples/quiz/{quiz_id}/submit")
async def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    cache: CacheService = Depends(get_cache_service)
):
    """
    Example: Real-world use case - cache quiz results.
    
    curl -X POST http://localhost:8000/examples/quiz/42/submit \
      -H "Content-Type: application/json" \
      -d '{
        "user_id": 1,
        "quiz_id": 42,
        "score": 85.5,
        "answers": [1, 2, 0, 3, 1],
        "submitted_at": "2026-03-01T10:30:00Z"
      }'
    """
    # Store submission in database (simulated)
    # await db.save(submission)
    
    # Cache the result for quick access
    cache_key = f"quiz:result:{submission.quiz_id}:user:{submission.user_id}"
    
    await cache.set(
        cache_key,
        {
            **submission.model_dump(),
            "cached_at": "2026-03-01T10:30:00Z"
        },
        ttl=86400  # 24 hours
    )
    
    # Cache user's score for leaderboards
    leaderboard_key = f"leaderboard:quiz:{quiz_id}"
    user_score_key = f"user:{submission.user_id}:score"
    
    await cache.increment(user_score_key, int(submission.score))
    
    # Clear quiz cache to ensure fresh data
    await cache.clear_pattern(f"quiz:{quiz_id}:*")
    
    return {
        "status": "submitted",
        "cached_keys": [cache_key, leaderboard_key],
        "score": submission.score
    }


# ============================================================================
# Export for inclusion in main app
# ============================================================================

if __name__ == "__main__":
    # For documentation and testing
    import json
    
    examples = {
        "simple_get": "GET /examples/simple-get/{key}",
        "simple_set": "POST /examples/simple-set/{key}",
        "get_question_cached": "GET /examples/question/{question_id}",
        "get_quiz_with_get_or_set": "GET /examples/quiz/{quiz_id}",
        "batch_set": "POST /examples/batch-set",
        "batch_get": "GET /examples/batch-get",
        "clear_quiz_cache": "POST /examples/quiz/{quiz_id}/clear-cache",
        "delete_cache": "DELETE /examples/cache/{key}",
        "cache_info": "GET /examples/cache/{key}/info",
        "set_expiration": "PUT /examples/cache/{key}/expire",
        "persist_cache": "PUT /examples/cache/{key}/persist",
        "increment_counter": "POST /examples/counter/{name}/increment",
        "decrement_counter": "POST /examples/counter/{name}/decrement",
        "get_counter": "GET /examples/counter/{name}",
        "submit_quiz": "POST /examples/quiz/{quiz_id}/submit",
    }
    
    print("CacheService Examples")
    print("=" * 60)
    for name, endpoint in examples.items():
        print(f"  {name:<25} {endpoint}")
