'use strict';
const aiProvider = require('./aiProvider.service');
const logger = require('../utils/logger');

const DIFFICULTY_MAP = { easy: 'easy', medium: 'medium', hard: 'hard', 1: 'easy', 2: 'medium', 3: 'hard' };

/**
 * Build the prompt that instructs Gemini to emit quiz JSON.
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
 * Generate a quiz using AI provider with automatic fallback.
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
    logger.warn('Quiz generation failed, using fallback', { error: err.message });
    return buildFallbackQuiz(topic, count, difficulty);
  }

  // Normalise: support both { questions: [...] } and a bare array
  const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

  if (!questions.length) {
    logger.warn('Gemini returned empty questions array, using fallback');
    return buildFallbackQuiz(topic, count, difficulty);
  }

  // Sanitise each question
  const sanitised = questions.slice(0, count).map((q, i) => ({
    question:     String(q.question     || `Question ${i + 1} about ${topic}`),
    options:      Array.isArray(q.options) && q.options.length === 4
                    ? q.options.map(String)
                    : ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3
                    ? q.correctIndex
                    : 0,
    explanation:  String(q.explanation  || 'No explanation provided.'),
    difficulty:   DIFFICULTY_MAP[q.difficulty] || difficulty,
  }));

  return { questions: sanitised };
}

/**
 * Static fallback used when the AI service is unavailable.
 */
function buildFallbackQuiz(topic, count, difficulty) {
  const diff = DIFFICULTY_MAP[difficulty] || 'medium';
  return {
    questions: Array.from({ length: count }, (_, i) => ({
      question:     `What is a fundamental concept in ${topic}? (Question ${i + 1})`,
      options:      ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
      correctIndex: 0,
      explanation:  `This is a placeholder. The AI service returned no content for ${topic}.`,
      difficulty:   diff,
    })),
  };
}

module.exports = { generateQuiz };
