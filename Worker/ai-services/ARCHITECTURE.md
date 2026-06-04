# AI Services Architecture

## Overview

`Worker/ai-services` is the BlueLearnerHub AI gateway. The primary runtime is a Node.js Express service on port `8000`. It routes model calls through the inbuilt/local provider chain:

- BlueLearner Python local-model worker, optional, `BLUELEARNER_ENABLED=true`, default URL `http://localhost:8002`
- Ollama/local LLM fallback, optional, default URL `http://localhost:11434`

Hosted Gemini calls are disabled in the current provider service. If no local provider is available, AI generation fails explicitly instead of returning placeholder or stub content.

## Entry Points

Primary service:

```bash
cd Worker/ai-services
npm install
npm start
```

Optional Python worker:

```bash
cd Worker/ai-services
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

## Ports

| Service | Port | Purpose |
| --- | ---: | --- |
| Node AI gateway | `8000` | Backend-facing AI API |
| Python BlueLearner worker | `8002` | Optional local-model worker |
| Ollama | `11434` | Optional external local LLM |

## Backend Configuration

Set the backend to the Node gateway:

```bash
AI_SERVICE_URL=http://localhost:8000
AI_PROVIDER=local
```

Use the same `INTERNAL_SERVICE_SECRET` in backend and worker only when internal request authentication is enabled.

## Core Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | GET | Worker health and provider status |
| `/api/ai/generate` | POST | General text generation |
| `/api/ai/chat` | POST | Chat response |
| `/api/ai/quiz/generate` | POST | Structured quiz generation |
| `/api/agent/run` | POST | Multi-agent command |

Compatibility aliases are still mounted for backend callers:

- `POST /api/v1/ai/quiz/generate`
- `POST /api/v1/quiz/generate`
- `POST /api/v1/chat`
- `POST /api/v1/ai/generate`

## Failure Behavior

Quiz generation validates model output before returning it. The worker rejects empty, malformed, or incomplete quiz JSON. The backend no longer caches placeholder daily quizzes, so users are not scored against fabricated questions when the model stack is unavailable.

## Troubleshooting

`No local AI provider available` means neither BlueLearner nor Ollama responded. Start one provider or disable the feature route until a model is available.

`AI provider returned no quiz questions` means the selected model returned empty or malformed JSON. Check the provider logs and prompt output.

`Cannot connect to AI service` means the backend cannot reach `AI_SERVICE_URL`. Confirm `curl http://localhost:8000/health` from the backend host.
