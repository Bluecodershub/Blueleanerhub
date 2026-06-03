import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { Exercise, ExerciseSubmission, DailyChallenge, Space } from '../db/models';
import { authenticate } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.get('/spaces', async (_req: Request, res: Response) => {
  try {
    const spaces = await Space.find({ isActive: true }).lean();
    res.json(spaces);
  } catch (error) {
    logger.error('Error fetching spaces:', error);
    res.status(500).json({ message: 'Failed to fetch spaces' });
  }
});

router.get('/challenges', async (req: Request, res: Response) => {
  try {
    const { spaceId, difficulty, page = '1', limit = '20' } = req.query;
    const pageNum  = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (spaceId)    filter.spaceId = spaceId;
    if (difficulty) filter.difficulty = difficulty;

    const [challenges, total] = await Promise.all([
      Exercise.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Exercise.countDocuments(filter),
    ]);

    res.json({
      challenges,
      pagination: {
        page:       pageNum,
        limit:      limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Failed to fetch challenges' });
  }
});

router.get('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid challenge id' });
    }
    const challenge = await Exercise.findById(id).lean();
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    const { solution: _solution, ...safeChallenge } = challenge as any;
    res.json(safeChallenge);
  } catch (error) {
    logger.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Failed to fetch challenge' });
  }
});

router.post('/execute', authenticate, [
  body('challengeId').isString(),
  body('language').isString(),
  body('code').isString(),
], validate, async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: 'Invalid challengeId' });
    }
    const challenge = await Exercise.findById(challengeId).lean();
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json({
      submission: { status: 'PENDING' },
      results:    [],
      passed:     false,
      xpEarned:   0,
    });
  } catch (error) {
    logger.error('Error executing code:', error);
    res.status(500).json({ message: 'Failed to execute code' });
  }
});

router.get('/submissions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const submissions = await ExerciseSubmission.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ submittedAt: -1 }).lean();
    res.json({ submissions });
  } catch (error) {
    logger.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
});

router.get('/daily', authenticate, async (_req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const daily = await DailyChallenge.findOne({
      date: { $gte: todayStart, $lt: tomorrowStart },
    }).lean();

    if (!daily) {
      return res.status(404).json({ message: 'No daily challenge available' });
    }

    res.json({ challenge: daily, completed: false });
  } catch (error) {
    logger.error('Error fetching daily challenge:', error);
    res.status(500).json({ message: 'Failed to fetch daily challenge' });
  }
});

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId  = req.user!.id;
    const userOid = new mongoose.Types.ObjectId(userId);

    const [total, passed] = await Promise.all([
      ExerciseSubmission.countDocuments({ userId: userOid }),
      ExerciseSubmission.countDocuments({ userId: userOid, status: 'ACCEPTED' }),
    ]);

    res.json({
      totalSolved:        passed,
      totalSubmissions:   total,
      passedSubmissions:  passed,
      languageBreakdown:  [],
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

export default router;
