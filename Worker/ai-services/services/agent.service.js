'use strict';
const aiProvider = require('./aiProvider.service');
const logger = require('../utils/logger');

// Import role-specific agents (ported from ai_system/)
const ctoAgent     = require('../system/cto_agent');
const devAgent     = require('../system/dev_agent');
const productAgent = require('../system/product_agent');
const salesAgent   = require('../system/sales_agent');

/**
 * Naive keyword router: map a free-text command to the right agent.
 */
function routeCommand(command) {
  const lower = command.toLowerCase();
  if (/\b(architect|infrastructure|deploy|monitor|health|security|tech debt)\b/.test(lower)) return 'cto';
  if (/\b(code|bug|feature|implement|refactor|debug|test|pr|pull request)\b/.test(lower))    return 'dev';
  if (/\b(product|roadmap|ux|user|story|sprint|backlog|design)\b/.test(lower))               return 'product';
  if (/\b(sales|email|customer|market|lead|outreach|pitch|revenue)\b/.test(lower))           return 'sales';
  return 'general';
}

/**
 * Run a command through the appropriate agent.
 * @param {string} command
 * @param {string} [agentType]   explicit override ('cto'|'dev'|'product'|'sales')
 * @returns {Promise<{agent: string, result: string}>}
 */
async function runCommand(command, agentType) {
  const type = agentType || routeCommand(command);
  logger.info('agent.run', { type, command: command.slice(0, 80) });

  let result;
  switch (type) {
    case 'cto':     result = await ctoAgent.handle(command);     break;
    case 'dev':     result = await devAgent.handle(command);     break;
    case 'product': result = await productAgent.handle(command); break;
    case 'sales':   result = await salesAgent.handle(command);   break;
    default:
      // General — send directly to the inbuilt local provider
      result = await aiProvider.generate(
        `You are a helpful AI assistant for a software company. Respond concisely.\n\nCommand: ${command}`
      );
  }

  return { agent: type, result };
}

module.exports = { runCommand, routeCommand };
