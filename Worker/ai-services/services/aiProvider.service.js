'use strict';
/**
 * Unified AI Provider Service
 *
 * Provides a unified interface for local AI generation:
 * 1. BlueLearner (fine-tuned inbuilt model)
 * 2. Local LLM (Ollama) - general local model fallback
 *
 * If neither provider is available, generation fails explicitly.
 */

const config = require('../config');
const logger = require('../utils/logger');
const localLlm = require('./localLlm.service');
const blueLearner = require('./blueLearner.service');

/**
 * Get the best available provider
 * @returns {Promise<{type: string, available: boolean}>}
 */
async function getProvider() {
  const blueLearnerAvailable = await blueLearner.isAvailable();
  if (blueLearnerAvailable) {
    return { type: 'bluelearner', available: true };
  }

  const localAvailable = await localLlm.isAvailable();
  if (localAvailable) {
    return { type: 'local', available: true };
  }

  return { type: 'unavailable', available: false };
}

/**
 * Generate text using best available provider
 * @param {string} prompt
 * @param {object} [opts]
 * @param {number} [opts.maxTokens]
 * @param {number} [opts.temperature]
 * @param {string} [opts.provider] - Force provider: 'bluelearner', 'local', or 'auto'
 * @returns {Promise<string>}
 */
async function generate(prompt, opts = {}) {
  const provider = opts.provider || 'auto';

  if (provider === 'gemini') {
    throw new Error('Gemini provider is disabled. Use bluelearner, local, or auto.');
  }

  // Try BlueLearner (fine-tuned custom model) first.
  if (provider === 'auto' || provider === 'bluelearner') {
    try {
      const result = await blueLearner.generate(prompt, opts);
      logger.info('aiProvider.generate: BlueLearner success');
      return result;
    } catch (error) {
      logger.warn('aiProvider.generate: BlueLearner failed', { error: error.message });
      if (provider === 'bluelearner') throw error;
    }
  }

  // Try Local LLM (Ollama) as fallback.
  if (provider === 'auto' || provider === 'local') {
    try {
      const result = await localLlm.generate(prompt, opts);
      logger.info('aiProvider.generate: Local LLM success');
      return result;
    } catch (error) {
      logger.warn('aiProvider.generate: Local LLM failed', { error: error.message });
      if (provider === 'local') throw error;
    }
  }

  throw new Error('No local AI provider available. Enable BlueLearner or configure Ollama.');
}

/**
 * Generate JSON response using best available provider
 * @param {string} prompt
 * @param {object} [opts]
 * @returns {Promise<object>}
 */
async function generateJSON(prompt, opts = {}) {
  // Add JSON instruction if not present
  const jsonPrompt = prompt.includes('JSON')
    ? prompt
    : `${prompt}\n\nRespond with ONLY valid JSON. No markdown code blocks, no extra text.`;

  const raw = await generate(jsonPrompt, opts);

  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract the first {...} or [...] block
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch { /* fall through */ }
    }
    logger.warn('aiProvider.generateJSON failed to parse', { raw: raw.slice(0, 200) });
    throw new Error(`AI returned non-JSON response: ${raw.slice(0, 120)}`);
  }
}

/**
 * Chat completion using best available provider
 * @param {Array} messages - Array of {role, content} objects
 * @param {object} [opts]
 * @returns {Promise<string>}
 */
async function chat(messages, opts = {}) {
  const provider = opts.provider || 'auto';

  if (provider === 'gemini') {
    throw new Error('Gemini provider is disabled. Use bluelearner, local, or auto.');
  }

  // Try BlueLearner first fallback
  if (provider === 'auto' || provider === 'bluelearner') {
    try {
      const result = await blueLearner.chat(messages, opts);
      logger.info('aiProvider.chat: BlueLearner success');
      return result;
    } catch (error) {
      logger.warn('aiProvider.chat: BlueLearner failed', { error: error.message });
      if (provider !== 'auto') throw error;
    }
  }

  // Try Local LLM (native chat support)
  if (provider === 'auto' || provider === 'local') {
    try {
      const result = await localLlm.chat(messages, opts);
      logger.info('aiProvider.chat: Local LLM success');
      return result;
    } catch (error) {
      logger.warn('aiProvider.chat: Local LLM failed', { error: error.message });
      throw error;
    }
  }

  throw new Error('No AI provider available for chat');
}

module.exports = {
  generate,
  generateJSON,
  chat,
  getProvider,
};
