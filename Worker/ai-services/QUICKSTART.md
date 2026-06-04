# AI Services Quickstart

## Start The Gateway

```bash
cd Worker/ai-services
npm install
cp .env.example .env
npm run dev
```

The Node gateway listens on `http://localhost:8000`.

## Verify

```bash
curl http://localhost:8000/health
```

## Connect Backend

In `Backend/.env`:

```bash
AI_SERVICE_URL=http://localhost:8000
AI_PROVIDER=local
```

## Enable A Model

BlueLearner local model worker:

```bash
BLUELEARNER_ENABLED=true
BLUELEARNER_URL=http://localhost:8002
```

Ollama local LLM:

```bash
OLLAMA_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3
```

If neither provider is running, generation endpoints return an error instead of fake content.
