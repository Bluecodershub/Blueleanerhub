# AI Services Architecture

## Overview

This AI Services module provides a **unified Node.js-based AI gateway** with optional Python microservices for advanced ML features.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI SERVICES (Unified)                               │
│                           Port: 8000 (default)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Node.js Express Gateway (Primary)                                    │   │
│  │  Entry: index.js                                                    │   │
│  │                                                                     │   │
│  │  • Gemini API integration (Google AI)                               │   │
│  │  • Quiz generation                                                  │   │
│  │  • Code review                                                      │   │
│  │  • Learning path generation                                         │   │
│  │  • AI chat                                                          │   │
│  │  • Multi-agent orchestration                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┴───────────────┐                        │
│                    ▼                               ▼                        │
│  ┌─────────────────────────────────┐  ┌──────────────────────────────┐       │
│  │  Optional: Python Microservice   │  │  Optional: Local LLM       │       │
│  │  (app/main.py) - Port 8002      │  │  (Ollama/Llama/etc.)       │       │
│  │                                  │  │  Port: 11434 (external)    │       │
│  │  • Advanced caching (Redis)      │  │                             │       │
│  │  • Training data generation      │  │  • Fallback when Gemini    │       │
│  │  • Custom ML models              │  │    API unavailable         │       │
│  │  • Multi-agent advanced          │  │                             │       │
│  └─────────────────────────────────┘  └──────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Service Entry Points

### Primary: Node.js Gateway (RECOMMENDED)

**File**: `index.js`  
**Port**: 8000 (set via `PORT` env var)  
**Status**: ✅ **ACTIVE & PRODUCTION-READY**

This is the main AI service that handles all AI requests from the backend.

```bash
npm start        # Production
npm run dev      # Development with nodemon
```

### Optional: Python Microservice

**File**: `app/main.py`  
**Port**: 8002 (set via `PORT` env var)  
**Status**: ⚠️ **ADVANCED FEATURES ONLY**

Provides additional ML capabilities. Start only if you need:
- Advanced Redis caching for AI responses
- Training data generation pipelines
- Custom local LLM orchestration beyond basic Ollama

```bash
# Requires Python 3.11+
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app/main.py       # or: uvicorn app.main:app --reload --port 8002
```

### ⚠️ DEPRECATED: Ollama Bridge

**File**: `bridge.js` (kept for reference only)  
**Status**: ❌ **DEPRECATED - DO NOT USE**

The bridge functionality has been integrated into the main Node.js gateway via the model service.

## API Endpoints

All endpoints are prefixed with `/api`:

### AI Routes (`/api/ai/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate` | POST | General text generation |
| `/api/ai/chat` | POST | AI chat/completion |
| `/api/ai/quiz/generate` | POST | Generate quiz questions |
| `/api/ai/review` | POST | Code review |
| `/api/ai/learning-path` | POST | Generate learning path |

### Agent Routes (`/api/agent/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/run` | POST | Run multi-agent command |
| `/api/agent/ask` | POST | Ask agent a question |

### Model Routes (`/api/model/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/model/predict` | POST | Model prediction |
| `/api/model/info` | GET | Model information |

### Backward Compatibility (`/api/v1/*`)

These endpoints are aliases for the backend services:

- `POST /api/v1/ai/quiz/generate` → `POST /api/ai/quiz/generate`
- `POST /api/v1/quiz/generate` → `POST /api/ai/quiz/generate`
- `POST /api/v1/chat` → `POST /api/ai/chat`
- `POST /api/v1/ai/generate` → `POST /api/ai/generate`

## Configuration

### Required Environment Variables

```bash
# AI Provider
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Local LLM Fallback
OLLAMA_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3

# Server
PORT=8000
NODE_ENV=production

# CORS (for security)
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Optional Python Service Variables

```bash
# Only needed if running Python microservice on port 8002
DATABASE_URL=postgresql://...  # If using PostgreSQL caching
REDIS_URL=redis://localhost:6379  # For advanced caching
PYTHON_ENV=production
```

## Local LLM Fallback

The Node.js gateway can fall back to local LLMs (Ollama) when:
1. Gemini API key is not configured
2. Gemini API returns errors
3. Explicitly requested via `provider: 'local'`

To enable:
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama3`
3. Set `OLLAMA_URL=http://localhost:11434`

## Architecture Decision Records

### ADR 1: Node.js as Primary Gateway

**Decision**: Use Node.js Express as the primary AI gateway instead of Python FastAPI.

**Rationale**:
- Backend team is primarily TypeScript/JavaScript
- Simpler deployment (single Node.js process)
- Better integration with existing backend services
- Google Gemini SDK has excellent Node.js support

**Consequences**:
- Python layer becomes optional for advanced ML only
- Need to maintain two codebases if Python features are needed

### ADR 2: Port Consolidation

**Decision**: Standardize on port 8000 for the primary AI service.

**Previous State**: Port confusion (8000, 8001, 8002)

**Resolution**:
- `index.js`: Port 8000 (primary)
- `app/main.py`: Port 8002 (optional Python microservice)
- Ollama: Port 11434 (external, not managed by this service)

## Deployment

### Docker (Recommended)

```bash
# Build and run primary AI service
docker build -t ai-services .
docker run -p 8000:8000 -e GEMINI_API_KEY=... ai-services
```

### Docker Compose (Full Stack)

See `../../devops/docker-compose.yml` for the complete stack including:
- AI Services (Node.js, port 8000)
- Backend (port 5000)
- Frontend (port 3000)
- PostgreSQL, Redis, MongoDB

## Migration Guide

### From Old Architecture

If you were using `bridge.js`:
1. Stop using `bridge.js` - it's deprecated
2. Use `index.js` on port 8000 instead
3. The Ollama integration is now automatic when `OLLAMA_URL` is set

### Backend Configuration

Update your backend `.env`:

```bash
# Old (confusing)
AI_SERVICE_URL=http://localhost:8000  # If using bridge
AI_SERVICE_URL=http://localhost:8001  # If using index.js

# New (unified)
AI_SERVICE_URL=http://localhost:8000  # Always port 8000
```

## Troubleshooting

### "AI features returning stub responses"

Check that `GEMINI_API_KEY` is set and valid. Without it, the service returns stubs for development.

### "Cannot connect to AI service"

Verify:
1. Service is running: `curl http://localhost:8000/health`
2. Port is correct: Should be 8000 for primary service
3. Firewall allows connections

### "CORS errors from backend"

Add your backend URL to `CORS_ORIGINS`:
```bash
CORS_ORIGINS=http://localhost:3000,http://localhost:5000,https://your-production-backend.com
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

---

**Last Updated**: May 2026  
**Architecture Version**: 3.0 (Unified)
