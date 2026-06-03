import { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  User,
  Tutorial,
  Exercise,
  Hackathon,
  SavedLesson,
  LessonProgressExtended,
  UserLearningActivity,
  LearningSession,
  UserStreakExtended,
  XpTracking,
  PersonalizedRecommendation,
  SkillScores,
} from '../db/models';
import { GamificationService } from '../services/gamification.service';
import logger from '../utils/logger';

// ─── 1. WISHLIST / SAVE LESSON SYSTEM ─────────────────────────────────────────

export const saveLesson = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { tutorialId, lessonId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tutorialId) || !lessonId) {
      return res.status(400).json({ success: false, message: 'Invalid tutorialId or lessonId' });
    }

    const tutorial = await Tutorial.findById(tutorialId).lean();
    if (!tutorial) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }

    // Upsert bookmark entry
    await SavedLesson.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        tutorialId: new mongoose.Types.ObjectId(tutorialId),
        lessonId: String(lessonId),
      },
      { savedAt: new Date() },
      { upsert: true, new: true }
    );

    // Log Activity
    await UserLearningActivity.create({
      userId: new mongoose.Types.ObjectId(userId),
      activityType: 'WISHLIST_ADD',
      tutorialId: new mongoose.Types.ObjectId(tutorialId),
      lessonId: String(lessonId),
      metadata: { title: tutorial.title },
    });

    res.json({ success: true, message: 'Lesson saved successfully' });
  } catch (err) {
    logger.error('saveLesson error', err);
    res.status(500).json({ success: false, message: 'Failed to save lesson' });
  }
};

export const getSavedLessons = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const saved = await SavedLesson.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ savedAt: -1 })
      .lean();

    const data = await Promise.all(
      saved.map(async (item: any) => {
        const tutorial = await Tutorial.findById(item.tutorialId).lean();
        if (!tutorial) return null;

        const lesson = (tutorial.lessons || []).find((l: any) => String(l.id || l._id) === String(item.lessonId));
        if (!lesson) return null;

        return {
          id: String(item._id),
          tutorialId: String(item.tutorialId),
          lessonId: item.lessonId,
          savedAt: item.savedAt,
          tutorialTitle: tutorial.title,
          tutorialSlug: tutorial.path,
          lessonTitle: lesson.title,
          domain: tutorial.category,
          difficulty: tutorial.difficulty,
        };
      })
    );

    res.json({ success: true, data: data.filter(Boolean) });
  } catch (err) {
    logger.error('getSavedLessons error', err);
    res.status(500).json({ success: false, message: 'Failed to load saved lessons' });
  }
};

export const removeSavedLesson = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { tutorialId, lessonId } = req.params;

    const tutId = Array.isArray(tutorialId) ? tutorialId[0] : (tutorialId as string);
    const lesId = Array.isArray(lessonId) ? lessonId[0] : (lessonId as string);

    if (!tutId || !lesId || !mongoose.Types.ObjectId.isValid(tutId)) {
      return res.status(400).json({ success: false, message: 'Invalid params' });
    }

    await SavedLesson.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      tutorialId: new mongoose.Types.ObjectId(tutId),
      lessonId: String(lesId),
    });

    res.json({ success: true, message: 'Lesson removed from wishlist' });
  } catch (err) {
    logger.error('removeSavedLesson error', err);
    res.status(500).json({ success: false, message: 'Failed to remove saved lesson' });
  }
};

// ─── 2. PROGRESS TELEMETRY ENGINE ────────────────────────────────────────────

export const trackProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { tutorialId, lessonId, completionPercent = 0, timeSpent = 0 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tutorialId) || !lessonId) {
      return res.status(400).json({ success: false, message: 'Invalid tutorialId or lessonId' });
    }

    const tutorial = await Tutorial.findById(tutorialId).lean();
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' });

    const isComplete = completionPercent >= 100;
    const dateStr = new Date().toISOString().split('T')[0];

    // Find existing progress
    let progress = await LessonProgressExtended.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      tutorialId: new mongoose.Types.ObjectId(tutorialId),
      lessonId: String(lessonId),
    });

    let newlyCompleted = false;

    if (progress) {
      if (!progress.completed && isComplete) {
        newlyCompleted = true;
      }
      progress.completionPercent = Math.max(progress.completionPercent, completionPercent);
      progress.timeSpent += timeSpent;
      if (isComplete) {
        progress.completed = true;
        progress.completedAt = progress.completedAt || new Date();
      }
      progress.lastViewedAt = new Date();
      await progress.save();
    } else {
      if (isComplete) newlyCompleted = true;
      progress = await LessonProgressExtended.create({
        userId: new mongoose.Types.ObjectId(userId),
        tutorialId: new mongoose.Types.ObjectId(tutorialId),
        lessonId: String(lessonId),
        completionPercent,
        timeSpent,
        completed: isComplete,
        completedAt: isComplete ? new Date() : undefined,
        domain: tutorial.category || 'Software Engineering',
        revisitCount: 0,
        lastViewedAt: new Date(),
      });
    }

    // Award streak & activity consistency
    await GamificationService.updateStreak(userId);
    
    // Update detailed streak log
    const userStreak = await UserStreakExtended.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    if (userStreak) {
      if (userStreak.lastActiveDate !== dateStr) {
        userStreak.currentStreak = (userStreak.currentStreak || 0) + 1;
        userStreak.longestStreak = Math.max(userStreak.longestStreak, userStreak.currentStreak);
        userStreak.lastActiveDate = dateStr;
        if (!userStreak.history.includes(dateStr)) {
          userStreak.history.push(dateStr);
        }
        await userStreak.save();
      }
    } else {
      await UserStreakExtended.create({
        userId: new mongoose.Types.ObjectId(userId),
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: dateStr,
        history: [dateStr],
      });
    }

    // Record activity event
    await UserLearningActivity.create({
      userId: new mongoose.Types.ObjectId(userId),
      activityType: isComplete ? 'LESSON_COMPLETE' : 'LESSON_PROGRESS',
      tutorialId: new mongoose.Types.ObjectId(tutorialId),
      lessonId: String(lessonId),
      metadata: { completionPercent, timeSpent },
    });

    let xpEarned = 0;
    if (newlyCompleted) {
      xpEarned = 30; // 30 XP for lesson completion
      await GamificationService.awardXP(userId, xpEarned, 'LESSON_COMPLETE');
      await XpTracking.create({
        userId: new mongoose.Types.ObjectId(userId),
        amount: xpEarned,
        reason: 'LESSON_COMPLETE',
      });
    }

    res.json({ success: true, isComplete: progress.completed, xpEarned });
  } catch (err) {
    logger.error('trackProgress error', err);
    res.status(500).json({ success: false, message: 'Failed to record progress' });
  }
};

export const logLessonView = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { tutorialId, lessonId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tutorialId) || !lessonId) {
      return res.status(400).json({ success: false, message: 'Invalid tutorialId or lessonId' });
    }

    const tutorial = await Tutorial.findById(tutorialId).lean();
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found' });

    let progress = await LessonProgressExtended.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      tutorialId: new mongoose.Types.ObjectId(tutorialId),
      lessonId: String(lessonId),
    });

    if (progress) {
      progress.revisitCount += 1;
      progress.lastViewedAt = new Date();
      await progress.save();
    } else {
      progress = await LessonProgressExtended.create({
        userId: new mongoose.Types.ObjectId(userId),
        tutorialId: new mongoose.Types.ObjectId(tutorialId),
        lessonId: String(lessonId),
        completionPercent: 0,
        timeSpent: 0,
        completed: false,
        revisitCount: 0,
        domain: tutorial.category || 'Software Engineering',
        lastViewedAt: new Date(),
      });
    }

    await UserLearningActivity.create({
      userId: new mongoose.Types.ObjectId(userId),
      activityType: 'LESSON_VIEW',
      tutorialId: new mongoose.Types.ObjectId(tutorialId),
      lessonId: String(lessonId),
      metadata: { revisitCount: progress.revisitCount },
    });

    res.json({ success: true, revisitCount: progress.revisitCount });
  } catch (err) {
    logger.error('logLessonView error', err);
    res.status(500).json({ success: false, message: 'Failed to record view' });
  }
};

// ─── 3. LEARNING SESSIONS (INTERVALS) ──────────────────────────────────────────

export const heartbeatSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { duration = 10 } = req.body; // duration in seconds (heartbeat frequency)

    let session = await LearningSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
    });

    if (session) {
      session.duration += duration;
      session.endTime = new Date();
      await session.save();
    } else {
      session = await LearningSession.create({
        userId: new mongoose.Types.ObjectId(userId),
        startTime: new Date(),
        endTime: new Date(),
        duration,
        isActive: true,
      });
    }

    res.json({ success: true, totalDuration: session.duration });
  } catch (err) {
    logger.error('heartbeatSession error', err);
    res.status(500).json({ success: false, message: 'Session heartbeat failed' });
  }
};

// ─── 4. SMART "CONTINUE LEARNING" POINT ───────────────────────────────────────

export const getContinueLearning = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get the last active lessonprogress that is either not complete, or recently completed
    const active = await LessonProgressExtended.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ lastViewedAt: -1 })
      .lean();

    if (!active) {
      // Find any published tutorial in user's onboarded domain or general beginner tutorial
      const user = await User.findById(userId).lean();
      const domain = user?.domain || 'Software Engineering';

      const tutorial = await Tutorial.findOne({ isPublished: true, category: { $regex: domain, $options: 'i' } })
        .sort({ createdAt: -1 })
        .lean();

      if (!tutorial || !tutorial.lessons || tutorial.lessons.length === 0) {
        return res.json({ success: true, data: null });
      }

      return res.json({
        success: true,
        data: {
          tutorialId: String(tutorial._id),
          lessonId: String(tutorial.lessons[0].id || (tutorial.lessons[0] as any)._id),
          tutorialTitle: tutorial.title,
          tutorialSlug: tutorial.path,
          lessonTitle: tutorial.lessons[0].title,
          completionPercent: 0,
          timeSpent: 0,
          completed: false,
        },
      });
    }

    const tutorial = await Tutorial.findById(active.tutorialId).lean();
    if (!tutorial || !tutorial.lessons) {
      return res.json({ success: true, data: null });
    }

    const lessonIdx = (tutorial.lessons || []).findIndex((l: any) => String(l.id || l._id) === String(active.lessonId));
    let resumeLesson = (tutorial.lessons || [])[lessonIdx];
    let nextUp = false;

    // If this lesson is completed, suggest the next one in sequence
    if (active.completed && lessonIdx !== -1 && lessonIdx < tutorial.lessons.length - 1) {
      resumeLesson = tutorial.lessons[lessonIdx + 1];
      nextUp = true;
    }

    if (!resumeLesson) {
      resumeLesson = tutorial.lessons[0];
    }

    res.json({
      success: true,
      data: {
        tutorialId: String(tutorial._id),
        lessonId: String(resumeLesson.id || (resumeLesson as any)._id),
        tutorialTitle: tutorial.title,
        tutorialSlug: tutorial.path,
        lessonTitle: resumeLesson.title,
        completionPercent: nextUp ? 0 : active.completionPercent,
        timeSpent: nextUp ? 0 : active.timeSpent,
        completed: nextUp ? false : active.completed,
      },
    });
  } catch (err) {
    logger.error('getContinueLearning error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch continue point' });
  }
};

// ─── 5. AI PERSONALIZED RECOMMENDATIONS ───────────────────────────────────────

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).lean();
    const domain = user?.domain || 'Software Engineering';

    // Try finding cached recommendations
    let recommendations = await PersonalizedRecommendation.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();

    if (!recommendations) {
      // Generate standard matching logic for domain
      const [tutorials, exercises, hackathons] = await Promise.all([
        Tutorial.find({ isPublished: true, category: { $regex: domain, $options: 'i' } }).limit(3).lean(),
        Exercise.find({ domain: { $regex: domain, $options: 'i' } }).limit(3).lean(),
        Hackathon.find({ isPublished: true }).sort({ startDate: 1 }).limit(2).lean(),
      ]);

      recommendations = {
        userId: new mongoose.Types.ObjectId(userId),
        domain,
        recommendedLessons: (tutorials || []).map((t: any) => ({
          tutorialId: t._id,
          title: t.title,
          difficulty: t.difficulty || 'BEGINNER',
          reason: `Highly rated in ${domain}`,
        })),
        recommendedExercises: (exercises || []).map((e: any) => ({
          exerciseId: e._id,
          title: e.title,
          difficulty: e.difficulty || 'MEDIUM',
          reason: `Builds core skills for ${domain}`,
        })),
        recommendedHackathons: (hackathons || []).map((h: any) => ({
          hackathonId: h._id,
          title: h.title,
          theme: h.tags?.join(', ') || 'AI & Code',
          reason: `Participate & build real projects`,
        })),
        updatedAt: new Date(),
      } as any;

      // Cache it
      await PersonalizedRecommendation.create(recommendations);
    }

    res.json({ success: true, data: recommendations });
  } catch (err) {
    logger.error('getRecommendations error', err);
    res.status(500).json({ success: false, message: 'Failed to load recommendations' });
  }
};

// ─── 6. USER STATS & XP AUDIT ──────────────────────────────────────────────────

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [user, streakLog, xpLogs, sessions, progressLogs, skillScores] = await Promise.all([
      User.findById(userId).lean(),
      UserStreakExtended.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean(),
      XpTracking.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(10).lean(),
      LearningSession.find({ userId: new mongoose.Types.ObjectId(userId) }).lean(),
      LessonProgressExtended.find({ userId: new mongoose.Types.ObjectId(userId) }).lean(),
      SkillScores.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean(),
    ]);

    // Calculate total seconds spent
    const totalSecondsSpent = sessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
    const weeklySecondsSpent = sessions
      .filter((s: any) => s.startTime >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .reduce((acc: number, s: any) => acc + (s.duration || 0), 0);

    const completedLessonsCount = progressLogs.filter((p: any) => p.completed).length;

    res.json({
      success: true,
      data: {
        totalPoints: user?.totalPoints || 0,
        level: user?.level || 1,
        streak: streakLog?.currentStreak || user?.currentStreak || 0,
        longestStreak: streakLog?.longestStreak || user?.longestStreak || 0,
        streakHistory: streakLog?.history || [],
        totalMinutesSpent: Math.round(totalSecondsSpent / 60),
        weeklyMinutesSpent: Math.round(weeklySecondsSpent / 60),
        completedLessonsCount,
        recentXpGain: xpLogs.map((log: any) => ({
          amount: log.amount,
          reason: log.reason,
          earnedAt: log.createdAt,
        })),
        skillScores: skillScores || null,
      },
    });
  } catch (err) {
    logger.error('getStats error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tracking stats' });
  }
};
