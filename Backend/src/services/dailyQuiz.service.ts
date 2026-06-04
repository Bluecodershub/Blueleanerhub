/**
 * Daily Quiz Cron Service
 * =======================
 * Generates domain-specific AI quizzes every day at midnight.
 * Uses the Python AI orchestrator → QuizGeneratorAgent.
 *
 * Schedule: 0 0 * * *  (midnight UTC)
 */

import axios from 'axios';
import logger from '../utils/logger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const ENABLE_DAILY_QUIZ_CRON = process.env.ENABLE_DAILY_QUIZ_CRON !== 'false';
const DAILY_QUIZ_WARMUP_ON_START = process.env.DAILY_QUIZ_WARMUP_ON_START === 'true';

const DOMAINS = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js',
  'PostgreSQL', 'Docker', 'Machine Learning', 'Data Structures',
  'System Design', 'Finance', 'Mechanical Engineering',
];

export interface DailyQuiz {
  domain:     string;
  date:       string;   // ISO date YYYY-MM-DD
  questions:  MCQ[];
}

export interface MCQ {
  question:     string;
  options:      string[];
  correctIndex: number;   // NEVER send to client
  explanation:  string;   // Sent only after submission
  difficulty:   'easy' | 'medium' | 'hard';
}

/**
 * Safe public shape — no correctIndex, no explanation.
 * This is the ONLY shape the frontend ever receives before submission.
 */
export interface MCQPublic {
  question:   string;
  options:    string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface DailyQuizPublic {
  domain:     string;
  date:       string;
  questions:  MCQPublic[];
}

/** XP per correct answer keyed by difficulty */
const XP_PER_DIFFICULTY: Record<MCQ['difficulty'], number> = {
  easy:   10,
  medium: 20,
  hard:   30,
};

/**
 * Strip correctIndex and explanation before sending to the client.
 * The server keeps the original DailyQuiz in its cache and uses it for scoring.
 */
export function getPublicQuiz(quiz: DailyQuiz): DailyQuizPublic {
  return {
    domain:    quiz.domain,
    date:      quiz.date,
    questions: quiz.questions.map(({ question, options, difficulty }) => ({
      question,
      options,
      difficulty,
    })),
  };
}

export interface ScoreResult {
  correctCount:   number;
  score:          number;   // 0–100 percentage
  xpEarned:       number;
  correctAnswers: number[]; // indices, revealed only after submission
  explanations:   string[]; // revealed only after submission
}

/**
 * Score a quiz server-side.
 * answers[] must have the same length as quiz.questions[].
 * Any out-of-range index is treated as wrong.
 */
export function scoreQuiz(quiz: DailyQuiz, answers: number[]): ScoreResult {
  let correctCount = 0;
  let xpEarned     = 0;

  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctIndex) {
      correctCount++;
      xpEarned += XP_PER_DIFFICULTY[q.difficulty] ?? 10;
    }
  });

  return {
    correctCount,
    score:          Math.round((correctCount / quiz.questions.length) * 100),
    xpEarned,
    correctAnswers: quiz.questions.map((q) => q.correctIndex),
    explanations:   quiz.questions.map((q) => q.explanation),
  };
}

// In-memory cache — keyed by `${domain}:${date}`
const MAX_CACHE_SIZE = 100;
const CACHE_ENTRY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

const quizCache = new Map<string, CacheEntry<DailyQuiz>>();

function normalizeDifficulty(value: unknown): MCQ['difficulty'] | null {
  const difficulty = typeof value === 'string' ? value.toLowerCase() : '';
  if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') {
    return difficulty;
  }
  return null;
}

function normalizeQuestion(value: unknown, index: number): MCQ {
  if (!value || typeof value !== 'object') {
    throw new Error(`Question ${index + 1} is not an object`);
  }

  const raw = value as {
    question?: unknown;
    options?: unknown;
    correctIndex?: unknown;
    explanation?: unknown;
    difficulty?: unknown;
  };

  const question = typeof raw.question === 'string' ? raw.question.trim() : '';
  const options = Array.isArray(raw.options)
    ? raw.options.map((option) => (typeof option === 'string' ? option.trim() : '')).filter(Boolean)
    : [];
  const correctIndex = Number(raw.correctIndex);
  const explanation = typeof raw.explanation === 'string' ? raw.explanation.trim() : '';
  const difficulty = normalizeDifficulty(raw.difficulty);

  if (!question) throw new Error(`Question ${index + 1} is missing text`);
  if (options.length !== 4) throw new Error(`Question ${index + 1} must have exactly 4 options`);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    throw new Error(`Question ${index + 1} has an invalid correctIndex`);
  }
  if (!explanation) throw new Error(`Question ${index + 1} is missing an explanation`);
  if (!difficulty) throw new Error(`Question ${index + 1} has an invalid difficulty`);

  return { question, options, correctIndex, explanation, difficulty };
}

function normalizeQuestions(value: unknown, expectedCount: number): MCQ[] {
  if (!Array.isArray(value)) {
    throw new Error('AI quiz response did not include a questions array');
  }

  const questions = value.slice(0, expectedCount).map(normalizeQuestion);
  if (questions.length !== expectedCount) {
    throw new Error(`AI quiz response included ${questions.length}/${expectedCount} questions`);
  }

  return questions;
}

function cleanupCache(): void {
  const now = Date.now();
  let removed = 0;
  
  for (const [key, entry] of quizCache.entries()) {
    if (now - entry.createdAt > CACHE_ENTRY_TTL_MS) {
      quizCache.delete(key);
      removed++;
    }
  }

  // Also enforce max size by removing oldest entries
  if (quizCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(quizCache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);
    
    const toRemove = quizCache.size - MAX_CACHE_SIZE;
    for (let i = 0; i < toRemove; i++) {
      quizCache.delete(entries[i][0]);
      removed++;
    }
  }

  if (removed > 0) {
    logger.info(`[DailyQuiz] Cache cleanup: removed ${removed} entries, ${quizCache.size} remaining`);
  }
}

// Start automatic cleanup every hour
const cacheCleanupInterval = setInterval(cleanupCache, 60 * 60 * 1000);
cacheCleanupInterval.unref?.();

// ─── Generator ────────────────────────────────────────────────────────────────

async function generateQuizForDomain(domain: string, date: string): Promise<DailyQuiz> {
  const cacheKey = `${domain}:${date}`;
  const cached = quizCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.createdAt) < CACHE_ENTRY_TTL_MS) {
    return cached.value;
  }

  // Enforce max cache size before adding new entry
  if (quizCache.size >= MAX_CACHE_SIZE) {
    cleanupCache();
  }

  try {
    const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
    const { data } = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/quiz/generate`, {
      topic:       domain,
      count:       5,
      difficulty:  'medium',
      context:     `Daily practice quiz for ${domain}. Date: ${date}. Mix easy, medium, hard questions.`,
    }, {
      timeout: 30_000,
      headers: internalSecret ? { 'X-Internal-Service': internalSecret } : {},
    });

    const payload = data as { questions?: unknown };
    const quiz: DailyQuiz = {
      domain,
      date,
      questions: normalizeQuestions(payload.questions, 5),
    };

    quizCache.set(cacheKey, { value: quiz, createdAt: Date.now() });
    logger.info(`Daily quiz generated: ${domain} (${date})`);
    return quiz;
  } catch (err) {
    logger.warn(`Daily quiz AI generation failed for ${domain}`, {
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

// ─── Cron Job ─────────────────────────────────────────────────────────────────

export async function runDailyQuizGeneration(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  logger.info(`[DailyQuiz] Generating quizzes for ${today}…`);

  // Pre-warm all domain quizzes in parallel (with concurrency cap)
  const BATCH = 3;
  for (let i = 0; i < DOMAINS.length; i += BATCH) {
    const batch = DOMAINS.slice(i, i + BATCH);
    await Promise.all(batch.map((d) => generateQuizForDomain(d, today)));
  }

  logger.info(`[DailyQuiz] All ${DOMAINS.length} quizzes ready for ${today}`);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getDailyQuiz(domain: string): Promise<DailyQuiz> {
  const today = new Date().toISOString().slice(0, 10);
  return generateQuizForDomain(domain, today);
}

export function getAvailableDomains(): string[] {
  return DOMAINS;
}

// ─── Scheduler Setup ─────────────────────────────────────────────────────────
// Call this once at server startup to register the cron

export function initDailyQuizCron(): void {
  if (!ENABLE_DAILY_QUIZ_CRON) {
    logger.info('[DailyQuiz] Cron disabled by ENABLE_DAILY_QUIZ_CRON=false');
    return;
  }

  try {
    // Dynamic require so the server doesn't crash if node-cron isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cron = require('node-cron');

    // Run at midnight UTC every day
    cron.schedule('0 0 * * *', async () => {
      await runDailyQuizGeneration();
    }, { timezone: 'UTC' });

    logger.info('[DailyQuiz] Cron scheduled: 0 0 * * * UTC');

    if (DAILY_QUIZ_WARMUP_ON_START) {
      runDailyQuizGeneration().catch((err) => logger.error('[DailyQuiz] Startup warmup failed', err));
    }
  } catch (err) {
    logger.warn('[DailyQuiz] node-cron not available — daily quiz cron disabled. Install: npm i node-cron @types/node-cron');
  }
}
