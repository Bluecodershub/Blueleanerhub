'use strict';
// Ported from ai_system/product_agent.py
const aiProvider = require('../services/aiProvider.service');

const SYSTEM_PROMPT = `You are a Product Manager AI assistant. You help with product roadmaps,
user story creation, UX improvements, and prioritization. Be user-focused and business-aware.`;

async function handle(command) {
  const lower = command.toLowerCase();

  if (/roadmap|plan|quarter/.test(lower))      return suggestRoadmap(command);
  if (/analyz|improv|feedback/.test(lower))    return analyzeImprovements(command);
  if (/ux|user experience|design/.test(lower)) return proposeUXEnhancement(command);

  return aiProvider.generate(`${SYSTEM_PROMPT}\n\nRequest: ${command}`);
}

async function suggestRoadmap(context) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nCreate a prioritized product roadmap for:\n${context}\n\nGroup by quarters if possible.`
  );
}

async function analyzeImprovements(context) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nAnalyze and suggest product improvements for:\n${context}`
  );
}

async function proposeUXEnhancement(context) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nPropose UX enhancements for:\n${context}\n\nFocus on user pain points and measurable improvements.`
  );
}

module.exports = { handle, suggestRoadmap, analyzeImprovements, proposeUXEnhancement };
