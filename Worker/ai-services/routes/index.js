'use strict';
const { Router }    = require('express');
const aiRoutes      = require('./ai.routes');
const agentRoutes   = require('./agent.routes');
const modelRoutes   = require('./model.routes');
const pythonRoutes  = require('./python.routes');
const aiCtrl        = require('../controllers/ai.controller');
const internalAuth  = require('../middleware/internalAuth');

const router = Router();

// All routes require internal service authentication
router.use(internalAuth);

// ── Core AI routes ────────────────────────────────────────────────────────────
router.use('/ai',    aiRoutes);
router.use('/agent', agentRoutes);
router.use('/model', modelRoutes);

// ── Python ML routes (consolidated into unified gateway) ──────────────────────
router.use('/v1', pythonRoutes);

// ── Backward-compatibility aliases (called by backend services) ───────────────
router.post('/v1/ai/quiz/generate', aiCtrl.generateQuiz);
router.post('/v1/quiz/generate',    aiCtrl.generateQuiz);
router.post('/v1/chat',             aiCtrl.chat);
router.post('/v1/ai/generate',      aiCtrl.generate);

module.exports = router;
