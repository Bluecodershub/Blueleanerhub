/**
 * AI Core Bridge — In-process adapter for AI_core/ai-services
 * =============================================================
 * Loads the Node.js CommonJS modules from Worker/ai-services directly
 * (no HTTP call, no separate process) and re-exports them with TypeScript
 * types so the rest of the backend can stay fully typed.
 *
 * Relative path after tsc compilation:
 *   dist/services/aiCoreBridge.service.js
 *   → ../../../Worker/ai-services/services/*.js
 *
 * Fallback: if worker modules fail to load
 * in dev), every function falls back to calling AI_SERVICE_URL via HTTP so
 * the provider-abstraction in ai.service.ts continues working unchanged.
 */

import axios from 'axios';
import logger from '../utils/logger';

// ── Typed shapes for AI_core exports ─────────────────────────────────────────

interface AIProviderService {
  generate:     (prompt: string, opts?: { temperature?: number; maxTokens?: number }) => Promise<string>;
  generateJSON: (prompt: string, opts?: { temperature?: number; maxTokens?: number }) => Promise<unknown>;
}

interface QuizService {
  generateQuiz: (params: {
    topic:       string;
    count?:      number;
    difficulty?: string;
    context?:    string;
  }) => Promise<{ questions: QuizQuestion[] }>;
}

interface AgentService {
  runCommand: (command: string, agentType?: string) => Promise<{ agent: string; result: string }>;
}

export interface QuizQuestion {
  question:     string;
  options:      string[];
  correctIndex: number;
  explanation:  string;
  difficulty:   'easy' | 'medium' | 'hard';
}

// ── Load AI_core modules (safe require — never crashes the backend) ───────────

function loadModule<T>(relativePath: string, label: string): T | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(relativePath) as T;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`[AICoreBridge] Could not load ${label}: ${msg}. HTTP fallback active.`);
    return null;
  }
}

const aiProviderMod = loadModule<AIProviderService>('../../../Worker/ai-services/services/aiProvider.service', 'aiProvider.service');
const quizMod       = loadModule<QuizService>  ('../../../Worker/ai-services/services/quiz.service',       'quiz.service');
const agentMod      = loadModule<AgentService> ('../../../Worker/ai-services/services/agent.service',      'agent.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET;

function internalHeaders(): Record<string, string> {
  return INTERNAL_SECRET ? { 'X-Internal-Service': INTERNAL_SECRET } : {};
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a free-text AI response.
 * Tries the in-process provider first; falls back to HTTP if unavailable.
 */
export async function generate(
  prompt: string,
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  if (aiProviderMod) {
    return aiProviderMod.generate(prompt, opts);
  }
  // HTTP fallback → AI_core/ai-services running as separate service
  const { data } = await axios.post<{ response: string }>(`${AI_SERVICE_URL}/api/ai/generate`, { prompt }, { headers: internalHeaders() });
  return data.response;
}

/**
 * Generate structured quiz questions for a topic.
 * Tries in-process quiz service first; falls back to HTTP if unavailable.
 */
export async function generateQuizQuestions(params: {
  topic:       string;
  count?:      number;
  difficulty?: string;
  context?:    string;
}): Promise<{ questions: QuizQuestion[] }> {
  if (quizMod) {
    return quizMod.generateQuiz(params);
  }
  const { data } = await axios.post<{ questions: QuizQuestion[] }>(
    `${AI_SERVICE_URL}/api/v1/ai/quiz/generate`,
    { topic: params.topic, count: params.count, difficulty: params.difficulty, context: params.context },
    { headers: internalHeaders() }
  );
  return { questions: data.questions };
}

/**
 * Run a command through the multi-agent orchestrator.
 * Tries in-process agent service first; falls back to HTTP if unavailable.
 */
export async function runAgentCommand(
  command: string,
  agentType?: string
): Promise<{ agent: string; result: string }> {
  if (agentMod) {
    return agentMod.runCommand(command, agentType);
  }
  const { data } = await axios.post<{ agent: string; result: string }>(
    `${AI_SERVICE_URL}/api/agent/run`,
    { command, agent_type: agentType },
    { headers: internalHeaders() }
  );
  return data;
}

/** True when the provider module loaded in-process. */
export const isInProcess = aiProviderMod !== null;
