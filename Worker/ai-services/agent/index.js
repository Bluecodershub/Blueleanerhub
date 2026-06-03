'use strict';
// Ported from ai-agent/agent.py
// Provides a programmable agent interface (not interactive REPL).
// The OpenClaw SDK is not on npm, so we back every action with the inbuilt model provider.
const aiProvider = require('../services/aiProvider.service');
const logger = require('../utils/logger');

const AGENT_PROMPT = `You are an intelligent development assistant (DevAgent) for a software team.
You help with: scaffolding code, code generation, documentation, and deployment orchestration.
Be concise, technical, and actionable.`;

/**
 * Main agent entry point.
 * @param {string} prompt   The user's instruction
 * @returns {Promise<string>}
 */
async function ask(prompt) {
  if (!prompt) return 'No prompt provided.';
  logger.info('agent.ask', { prompt: prompt.slice(0, 80) });

  const lower = prompt.toLowerCase();

  if (/scaffold/.test(lower))  return scaffold(prompt);
  if (/deploy/.test(lower))    return deploy(prompt);
  if (/document/.test(lower))  return document(prompt);
  if (/generate/.test(lower))  return generateCode(prompt);

  return aiProvider.generate(`${AGENT_PROMPT}\n\nInstruction: ${prompt}`);
}

async function scaffold(instruction) {
  return aiProvider.generate(
    `${AGENT_PROMPT}\n\nScaffold the following. Output file names and complete code:\n${instruction}`
  );
}

async function generateCode(instruction) {
  return aiProvider.generate(
    `${AGENT_PROMPT}\n\nGenerate production-ready code for:\n${instruction}`
  );
}

async function document(instruction) {
  return aiProvider.generate(
    `${AGENT_PROMPT}\n\nWrite clear technical documentation for:\n${instruction}`
  );
}

async function deploy(instruction) {
  return aiProvider.generate(
    `${AGENT_PROMPT}\n\nProvide a step-by-step deployment plan for:\n${instruction}`
  );
}

module.exports = { ask, scaffold, generateCode, document, deploy };
