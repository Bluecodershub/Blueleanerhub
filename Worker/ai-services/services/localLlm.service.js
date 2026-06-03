'use strict';
/**
 * Local LLM Service (Ollama Integration)
 *
 * Provides fallback AI capabilities when Gemini API is unavailable.
 * This replaces the deprecated bridge.js with integrated service logic.
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Check if Ollama is available
 * @returns {Promise<boolean>}
 */
async function isAvailable() {
  if (!config.ollama.url) return false;
  try {
    const response = await axios.get(`${config.ollama.url}/api/tags`, { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Generate text using local LLM (Ollama)
 * @param {string} prompt
 * @param {object} [opts]
 * @param {string} [opts.model]
 * @param {number} [opts.temperature]
 * @returns {Promise<string>}
 */
async function generate(prompt, opts = {}) {
  if (!config.ollama.url) {
    throw new Error('OLLAMA_URL not configured');
  }

  const model = opts.model || config.ollama.model;
  const temperature = opts.temperature ?? 0.7;

  try {
    logger.info('localLlm.generate', { model, promptLength: prompt.length });

    const response = await axios.post(
      `${config.ollama.url}/api/generate`,
      {
        model,
        prompt,
        stream: false,
        options: {
          temperature,
        },
      },
      { timeout: 60000 } // Local models can be slow
    );

    return response.data.response;
  } catch (error) {
    logger.error('localLlm.generate failed', { error: error.message });
    throw new Error(`Local LLM generation failed: ${error.message}`);
  }
}

/**
 * Chat completion using local LLM
 * @param {Array} messages - Array of {role, content} objects
 * @param {object} [opts]
 * @returns {Promise<string>}
 */
async function chat(messages, opts = {}) {
  if (!config.ollama.url) {
    throw new Error('OLLAMA_URL not configured');
  }

  const model = opts.model || config.ollama.model;

  try {
    logger.info('localLlm.chat', { model, messageCount: messages.length });

    const response = await axios.post(
      `${config.ollama.url}/api/chat`,
      {
        model,
        messages,
        stream: false,
      },
      { timeout: 60000 }
    );

    return response.data.message?.content || '';
  } catch (error) {
    logger.error('localLlm.chat failed', { error: error.message });
    throw new Error(`Local LLM chat failed: ${error.message}`);
  }
}

/**
 * Generate JSON response using local LLM
 * @param {string} prompt
 * @param {object} [opts]
 * @returns {Promise<object>}
 */
async function generateJSON(prompt, opts = {}) {
  const modifiedPrompt = `${prompt}

IMPORTANT: Respond with ONLY valid JSON. Do not include markdown code blocks, explanations, or any other text. Just the raw JSON.`;

  const raw = await generate(modifiedPrompt, opts);

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
    logger.warn('localLlm.generateJSON failed to parse response', { raw: raw.slice(0, 200) });
    throw new Error(`Local LLM returned non-JSON response: ${raw.slice(0, 120)}`);
  }
}

/**
 * Get available models from Ollama
 * @returns {Promise<Array>}
 */
async function listModels() {
  if (!config.ollama.url) {
    return [];
  }

  try {
    const response = await axios.get(`${config.ollama.url}/api/tags`, { timeout: 5000 });
    return response.data.models || [];
  } catch (error) {
    logger.warn('localLlm.listModels failed', { error: error.message });
    return [];
  }
}

module.exports = {
  isAvailable,
  generate,
  chat,
  generateJSON,
  listModels,
};
