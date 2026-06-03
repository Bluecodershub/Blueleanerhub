/**
 * Tutorials Controller
 * ====================
 * Handles the interactive tutorial engine — the guided learning core.
 *
 * Routes:
 *   GET  /api/tutorials              — browse / filter tutorials
 *   GET  /api/tutorials/search       — semantic search (via AI service)
 *   GET  /api/tutorials/:slug        — full tutorial with lessons
 *   POST /api/tutorials              — create tutorial
 *   PUT  /api/tutorials/:id          — update tutorial (owner)
 *   POST /api/tutorials/:id/progress — mark lesson complete + award XP
 *   POST /api/tutorials/:id/run-code — execute code in the AI service sandbox
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { Tutorial, UserProgress } from '../db/models';
import mongoose from 'mongoose';
import { GamificationService } from '../services/gamification.service';
import { config } from '../config';
import logger from '../utils/logger';
import { fetchAdaptiveGuidanceFromAI, fallbackTutorialGuidance } from '../services/adaptiveGuidance';

// ─── BROWSE & SEARCH ─────────────────────────────────────────────────────────

export const listTutorials = async (req: Request, res: Response) => {
  try {
    const { domain, difficulty, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const filter: any = { isPublished: true };
    if (domain)     filter.category = { $regex: domain, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty.toUpperCase();

    const rows = await Tutorial.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'fullName')
      .lean();

    const data = rows.map((t: any) => ({
      id:               String(t._id),
      slug:             t.path,
      title:            t.title,
      description:      t.description,
      domain:           t.category,
      difficulty:       t.difficulty,
      estimatedMinutes: null,
      xpReward:         50,
      viewCount:        0,
      completionCount:  0,
      tags:             [],
      authorName:       t.createdBy?.fullName || null,
      createdAt:        t.createdAt,
    }));

    res.json({ success: true, data, page: pageNum, limit: limitNum });
  } catch (err) {
    logger.error('listTutorials error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tutorials' });
  }
};

export const searchTutorials = async (req: Request, res: Response) => {
  try {
    const { q } = req.query as { q: string };
    if (!q?.trim()) return res.json({ success: true, data: [] });

    try {
      const { data } = await axios.post(`${config.aiServiceUrl}/api/v1/search/semantic`, {
        query: q,
        content_type: 'tutorial',
        top_k: 10,
      });
      return res.json({ success: true, data: data.results });
    } catch {
      const rows = await Tutorial.find({
        isPublished: true,
        title: { $regex: q, $options: 'i' },
      }).limit(10).lean();
      return res.json({ success: true, data: rows, fallback: true });
    }
  } catch (err) {
    logger.error('searchTutorials error', err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// ─── GET SINGLE TUTORIAL WITH LESSONS ────────────────────────────────────────

export const getTutorial = async (req: Request, res: Response) => {
  try {
    const slug   = String(req.params.slug);
    const userId = req.user?.id;

    const tutorial = await Tutorial.findOne({ path: slug, isPublished: true })
      .populate('createdBy', 'fullName')
      .lean();

    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' });

    const lessons = tutorial.lessons || [];

    // If authenticated, overlay completion state via UserProgress
    let completedLessons: string[] = [];
    if (userId) {
      const progressRows = await UserProgress.find({
        userId:    new mongoose.Types.ObjectId(userId),
        courseId:  String(tutorial._id),
        completed: true,
      }).select('lessonId').lean();
      completedLessons = progressRows.map((p: any) => p.lessonId);
    }

    res.json({
      success: true,
      data: {
        id:          String(tutorial._id),
        slug:        tutorial.path,
        title:       tutorial.title,
        description: tutorial.description,
        domain:      tutorial.category,
        difficulty:  tutorial.difficulty,
        xpReward:    50,
        authorName:  (tutorial.createdBy as any)?.fullName || null,
        createdAt:   tutorial.createdAt,
        sections:    lessons.map((l: any) => ({
          id:        l.id || String(l._id),
          title:     l.title,
          content:   l.content,
          order:     l.order,
          completed: completedLessons.includes(String(l.id || l._id)),
        })),
        totalSections:     lessons.length,
        completedSections: completedLessons.length,
        progressPercent:   lessons.length
          ? Math.round((completedLessons.length / lessons.length) * 100)
          : 0,
      },
    });
  } catch (err) {
    logger.error('getTutorial error', err);
    res.status(500).json({ success: false, message: 'Failed to load tutorial' });
  }
};

// ─── CREATE TUTORIAL ─────────────────────────────────────────────────────────

export const createTutorial = async (req: Request, res: Response) => {
  try {
    const authorId = req.user!.id;
    const {
      title, slug, description, domain, difficulty,
      sections,
    } = req.body;

    const lessons = Array.isArray(sections)
      ? sections.map((s: any, i: number) => ({
          id:      s.id || String(i + 1),
          title:   s.title,
          content: s.content,
          order:   s.order ?? i + 1,
        }))
      : [];

    const created = await Tutorial.create({
      title,
      path:        slug,
      description,
      category:    domain,
      difficulty:  difficulty?.toUpperCase() || 'BEGINNER',
      lessons,
      isPublished: false,
      createdBy:   new mongoose.Types.ObjectId(authorId),
    });

    res.status(201).json({ success: true, data: created.toObject() });
  } catch (err) {
    logger.error('createTutorial error', err);
    res.status(500).json({ success: false, message: 'Failed to create tutorial' });
  }
};

// ─── MARK LESSON COMPLETE + AWARD XP ─────────────────────────────────────────

export const markSectionComplete = async (req: Request, res: Response) => {
  try {
    const userId     = req.user!.id;
    const tutorialId = req.params.id as string;
    const { sectionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
      return res.status(400).json({ success: false, message: 'Invalid tutorial id' });
    }
    if (!sectionId) {
      return res.status(400).json({ success: false, message: 'sectionId is required' });
    }

    const tutorial = await Tutorial.findById(tutorialId).lean();
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' });

    const lessonIdStr = String(sectionId);

    // Upsert progress record for this specific lesson
    await UserProgress.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), courseId: String(tutorialId), lessonId: lessonIdStr },
      { $set: { completed: true, completedAt: new Date() } },
      { upsert: true },
    );

    const allLessons = tutorial.lessons || [];
    const completedRows = await UserProgress.find({
      userId:    new mongoose.Types.ObjectId(userId),
      courseId:  String(tutorialId),
      completed: true,
    }).lean();
    const completedCount = completedRows.length;
    const isComplete     = allLessons.length > 0 && completedCount >= allLessons.length;
    let xpAwarded = 0;

    if (isComplete && completedCount === allLessons.length) {
      xpAwarded = 50;
      await GamificationService.awardXP(userId, xpAwarded, 'TUTORIAL_COMPLETE');
    }

    res.json({ success: true, isComplete, xpAwarded });
  } catch (err) {
    logger.error('markSectionComplete error', err);
    res.status(500).json({ success: false, message: 'Failed to save progress' });
  }
};

// ─── RUN CODE ─────────────────────────────────────────────────────────────────

const ALLOWED_RUN_LANGUAGES = new Set(['python', 'javascript', 'java', 'cpp', 'c', 'typescript', 'go', 'rust']);

export const runCode = async (req: Request, res: Response) => {
  try {
    const { code, language, stdin, testCases } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'code is required' });
    }
    if (code.length > 50_000) {
      return res.status(413).json({ success: false, message: 'Code exceeds 50 KB limit' });
    }
    if (!language || !ALLOWED_RUN_LANGUAGES.has(String(language).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language. Allowed: ${[...ALLOWED_RUN_LANGUAGES].join(', ')}`,
      });
    }

    const { data } = await axios.post(`${config.aiServiceUrl}/api/v1/hackathon/evaluate`, {
      code,
      language,
      stdin,
      test_cases: testCases,
      run_only:   true,
    });

    res.json({ success: true, data });
  } catch (err) {
    logger.error('runCode error', err);
    res.status(500).json({ success: false, message: 'Code execution failed' });
  }
};

// ─── BEHAVIOR EVENTS + ADAPTIVE GUIDANCE ─────────────────────────────────────

export const createTutorialBehaviorEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { eventType } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid tutorial id' });
    }
    if (!eventType || typeof eventType !== 'string') {
      return res.status(400).json({ success: false, message: 'eventType is required' });
    }

    // No LearningBehaviorEvent MongoDB model — accept and discard
    res.status(201).json({ success: true });
  } catch (err) {
    logger.error('createTutorialBehaviorEvent error', err);
    res.status(500).json({ success: false, message: 'Failed to record behavior event' });
  }
};

export const getTutorialAdaptiveGuidance = async (req: Request, res: Response) => {
  try {
    const userId     = req.user!.id;
    const tutorialId = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(tutorialId)) {
      return res.status(400).json({ success: false, message: 'Invalid tutorial id' });
    }

    const [tutorial, completedRows] = await Promise.all([
      Tutorial.findById(tutorialId).lean(),
      UserProgress.find({
        userId:    new mongoose.Types.ObjectId(userId),
        courseId:  tutorialId,
        completed: true,
      }).lean(),
    ]);

    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' });

    const allLessons     = tutorial.lessons || [];
    const completedCount = completedRows.length;

    const snapshot = {
      completionPercent: allLessons.length
        ? Math.round((completedCount / allLessons.length) * 100)
        : 0,
      completedSections: completedCount,
      totalSections:     allLessons.length,
      runCodeEvents:     0,
      errorEvents:       0,
    };

    const fallbackGuidance = fallbackTutorialGuidance(snapshot);

    try {
      const data = await fetchAdaptiveGuidanceFromAI(
        'tutorial',
        String((req as any).requestId || 'unknown'),
        {
          target_id:    tutorialId,
          target_title: tutorial.title,
          metrics:      snapshot,
          events:       [],
        },
      );

      return res.json({
        success:         true,
        guidance:        Array.isArray(data?.guidance) && data.guidance.length > 0 ? data.guidance : fallbackGuidance,
        behaviorSummary: data?.behavior_summary || snapshot,
        generatedAt:     data?.generated_at || new Date().toISOString(),
      });
    } catch (upstreamErr) {
      logger.warn('getTutorialAdaptiveGuidance upstream fallback', upstreamErr);
      return res.json({
        success:         true,
        guidance:        fallbackGuidance,
        behaviorSummary: snapshot,
        generatedAt:     new Date().toISOString(),
      });
    }
  } catch (err) {
    logger.error('getTutorialAdaptiveGuidance error', err);
    return res.status(500).json({ success: false, message: 'Failed to generate adaptive guidance' });
  }
};
