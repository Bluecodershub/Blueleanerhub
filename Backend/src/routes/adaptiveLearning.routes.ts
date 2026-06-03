import { Router } from 'express';
import {
  onboarding,
  getCurrentAssessmentStep,
  submitAnswer,
  finalizeAssessment,
  getRoadmap,
  chatWithMentor,
  sandboxAssist,
  generateNodeContent,
  getNodeContent,
  updateNodeProgress
} from '../controllers/adaptiveLearning.controller';
import { authenticate } from '../middleware/auth';
import { apiLimiter, notebookAiLimiter } from '../middleware/rateLimiter';

const router = Router();

// ── Onboarding & Assessment ───────────────────────────────────────────────────
// Submit background details & start GATE-style adaptive assessment
router.post('/onboarding', apiLimiter, authenticate, onboarding);

// Fetch current question in the active assessment
router.get('/assessment/current', apiLimiter, authenticate, getCurrentAssessmentStep);

// Submit answer (triggers adaptive difficulty routing)
router.post('/assessment/answer', apiLimiter, authenticate, submitAnswer);

// Finalize assessment → triggers AI Skill Analyzer + Roadmap generation
router.post('/assessment/finalize', apiLimiter, authenticate, finalizeAssessment);

// ── Roadmap ───────────────────────────────────────────────────────────────────
// Fetch personalized roadmap tree for a domain
router.get('/roadmap', apiLimiter, authenticate, getRoadmap);

// ── Course Content (AI-Generated Lessons) ────────────────────────────────────
// Generate lesson content for a roadmap node (cached after first generation)
router.post('/content/generate', notebookAiLimiter, authenticate, generateNodeContent);

// Fetch existing lesson content for a node
router.get('/content/:nodeId', apiLimiter, authenticate, getNodeContent);

// ── Node Progress ─────────────────────────────────────────────────────────────
// Update node status (IN_PROGRESS or COMPLETED) + unlock next node + award XP
router.post('/progress/update', apiLimiter, authenticate, updateNodeProgress);

// ── AI Mentor & Sandbox ───────────────────────────────────────────────────────
// Domain-specific AI Mentor streaming chat (SSE)
router.post('/mentor/chat', notebookAiLimiter, authenticate, chatWithMentor);

// IDE Sandbox AI Copilot (SSE) — debug / optimize / explain
router.post('/sandbox/assist', notebookAiLimiter, authenticate, sandboxAssist);

export default router;
