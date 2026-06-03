# Worker Services

This folder contains background and auxiliary services that support the BluelearnerHub platform.

## Active Services

| Service | Description | Port |
|---------|-------------|------|
| `ai-services/` | FastAPI + Node.js AI service (Gemini, Ollama, quiz generation) | 8000 (FastAPI), 8001 (Node) |

## Deprecated Components

Legacy components moved to `deprecated/` directory:
- `ai_system/` → superseded by `ai-services/system/`
- `ai_model/` → use `ai-services/app/ai/airllm_service.py`
- `ai-agent/` → unused CLI tool
- `telegram_bot/` → inactive
- `sales_system/` → not implemented

## Running Services

```bash
# Node.js AI service (primary)
cd ai-services && npm start

# Python FastAPI (optional, for advanced features)
cd ai-services/app && uvicorn main:app --reload
```

## Architecture

The AI services are called by the main backend (`backend/src/services/ai.service.ts`) via HTTP:
- `/api/ai/generate` - AI content generation
- `/api/ai/quiz` - Quiz generation
- `/api/ai/chat` - Real-time AI tutoring

For details, see `ai-services/README.md` and `ai-services/CONFIGURATION.md`.

**Last Updated**: April 2026
