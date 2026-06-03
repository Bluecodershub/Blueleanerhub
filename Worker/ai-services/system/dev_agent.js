'use strict';
// Ported from ai_system/dev_agent.py
const aiProvider = require('../services/aiProvider.service');

const SYSTEM_PROMPT = `You are a senior software developer AI assistant. You help with code suggestions,
bug fixes, feature proposals, and code reviews. Be specific, practical, and include code examples where helpful.`;

async function handle(command) {
  const lower = command.toLowerCase();

  if (/suggest|scaffold|generate.*code/.test(lower)) return suggestCode(command);
  if (/bug|fix|error|issue/.test(lower))             return fixBug(command);
  if (/feature|implement|add/.test(lower))           return proposeFeature(command);
  if (/refactor|update|improve.*code/.test(lower))   return updateCode(command);

  return aiProvider.generate(`${SYSTEM_PROMPT}\n\nTask: ${command}`);
}

async function suggestCode(task) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nGenerate clean, production-ready code for:\n${task}\n\nInclude brief comments.`
  );
}

async function fixBug(description) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nAnalyze and fix this bug:\n${description}\n\nExplain the root cause and the fix.`
  );
}

async function proposeFeature(description) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nPropose an implementation plan for this feature:\n${description}`
  );
}

async function updateCode(description) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nSuggest how to refactor/update this code:\n${description}`
  );
}

module.exports = { handle, suggestCode, fixBug, proposeFeature, updateCode };
