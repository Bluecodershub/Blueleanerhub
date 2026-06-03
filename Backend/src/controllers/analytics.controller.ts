import { Request, Response, NextFunction } from 'express';
import { User, UserProgress, QuizAttempt, Quiz, Tutorial, Hackathon, HackathonTeam } from '../db/models';
import mongoose from 'mongoose';

export class AnalyticsController {
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId  = req.user!.id;
      const userOid = new mongoose.Types.ObjectId(userId);

      const [user, quizAgg, hackathonCount, progressAgg] = await Promise.all([
        User.findById(userId).select('level totalPoints currentStreak longestStreak').lean(),

        QuizAttempt.aggregate([
          { $match: { userId: userOid } },
          { $group: {
            _id:      null,
            total:    { $sum: 1 },
            avgScore: { $avg: { $multiply: [{ $divide: ['$score', { $max: ['$totalQuestions', 1] }] }, 100] } },
            maxScore: { $max: { $multiply: [{ $divide: ['$score', { $max: ['$totalQuestions', 1] }] }, 100] } },
          }},
        ]),

        HackathonTeam.countDocuments({
          $or: [{ leaderId: userOid }, { memberIds: userOid }],
        }),

        // Group UserProgress by courseId to count enrolled / completed paths
        UserProgress.aggregate([
          { $match: { userId: userOid } },
          { $group: {
            _id:       '$courseId',
            completed: { $sum: { $cond: ['$completed', 1, 0] } },
          }},
        ]),
      ]);

      const profile        = user ?? {};
      const quiz           = quizAgg[0] ?? { total: 0, avgScore: 0, maxScore: 0 };
      const enrolledPaths  = progressAgg.length;
      const completedPaths = progressAgg.filter((p: any) => p.completed > 0).length;

      res.json({
        success: true,
        data: {
          level:               (profile as any).level         ?? 1,
          totalPoints:         (profile as any).totalPoints   ?? 0,
          currentStreak:       (profile as any).currentStreak ?? 0,
          longestStreak:       (profile as any).longestStreak ?? 0,
          enrolledPaths,
          completedPaths,
          totalQuizAttempts:   quiz.total,
          averageQuizScore:    Math.round((quiz.avgScore ?? 0) * 10) / 10,
          bestQuizScore:       Math.round((quiz.maxScore ?? 0) * 10) / 10,
          hackathonsRegistered: hackathonCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId  = req.user!.id;
      const userOid = new mongoose.Types.ObjectId(userId);

      const [learningPaths, recentLessons, recentQuizAttempts] = await Promise.all([
        UserProgress.aggregate([
          { $match: { userId: userOid } },
          { $group: {
            _id:          '$courseId',
            totalLessons: { $sum: 1 },
            doneLessons:  { $sum: { $cond: ['$completed', 1, 0] } },
            lastAccessed: { $max: '$completedAt' },
          }},
          { $project: {
            learning_path_id:    '$_id',
            title:               '$_id',
            progress_percentage: { $multiply: [
              { $divide: ['$doneLessons', { $max: ['$totalLessons', 1] }] }, 100,
            ]},
            last_accessed_at: '$lastAccessed',
            completed_at:     { $cond: [{ $gt: ['$doneLessons', 0] }, '$lastAccessed', null] },
            _id: 0,
          }},
          { $sort: { last_accessed_at: -1 } },
        ]),

        UserProgress.find({ userId: userOid })
          .sort({ completedAt: -1, _id: -1 })
          .limit(10)
          .lean(),

        QuizAttempt.find({ userId: userOid })
          .populate('quizId', 'title category')
          .sort({ completedAt: -1, startedAt: -1 })
          .limit(10)
          .lean(),
      ]);

      res.json({
        success: true,
        data: { learningPaths, recentLessons, recentQuizAttempts },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStrengthsWeaknesses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user   = await User.findById(userId).select('skills').lean();
      const skills: Array<{ name: string; level: number }> = (user as any)?.skills ?? [];

      const strengths = skills
        .filter(s => s.level >= 4)
        .sort((a, b) => b.level - a.level)
        .slice(0, 10)
        .map(s => ({ skill_name: s.name, proficiency_level: s.level, verification_score: null }));

      const weaknesses = skills
        .filter(s => s.level <= 2)
        .sort((a, b) => a.level - b.level)
        .slice(0, 10)
        .map(s => ({ skill_name: s.name, proficiency_level: s.level, verification_score: null }));

      res.json({ success: true, data: { strengths, weaknesses } });
    } catch (error) {
      next(error);
    }
  }

  async getPlatformAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalUsers, newUsers30d, roleDistribution,
        totalQuizzes,
        totalTutorials, publishedTutorials, totalProgress,
        totalHackathons, hackathonByStatus,
        xpAgg,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        User.aggregate([
          { $group:   { _id: '$role', count: { $sum: 1 } } },
          { $sort:    { count: -1 } },
          { $project: { role: '$_id', count: 1, _id: 0 } },
        ]),
        Quiz.countDocuments(),
        Tutorial.countDocuments(),
        Tutorial.countDocuments({ isPublished: true }),
        UserProgress.countDocuments(),
        Hackathon.countDocuments(),
        Hackathon.aggregate([
          { $group:   { _id: '$status', count: { $sum: 1 } } },
          { $project: { status: '$_id', count: 1, _id: 0 } },
        ]),
        User.aggregate([{ $group: { _id: null, total: { $sum: '$totalPoints' } } }]),
      ]);

      const hackathonStatus: Record<string, number> = {};
      hackathonByStatus.forEach((h: any) => { hackathonStatus[h.status] = h.count; });

      res.json({
        success: true,
        data: {
          users: { total_users: totalUsers, new_users_last_30_days: newUsers30d },
          roleDistribution,
          quizzes: { total_quizzes: totalQuizzes, active_quizzes: totalQuizzes, daily_quizzes: 0 },
          learning: {
            total_learning_paths:     totalTutorials,
            published_learning_paths: publishedTutorials,
            total_enrollments:        totalProgress,
          },
          hackathons: {
            total_hackathons:     totalHackathons,
            upcoming_hackathons:  (hackathonStatus['DRAFT'] ?? 0) + (hackathonStatus['PUBLISHED'] ?? 0),
            ongoing_hackathons:   hackathonStatus['ACTIVE']    ?? 0,
            completed_hackathons: hackathonStatus['COMPLETED'] ?? 0,
          },
          totalXpAwarded: xpAgg[0]?.total ?? 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
