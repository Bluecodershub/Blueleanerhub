# AI Services Configuration

## Required

```bash
PORT=8000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

## Backend Link

Backend must point to the Node gateway:

```bash
AI_SERVICE_URL=http://localhost:8000
AI_PROVIDER=local
```

Optional internal secret:

```bash
INTERNAL_SERVICE_SECRET=
```

Set the same value in backend and worker if this protection is enabled.

## BlueLearner Worker

```bash
BLUELEARNER_ENABLED=false
BLUELEARNER_URL=http://localhost:8002
```

Set `BLUELEARNER_ENABLED=true` only when the Python worker is running and serving `/api/v1/bluelearner/status`.

## Ollama

```bash
OLLAMA_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3
```

Leave `OLLAMA_URL` blank if the gateway should not try Ollama.

## Legacy Hosted AI

```bash
GEMINI_API_KEY=
```

Gemini is disabled by the current provider service. Keep this blank unless hosted-provider support is intentionally reintroduced.

## Failure Policy

The service fails closed for model output:

- no provider: error
- malformed quiz JSON: error
- incomplete quiz questions: error

It does not generate placeholder options, answers, or stub responses.
