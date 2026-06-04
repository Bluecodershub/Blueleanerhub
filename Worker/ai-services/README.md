# BlueLearnerHub AI Services

Node.js AI gateway for BlueLearnerHub. It serves chat, quiz generation, agent commands, and model routing for the backend.

## Current Model Stack

The current deployment is local/inbuilt-first:

- Primary gateway: Node.js on `PORT=8000`
- Optional custom model worker: BlueLearner Python service on `http://localhost:8002`
- Optional fallback: Ollama on `http://localhost:11434`

Gemini is disabled in the provider service. Missing model configuration returns an error; the service does not return fake development stubs.

## Quick Start

```bash
cd Worker/ai-services
npm install
cp .env.example .env
npm run dev
```

Health check:

```bash
curl http://localhost:8000/health
```

Backend `.env`:

```bash
AI_SERVICE_URL=http://localhost:8000
AI_PROVIDER=local
```

## Provider Setup

Use BlueLearner:

```bash
BLUELEARNER_ENABLED=true
BLUELEARNER_URL=http://localhost:8002
```

Use Ollama:

```bash
OLLAMA_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3
```

If both are unavailable, generation requests fail explicitly.

## Tests

```bash
npm test
```

## License

Apache-2.0
