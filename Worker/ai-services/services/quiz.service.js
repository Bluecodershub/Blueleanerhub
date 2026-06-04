'use strict';
const aiProvider = require('./aiProvider.service');
const logger = require('../utils/logger');

const DIFFICULTY_MAP = { easy: 'easy', medium: 'medium', hard: 'hard', 1: 'easy', 2: 'medium', 3: 'hard' };

/**
 * Build the prompt that instructs the active local AI provider to emit quiz JSON.
 */
function buildQuizPrompt({ topic, count = 5, difficulty = 'medium', context = '' }) {
  const diff = DIFFICULTY_MAP[difficulty] || 'medium';
  return `You are an expert quiz generator for a technical learning platform.

Generate exactly ${count} multiple-choice questions about "${topic}".
Difficulty: ${diff}. ${context ? `\nContext: ${context}` : ''}

Rules:
- Each question must have exactly 4 options (A, B, C, D).
- correctIndex is the 0-based index of the correct option (0=A, 1=B, 2=C, 3=D).
- Mix difficulties slightly: some easy, mostly ${diff}, some harder.
- explanation must be 1-2 clear sentences explaining why the answer is correct.
- All questions must be factually accurate and unambiguous.

Respond with ONLY valid JSON — no markdown, no extra text:
{
  "questions": [
    {
      "question": "...",
      "options": ["A text", "B text", "C text", "D text"],
      "correctIndex": 0,
      "explanation": "...",
      "difficulty": "${diff}"
    }
  ]
}`;
}

/**
 * Generate a quiz using the active AI provider.
 * @param {object} params
 * @param {string} params.topic
 * @param {number} [params.count=5]
 * @param {string} [params.difficulty='medium']
 * @param {string} [params.context]
 * @param {string} [params.provider] - Force provider: 'gemini', 'local', or 'auto'
 * @returns {Promise<{questions: Array}>}
 */
async function generateQuiz({ topic, count = 5, difficulty = 'medium', context = '', provider = 'auto' }) {
  logger.info('quiz.generate', { topic, count, difficulty, provider });

  const prompt = buildQuizPrompt({ topic, count, difficulty, context });

  let parsed;
  try {
    parsed = await aiProvider.generateJSON(prompt, { temperature: 0.6, provider });
  } catch (err) {
    logger.warn('Quiz generation failed', { error: err.message });
    throw err;
  }

  // Normalise: support both { questions: [...] } and a bare array
  const questions = Array.isArray(parsed)
    ? parsed
    : (parsed && Array.isArray(parsed.questions) ? parsed.questions : []);

  if (!questions.length) {
    throw new Error('AI provider returned no quiz questions');
  }

  const sanitised = questions.slice(0, count).map((q, i) => normaliseQuestion(q, i, difficulty));
  if (sanitised.length !== count) {
    throw new Error(`AI provider returned ${sanitised.length}/${count} quiz questions`);
  }

  return { questions: sanitised };
}

function normaliseOptions(options) {
  if (Array.isArray(options)) {
    return options.map((option) => String(option).trim()).filter(Boolean);
  }

  if (options && typeof options === 'object') {
    return ['A', 'B', 'C', 'D']
      .map((key) => options[key])
      .map((option) => (option == null ? '' : String(option).trim()))
      .filter(Boolean);
  }

  return [];
}

function normaliseCorrectIndex(q) {
  if (Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3) {
    return q.correctIndex;
  }

  if (typeof q.correct_answer === 'string') {
    const answer = q.correct_answer.trim().toUpperCase();
    const index = ['A', 'B', 'C', 'D'].indexOf(answer);
    if (index !== -1) return index;
  }

  return -1;
}

function normaliseQuestion(q, index, fallbackDifficulty) {
  if (!q || typeof q !== 'object') {
    throw new Error(`Question ${index + 1} is not an object`);
  }

  const question = typeof q.question === 'string' ? q.question.trim() : '';
  const options = normaliseOptions(q.options);
  const correctIndex = normaliseCorrectIndex(q);
  const explanation = typeof q.explanation === 'string' ? q.explanation.trim() : '';
  const diff = DIFFICULTY_MAP[q.difficulty] || DIFFICULTY_MAP[fallbackDifficulty] || 'medium';

  if (!question) throw new Error(`Question ${index + 1} is missing text`);
  if (options.length !== 4) throw new Error(`Question ${index + 1} must have exactly 4 options`);
  if (correctIndex < 0) throw new Error(`Question ${index + 1} has an invalid correct answer`);
  if (!explanation) throw new Error(`Question ${index + 1} is missing an explanation`);

  return {
    question,
    options,
    correctIndex,
    explanation,
    difficulty: diff,
  };
}

module.exports = { generateQuiz };
