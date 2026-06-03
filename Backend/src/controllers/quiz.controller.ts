import { Request, Response, NextFunction } from 'express';
import { quizService } from '../services/quiz';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { fetchAdaptiveGuidanceFromAI, fallbackQuizGuidance } from '../services/adaptiveGuidance';

export class QuizController {
  async getQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizType, domain, difficulty, page = 1, limit = 10 } = req.query;

      const result = await quizService.getQuizzes(
        { quizType, domain, difficulty },
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getQuizById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id;

      const quiz = await quizService.getQuizById(id, userId);

      res.json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async getDailyQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const domain = req.query.domain as string;

      const quiz = await quizService.getDailyQuiz(domain);

      res.json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const { answers } = req.body;

      const result = await quizService.submitQuizAttempt(userId, id, answers);

      res.json({
        success: true,
        message: 'Quiz submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await quizService.getUserAttempts(
        userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const type = (req.params.type as string) || (req.query.type as string) || 'all_time';
      const { limit = 10 } = req.query;

      const leaderboard = await quizService.getLeaderboard(type, parseInt(limit as string));

      res.json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  async generateAIQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { topic, difficulty, numQuestions = 10 } = req.body;

      const quiz = await quizService.generateAIQuiz(
        topic,
        difficulty,
        parseInt(numQuestions),
        userId
      );

      res.json({
        success: true,
        message: 'AI Quiz generated successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBehaviorEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { eventType } = req.body || {};

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid quiz id' });
      }
      if (!eventType || typeof eventType !== 'string') {
        return res.status(400).json({ success: false, message: 'eventType is required' });
      }

      // LearningBehaviorEvent has no MongoDB model — accept and discard
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getAdaptiveGuidance(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid quiz id' });
      }

      const [quiz, attemptsResult] = await Promise.all([
        quizService.getQuizById(id, userId),
        quizService.getUserAttempts(userId, 1, 20),
      ]);

      const attempts = Array.isArray(attemptsResult?.data) ? attemptsResult.data : [];
      const relevantAttempts = attempts.filter((a: any) => String(a.quizId?._id || a.quizId) === id);
      const attemptCount = relevantAttempts.length;
      const averageScore = attemptCount
        ? relevantAttempts.reduce((acc: number, a: any) => acc + Number(a.score || 0), 0) / attemptCount
        : 0;
      const latestScore = attemptCount ? Number(relevantAttempts[0]?.score || 0) : 0;

      const snapshot = {
        attemptCount,
        averageScore: Math.round(averageScore * 10) / 10,
        latestScore,
        errorEvents: 0,
      };

      const fallbackGuidance = fallbackQuizGuidance(snapshot);

      try {
        const data = await fetchAdaptiveGuidanceFromAI('quiz', String(req.requestId || 'unknown'), {
          target_id: id,
          target_title: (quiz as any)?.title || `Quiz ${id}`,
          metrics: snapshot,
          events: [],
        });

        return res.json({
          success: true,
          guidance: Array.isArray(data?.guidance) && data.guidance.length > 0 ? data.guidance : fallbackGuidance,
          behaviorSummary: data?.behavior_summary || snapshot,
          generatedAt: data?.generated_at || new Date().toISOString(),
        });
      } catch (upstreamErr) {
        logger.warn('quiz adaptive guidance upstream fallback', upstreamErr);
        return res.json({
          success: true,
          guidance: fallbackGuidance,
          behaviorSummary: snapshot,
          generatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
