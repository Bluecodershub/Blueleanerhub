import { User, UserAchievement, XpTracking } from '../db/models';
import { redisHelpers } from '../utils/database';
import mongoose from 'mongoose';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time';

const LEADERBOARD_CACHE_TTL = 300; // 5 minutes

export class GamificationService {
  static async awardXP(userId: string, amount: number, _reason?: string) {
    return await this.addExperience(userId, amount);
  }

  static async addExperience(userId: string, amount: number) {
    const user = await User.findById(userId);
    if (!user) return null;

    user.totalPoints  = (user.totalPoints  ?? 0) + amount;
    user.level        = Math.floor(Math.sqrt(user.totalPoints / 100)) + 1;
    user.lastActiveAt = new Date();
    await user.save();

    await this.checkAchievements(userId, user.totalPoints, user.level);
    return user;
  }

  static async updateStreak(userId: string) {
    const user = await User.findById(userId);
    if (!user) return null;

    const now         = new Date();
    const lastActive  = user.lastActiveAt ?? null;
    const diffHours   = lastActive
      ? (now.getTime() - lastActive.getTime()) / (1000 * 3600)
      : 999;

    let streak = user.currentStreak ?? 0;

    if (diffHours >= 24 && diffHours < 48) {
      streak += 1;
    } else if (diffHours >= 48) {
      streak = 1;
    }
    // diffHours < 24: already active today — keep streak unchanged

    user.currentStreak = streak;
    user.longestStreak = Math.max(streak, user.longestStreak ?? 0);
    user.lastActiveAt  = now;
    await user.save();
    return user;
  }

  static async checkAchievements(userId: string, xp: number, level: number) {
    if (xp > 0) {
      await this.awardAchievement(userId, 'WAKING_UP', 'Waking Up', 'First steps on the platform', 25);
    }
    if (level >= 5) {
      await this.awardAchievement(userId, 'LEVEL_5', 'Specialist', 'Reached level 5', 200);
    }
  }

  static async awardAchievement(
    userId: string,
    code: string,
    title: string,
    description?: string,
    xpReward?: number,
  ) {
    const userOid = new mongoose.Types.ObjectId(userId);

    // Atomic upsert: $setOnInsert only fires on insert, not update.
    // Returns the pre-update doc (null when newly inserted).
    const existing = await UserAchievement.findOneAndUpdate(
      { userId: userOid, achievementId: code },
      { $setOnInsert: {
        userId:        userOid,
        achievementId: code,
        title,
        description:   description ?? `Awarded for ${title.toLowerCase()}`,
        earnedAt:      new Date(),
      }},
      { upsert: true, new: false, lean: true },
    );
    if (existing) return; // already had this achievement

    if (xpReward && xpReward > 0) {
      const user = await User.findById(userId);
      if (user) {
        user.totalPoints = (user.totalPoints ?? 0) + xpReward;
        user.level       = Math.floor(Math.sqrt(user.totalPoints / 100)) + 1;
        await user.save();
      }
    }
  }

  static async getLeaderboard(limit = 10, offset = 0, period: LeaderboardPeriod = 'all-time') {
    const cacheKey = `leaderboard:${period}:${limit}:${offset}`;
    const cached = await redisHelpers.get(cacheKey);
    if (cached) return cached;

    let leaderboard: any[];

    if (period === 'all-time') {
      // All-time: rank by cumulative totalPoints stored on User document
      const rows = await User.find({})
        .select('fullName totalPoints level currentStreak longestStreak lastActiveAt')
        .sort({ totalPoints: -1, lastActiveAt: 1 })
        .skip(offset)
        .limit(limit)
        .lean();

      leaderboard = rows.map((u: any, i: number) => ({
        rank:          offset + i + 1,
        id:            u._id,
        name:          u.fullName,
        xp:            u.totalPoints   ?? 0,
        level:         u.level         ?? 1,
        streak:        u.currentStreak ?? 0,
        longestStreak: u.longestStreak ?? 0,
      }));
    } else {
      // Weekly / monthly: aggregate XP earned within the time window from XpTracking
      const windowMs = period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const since = new Date(Date.now() - windowMs);

      const agg = await XpTracking.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$userId', periodXp: { $sum: '$amount' } } },
        { $sort: { periodXp: -1 } },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            let: { uid: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$uid' }] } } },
              { $project: { fullName: 1, level: 1, currentStreak: 1, longestStreak: 1 } },
            ],
            as: 'userInfo',
          },
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: false } },
      ]);

      leaderboard = agg.map((row: any, i: number) => ({
        rank:          offset + i + 1,
        id:            row._id,
        name:          row.userInfo?.fullName ?? 'Unknown',
        xp:            row.periodXp ?? 0,
        level:         row.userInfo?.level         ?? 1,
        streak:        row.userInfo?.currentStreak ?? 0,
        longestStreak: row.userInfo?.longestStreak ?? 0,
      }));
    }

    await redisHelpers.set(cacheKey, leaderboard, LEADERBOARD_CACHE_TTL);
    return leaderboard;
  }

  static async invalidateLeaderboardCache(): Promise<void> {
    await redisHelpers.clearPattern('leaderboard:*');
  }
}
