import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { db } from '../db';
import { Hackathon, HackathonTeam } from '../db/models';
import { hackathonService } from '../services/hackathon';
import { StripeService } from '../services/stripe.service';
import logger from '../utils/logger';

export class HackathonController {
  async createHackathon(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        title,
        description,
        startDate,
        endDate,
        domain,
        maxParticipants,
        organizerType,
        organizerName,
        difficulty,
        tags,
        prizes,
        prizePool,
        entryFee,
        currency,
        rules,
        judgingCriteria,
        registrationDeadline,
        status: requestedStatus,
        teamSizeMin: _teamSizeMin = 1,
        teamSizeMax: _teamSizeMax = 4,
      } = req.body;

      const hackathon = await db.query.hackathons.create({
        name: title,
        description,
        theme: domain || 'GENERAL',
        organizerType: organizerType || 'PLATFORM',
        organizerName: organizerName || undefined,
        difficulty: difficulty || 'Intermediate',
        tags: Array.isArray(tags) ? tags : [],
        prizes: Array.isArray(prizes) ? prizes : [],
        prizePool: prizePool || undefined,
        entryFee: Math.max(0, Number(entryFee) || 0),
        currency: (currency || 'usd').toLowerCase(),
        rules: rules || undefined,
        judgingCriteria: Array.isArray(judgingCriteria) ? judgingCriteria : [],
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: requestedStatus === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        maxParticipants: maxParticipants || 100,
        createdBy: new mongoose.Types.ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logger.info(`Hackathon created: ${hackathon._id} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Hackathon created successfully',
        data: hackathon,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHackathons(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, domain, organizerType, difficulty, page = 1, limit = 10 } = req.query;
      const filter: any = {};

      if (status) filter.status = status;
      if (domain) filter.theme = domain;
      if (organizerType && ['UNIVERSITY', 'CORPORATE', 'PLATFORM'].includes(String(organizerType))) {
        filter.organizerType = organizerType;
      }
      if (difficulty && ['Beginner', 'Intermediate', 'Pro'].includes(String(difficulty))) {
        filter.difficulty = difficulty;
      }

      const pageNum  = Math.max(1, parseInt(String(page)) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));
      const skip     = (pageNum - 1) * limitNum;

      const [hackathons, total] = await Promise.all([
        Hackathon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Hackathon.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: hackathons,
        total,
        page: pageNum,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHackathonById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const hackathon = await db.query.hackathons.findById(id);

      res.json({
        success: true,
        data: hackathon,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const registrations = await db.query.hackathonTeams.findMany({ hackathonId: new Types.ObjectId(id) });

      res.json({
        success: true,
        data: registrations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHostedHackathons(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = String(req.user!.id);

      const hostedHackathons = await db.query.hackathons.findMany({ 
        createdBy: new Types.ObjectId(userId) 
      });

      res.json({
        success: true,
        data: hostedHackathons,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id as string;
      const { teamId: _teamId } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid hackathon id' });
      }

      const hackathon = await Hackathon.findById(id).select('maxParticipants status').lean();
      if (!hackathon) {
        return res.status(404).json({ success: false, message: 'Hackathon not found' });
      }
      if (hackathon.status !== 'PUBLISHED') {
        return res.status(400).json({ success: false, message: 'Hackathon is not open for registration' });
      }

      if (hackathon.maxParticipants) {
        const currentCount = await HackathonTeam.countDocuments({ hackathonId: new Types.ObjectId(id) });
        if (currentCount >= hackathon.maxParticipants) {
          return res.status(409).json({ success: false, message: 'Hackathon is full' });
        }
      }

      const existingTeam = await HackathonTeam.findOne({
        hackathonId: new Types.ObjectId(id),
        $or: [{ leaderId: new Types.ObjectId(userId) }, { memberIds: new Types.ObjectId(userId) }],
      }).lean();
      if (existingTeam) {
        return res.status(409).json({ success: false, message: 'Already registered for this hackathon' });
      }

      const team = await db.query.hackathonTeams.create({
        hackathonId: new Types.ObjectId(id),
        leaderId: new Types.ObjectId(userId),
        name: `Solo-${userId.slice(-6)}`,
        memberIds: [new Types.ObjectId(userId)],
        createdAt: new Date(),
      });

      res.json({
        success: true,
        data: team,
        message: 'Registration successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.user!.id);
      const { teamName } = req.body;

      if (!teamName || typeof teamName !== 'string') {
        return res.status(400).json({ success: false, message: 'teamName is required' });
      }

      const team = await hackathonService.createTeam(id, userId, teamName);

      res.json({
        success: true,
        message: 'Team created successfully',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitCode(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.user!.id);
      const { language, sourceCode, demoUrl, presentationUrl, repoUrl, title, description } = req.body;

      if (!language || !sourceCode) {
        return res.status(400).json({
          success: false,
          message: 'language and sourceCode are required',
        });
      }

      const submission = await hackathonService.submitCode(id, userId, language, sourceCode, {
        demoVideoUrl: demoUrl,
        presentationUrl,
        repoUrl,
        title,
        description,
      });

      res.json({
        success: true,
        message: 'Code submitted successfully',
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }

  async runCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, language, input } = req.body;
      const id = String(req.params.id);
      const userId = String(req.user!.id);
      
      if (!code || !language) {
        return res.status(400).json({
          success: false,
          error: 'Code and language are required'
        });
      }

      const result = await hackathonService.runCode(id, userId, code, language, input);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const submissions = await hackathonService.getLeaderboard(id);

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.user!.id);

      const submissions = await hackathonService.getUserSubmissions(id, userId);

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  }

  // Stub methods that were referenced in routes but not implemented
  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.user!.id);

      const session = await StripeService.createHackathonCheckoutSession(userId, id);
      res.json({
        success: true,
        data: {
          url: session.url,
          sessionId: session.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createBehaviorEvent(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'Event recorded' });
    } catch (error) {
      next(error);
    }
  }

  async getAdaptiveGuidance(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, data: { guidance: [] } });
    } catch (error) {
      next(error);
    }
  }

  async getPotentialMatches(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.user!.id);
      const matches = await hackathonService.getPotentialMatches(id, userId);
      res.json({ success: true, data: matches });
    } catch (error) {
      next(error);
    }
  }

  async transferTeamLeadership(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const currentLeaderId = String(req.user!.id);
      const newLeaderId = String(req.body.newLeaderId || '');

      if (!mongoose.isValidObjectId(newLeaderId)) {
        return res.status(400).json({ success: false, message: 'newLeaderId is required' });
      }

      const result = await hackathonService.transferTeamLeadership(id, currentLeaderId, newLeaderId);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async joinTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const userId = String(req.user!.id);
      const teamId = String(req.body.teamId || req.body.teamCode || '');

      if (!mongoose.isValidObjectId(teamId)) {
        return res.status(400).json({ success: false, message: 'Valid teamId or teamCode is required' });
      }

      const result = await hackathonService.joinTeam(id, userId, teamId);
      res.json({ success: true, data: result.team, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
