# Logging Usage Guide

## Overview

EdTech AI Services uses structured JSON logging for production and readable text logging for development.

- **Development** (`DEBUG=True`): Human-readable text format
- **Production** (`DEBUG=False`): Structured JSON for log aggregation

## Quick Start

### Using Logger in Code

```python
import logging
from app.core.logging import logger

# Any of these work:
logger.debug("Debug message")
logger.info("Information message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical message")
```

### Logger in FastAPI Endpoints

```python
from fastapi import APIRouter
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/items")
async def get_items():
    """Get all items."""
    logger.info("Fetching items")
    items = [{"id": 1, "name": "Item 1"}]
    logger.info(f"Retrieved {len(items)} items")
    return items

@router.post("/items")
async def create_item(item_data: dict):
    """Create a new item."""
    logger.info(f"Creating item: {item_data}")
    try:
        # Create item
        logger.info("Item created successfully")
        return {"id": 1, "name": item_data["name"]}
    except Exception as e:
        logger.error(f"Failed to create item: {e}", exc_info=True)
        raise
```

### Logger in Services

```python
import logging
from app.services.quiz_service import QuizService

logger = logging.getLogger(__name__)

class QuizService:
    def generate_questions(self, topic: str, count: int):
        """Generate quiz questions using AI."""
        logger.info(f"Generating {count} questions for topic: {topic}")
        
        try:
            # Call AI API
            logger.debug(f"Calling AI API with topic={topic}, count={count}")
            questions = self._call_ai_api(topic, count)
            
            logger.info(f"Successfully generated {len(questions)} questions")
            return questions
            
        except Exception as e:
            logger.error(f"Failed to generate questions: {e}", exc_info=True)
            raise
```

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| **DEBUG** | Detailed diagnostic info (disabled in production) | Variable values, function calls |
| **INFO** | General informational messages | User actions, successful operations |
| **WARNING** | Warning messages (something unexpected) | Deprecated API usage, high latency |
| **ERROR** | Error messages (something went wrong) | Failed queries, API errors |
| **CRITICAL** | Critical errors (system in danger) | Database unavailable, out of memory |

## Configuration

Logging is automatically configured on app startup via `app/core/logging.py`.

### Setting Log Level

Via `.env` file:
```env
LOG_LEVEL=INFO    # DEBUG, INFO, WARNING, ERROR, CRITICAL
DEBUG=True        # Sets format (True = text, False = JSON)
```

Via environment variable:
```bash
export LOG_LEVEL=DEBUG
export DEBUG=False
```

### Log Format

#### Development Format (`DEBUG=True`)

```
2026-03-01 10:30:45 - app.services.quiz - INFO - Generating 5 questions for topic: Python
2026-03-01 10:30:46 - app.services.quiz - DEBUG - Calling AI API with topic=Python, count=5
2026-03-01 10:30:47 - app.services.quiz - INFO - Successfully generated 5 questions
```

#### Production Format (`DEBUG=False`)

```json
{
  "timestamp": "2026-03-01T10:30:45.123456Z",
  "name": "app.services.quiz",
  "levelname": "INFO",
  "message": "Generating 5 questions for topic: Python"
}
{
  "timestamp": "2026-03-01T10:30:47.654321Z",
  "name": "app.services.quiz",
  "levelname": "INFO",
  "message": "Successfully generated 5 questions"
}
```

## Advanced Usage

### Logging with Exception Info

```python
logger = logging.getLogger(__name__)

try:
    result = risky_operation()
except Exception as e:
    # Include full traceback
    logger.error("Operation failed", exc_info=True)
```

### Structured Logging with Extra Fields

```python
logger.info(
    "User logged in",
    extra={
        "user_id": 123,
        "email": "user@example.com",
        "ip_address": "192.168.1.1"
    }
)
```

### Logger Per Module

```python
# In app/services/quiz_service.py
import logging

logger = logging.getLogger(__name__)  # Automatically uses module path

class QuizService:
    def __init__(self):
        self.logger = logger  # Or use directly
```

### Setting Log Levels Per Component

```python
import logging

# Set specific logger levels
logging.getLogger("sqlalchemy").setLevel(logging.WARNING)  # Reduce SQL noise
logging.getLogger("uvicorn").setLevel(logging.INFO)        # Normal level
logging.getLogger("app.services").setLevel(logging.DEBUG)   # Extra detail for services
```

## Log Aggregation

### Elasticsearch Integration

For production, JSON logs can be easily ingested into Elasticsearch:

```bash
# Pipe logs to logstash or similar
python app/main.py | logstash -c logstash.conf
```

### CloudWatch Integration (AWS)

Set up CloudWatch agent to ingest JSON logs:

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/app/logs/app.log",
            "log_group_name": "/edtech/ai-services",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

### Datadog Integration

```python
# Add to .env or config
DATADOG_API_KEY=your_api_key
DATADOG_SERVICE_NAME=edtech-ai-services
```

## Benefits of Structured JSON Logging

1. **Machine Readable** - Easy to parse and analyze
2. **Queryable** - Search by timestamp, level, message, custom fields
3. **Aggregatable** - Combine logs across multiple services
4. **Reliable** - Consistent format across all log statements
5. **Scalable** - Handles high volume without degradation

## Example: Complete Logging Setup

```python
# app/services/hackathon_service.py
import logging
from app.config import settings
from app.core.database import get_db

logger = logging.getLogger(__name__)

class HackathonService:
    def __init__(self, db):
        self.db = db
        self.logger = logger
    
    def submit_code(self, user_id: int, hackathon_id: int, code: str):
        """Submit code for a hackathon challenge."""
        self.logger.info(
            "Code submission started",
            extra={
                "user_id": user_id,
                "hackathon_id": hackathon_id,
                "code_length": len(code)
            }
        )
        
        try:
            # Validate code
            self.logger.debug("Validating code syntax")
            self._validate_code(code)
            
            # Save submission
            self.logger.debug("Saving submission to database")
            submission = self.db.create_submission(
                user_id=user_id,
                hackathon_id=hackathon_id,
                code=code
            )
            
            # Analyze code
            self.logger.debug("Starting code analysis")
            analysis = self._analyze_code(code)
            
            self.logger.info(
                "Code submission successful",
                extra={
                    "user_id": user_id,
                    "submission_id": submission.id,
                    "analysis_score": analysis["score"]
                }
            )
            return submission
            
        except ValidationError as e:
            self.logger.warning(f"Code validation failed: {e}")
            raise
        except DatabaseError as e:
            self.logger.error(f"Database error during submission: {e}", exc_info=True)
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error during code submission: {e}", exc_info=True)
            raise
```

## Best Practices

1. **Use appropriate log levels** - Don't log everything as INFO
2. **Include context** - Log user IDs, request IDs, resource IDs
3. **Use structured extra fields** - Not just one long message
4. **Log before and after operations** - Track start and completion
5. **Include exceptions** - Always use `exc_info=True` when logging errors
6. **Avoid sensitive data** - Never log passwords, API keys, or PII
7. **Use logger per module** - `logger = logging.getLogger(__name__)`
8. **Don't catch and ignore** - Log errors before re-raising
9. **Be specific** - "Failed to update user" is better than "Error"
10. **Use consistent naming** - Maintain consistent log message patterns

## Troubleshooting

### Logs Not Appearing

1. Check log level: `echo $LOG_LEVEL`
2. Verify logger is configured: Check `setup_logging()` is called
3. Ensure handler is added: Check `logger.handlers`

### Too Many DEBUG Logs

```env
LOG_LEVEL=INFO  # Change from DEBUG
```

### Missing Exception Traceback

Add `exc_info=True`:
```python
logger.error("Something failed", exc_info=True)
```

### JSON Logs Not Parsing

Ensure `python-json-logger` is installed:
```bash
pip install python-json-logger
```

## See Also

- [Configuration Guide](CONFIGURATION.md)
- [python-json-logger Documentation](https://github.com/madzak/python-json-logger)
- [Python Logging Guide](https://docs.python.org/3/library/logging.html)
