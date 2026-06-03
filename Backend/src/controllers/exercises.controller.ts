/**
 * Exercises Controller
 * ====================
 * Serves practice challenges for the /exercises page.
 *
 * Routes:
 *   GET  /api/exercises         — paginated exercise list (filter by domain, difficulty, search)
 *   GET  /api/exercises/:id     — single exercise with questions
 */

import { Request, Response } from 'express';
import { Exercise } from '../db/models';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const DIFFICULTY_POINTS: Record<string, number> = { EASY: 30, MEDIUM: 60, HARD: 120 };

// ─── GET /exercises ───────────────────────────────────────────────────────────

export const listExercises = async (req: Request, res: Response) => {
  try {
    const {
      domain: domainFilter,
      search,
      difficulty: difficultyFilter,
      sort = 'newest',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (domainFilter && domainFilter !== 'All Domains') {
      filter.category = { $regex: domainFilter, $options: 'i' };
    }
    if (difficultyFilter) {
      filter.difficulty = difficultyFilter.toUpperCase();
    }
    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags:     { $regex: search, $options: 'i' } },
      ];
    }

    const sortField: any = sort === 'points' ? { difficulty: -1 } : { createdAt: -1 };

    const [exercises, total] = await Promise.all([
      Exercise.find(filter).sort(sortField).skip(skip).limit(limitNum).lean(),
      Exercise.countDocuments(filter),
    ]);

    const result = exercises.map((e: any) => ({
      id:          String(e._id),
      title:       e.title,
      domain:      e.category,
      subDomain:   e.tags?.[0] || '',
      difficulty:  e.difficulty || 'EASY',
      points:      DIFFICULTY_POINTS[e.difficulty] ?? 30,
      successRate: null,
      solved:      false,
    }));

    res.json({
      success: true,
      data:    result,
      meta:    { page: pageNum, limit: limitNum, total },
    });
  } catch (err) {
    logger.error('listExercises error', err);
    res.status(500).json({ success: false, message: 'Failed to load exercises' });
  }
};

// ─── GET /exercises/:id ───────────────────────────────────────────────────────

export const getExercise = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid exercise id' });
    }

    const exercise = await Exercise.findById(id).lean();
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });

    // Never send solution to client
    const { solution: _solution, ...safeExercise } = exercise as any;

    res.json({
      success: true,
      data: {
        ...safeExercise,
        id:         String(exercise._id),
        difficulty: exercise.difficulty || 'EASY',
        points:     DIFFICULTY_POINTS[exercise.difficulty] ?? 30,
      },
    });
  } catch (err) {
    logger.error('getExercise error', err);
    res.status(500).json({ success: false, message: 'Failed to load exercise' });
  }
};
