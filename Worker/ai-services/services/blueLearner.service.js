'use strict';
/**
 * BlueLearner Custom Model Service
 *
 * Calls the fine-tuned BlueLearner LLM served by the Python worker.
 * Added to the fallback chain in aiProvider.service.js between
 * the provider chain before Ollama (general local).
 *
 * Environment:
 *   BLUELEARNER_URL  — Python worker URL (default: http://localhost:8002)
 *   BLUELEARNER_ENABLED — set to 'true' to enable (default: false)
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const BASE_URL = process.env.BLUELEARNER_URL || 'http://localhost:8002';

function internalHeaders() {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  return secret ? { 'X-Internal-Service': secret } : {};
}

/**
 * Check if the BlueLearner model endpoint is available
 * @returns {Promise<boolean>}
 */
async function isAvailable() {
  if (process.env.BLUELEARNER_ENABLED !== 'true') return false;
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/bluelearner/status`, {
      timeout: 3000,
      headers: internalHeaders(),
    });
    return res.data?.enabled === true;
  } catch {
    return false;
  }
}

/**
 * Generate text using the fine-tuned BlueLearner model
 * @param {string} prompt
 * @param {object} [opts]
 * @param {number} [opts.maxTokens]
 * @returns {Promise<string>}
 */
async function generate(prompt, opts = {}) {
  const maxTokens = opts.maxTokens ?? 256;

  try {
    logger.info('blueLearner.generate', { promptLength: prompt.length });

    const response = await axios.post(
      `${BASE_URL}/api/v1/bluelearner/generate`,
      { prompt, max_tokens: maxTokens },
      { timeout: 120000, headers: internalHeaders() } // Local model can be slow
    );

    if (typeof response.data.response !== 'string') {
      throw new Error(`BlueLearner returned invalid response type: ${typeof response.data.response}`);
    }

    return response.data.response;
  } catch (error) {
    logger.error('blueLearner.generate failed', { error: error.message });
    throw new Error(`BlueLearner generation failed: ${error.message}`);
  }
}

/**
 * Chat completion using the BlueLearner model
 * @param {Array} messages - Array of {role, content}
 * @param {object} [opts]
 * @returns {Promise<string>}
 */
async function chat(messages, opts = {}) {
  const maxTokens = opts.maxTokens ?? 256;

  try {
    logger.info('blueLearner.chat', { messageCount: messages.length });

    const response = await axios.post(
      `${BASE_URL}/api/v1/bluelearner/chat`,
      { messages, max_tokens: maxTokens },
      { timeout: 120000, headers: internalHeaders() }
    );

    if (typeof response.data.response !== 'string') {
      throw new Error(`BlueLearner returned invalid response type: ${typeof response.data.response}`);
    }

    return response.data.response;
  } catch (error) {
    logger.error('blueLearner.chat failed', { error: error.message });
    throw new Error(`BlueLearner chat failed: ${error.message}`);
  }
}

module.exports = {
  isAvailable,
  generate,
  chat,
};
