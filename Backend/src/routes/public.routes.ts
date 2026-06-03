/**
 * PUBLIC API ROUTES — MongoDB port
 * All pool.query calls replaced with Mongoose model queries.
 */

import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import { User, Hackathon, Job, Tutorial } from '../db/models';
import { db } from '../db';
import logger from '../utils/logger';

const router = Router();

// ─── Live Search ───────────────────────────────────────────────────────────────
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, type, limit = '20', page = '1' } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const pageNum  = Math.max(parseInt(page as string) || 1, 1);
    const skip = (pageNum - 1) * limitNum;
    const results: Record<string, any[]> = {};

    if (!type || type === 'hackathons') {
      results.hackathons = await Hackathon.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
        .select('_id name description status theme startDate endDate prizePool')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    if (!type || type === 'jobs') {
      results.jobs = await Job.find({
        isActive: true,
        $or: [{ title: searchRegex }, { description: searchRegex }, { company: searchRegex }],
      })
        .select('_id title company location type salary requirements')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    if (!type || type === 'candidates') {
      results.candidates = await User.find({
        role: 'STUDENT',
        isActive: true,
        $or: [{ fullName: searchRegex }, { currentPosition: searchRegex }, { company: searchRegex }],
      })
        .select('_id fullName email totalPoints level currentPosition company location avatarConfig')
        .sort({ totalPoints: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    if (!type || type === 'tracks') {
      results.tracks = await Tutorial.find({
        isPublished: true,
        $or: [{ title: searchRegex }, { description: searchRegex }],
      })
        .select('_id title path description difficulty category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    res.json({
      success: true,
      data: results,
      meta: { query: q, type: type || 'all', page: pageNum, limit: limitNum },
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// ─── User Profile ──────────────────────────────────────────────────────────────
router.get('/profile/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = (req as any).user?.id;

    const user = await User.findById(id)
      .select('-passwordHash')
      .lean();

    if (!user || !(user as any).isActive) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch achievements from the userAchievements collection
    const achievements = await db.query.userAchievements.findMany({ userId: (user as any)._id });

    res.json({
      success: true,
      data: {
        ...user,
        achievements: achievements.slice(0, 10),
        isOwnProfile: requesterId === id,
      },
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// ─── Candidate Search (For Corporate Users) ────────────────────────────────────
router.get('/candidates', authenticate, async (req, res) => {
  try {
    const {
      search,
      minXp,
      maxXp,
      sortBy = 'totalPoints',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum  = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = { role: 'STUDENT', isActive: true, isBanned: { $ne: true } };

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filter.$or = [{ fullName: searchRegex }, { email: searchRegex }, { currentPosition: searchRegex }];
    }
    if (minXp) filter.totalPoints = { ...(filter.totalPoints || {}), $gte: parseInt(minXp as string) };
    if (maxXp) filter.totalPoints = { ...(filter.totalPoints || {}), $lte: parseInt(maxXp as string) };

    const allowedSortFields: Record<string, string> = {
      total_points: 'totalPoints', totalPoints: 'totalPoints',
      level: 'level', current_streak: 'currentStreak', created_at: 'createdAt',
    };
    const sortField = allowedSortFields[sortBy as string] || 'totalPoints';
    const sortDir   = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Candidate search error:', error);
    res.status(500).json({ success: false, message: 'Failed to search candidates' });
  }
});

// ─── Job Search (Public) ──────────────────────────────────────────────────────
router.get('/jobs/search', optionalAuth, async (req, res) => {
  try {
    const {
      q, location, jobType, remote,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = '1', limit = '20',
    } = req.query;

    const pageNum  = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = { isActive: true };

    if (q) {
      const qRegex = new RegExp(String(q), 'i');
      filter.$or = [{ title: qRegex }, { description: qRegex }];
    }
    if (location) filter.location = new RegExp(String(location), 'i');
    if (jobType) filter.type = jobType;
    if (remote === 'true') filter.remote = true;

    const allowedSortFields: Record<string, string> = {
      created_at: 'createdAt', createdAt: 'createdAt',
      salary: 'salary', title: 'title',
    };
    const sortField = allowedSortFields[sortBy as string] || 'createdAt';
    const sortDir   = sortOrder === 'asc' ? 1 : -1;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: jobs,
      meta: { total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    logger.error('Job search error:', error);
    res.status(500).json({ success: false, message: 'Failed to search jobs' });
  }
});

// ─── Hackathon Search (Public) ───────────────────────────────────────────────
router.get('/hackathons/search', optionalAuth, async (req, res) => {
  try {
    const {
      q, status, theme,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = '1', limit = '20',
    } = req.query;

    const pageNum  = Math.max(parseInt(page as string) || 1, 1);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    if (q) {
      const qRegex = new RegExp(String(q), 'i');
      filter.$or = [{ name: qRegex }, { description: qRegex }];
    }
    if (status) filter.status = status;
    if (theme)  filter.theme  = new RegExp(String(theme), 'i');

    const allowedSortFields: Record<string, string> = {
      created_at: 'createdAt', createdAt: 'createdAt',
      startDate: 'startDate', start_time: 'startDate', title: 'name',
    };
    const sortField = allowedSortFields[sortBy as string] || 'createdAt';
    const sortDir   = sortOrder === 'asc' ? 1 : -1;

    const [hackathons, total] = await Promise.all([
      Hackathon.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Hackathon.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: hackathons,
      meta: { total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    logger.error('Hackathon search error:', error);
    res.status(500).json({ success: false, message: 'Failed to search hackathons' });
  }
});

export default router;
