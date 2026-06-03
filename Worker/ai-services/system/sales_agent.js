'use strict';
// Ported from ai_system/sales_agent.py
const aiProvider = require('../services/aiProvider.service');

const SYSTEM_PROMPT = `You are a Sales & Marketing AI assistant for an EdTech platform (BlueLearnerHub).
You help craft outreach emails, identify customer segments, suggest marketing strategies,
and write compelling copy. Be persuasive, professional, and results-oriented.`;

async function handle(command) {
  const lower = command.toLowerCase();

  if (/market|idea|campaign/.test(lower))         return generateMarketingIdeas(command);
  if (/segment|audience|customer/.test(lower))    return suggestCustomerSegments(command);
  if (/email|outreach|pitch|write/.test(lower))   return writeOutreachEmail(command);

  return aiProvider.generate(`${SYSTEM_PROMPT}\n\nRequest: ${command}`);
}

async function generateMarketingIdeas(context) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nGenerate 5 creative marketing ideas for:\n${context}`
  );
}

async function suggestCustomerSegments(context) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nIdentify and describe the best customer segments for:\n${context}`
  );
}

async function writeOutreachEmail(context) {
  return aiProvider.generate(
    `${SYSTEM_PROMPT}\n\nWrite a professional, compelling outreach email for:\n${context}\n\nInclude subject line, body, and CTA.`
  );
}

module.exports = { handle, generateMarketingIdeas, suggestCustomerSegments, writeOutreachEmail };
