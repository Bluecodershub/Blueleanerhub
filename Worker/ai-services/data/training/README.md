# BlueLearnerHub Inbuilt AI Training Data

This directory contains offline seed data for the BlueLearnerHub inbuilt AI model. It is intentionally API-free: do not use Gemini, OpenAI, or another hosted model to build this dataset.

## Files

- `manifest.json`: dataset registry consumed by training jobs.
- `instruction_train.jsonl`: tutor, career, and code-review instruction examples.
- `quiz_train.jsonl`: structured quiz-generation examples.
- `feature_train.jsonl`: learning-path, hackathon, and study-notebook examples.
- `safety_train.jsonl`: academic-integrity, secret-handling, and model-identity examples.
- `validation.jsonl`: held-out examples for basic validation.

## Format

Each line is one training example:

```json
{"messages":[{"role":"system","content":"..."},{"role":"user","content":"..."},{"role":"assistant","content":"..."}],"metadata":{"domain":"computer_science","feature":"ai_tutor"}}
```

## Expansion Plan

To make this production-grade, expand each feature area with reviewed examples from platform-owned content:

- tutorials and lessons for tutor responses
- existing quizzes for quiz generation
- mentor guidance and roadmap templates for learning paths
- accepted code-review rubrics for project review
- notebook source-answer pairs with citations
- moderation decisions for Q&A and community safety

Keep personally identifiable information, secrets, private submissions, and copyrighted third-party content out of the training set unless you have explicit rights and consent.
