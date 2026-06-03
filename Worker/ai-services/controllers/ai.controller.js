'use strict';
const catchAsync   = require('../middleware/asyncWrapper');
const aiProvider   = require('../services/aiProvider.service');
const quizService  = require('../services/quiz.service');
const logger       = require('../utils/logger');
const { badRequest, requireBodyField } = require('../utils/http');

const MAX_PROMPT_LEN = 8192;
const MAX_CODE_LEN   = 32768;
const MAX_TOPIC_LEN  = 200;

// ── POST /api/ai/generate ─────────────────────────────────────────────────────
// General text generation with automatic provider fallback.
const generate = catchAsync(async (req, res) => {
  const { prompt, topic, max_tokens, provider } = req.body;
  const input = prompt || topic;
  if (requireBodyField(res, input, 'prompt or topic is required')) return;
  if (typeof input !== 'string' || input.length > MAX_PROMPT_LEN) {
    return badRequest(res, `prompt must be a string under ${MAX_PROMPT_LEN} characters`);
  }

  const response = await aiProvider.generate(input, { maxTokens: max_tokens, provider });
  res.json({ success: true, response });
});

// ── POST /api/ai/chat  (also /api/v1/chat) ────────────────────────────────────
// AI chat with support for both single prompts and message arrays.
const chat = catchAsync(async (req, res) => {
  const { prompt, message, messages, max_new_tokens, provider } = req.body;
  const input = prompt || message;

  // Support both simple prompt and structured messages
  if (messages && Array.isArray(messages)) {
    if (messages.length > 100) {
      return badRequest(res, 'messages array too long (max 100)');
    }
    const response = await aiProvider.chat(messages, { maxTokens: max_new_tokens, provider });
    return res.json({ success: true, response });
  }

  if (requireBodyField(res, input, 'prompt, message, or messages is required')) return;
  if (typeof input !== 'string' || input.length > MAX_PROMPT_LEN) {
    return badRequest(res, `prompt must be a string under ${MAX_PROMPT_LEN} characters`);
  }

  const response = await aiProvider.generate(input, { maxTokens: max_new_tokens, provider });
  res.json({ success: true, response });
});

// ── POST /api/ai/quiz/generate  (also /api/v1/ai/quiz/generate + /api/v1/quiz/generate)
// This is the endpoint called by backend/src/services/dailyQuiz.service.ts
const generateQuiz = catchAsync(async (req, res) => {
  const { topic, count, num_questions, difficulty, context } = req.body;
  if (requireBodyField(res, topic, 'topic is required')) return;
  if (typeof topic !== 'string' || topic.length > MAX_TOPIC_LEN) {
    return badRequest(res, `topic must be a string under ${MAX_TOPIC_LEN} characters`);
  }

  const result = await quizService.generateQuiz({
    topic,
    count:      count || num_questions || 5,
    difficulty: difficulty || 'medium',
    context:    context || '',
  });

  logger.info('quiz.generated', { topic, count: result.questions.length });
  res.json({ success: true, ...result });
});

// ── POST /api/ai/review ───────────────────────────────────────────────────────
// Code review with AI provider fallback.
const reviewCode = catchAsync(async (req, res) => {
  const { code, language, provider } = req.body;
  if (requireBodyField(res, code, 'code is required')) return;
  if (typeof code !== 'string' || code.length > MAX_CODE_LEN) {
    return badRequest(res, `code must be a string under ${MAX_CODE_LEN} characters`);
  }

  const prompt = `You are an expert code reviewer.

Review the following ${language || 'code'} and provide:
1. A brief summary of what the code does
2. Issues found (bugs, security risks, performance)
3. Specific improvement suggestions with examples

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Respond in plain text, not JSON.`;

  const review = await aiProvider.generate(prompt, { temperature: 0.3, provider });
  res.json({ success: true, review });
});

// ── POST /api/ai/learning-path ────────────────────────────────────────────────
// Generate structured learning path with JSON output.
const generateLearningPath = catchAsync(async (req, res) => {
  const { goal, current_skills, provider } = req.body;
  if (requireBodyField(res, goal, 'goal is required')) return;

  const skills = Array.isArray(current_skills) ? current_skills.join(', ') : (current_skills || 'beginner');
  const prompt = `You are an expert learning path designer.

Create a structured learning path for someone who wants to: "${goal}"
Current skills: ${skills}

Respond with a JSON object:
{
  "title": "...",
  "estimatedWeeks": 12,
  "phases": [
    {
      "phase": 1,
      "title": "...",
      "weeks": 2,
      "topics": ["topic1", "topic2"],
      "resources": ["resource1"],
      "milestone": "..."
    }
  ]
}`;

  const path = await aiProvider.generateJSON(prompt, { temperature: 0.5, provider });
  res.json({ success: true, path });
});

module.exports = { generate, chat, generateQuiz, reviewCode, generateLearningPath };
