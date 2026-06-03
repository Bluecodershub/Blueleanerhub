'use strict';
const { Router } = require('express');
const ctrl = require('../controllers/ai.controller');

const router = Router();

// ── Unified API (new) ─────────────────────────────────────────────────────────
router.post('/generate',       ctrl.generate);
router.post('/chat',           ctrl.chat);
router.post('/quiz/generate',  ctrl.generateQuiz);
router.post('/review',         ctrl.reviewCode);
router.post('/learning-path',  ctrl.generateLearningPath);

module.exports = router;
