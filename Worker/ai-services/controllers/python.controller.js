'use strict';
const catchAsync = require('../middleware/asyncWrapper');
const bridge = require('../python/bridge');
const aiProvider = require('../services/aiProvider.service');
const logger = require('../utils/logger');
const { requireBodyField } = require('../utils/http');

const MAX_PROMPT_INPUT = 10000;

/**
 * Sanitize user input before embedding in LLM prompts.
 * Strips control characters, trims whitespace, and enforces length limit.
 */
function sanitizeForPrompt(input) {
  if (typeof input !== 'string') return String(input ?? '');
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, MAX_PROMPT_INPUT);
}

async function withPython(method, params, fallback) {
  try {
    if (!bridge.isAvailable()) await bridge.start();
    if (bridge.isAvailable()) return await bridge.call(method, params);
  } catch (err) {
    logger.warn(`Python ${method} unavailable, using fallback`, { error: err.message });
  }
  if (fallback) return fallback();
  throw new Error(`${method} requires Python ML worker which is not available`);
}

const evaluateCode = catchAsync(async (req, res) => {
  const { code, language, testCases } = req.body;
  if (requireBodyField(res, code, 'code is required')) return;

  const result = await withPython('code_evaluate', { code, language, test_cases: testCases },
    () => ({ score: 0, complexity: 'unknown', issues: [], output: '' })
  );
  res.json({ success: true, data: result });
});

const checkPlagiarism = catchAsync(async (req, res) => {
  const { submissions, threshold } = req.body;
  if (requireBodyField(res, submissions, 'submissions is required')) return;

  const result = await withPython('plagiarism_check', { submissions, threshold: threshold || 0.7 },
    () => ({ similar_pairs: [], overall_similarity: 0 })
  );
  res.json({ success: true, data: result });
});

const screenResume = catchAsync(async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (requireBodyField(res, resume, 'resume is required')) return;

  const result = await withPython('screen_resume', { resume, job_description: jobDescription },
    () => ({ score: 0, matchedSkills: [], missingSkills: [], fit: 'unknown' })
  );
  res.json({ success: true, data: result });
});

const evaluateInterview = catchAsync(async (req, res) => {
  const { question, answer } = req.body;
  if (requireBodyField(res, question && answer, 'question and answer are required')) return;

  const result = await withPython('evaluate_interview', { question, answer },
    () => {
      const safeQuestion = sanitizeForPrompt(question);
      const safeAnswer = sanitizeForPrompt(answer);
      const prompt = `Evaluate this interview response.\nQuestion: ${safeQuestion}\nAnswer: ${safeAnswer}\nRate 1-10 on: relevance, completeness, technical accuracy, communication, confidence. Return JSON.`;
      return aiProvider.generateJSON(prompt, { temperature: 0.3 });
    }
  );
  res.json({ success: true, data: result });
});

const predictDifficulty = catchAsync(async (req, res) => {
  const { question } = req.body;
  if (requireBodyField(res, question, 'question is required')) return;

  const result = await withPython('predict_difficulty', { question },
    () => ({ difficulty: 'medium', confidence: 0.5 })
  );
  res.json({ success: true, data: result });
});

const rankSubmissions = catchAsync(async (req, res) => {
  const { submissions, criteria } = req.body;
  if (requireBodyField(res, submissions, 'submissions is required')) return;

  const result = await withPython('code_evaluate', { submissions, mode: 'rank' },
    () => submissions.map((s, i) => ({ ...s, rank: i + 1, score: 0 }))
  );
  res.json({ success: true, data: result });
});

const notebookIngest = catchAsync(async (req, res) => {
  const {
    source_id: sourceId,
    notebook_id: notebookId,
    source_type: sourceType,
    content,
    url,
    file_path: filePath,
    title,
  } = req.body;

  if (requireBodyField(res, sourceId, 'source_id is required')) return;
  if (requireBodyField(res, notebookId, 'notebook_id is required')) return;

  const result = await withPython('notebook_ingest', {
    source_id: sourceId,
    notebook_id: notebookId,
    source_type: sourceType || 'text',
    content: content || null,
    url: url || null,
    file_path: filePath || null,
    title: title || 'Untitled Source',
  },
    () => ({ chunks: 0, status: 'not_available' })
  );
  res.json({
    source_id: sourceId,
    chunk_count: result.chunk_count ?? result.chunks ?? 0,
    word_count: result.word_count ?? 0,
    extracted_text: result.extracted_text || '',
  });
});

const notebookChat = catchAsync(async (req, res) => {
  const notebookId = req.body.notebook_id || req.body.notebookId;
  const message = req.body.message || req.body.query;
  if (requireBodyField(res, notebookId, 'notebook_id is required')) return;
  if (requireBodyField(res, message, 'message is required')) return;

  const result = await withPython('notebook_chat', {
    notebook_id: notebookId,
    message,
    history: Array.isArray(req.body.history) ? req.body.history : [],
  },
    () => ({ answer: 'Notebook service requires Python ML worker.', citations: [] })
  );
  res.json({
    answer: result.answer,
    sources: result.sources || result.citations || [],
  });
});

const notebookGenerate = catchAsync(async (req, res) => {
  const notebookId = req.body.notebook_id || req.body.notebookId;
  const { type } = req.body;
  if (requireBodyField(res, notebookId, 'notebook_id is required')) return;

  const result = await withPython('notebook_generate', { notebook_id: notebookId, type: type || 'summary' },
    () => ({ content: 'Notebook generation requires Python ML worker.', type })
  );
  res.json({
    title: result.title || String(type || 'summary').replace(/_/g, ' '),
    content: result.content || '',
  });
});

const generateQuiz = catchAsync(async (req, res) => {
  const { topic, count, difficulty } = req.body;
  if (requireBodyField(res, topic, 'topic is required')) return;

  const result = await withPython('generate_quiz', { topic, count: count || 5, difficulty: difficulty || 'medium' },
    () => null
  );
  if (result) return res.json({ success: true, data: result });

  const quiz = await aiProvider.generateJSON(
    `Generate ${count || 5} ${difficulty || 'medium'} difficulty quiz questions about "${topic}". Return JSON: { "questions": [{ "question": "...", "options": ["a","b","c","d"], "correctAnswer": 0, "explanation": "..." }] }`,
    { temperature: 0.4 }
  );
  res.json({ success: true, data: quiz });
});

const codeReview = catchAsync(async (req, res) => {
  const { diff, context } = req.body;
  if (requireBodyField(res, diff, 'diff is required')) return;

  const result = await withPython('code_review', { diff, context },
    async () => {
      const safeDiff = sanitizeForPrompt(diff);
      const review = await aiProvider.generate(
        `Review this code diff:\n${safeDiff}\n\nProvide: 1) Summary 2) Issues 3) Suggestions`,
        { temperature: 0.3 }
      );
      return { review, score: 0 };
    }
  );
  res.json({ success: true, ...result });
});

module.exports = {
  evaluateCode, checkPlagiarism, screenResume, evaluateInterview,
  predictDifficulty, rankSubmissions, notebookIngest, notebookChat,
  notebookGenerate, generateQuiz, codeReview,
};
