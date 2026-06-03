'use strict';
const catchAsync  = require('../middleware/asyncWrapper');
const modelModule = require('../model/index');
const { requireBodyField } = require('../utils/http');

// ── POST /api/model/predict ───────────────────────────────────────────────────
const predict = catchAsync(async (req, res) => {
  const { prompt, input } = req.body;
  const text = prompt || input;
  if (requireBodyField(res, text, 'prompt or input is required')) return;

  const result = await modelModule.predict(text);
  res.json({ success: true, ...result });
});

// ── GET /api/model/info ───────────────────────────────────────────────────────
const info = catchAsync(async (req, res) => {
  res.json({ success: true, model: modelModule.getModelInfo() });
});

module.exports = { predict, info };
