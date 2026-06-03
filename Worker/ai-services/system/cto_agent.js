'use strict';
// Ported from ai_system/cto_agent.py
const aiProvider = require('../services/aiProvider.service');

const SYSTEM_PROMPT = `You are a CTO AI assistant for a software company. You provide expert advice on
software architecture, infrastructure, deployment strategies, security, and technical debt.
Be concise and actionable.`;

async function handle(command) {
  const lower = command.toLowerCase();

  if (/analyze.*(arch|system|design)/.test(lower)) return analyzeArchitecture(command);
  if (/recommend|improve/.test(lower))              return recommendImprovements(command);
  if (/deploy/.test(lower))                         return triggerDeployment(command);
  if (/monitor|health/.test(lower))                 return monitorHealth(command);

  return aiProvider.generate(`${SYSTEM_PROMPT}\n\nCommand: ${command}`);
}

async function analyzeArchitecture(command) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nAnalyze this architecture concern and provide recommendations:\n${command}`
  );
}

async function recommendImprovements(command) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nSuggest concrete technical improvements for:\n${command}`
  );
}

async function triggerDeployment(command) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nProvide a deployment checklist and strategy for:\n${command}`
  );
}

async function monitorHealth(command) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nProvide monitoring recommendations and health check strategies for:\n${command}`
  );
}

module.exports = { handle, analyzeArchitecture, recommendImprovements, triggerDeployment, monitorHealth };
