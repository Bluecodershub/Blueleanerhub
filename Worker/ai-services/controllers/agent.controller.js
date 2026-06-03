'use strict';
const catchAsync      = require('../middleware/asyncWrapper');
const orchestrator    = require('../system/orchestrator');
const agentModule     = require('../agent/index');
const { requireBodyField } = require('../utils/http');

// ── POST /api/agent/run ───────────────────────────────────────────────────────
const run = catchAsync(async (req, res) => {
  const { command, agent_type } = req.body;
  if (requireBodyField(res, command, 'command is required')) return;

  const result = await orchestrator.handleCommand(command, agent_type);
  res.json({ success: true, ...result });
});

// ── POST /api/agent/ask ───────────────────────────────────────────────────────
// Direct single-agent call (from ai-agent/agent.py)
const ask = catchAsync(async (req, res) => {
  const { prompt } = req.body;
  if (requireBodyField(res, prompt, 'prompt is required')) return;

  const result = await agentModule.ask(prompt);
  res.json({ success: true, result });
});

module.exports = { run, ask };
