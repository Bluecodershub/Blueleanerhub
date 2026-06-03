# BlueLearnerHub Inbuilt AI Training Data

BlueLearnerHub now trains and serves its own inbuilt local model. The training workflow must not depend on Gemini, OpenAI, or any hosted AI API.

## Seed Dataset

The offline seed dataset lives in:

```text
worker/ai-services/data/training
```

It includes:

- tutor and career-coach instruction examples
- quiz-generation examples with strict JSON outputs
- code-review, learning-path, hackathon, and notebook examples
- safety examples for academic integrity, secrets, and model identity
- a `manifest.json` file used by the LoRA training script

## Train The Inbuilt Model

From `worker/ai-services`:

```bash
python -m app.training.finetune_lora --data data/training --output models/bluelearner-v1 --epochs 3
```

For a quick wiring test:

```bash
python -m app.training.finetune_lora --data data/training --quick
```

## Serve The Model

Use the local provider stack:

```bash
AI_PROVIDER=local
LOCAL_LLM_PROVIDER=airllm
LOCAL_LLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2
BLUELEARNER_ENABLED=true
BLUELEARNER_ADAPTER=models/bluelearner-v1
```

In production, do not use `LOCAL_LLM_PROVIDER=stub`.

## Expanding Data

Add more JSONL examples from platform-owned content:

- tutorials and lesson explanations
- reviewed quiz banks
- roadmap templates
- code-review rubrics
- study-notebook source and answer pairs
- moderation decisions

Do not include secrets, private user data, live exam answers, or copyrighted third-party material without rights and consent.
