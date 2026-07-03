import { AppError } from '../middleware/error';
import logger from '../utils/logger';
import { Hackathon, HackathonTeam, HackathonSubmission, User } from '../db/models';
import mongoose from 'mongoose';
import { executionManager } from './execution/execution.manager';

interface HackathonFilters {
  domain?: string;
  status?: string;
  search?: string;
}

const isDuplicateMembershipError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  (error as { code?: number }).code === 11000;

export class HackathonService {
  private static readonly MAX_SOURCE_CODE_SIZE = 50 * 1024; // 50KB

  async getHackathons(filters: HackathonFilters, page: number, limit: number, userId?: string) {
    const filter: Record<string, any> = {};
    if (filters.status) filter.status = filters.status;
    if (filters.domain) filter.theme  = new RegExp(filters.domain, 'i');
    if (filters.search) {
      const re = new RegExp(filters.search, 'i');
      filter.$or = [{ name: re }, { description: re }];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Hackathon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Hackathon.countDocuments(filter),
    ]);

    if (userId && data.length > 0) {
      const hackathonIds = data.map((h: any) => h._id);
      const teams = await HackathonTeam.find({
        hackathonId: { $in: hackathonIds },
        $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
      }).lean();
      const registeredIds = new Set(teams.map((t: any) => t.hackathonId.toString()));
      data.forEach((h: any) => { h.isRegistered = registeredIds.has(h._id.toString()); });
    }

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getHackathonById(hackathonId: string, userId?: string) {
    const hackathon = await Hackathon.findById(hackathonId).lean() as any;
    if (!hackathon) throw new AppError('Hackathon not found', 404);

    if (userId) {
      const team = await HackathonTeam.findOne({
        hackathonId: new mongoose.Types.ObjectId(hackathonId),
        $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
      }).lean();
      hackathon.isRegistered = Boolean(team);

      const submission = await HackathonSubmission.findOne({
        hackathonId: new mongoose.Types.ObjectId(hackathonId),
        submittedBy: new mongoose.Types.ObjectId(userId),
      }).lean();
      hackathon.userSubmission = submission || null;
    }

    return hackathon;
  }

  async registerForHackathon(hackathonId: string, userId: string, _teamId?: string) {
    const hackathon = await Hackathon.findById(hackathonId).lean() as any;
    if (!hackathon) throw new AppError('Hackathon not found', 404);

    const now = new Date();
    if (hackathon.startDate && now > hackathon.startDate) {
      throw new AppError('Registration has closed', 400);
    }

    // Check if already in a team for this hackathon
    const existingTeam = await HackathonTeam.findOne({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
    });
    if (existingTeam) throw new AppError('Already registered for this hackathon', 400);

    // If no teamId, create a solo team
    let team;
    try {
      team = await HackathonTeam.create({
        hackathonId: new mongoose.Types.ObjectId(hackathonId),
        name:        `Solo-${userId.slice(-6)}`,
        leaderId:    new mongoose.Types.ObjectId(userId),
        memberIds:   [new mongoose.Types.ObjectId(userId)],
        createdAt:   new Date(),
      });
    } catch (error) {
      if (isDuplicateMembershipError(error)) {
        throw new AppError('Already registered for this hackathon', 400);
      }
      throw error;
    }

    logger.info(`User ${userId} registered for hackathon ${hackathonId}`);
    return { message: 'Successfully registered for hackathon', team };
  }

  async createTeam(hackathonId: string, userId: string, teamName: string) {
    const hackathon = await Hackathon.findById(hackathonId).lean();
    if (!hackathon) throw new AppError('Hackathon not found', 404);

    // Check not already in a team
    const existing = await HackathonTeam.findOne({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
    });
    if (existing) throw new AppError('Already in a team for this hackathon', 400);

    let team;
    try {
      team = await HackathonTeam.create({
        hackathonId: new mongoose.Types.ObjectId(hackathonId),
        name:        teamName,
        leaderId:    new mongoose.Types.ObjectId(userId),
        memberIds:   [new mongoose.Types.ObjectId(userId)],
        createdAt:   new Date(),
      });
    } catch (error) {
      if (isDuplicateMembershipError(error)) {
        throw new AppError('Already in a team for this hackathon', 400);
      }
      throw error;
    }

    logger.info(`Team created: ${team._id} for hackathon ${hackathonId}`);
    return team;
  }

  async joinTeam(hackathonId: string, userId: string, teamId: string) {
    const team = await HackathonTeam.findOne({
      _id: teamId,
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
    });
    if (!team) throw new AppError('Team not found', 404);

    if (team.memberIds.some((m: any) => m.toString() === userId)) {
      throw new AppError('Already a member of this team', 400);
    }

    // Check not in another team
    const existingTeam = await HackathonTeam.findOne({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
    });
    if (existingTeam) throw new AppError('Already in a team for this hackathon', 400);

    team.memberIds.push(new mongoose.Types.ObjectId(userId));
    try {
      await team.save();
    } catch (error) {
      if (isDuplicateMembershipError(error)) {
        throw new AppError('Already in a team for this hackathon', 400);
      }
      throw error;
    }

    logger.info(`User ${userId} joined team ${team._id}`);
    return { message: 'Successfully joined team', team };
  }

  async submitCode(
    hackathonId: string,
    userId: string,
    _language: string,
    sourceCode: string,
    additionalFiles?: any,
  ) {
    const hackathon = await Hackathon.findById(hackathonId).lean() as any;
    if (!hackathon) throw new AppError('Hackathon not found', 404);

    const now = new Date();
    if (hackathon.startDate && now < hackathon.startDate) throw new AppError('Hackathon has not started yet', 400);
    if (hackathon.endDate   && now > hackathon.endDate)   throw new AppError('Hackathon has ended', 400);

    if (sourceCode.length > HackathonService.MAX_SOURCE_CODE_SIZE) {
      throw new AppError(`Source code exceeds maximum size of ${Math.floor(HackathonService.MAX_SOURCE_CODE_SIZE / 1024)}KB`, 400);
    }

    const team = await HackathonTeam.findOne({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
    }).lean();
    if (!team) throw new AppError('Not registered for this hackathon', 403);

    const submission = await HackathonSubmission.create({
      hackathonId:  new mongoose.Types.ObjectId(hackathonId),
      teamId:       (team as any)._id,
      title:        additionalFiles?.title || `Submission by ${userId}`,
      description:  additionalFiles?.description || '',
      repoUrl:      additionalFiles?.repoUrl || '',
      demoUrl:      additionalFiles?.demoVideoUrl,
      submittedBy:  new mongoose.Types.ObjectId(userId),
      submittedAt:  new Date(),
    });

    logger.info(`Code submitted: Submission ${submission._id} for hackathon ${hackathonId}`);
    return submission;
  }

  async runCode(hackathonId: string, userId: string, code: string, language: string, input?: string) {
    const hackathon = await Hackathon.findById(hackathonId).select('startDate endDate status').lean() as any;
    if (!hackathon) throw new AppError('Hackathon not found', 404);

    const now = new Date();
    if (hackathon.status !== 'PUBLISHED') throw new AppError('Hackathon is not active', 400);
    if (hackathon.startDate && now < hackathon.startDate) throw new AppError('Hackathon has not started yet', 400);
    if (hackathon.endDate && now > hackathon.endDate) throw new AppError('Hackathon has ended', 400);

    const team = await HackathonTeam.findOne({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      $or: [{ leaderId: new mongoose.Types.ObjectId(userId) }, { memberIds: new mongoose.Types.ObjectId(userId) }],
    }).lean();
    if (!team) throw new AppError('Register for this hackathon before running submissions', 403);

    const result = await executionManager.execute({
      code,
      language,
      stdin: input,
      sandboxType: 'hackathon',
    });

    return {
      status: result.status.description,
      output: result.stdout,
      error: result.stderr || result.compile_output,
      executionTime: result.time,
      memory: result.memory,
      success: result.success,
    };
  }

  async getPotentialMatches(hackathonId: string, userId: string) {
    const user = await User.findById(userId).lean() as any;
    if (!user) throw new AppError('User not found', 404);

    // Find teams with open slots in this hackathon that the user hasn't joined
    const teams = await HackathonTeam.find({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      leaderId:    { $ne: new mongoose.Types.ObjectId(userId) },
      memberIds:   { $ne: new mongoose.Types.ObjectId(userId) },
    })
      .populate('leaderId', 'fullName domain')
      .limit(10)
      .lean();

    return teams.map((t: any) => ({
      teamId:     t._id,
      teamName:   t.name,
      leader:     t.leaderId,
      memberCount: t.memberIds?.length ?? 0,
      matchScore: 70,
    }));
  }

  async getLeaderboard(hackathonId: string) {
    const submissions = await HackathonSubmission.find({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
    })
      .populate('teamId', 'name memberIds')
      .sort({ score: -1 })
      .lean();

    return submissions.map((s: any, i: number) => ({ ...s, rank: i + 1 }));
  }

  async getUserSubmissions(hackathonId: string, userId: string) {
    return HackathonSubmission.find({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      submittedBy: new mongoose.Types.ObjectId(userId),
    }).lean();
  }

  async transferTeamLeadership(hackathonId: string, currentLeaderId: string, newLeaderId: string) {
    const team = await HackathonTeam.findOne({
      hackathonId: new mongoose.Types.ObjectId(hackathonId),
      leaderId:    new mongoose.Types.ObjectId(currentLeaderId),
    });
    if (!team) throw new AppError('You are not a team leader in this hackathon', 403);

    const isMember = team.memberIds.some((m: any) => m.toString() === newLeaderId);
    if (!isMember) throw new AppError('Target user is not a member of your team', 400);

    team.leaderId = new mongoose.Types.ObjectId(newLeaderId) as any;
    await team.save();

    logger.info(`Team leadership transferred: ${currentLeaderId} → ${newLeaderId} in team ${team._id}`);
    return { message: 'Team leadership transferred successfully' };
  }
}

export const hackathonService = new HackathonService();
