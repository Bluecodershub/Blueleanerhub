/**
 * Gamification Controller
 * =======================
 * Exposes user achievements and the global leaderboard.
 *
 * Routes:
 *   GET  /api/gamification/achievements   — authenticated user's earned achievements
 *   GET  /api/gamification/leaderboard    — top 10 users by XP (public)
 */

import { Request, Response } from 'express';
import { UserAchievement } from '../db/models';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { GamificationService, LeaderboardPeriod } from '../services/gamification.service';

// ─── All defined achievements catalogue (shown with lock/unlock state) ──────
const ALL_ACHIEVEMENTS = [
  { code: 'FIRST_STEPS',    title: 'First Steps',    description: 'Complete your first lesson',            icon: '🎯', xpReward: 50   },
  { code: 'CODE_NINJA',     title: 'Code Ninja',     description: 'Solve 50 challenges',                   icon: '🥷', xpReward: 200  },
  { code: 'WEEK_WARRIOR',   title: 'Week Warrior',   description: 'Maintain a 7-day streak',               icon: '🔥', xpReward: 150  },
  { code: 'HACKATHON_HERO', title: 'Hackathon Hero', description: 'Win a hackathon',                       icon: '🏆', xpReward: 500  },
  { code: 'TEAM_PLAYER',    title: 'Team Player',    description: 'Join 3 teams',                          icon: '🤝', xpReward: 100  },
  { code: 'CERTIFIED_PRO',  title: 'Certified Pro',  description: 'Earn a certificate',                    icon: '📜', xpReward: 300  },
  { code: 'AI_EXPLORER',    title: 'AI Explorer',    description: 'Use AI companion 10 times',             icon: '🤖', xpReward: 75   },
  { code: 'SPEED_DEMON',    title: 'Speed Demon',    description: 'Complete a quiz in under 60s',          icon: '⚡', xpReward: 100  },
  { code: 'CURIOUS_MIND',   title: 'Curious Mind',   description: 'Complete 10 tutorials',                 icon: '🔭', xpReward: 150  },
  { code: 'STREAK_30',      title: 'Unstoppable',    description: 'Maintain a 30-day streak',              icon: '💎', xpReward: 1000 },
  { code: 'LEVEL_5',        title: 'Specialist',     description: 'Reach level 5',                         icon: '⭐', xpReward: 200  },
  { code: 'WAKING_UP',      title: 'Waking Up',      description: 'Take your first steps on the platform', icon: '🌅', xpReward: 25   },
];

// ─── GET /gamification/achievements ─────────────────────────────────────────
export const getMyAchievements = async (req: Request, res: Response) => {
  try {
    const userId  = req.user!.id;
    const userOid = new mongoose.Types.ObjectId(userId);

    const earned = await UserAchievement.find({ userId: userOid })
      .sort({ earnedAt: -1 })
      .lean();

    const enriched = ALL_ACHIEVEMENTS.map((a) => {
      const match = earned.find((e) => e.title === a.title);
      return {
        id:          a.code,
        title:       a.title,
        description: a.description,
        icon:        a.icon,
        xpReward:    a.xpReward,
        status:      match
          ? (Date.now() - new Date(match.earnedAt).getTime() < 24 * 3600 * 1000 ? 'new' : 'unlocked')
          : 'locked',
        earnedAt: match?.earnedAt ?? null,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    logger.error('getMyAchievements error', err);
    res.status(500).json({ success: false, message: 'Failed to load achievements' });
  }
};

// ─── GET /gamification/leaderboard ──────────────────────────────────────────
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit  = Math.min(parseInt(String(req.query.limit  ?? '10')), 50);
    const offset = Math.max(parseInt(String(req.query.offset ?? '0')), 0);
    const period = (req.query.period ?? 'all-time') as LeaderboardPeriod;

    const validPeriods: LeaderboardPeriod[] = ['weekly', 'monthly', 'all-time'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ success: false, message: 'Invalid period. Use: weekly, monthly, or all-time' });
    }

    const leaderboard = await GamificationService.getLeaderboard(limit, offset, period);
    res.json({ success: true, data: leaderboard });
  } catch (err) {
    logger.error('getLeaderboard error', err);
    res.status(500).json({ success: false, message: 'Failed to load leaderboard' });
  }
};
