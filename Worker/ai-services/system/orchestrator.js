'use strict';
// Ported from ai_system/orchestrator.py
const agentService = require('../services/agent.service');
const logger       = require('../utils/logger');

/**
 * Route a command to the appropriate agent and return the result.
 * This is the single entry point for all agent commands.
 * @param {string} command
 * @param {string} [agentType]
 * @returns {Promise<{agent: string, result: string}>}
 */
async function handleCommand(command, agentType) {
  if (!command || typeof command !== 'string' || !command.trim()) {
    return { agent: 'none', result: 'No command provided.' };
  }
  logger.info('orchestrator.handleCommand', { command: command.slice(0, 80), agentType });
  return agentService.runCommand(command.trim(), agentType);
}

module.exports = { handleCommand };
