'use strict';
const { Router } = require('express');
const ctrl = require('../controllers/python.controller');

const router = Router();

router.post('/hackathon/evaluate', ctrl.evaluateCode);
router.post('/hackathon/plagiarism-check', ctrl.checkPlagiarism);
router.post('/hackathon/rank-submissions', ctrl.rankSubmissions);
router.post('/interview/screen-resume', ctrl.screenResume);
router.post('/interview/evaluate-response', ctrl.evaluateInterview);
router.post('/quiz/predict-difficulty', ctrl.predictDifficulty);
router.post('/quiz/generate', ctrl.generateQuiz);
router.post('/notebooks/ingest', ctrl.notebookIngest);
router.post('/notebooks/chat', ctrl.notebookChat);
router.post('/notebooks/generate', ctrl.notebookGenerate);
router.post('/review/code', ctrl.codeReview);

module.exports = router;
