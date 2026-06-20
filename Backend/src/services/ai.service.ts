/**
 * AI Service — Provider Abstraction Layer
 * ========================================
 *
 * This module exposes a single `aiService` singleton whose methods (chatAssistant,
 * chatAssistantStream, generateQuiz) are backed by whichever AI provider is
 * configured at startup.
 *
 * HOW TO CHANGE THE PROVIDER
 * ---------------------------
 * Set the AI_PROVIDER environment variable:
 *   AI_PROVIDER=local    -> BlueLearnerHub inbuilt/local model gateway
 *
 * HOW TO ADD A NEW PROVIDER (e.g. OpenAI)
 * ----------------------------------------
 * 1. Implement the AIProvider interface below.
 * 2. Add a case in buildProvider() that returns your class.
 * 3. Set AI_PROVIDER=<your-key> in the environment.
 *
 * HOW TO SCALE THE LOCAL LLM LAYER
 * ----------------------------------
 * The local provider forwards requests to the Node ai-services gateway
 * (AI_SERVICE_URL). To scale horizontally, run multiple replicas of that
 * service and point AI_SERVICE_URL at a load balancer.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import { generate as coreGenerate } from './aiCoreBridge.service';

function internalHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  return secret ? { 'X-Internal-Service': secret } : {};
}

// ---------------------------------------------------------------------------
// Provider interface — every backend must implement this
// ---------------------------------------------------------------------------

interface AIProvider {
  readonly name: string;
  chatAssistant(query: string, context: Record<string, unknown>): Promise<string>;
  chatAssistantStream(
    query: string,
    context: Record<string, unknown>,
    persona?: 'tutor' | 'technical' | 'manager' | 'career' | 'competition'
  ): Promise<AsyncIterable<{ text(): string }>>;
  generateQuiz(domain: string, level: number, performance: string): Promise<{ questions: unknown[] } | null>;
  generate(prompt: string): Promise<string>;
}

// ---------------------------------------------------------------------------
// Disabled hosted provider shim
// ---------------------------------------------------------------------------

class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private genAI!: GoogleGenerativeAI;

  constructor() {
    throw new Error('Gemini provider is disabled. Use AI_PROVIDER=local for the inbuilt model service.');
  }

  async generateQuiz(domain: string, level: number, performance: string) {
    try {
      const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'medium', 3: 'hard', 4: 'expert' };
      const difficulty = difficultyMap[level] || 'medium';

      const response = await axios.post(`${config.aiServiceUrl}/api/v1/quiz/generate`, {
        topic: domain,
        difficulty,
        num_questions: 5,
        context: performance,
      }, { headers: internalHeaders() });

      const questions = response.data.questions.map((q: any) => ({
        type: q.question_type || 'multiple_choice',
        content: q.question,
        options: [q.options.A, q.options.B, q.options.C, q.options.D],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      }));

      return { questions };
    } catch (error) {
      logger.error('DisabledHostedProvider: generateQuiz failed', error);
      return null;
    }
  }

  async chatAssistantStream(
    query: string,
    context: Record<string, unknown>,
    persona: 'tutor' | 'technical' | 'manager' | 'career' | 'competition' = 'tutor'
  ) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const systemPrompts = {
      tutor: 'You are the BLUELEARNERHUB AI Tutor. Simplify concepts and guide students with Socratic questioning.',
      technical: 'You are the BLUELEARNERHUB Engineering Lead. Provide high-performance code and architecture critiques.',
      manager: 'You are the BLUELEARNERHUB Management Consultant. Focus on ROI, strategy, and Agile/Scrum.',
      career: 'You are the BLUELEARNERHUB Career Accelerator. Help with resumes, portfolios, and interviews.',
      competition: 'You are the BLUELEARNERHUB Hackathon Strategist. Focus on rapid prototyping and winning features.',
    };

    const prompt = `
      ${systemPrompts[persona]}

      USER_CONTEXT:
      - Name: ${(context.userName as string) || 'Learner'}
      - Domain: ${(context.domain as string) || 'General'}
      - Level: ${(context.level as string) || 1}
      - Page: ${(context.path as string) || 'Dashboard'}

      Current Query: ${query}

      Respond in Markdown. Be concise but impactful.
    `;

    const result = await model.generateContentStream(prompt);
    return result.stream;
  }

  async chatAssistant(query: string, context: Record<string, unknown>) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
      User: ${query}
      Context: ${JSON.stringify(context)}
      Role: You are the BLUELEARNERHUB AI Assistant.
    `;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  }

  async generate(prompt: string): Promise<string> {
    // Route through AI_core bridge with HTTP fallback.
    return coreGenerate(prompt);
  }
}

// ---------------------------------------------------------------------------
// Local LLM provider — delegates to the Python ai-services FastAPI app
// which runs AIR LLM (see ai-services/app/ai/airllm_service.py)
// ---------------------------------------------------------------------------

/**
 * A minimal SSE-compatible iterable so LocalLLMProvider.chatAssistantStream
 * honours the same interface as the Gemini streaming API.
 */
class SingleChunkIterable implements AsyncIterable<{ text(): string }> {
  constructor(private content: string) {}

  [Symbol.asyncIterator]() {
    let done = false;
    const content = this.content;
    return {
      async next() {
        if (done) return { value: undefined, done: true as const };
        done = true;
        return { value: { text: () => content }, done: false as const };
      },
    };
  }
}

class LocalLLMProvider implements AIProvider {
  readonly name = 'local-airllm';

  /** Base URL of the Node ai-services gateway. */
  private serviceUrl: string;

  constructor() {
    // AI_SERVICE_URL defaults to the same value used by other service calls
    this.serviceUrl = process.env.AI_SERVICE_URL || config.aiServiceUrl || 'http://localhost:8000';
    logger.info(`[LocalLLMProvider] Routing AI requests to ${this.serviceUrl}/api/v1/chat`);
  }

  async chatAssistant(query: string, context: Record<string, unknown>) {
    const prompt = this.buildPrompt(query, context);
    const { data } = await axios.post<{ response: string }>(
      `${this.serviceUrl}/api/v1/chat`,
      { prompt, max_new_tokens: 512 },
      { headers: internalHeaders() }
    );
    return data.response;
  }

  async chatAssistantStream(
    query: string,
    context: Record<string, unknown>,
    _persona?: string
  ) {
    // The local model does not yet support token streaming; we return the full
    // response wrapped in a single-chunk iterable to keep the interface uniform.
    // To add streaming: implement SSE/chunked transfer in the Python service and
    // consume it here with an async generator.
    const text = await this.chatAssistant(query, context);
    return new SingleChunkIterable(text);
  }

  async generateQuiz(domain: string, level: number, performance: string) {
    // Quiz generation routes through the structured inbuilt-model quiz endpoint.
    try {
      const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'medium', 3: 'hard', 4: 'expert' };
      const { data } = await axios.post(`${this.serviceUrl}/api/v1/quiz/generate`, {
        topic: domain,
        difficulty: difficultyMap[level] || 'medium',
        num_questions: 5,
        context: performance,
      }, { headers: internalHeaders() });
      const questions = data.questions.map((q: any) => ({
        type: q.question_type || 'multiple_choice',
        content: q.question,
        options: [q.options.A, q.options.B, q.options.C, q.options.D],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      }));
      return { questions };
    } catch (error) {
      logger.error('LocalLLMProvider: generateQuiz failed', error);
      return null;
    }
  }

  async generate(prompt: string): Promise<string> {
    return coreGenerate(prompt);
  }

  /** Build a plain-text prompt that Mistral / Llama instruction models understand. */
  private buildPrompt(query: string, context: Record<string, unknown>): string {
    return [
      '<s>[INST]',
      'You are the BLUELEARNERHUB AI Assistant — an expert tutor and career advisor.',
      `User name: ${(context.userName as string) || 'Learner'}`,
      `Domain: ${(context.domain as string) || 'General'}`,
      `Level: ${(context.level as string) || '1'}`,
      '',
      query,
      '[/INST]',
    ].join('\n');
  }
}

// ---------------------------------------------------------------------------
// Provider factory
// ---------------------------------------------------------------------------

function buildProvider(): AIProvider {
  const providerKey = (process.env.AI_PROVIDER || 'local').toLowerCase();

  switch (providerKey) {
    case 'local':
    case 'airllm':
      logger.info('[AIService] Using local AIR LLM provider');
      return new LocalLLMProvider();

    case 'gemini':
      logger.warn('[AIService] AI_PROVIDER=gemini is disabled; using local inbuilt model provider');
      return new LocalLLMProvider();

    default:
      logger.info('[AIService] Using local inbuilt model provider');
      return new LocalLLMProvider();
  }
}

// ---------------------------------------------------------------------------
// Public AIService facade — keeps existing callers unchanged
// ---------------------------------------------------------------------------

export class AIService {
  private provider: AIProvider;

  constructor() {
    this.provider = buildProvider();
  }

  get providerName(): string {
    return this.provider.name;
  }

  generateQuiz(domain: string, level: number, performance: string) {
    return this.provider.generateQuiz(domain, level, performance);
  }

  chatAssistantStream(
    query: string,
    context: Record<string, unknown>,
    persona: 'tutor' | 'technical' | 'manager' | 'career' | 'competition' = 'tutor'
  ) {
    return this.provider.chatAssistantStream(query, context, persona);
  }

  chatAssistant(query: string, context: Record<string, unknown>) {
    return this.provider.chatAssistant(query, context);
  }

  /**
   * General-purpose text generation.
   * Powers POST /api/ai/generate — routes through AI_core/ai-services in-process.
   */
  generate(prompt: string): Promise<string> {
    return this.provider.generate(prompt);
  }
}

// Singleton — instantiated once when the backend process starts
export const aiService = new AIService();

// ---------------------------------------------------------------------------
// Structured AI submission review (Python FastAPI: POST /api/v1/ai-review)
// ---------------------------------------------------------------------------

export interface AIReviewPayload {
  submission_type: 'code' | 'assignment' | 'project' | 'capstone' | 'hackathon';
  content: string;
  language?: string;
  context?: string;
}

/**
 * Calls the AI service's structured review endpoint. Throws on transport error
 * or when the model is unavailable (503) so callers can surface an honest
 * "AI review unavailable" message — never a fabricated review.
 */
export async function reviewSubmissionViaAI(payload: AIReviewPayload): Promise<any> {
  const serviceUrl = process.env.AI_SERVICE_URL || config.aiServiceUrl || 'http://localhost:8000';
  const { data } = await axios.post(`${serviceUrl}/api/v1/ai-review`, payload, {
    headers: internalHeaders(),
    timeout: 60_000,
  });
  return data;
}
