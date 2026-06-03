import { Request, Response, NextFunction } from 'express';
import { JobService } from '../services/job';

const jobService = new JobService();

export class JobController {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { jobType, location, companyId, page = 1, limit = 10 } = req.query;

      const filters = {
        jobType,
        location,
        companyId,
      };

      const result = await jobService.getJobs(
        filters,
        parseInt(String(page)),
        parseInt(String(limit))
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getJobById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id;

      const job = await jobService.getJobById(id, userId);

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = req.user!.id;
      const jobData = req.body;

      const job = await jobService.createJob(companyId, jobData);

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyForJob(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const { resumeUrl, coverLetter } = req.body;

      const application = await jobService.applyForJob(
        id,
        userId,
        resumeUrl,
        coverLetter
      );

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await jobService.getUserApplications(
        userId,
        parseInt(String(page)),
        parseInt(String(limit))
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const companyId = req.user!.id;
      const { status, minScore } = req.query;

      const filters = {
        status,
        minScore: minScore ? parseFloat(minScore as string) : undefined,
      };

      const candidates = await jobService.getCandidates(
        id,
        companyId,
        filters
      );

      res.json({
        success: true,
        data: candidates,
      });
    } catch (error) {
      next(error);
    }
  }

  async rankCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const companyId = req.user!.id;

      const rankings = await jobService.rankCandidates(id, companyId);

      res.json({
        success: true,
        message: 'Candidates ranked successfully',
        data: rankings,
      });
    } catch (error) {
      next(error);
    }
  }
}


