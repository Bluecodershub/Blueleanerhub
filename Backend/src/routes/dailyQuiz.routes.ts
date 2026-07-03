/**
 * Daily Quiz Routes — Secure Server-Side Scoring
 * ================================================
 * SECURITY MODEL:
 *   - correctIndex is NEVER sent to the client
 *   - Frontend submits raw answers[]; backend scores from its own cache
 *   - UNIQUE(userId, quizDate, domain) enforced at MongoDB index level
 *   - Duplicate submissions return 409 (not silently double-award XP)
 *   - Domain validated against server-side allowlist
 */

import { Router } from 'express';
import {
  getDailyQuiz,
  getAvailableDomains,
  getPublicQuiz,
  scoreQuiz,
} from '../services/dailyQuiz.service';
import { authenticate } from '../middleware/auth';
import { apiLimiter, strictLimiter } from '../middleware/rateLimiter';
import { GamificationService } from '../services/gamification.service';
import { DailyQuizAttempt } from '../db/models';
import logger from '../utils/logger';
import { asString } from '../utils/request';
import mongoose from 'mongoose';

const router = Router();

// ─── GET /domains — public ───────────────────────────────────────────────────
router.get('/domains', apiLimiter, (_req, res) => {
  res.json({ success: true, data: getAvailableDomains(), error: null });
});

// ─── GET /:domain — return quiz WITHOUT correctIndex ─────────────────────────
router.get('/:domain', apiLimiter, authenticate, async (req, res) => {
  try {
    const domain = decodeURIComponent(asString(req.params.domain));
    const allowedDomains = getAvailableDomains();

    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ success: false, message: 'Invalid domain', error: 'INVALID_DOMAIN' });
    }

    const userId = req.user!.id;
    const today  = new Date().toISOString().slice(0, 10);

    const existing = await DailyQuizAttempt.findOne({
      userId:    new mongoose.Types.ObjectId(userId),
      quizDate:  today,
      domain,
    }).lean();

    const quiz       = await getDailyQuiz(domain);
    const publicQuiz = getPublicQuiz(quiz);

    res.json({
      success: true,
      data: {
        ...publicQuiz,
        alreadySubmitted: Boolean(existing),
        previousResult:   existing ?? null,
      },
      error: null,
    });
  } catch (err) {
    logger.error('daily-quiz GET error', err);
    return res.status(500).json({ success: false, message: 'Failed to load daily quiz', error: null });
  }
});

// ─── POST /submit — server-side scoring ──────────────────────────────────────
router.post('/submit', strictLimiter, authenticate, async (req, res) => {
  try {
    const userId  = req.user!.id;
    const { domain, answers } = req.body as { domain: unknown; answers: unknown };
    const today   = new Date().toISOString().slice(0, 10);

    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ success: false, message: 'domain is required', error: 'MISSING_DOMAIN' });
    }

    const allowedDomains = getAvailableDomains();
    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({ success: false, message: 'Invalid domain', error: 'INVALID_DOMAIN' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'answers must be an array', error: 'INVALID_ANSWERS' });
    }

    const quiz = await getDailyQuiz(domain);

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: `Expected ${quiz.questions.length} answers, received ${answers.length}`,
        error: 'WRONG_ANSWER_COUNT',
      });
    }

    for (let i = 0; i < answers.length; i++) {
      const a = answers[i];
      if (!Number.isInteger(a) || (a as number) < 0 || (a as number) >= quiz.questions[i].options.length) {
        return res.status(400).json({
          success: false,
          message: `Answer at index ${i} is out of range`,
          error: 'INVALID_ANSWER_VALUE',
        });
      }
    }

    const { correctCount, score, xpEarned, correctAnswers, explanations } =
      scoreQuiz(quiz, answers as number[]);

    // Equivalent to INSERT INTO daily_quiz_attempts; the unique index prevents double-submission.
    try {
      await DailyQuizAttempt.create({
        userId:   new mongoose.Types.ObjectId(userId),
        quizDate: today,
        domain,
        score,
        xpEarned,
      });
    } catch (dbErr: any) {
      const duplicateCode = String(dbErr.code);
      if (duplicateCode === '11000' || duplicateCode === '23505') {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted this quiz today. Come back tomorrow!',
          error: 'ALREADY_SUBMITTED',
        });
      }
      throw dbErr;
    }

    if (xpEarned > 0) {
      await GamificationService.awardXP(userId, xpEarned, 'daily_quiz');
      await GamificationService.updateStreak(userId);
    }

    res.json({
      success: true,
      data: {
        score,
        correctCount,
        totalQuestions: quiz.questions.length,
        xpEarned,
        correctAnswers,
        explanations,
      },
      error: null,
    });
  } catch (err) {
    logger.error('daily-quiz submit error', err);
    return res.status(500).json({ success: false, message: 'Failed to record quiz result', error: null });
  }
});

export default router;
