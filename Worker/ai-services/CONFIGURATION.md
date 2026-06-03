# AI Services Configuration Guide

## Overview

The EdTech AI Services uses Pydantic Settings for centralized configuration management. Configuration is loaded from environment variables and `.env` file.

## Configuration Structure

### Application Settings
- `app_name` - Application name (default: "EdTech AI Services")
- `app_version` - Current version (default: "1.0.0")
- `debug` - Debug mode (default: True for development)
- `host` - Server host (default: "0.0.0.0")
- `port` - Server port (default: 8000)

### Database Configuration
- `database_url` - PostgreSQL connection string
  - Default: `postgresql://edtech_user:YOUR_PASSWORD_HERE@localhost:5432/edtech_db`
  - Format: `postgresql://username:password@host:port/database`

### MongoDB Configuration
- `mongodb_uri` - MongoDB connection string
  - Default: `mongodb://localhost:27017/edtech_logs`

### Cache Configuration
- `redis_url` - Redis connection string
  - Default: `redis://:RedisPassword123!@localhost:6379`
- `cache_ttl` - Cache time-to-live in seconds (default: 3600 = 1 hour)
- `enable_caching` - Enable/disable caching (default: True)

### API Keys
- `gemini_api_key` - Google Gemini API key (required for AI features)
- `judge0_api_key` - Judge0 code execution API key

### Model Configuration
- `question_gen_model` - Model for quiz question generation (default: "gpt-3.5-turbo")
- `response_eval_model` - Model for response evaluation (default: "gpt-3.5-turbo")
- `code_eval_model` - Service for code evaluation (default: "judge0")

### ML/Training Settings
- `models_dir` - Directory for saved models (default: "data/models")
- `data_dir` - Directory for datasets (default: "data")
- `max_sequence_length` - Max sequence length for NLP models (default: 512)
- `batch_size` - Batch size for training (default: 32)
- `learning_rate` - Learning rate for training (default: 0.001)
- `epochs` - Number of training epochs (default: 10)
- `device` - Computation device: "cpu" or "cuda" (default: "cpu")

### CORS Configuration
- `allowed_origins` - List of allowed origins for CORS
  - Default: `["http://localhost:3000", "http://localhost:5000", "http://localhost:4000"]`

### JWT Configuration
- `jwt_secret` - Secret key for JWT signing (⚠️ Change in production!)
- `jwt_algorithm` - Algorithm for JWT (default: "HS256")
- `jwt_expires_in` - JWT expiration time in seconds (default: 86400 = 24 hours)

### Celery Configuration
- `celery_broker_url` - Celery message broker URL (default: Redis at 6379/0)
- `celery_result_backend` - Celery result backend URL (default: Redis at 6379/1)

### Logging Configuration
- `log_level` - Logging level (default: "INFO")
  - Options: DEBUG, INFO, WARNING, ERROR, CRITICAL
- `log_format` - Log message format

## Usage

### In Python Code

```python
from app.config import settings

# Access configuration values
print(settings.app_name)
print(settings.database_url)
print(settings.gemini_api_key)
```

### Using get_settings() with Dependency Injection

```python
from fastapi import Depends
from app.config import get_settings, Settings

async def my_endpoint(settings: Settings = Depends(get_settings)):
    # settings is properly typed and cached
    return {"database": settings.database_url}
```

## Environment Variables

Set configuration via environment variables:

```bash
# Application
export DEBUG=False
export ENVIRONMENT=production

# Server
export HOST=0.0.0.0
export PORT=8000

# Database
export DATABASE_URL="postgresql://user:pass@db-host:5432/dbname"
export MONGODB_URI="mongodb://mongo-host:27017/dbname"

# Redis
export REDIS_URL="redis://:password@redis-host:6379"

# API Keys (keep in .env, never commit!)
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# ML Settings
export DEVICE="cuda"  # Use GPU if available
export BATCH_SIZE=64

# JWT
export JWT_SECRET="your-super-secure-secret-key"

# Celery
export CELERY_BROKER_URL="redis://:password@redis-host:6379/0"

# Logging
export LOG_LEVEL="DEBUG"
```

## .env File Example

Create `.env` file in the project root:

```env
# Application
DEBUG=True
ENVIRONMENT=development

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edtech_db
MONGODB_URI=mongodb://localhost:27017/edtech_logs

# Redis
REDIS_URL=redis://localhost:6379

# API Keys - Keep these secure!
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
JUDGE0_API_KEY=your-judge0-key

# Models
QUESTION_GEN_MODEL=gpt-3.5-turbo
RESPONSE_EVAL_MODEL=gpt-3.5-turbo
CODE_EVAL_MODEL=judge0

# ML Settings
DEVICE=cpu
BATCH_SIZE=32
LEARNING_RATE=0.001
EPOCHS=10

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Logging
LOG_LEVEL=INFO
```

## Configuration Loading Order

1. **Default values** - Hardcoded in Settings class
2. **Environment variables** - Override defaults
3. **.env file** - Override environment variables

## Production Recommendations

⚠️ **Security Critical Settings:**

```env
# Change from defaults!
JWT_SECRET=generate-a-secure-random-key-here
DEBUG=False

# Use strong database credentials
DATABASE_URL=postgresql://strong-user:secure-password@prod-db.example.com:5432/edtech_db

# Disable CORS for public origins
ALLOWED_ORIGINS=https://yourdomain.com

# Use production API endpoints
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Set to production logging
LOG_LEVEL=WARNING
ENVIRONMENT=production
```

## Validation & Error Handling

Pydantic automatically validates settings:

```python
# Valid
settings = Settings(port=8000)

# Invalid - will raise ValidationError
settings = Settings(port="not-a-number")
```

## Dependency Injection

For proper type checking and FastAPI integration:

```python
from fastapi import FastAPI, Depends
from app.config import get_settings, Settings

app = FastAPI()

@app.get("/config")
async def get_config(settings: Settings = Depends(get_settings)):
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "debug": settings.debug
    }
```

## Debugging Configuration

Print all settings:

```python
from app.config import settings
import json

print(json.dumps(settings.model_dump(), indent=2, default=str))
```

## Performance Optimization

Settings are cached using `@lru_cache()` decorator:
- Single Settings instance is created and reused
- Reduces overhead of parsing environment variables
- Cache is cleared automatically between tests

## See Also

- [README.md](../README.md) - Documentation
- [QUICKSTART.md](../QUICKSTART.md) - Quick start guide
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) - Official docs
