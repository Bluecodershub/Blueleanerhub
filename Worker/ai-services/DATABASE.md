# Database and Caching Usage Guide

## Overview

The AI services application uses:
- **PostgreSQL** for persistent data storage
- **Redis** for caching and session management
- **SQLAlchemy ORM** for database interactions

## Basic Configuration

Configuration is loaded from `app/config.py` and uses these settings:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection URL

## Database Connections

### PostgreSQL

#### Creating ORM Models

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Quiz(id={self.id}, title='{self.title}')>"
```

#### Using Database Sessions in Endpoints

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Quiz

router = APIRouter()

@router.get("/quizzes")
async def get_quizzes(db: Session = Depends(get_db)):
    """Get all quizzes."""
    quizzes = db.query(Quiz).all()
    return quizzes

@router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/quizzes")
async def create_quiz(quiz_data: QuizCreate, db: Session = Depends(get_db)):
    """Create a new quiz."""
    quiz = Quiz(**quiz_data.dict())
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz

@router.put("/quizzes/{quiz_id}")
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    db: Session = Depends(get_db)
):
    """Update a quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    for field, value in quiz_data.dict(exclude_unset=True).items():
        setattr(quiz, field, value)
    
    db.commit()
    db.refresh(quiz)
    return quiz

@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Delete a quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}
```

### Redis Caching

#### Using Async Redis Client Dependency

```python
from fastapi import APIRouter, Depends
import redis.asyncio as redis
from app.core.database import get_redis
import json

router = APIRouter()

@router.get("/quiz/{quiz_id}")
async def get_quiz(quiz_id: int, cache: redis.Redis = Depends(get_redis)):
    """Get quiz with caching."""
    # Try to get from cache
    cache_key = f"quiz:{quiz_id}"
    cached = await cache.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # TODO: Get from database
    quiz = {"id": quiz_id, "title": "Sample Quiz"}
    
    # Store in cache for 1 hour
    await cache.setex(cache_key, 3600, json.dumps(quiz))
    
    return quiz
```

#### Using Cache Helper Functions

```python
from app.core.database import set_cache, get_cache, delete_cache, clear_cache_pattern
import json

# Set cache
await set_cache("quiz:1", json.dumps({"id": 1, "title": "Quiz 1"}), ttl=3600)

# Get cache
cached = await get_cache("quiz:1")
if cached:
    quiz = json.loads(cached)

# Delete cache
await delete_cache("quiz:1")

# Clear pattern (e.g., all quiz caches)
deleted = await clear_cache_pattern("quiz:*")
```

## Health Checks

### Synchronous Health Check (for app startup)

```python
from app.core.database import test_db_connection

# In app initialization
if not test_db_connection():
    raise RuntimeError("Failed to connect to database")
```

### Asynchronous Health Check (for endpoints)

```python
from fastapi import APIRouter
from app.core.database import test_db_connection, test_redis_connection

router = APIRouter()

@router.get("/health")
async def health_check():
    """Comprehensive health check."""
    db_ok = test_db_connection()
    redis_ok = await test_redis_connection()
    
    status = "healthy" if (db_ok and redis_ok) else "degraded"
    
    return {
        "status": status,
        "database": "ok" if db_ok else "error",
        "redis": "ok" if redis_ok else "error",
    }
```

## Lifecycle Management

### Automatic Startup and Shutdown

The application automatically handles startup and shutdown events:

```python
# In app/main.py
from app.core.database import startup_events, shutdown_events

app.add_event_handler("startup", startup_events)
app.add_event_handler("shutdown", shutdown_events)
```

**Startup activities:**
1. Test PostgreSQL connection
2. Initialize database tables
3. Initialize Redis connection

**Shutdown activities:**
1. Close Redis connection
2. Close database connection pool

### Manual Initialization (if needed)

```python
from app.core.database import (
    init_db,
    close_db,
    init_redis,
    close_redis,
    test_db_connection,
    test_redis_connection,
)

# During app startup
await init_db()
await init_redis()

# During cleanup
await close_redis()
await close_db()
```

## Connection Pooling

### PostgreSQL Pool Configuration

Located in `app/core/database.py`:

```python
engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=10,           # Number of persistent connections
    max_overflow=20,        # Additional temp connections
    pool_pre_ping=True,     # Test connections before use
    pool_recycle=3600,      # Recycle after 1 hour
)
```

**Pool Size Recommendations:**
- Development: `pool_size=5, max_overflow=10`
- Small Production: `pool_size=10, max_overflow=20`
- Medium Production: `pool_size=20, max_overflow=40`
- Large Production: `pool_size=50+, max_overflow=100+`

### Redis Connection Settings

```python
redis_client = await redis.from_url(
    settings.redis_url,
    encoding="utf-8",
    decode_responses=True,
    socket_connect_timeout=5,
    socket_keepalive=True,
    health_check_interval=30,
)
```

## Error Handling

### Database Errors

```python
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

@router.post("/quizzes")
async def create_quiz(quiz_data: QuizCreate, db: Session = Depends(get_db)):
    try:
        quiz = Quiz(**quiz_data.dict())
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        return quiz
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error")
```

### Cache Errors (Non-blocking)

```python
# Cache operations are non-blocking - failures don't break the app
try:
    await set_cache("key", "value")
except Exception as e:
    logger.warning(f"Cache set failed: {e}")  # Log but don't fail
```

## Testing

### Test Database Setup

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base

# Create test database
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Use in tests
def test_get_quiz():
    db = SessionLocal()
    try:
        # Test code here
        pass
    finally:
        db.close()
```

### Test Dependencies

```python
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db

# Override dependency for testing
def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_read_items():
    response = client.get("/quizzes")
    assert response.status_code == 200
```

## Best Practices

1. **Always use `Depends(get_db)`** in FastAPI endpoints for automatic session management
2. **Cache expensive queries** using Redis helper functions
3. **Use transactions** for multi-step operations
4. **Test connections** at app startup with health checks
5. **Handle exceptions** gracefully with proper logging
6. **Use TTLs** for cache keys to prevent stale data
7. **Pool size** should match expected concurrent requests
8. **Close connections** properly on app shutdown

## Troubleshooting

### Connection Pool Exhausted

```
SQLAlchemy.exc.TimeoutError: QueuePool limit exceeded
```

**Solution:** Increase `pool_size` and `max_overflow` in engine configuration.

### Redis Connection Refused

```
redis.asyncio.exceptions.ConnectionError: Connection refused
```

**Solution:** 
1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` in `.env`
3. Ensure Redis credentials are correct

### Database Locked (SQLite in tests)

**Solution:** Use `check_same_thread=False` in SQLite test database.

## See Also

- [Configuration Guide](../CONFIGURATION.md)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Redis Python Documentation](https://redis-py.readthedocs.io/)
- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
