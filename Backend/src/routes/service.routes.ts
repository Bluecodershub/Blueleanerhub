/**
 * SERVICE API ROUTES
 * ==================
 * Backend Services to Database operations
 * Protected by service authentication
 *
 * Use cases:
 * - User Insert (from OAuth, Admin, etc.)
 * - Profile Update
 * - Report Queries
 * - Batch operations
 */

import { Router } from 'express';
import { internalApiKeyAuth } from '../middleware/internalAuth';
import { User, Hackathon, HackathonTeam, Job, JobApplication, QuizAttempt } from '../db/models';
import { hashPassword } from '../utils/encryption';
import logger from '../utils/logger';

const router = Router();

// All service routes require API key
router.use(internalApiKeyAuth);

// ─── User Management ──────────────────────────────────────────────────────────
router.post('/users', async (req, res) => {
  try {
    const { email, password, fullName, role, collegeName, company, metadata } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ success: false, message: 'email and fullName are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        userId: (existing as any)._id,
      });
    }

    const passwordHash = password ? await hashPassword(password) : 'oauth_no_password';
    const user = await User.create({
      email,
      passwordHash,
      fullName,
      role: role || 'STUDENT',
      collegeName: collegeName || undefined,
      company: company || undefined,
      avatarConfig: { seed: email.split('@')[0], style: 'adventurer' },
      preferences: metadata || {},
      isActive: true,
    });

    logger.info(`Service: Created user ${email} with role ${role || 'STUDENT'}`);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    logger.error('Service: User creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

// camelCase MongoDB field names
const ALLOWED_USER_FIELDS = new Set([
  'fullName', 'bio', 'location', 'avatarConfig',
  'educationLevel', 'collegeName', 'graduationYear', 'currentPosition',
  'company', 'yearsExperience', 'linkedinUrl', 'githubUrl',
  'portfolioUrl', 'preferences',
]);

// snake_case aliases accepted from callers → canonical camelCase
const FIELD_ALIAS: Record<string, string> = {
  full_name: 'fullName', avatar_config: 'avatarConfig', education_level: 'educationLevel',
  college_name: 'collegeName', graduation_year: 'graduationYear', current_position: 'currentPosition',
  years_experience: 'yearsExperience', linkedin_url: 'linkedinUrl', github_url: 'githubUrl',
  portfolio_url: 'portfolioUrl',
};

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates: Record<string, any> = {};

    for (const [key, value] of Object.entries(req.body)) {
      if (value === undefined) continue;
      const canonical = FIELD_ALIAS[key] ?? key;
      if (ALLOWED_USER_FIELDS.has(canonical)) updates[canonical] = value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    updates.updatedAt = new Date();
    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Service: Updated user ${id}`);
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Service: User update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['STUDENT', 'CORPORATE', 'ADMIN', 'MENTOR'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (STUDENT, CORPORATE, ADMIN, MENTOR)',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role, updatedAt: new Date() } },
      { new: true },
    ).select('_id email role').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Service: Changed user ${id} role to ${role}`);
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Service: Role update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// ─── Profile Update ────────────────────────────────────────────────────────────
router.put('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName, bio, location, educationLevel, collegeName,
      graduationYear, currentPosition, company, yearsExperience,
      linkedinUrl, githubUrl, portfolioUrl, skills, avatarConfig,
    } = req.body;

    const updates: Record<string, any> = {};
    if (fullName        !== undefined) updates.fullName        = fullName;
    if (bio             !== undefined) updates.bio             = bio;
    if (location        !== undefined) updates.location        = location;
    if (educationLevel  !== undefined) updates.educationLevel  = educationLevel;
    if (collegeName     !== undefined) updates.collegeName     = collegeName;
    if (graduationYear  !== undefined) updates.graduationYear  = graduationYear;
    if (currentPosition !== undefined) updates.currentPosition = currentPosition;
    if (company         !== undefined) updates.company         = company;
    if (yearsExperience !== undefined) updates.yearsExperience = yearsExperience;
    if (linkedinUrl     !== undefined) updates.linkedinUrl     = linkedinUrl;
    if (githubUrl       !== undefined) updates.githubUrl       = githubUrl;
    if (portfolioUrl    !== undefined) updates.portfolioUrl    = portfolioUrl;
    if (avatarConfig    !== undefined) updates.avatarConfig    = avatarConfig;
    if (skills && Array.isArray(skills)) {
      updates.skills = skills.map((s: any) => ({
        name:  s.name  || s.skillName,
        level: s.level || s.proficiencyLevel || 1,
      }));
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No profile fields to update' });
    }

    updates.updatedAt = new Date();
    const user = await User.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Service: Profile updated for user ${id}`);
    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Service: Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ─── Analytics & Reports ───────────────────────────────────────────────────────
router.get('/stats/overview', async (_req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, newUsersWeek, totalHackathons, totalJobs, totalParticipants, totalApplications] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: weekAgo } }),
        Hackathon.countDocuments(),
        Job.countDocuments(),
        HackathonTeam.aggregate([
          { $group: { _id: null, count: { $sum: { $size: '$memberIds' } } } },
        ]).then(r => r[0]?.count ?? 0),
        JobApplication.countDocuments(),
      ]);

    res.json({
      success: true,
      data: {
        total_users:                 totalUsers,
        new_users_week:              newUsersWeek,
        total_hackathons:            totalHackathons,
        total_jobs:                  totalJobs,
        total_hackathon_participants: totalParticipants,
        total_applications:          totalApplications,
      },
    });
  } catch (error) {
    logger.error('Service: Stats overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

router.get('/stats/gamification', async (_req, res) => {
  try {
    const [agg, levelDist] = await Promise.all([
      User.aggregate([
        { $group: {
          _id:               null,
          totalXpDistributed: { $sum: '$totalPoints' },
          highestXp:          { $max: '$totalPoints' },
          averageXp:          { $avg: '$totalPoints' },
          averageStreak:      { $avg: '$currentStreak' },
          longestStreak:      { $max: '$currentStreak' },
          usersWithStreak:    { $sum: { $cond: [{ $gt: ['$currentStreak', 0] }, 1, 0] } },
        }},
      ]),
      User.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { level: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    const stats = agg[0] ?? {};
    res.json({
      success: true,
      data: {
        total_xp_distributed: stats.totalXpDistributed ?? 0,
        highest_xp:           stats.highestXp ?? 0,
        average_xp:           stats.averageXp ?? 0,
        average_streak:       stats.averageStreak ?? 0,
        longest_streak:       stats.longestStreak ?? 0,
        users_with_streak:    stats.usersWithStreak ?? 0,
        levelDistribution:    levelDist,
      },
    });
  } catch (error) {
    logger.error('Service: Gamification stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch gamification stats' });
  }
});

const ALLOWED_PERIODS = new Set(['7 days', '14 days', '30 days', '60 days', '90 days', '1 year']);
const PERIOD_MS: Record<string, number> = {
  '7 days':  7   * 24 * 60 * 60 * 1000,
  '14 days': 14  * 24 * 60 * 60 * 1000,
  '30 days': 30  * 24 * 60 * 60 * 1000,
  '60 days': 60  * 24 * 60 * 60 * 1000,
  '90 days': 90  * 24 * 60 * 60 * 1000,
  '1 year':  365 * 24 * 60 * 60 * 1000,
};

router.get('/stats/engagement', async (req, res) => {
  try {
    const rawPeriod = String(req.query.period || '30 days');
    const period    = ALLOWED_PERIODS.has(rawPeriod) ? rawPeriod : '30 days';
    const since     = new Date(Date.now() - PERIOD_MS[period]);

    const toDateStr = (field: string) => ({ $dateToString: { format: '%Y-%m-%d', date: `$${field}` } });

    const [dailyActive, quizActivity, hackathonActivity] = await Promise.all([
      User.aggregate([
        { $match:   { lastActiveAt: { $gte: since } } },
        { $group:   { _id: toDateStr('lastActiveAt'), active_users: { $sum: 1 } } },
        { $sort:    { _id: -1 } },
        { $project: { date: '$_id', active_users: 1, _id: 0 } },
      ]),
      QuizAttempt.aggregate([
        { $match:   { startedAt: { $gte: since } } },
        { $group:   { _id: toDateStr('startedAt'), submissions: { $sum: 1 } } },
        { $sort:    { _id: -1 } },
        { $project: { date: '$_id', submissions: 1, _id: 0 } },
      ]),
      Hackathon.aggregate([
        { $match:   { createdAt: { $gte: since } } },
        { $group:   { _id: toDateStr('createdAt'), new_hackathons: { $sum: 1 } } },
        { $sort:    { _id: -1 } },
        { $project: { date: '$_id', new_hackathons: 1, _id: 0 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        dailyActiveUsers: dailyActive,
        quizSubmissions:  quizActivity,
        newHackathons:    hackathonActivity,
      },
    });
  } catch (error) {
    logger.error('Service: Engagement stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch engagement stats' });
  }
});

// ─── Data Export ─────────────────────────────────────────────────────────────
router.get('/export/users', async (req, res) => {
  try {
    const { format = 'json', role, includeInactive } = req.query;
    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (!includeInactive) filter.isActive = true;

    const users = await User.aggregate([
      { $match: filter },
      { $lookup: {
        from: 'hackathonteams',
        let:  { uid: '$_id' },
        pipeline: [{ $match: { $expr: { $or: [
          { $eq: ['$leaderId', '$$uid'] },
          { $in:  ['$$uid', '$memberIds'] },
        ]}}}],
        as: 'hackathonsJoined',
      }},
      { $lookup: { from: 'hackathonsubmissions', localField: '_id', foreignField: 'submittedBy', as: 'hackathonSubs' }},
      { $lookup: { from: 'jobapplications',       localField: '_id', foreignField: 'userId',      as: 'jobApps' }},
      { $addFields: {
        hackathons_joined:    { $size: '$hackathonsJoined' },
        hackathons_submitted: { $size: '$hackathonSubs' },
        jobs_applied:         { $size: '$jobApps' },
      }},
      { $project: { passwordHash: 0, hackathonsJoined: 0, hackathonSubs: 0, jobApps: 0 }},
      { $sort: { createdAt: -1 } },
      { $limit: 10000 },
    ]);

    if (format === 'csv') {
      if (users.length === 0) return res.status(404).json({ success: false, message: 'No data to export' });
      const headers = Object.keys(users[0]).join(',');
      const rows = users.map(u =>
        Object.values(u).map(v => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(',')
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      return res.send([headers, ...rows].join('\n'));
    }

    res.json({
      success: true,
      data: users,
      meta: { count: users.length, exportedAt: new Date().toISOString() },
    });
  } catch (error) {
    logger.error('Service: User export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export users' });
  }
});

export default router;
