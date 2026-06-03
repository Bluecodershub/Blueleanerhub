import { AppError } from '../middleware/error';
import { Job, JobApplication } from '../db/models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export class JobService {
  async getJobs(filters: any, page: number, limit: number) {
    const filter: Record<string, any> = { isActive: true };
    if (filters.jobType)   filter.type     = filters.jobType;
    if (filters.location)  filter.location = new RegExp(filters.location, 'i');
    if (filters.companyId) filter.postedBy = new mongoose.Types.ObjectId(filters.companyId);

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getJobById(jobId: string, userId?: string) {
    const job = await Job.findById(jobId).lean();
    if (!job) throw new AppError('Job not found', 404);

    const result: any = { ...job };

    if (userId) {
      const application = await JobApplication.findOne({
        jobId: new mongoose.Types.ObjectId(jobId),
        userId: new mongoose.Types.ObjectId(userId),
      }).lean();
      result.hasApplied  = Boolean(application);
      result.application = application || null;
    }

    return result;
  }

  async createJob(companyId: string, data: any) {
    const job = await Job.create({
      title:        data.title,
      company:      data.company || '',
      location:     data.location,
      type:         data.jobType || 'FULL_TIME',
      description:  data.description,
      requirements: data.requirements || [],
      applyUrl:     data.applyUrl,
      salary:       data.salary,
      isActive:     true,
      postedBy:     new mongoose.Types.ObjectId(companyId),
      createdAt:    new Date(),
    });

    logger.info(`Job posted: ${job._id} by company ${companyId}`);
    return job;
  }

  async applyForJob(jobId: string, userId: string, resumeUrl: string, coverLetter?: string) {
    const job = await Job.findOne({ _id: jobId, isActive: true }).lean();
    if (!job) throw new AppError('Job not found or inactive', 404);

    const existing = await JobApplication.findOne({
      jobId:  new mongoose.Types.ObjectId(jobId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (existing) throw new AppError('Already applied for this job', 400);

    const application = await JobApplication.create({
      jobId:       new mongoose.Types.ObjectId(jobId),
      userId:      new mongoose.Types.ObjectId(userId),
      resumeUrl,
      coverLetter: coverLetter || '',
      status:      'PENDING',
      appliedAt:   new Date(),
    });

    logger.info(`Job application submitted: ${application._id} for job ${jobId}`);
    return application;
  }

  async getUserApplications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const filter = { userId: new mongoose.Types.ObjectId(userId) };

    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate('jobId', 'title location type company')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments(filter),
    ]);

    return { data: applications, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCandidates(jobId: string, companyId: string, filters: any) {
    const job = await Job.findOne({ _id: jobId, postedBy: new mongoose.Types.ObjectId(companyId) }).lean();
    if (!job) throw new AppError('Job not found or unauthorized', 404);

    const filter: Record<string, any> = { jobId: new mongoose.Types.ObjectId(jobId) };
    if (filters.status) filter.status = filters.status;

    const applications = await JobApplication.find(filter)
      .populate('userId', 'fullName email profilePicture yearsExperience')
      .sort({ appliedAt: -1 })
      .lean();

    return applications;
  }

  async rankCandidates(jobId: string, companyId: string) {
    const job = await Job.findOne({ _id: jobId, postedBy: new mongoose.Types.ObjectId(companyId) }).lean();
    if (!job) throw new AppError('Job not found or unauthorized', 404);

    const applications = await JobApplication.find({ jobId: new mongoose.Types.ObjectId(jobId) })
      .populate('userId', 'fullName email totalPoints level')
      .lean();

    // Simple ranking by totalPoints until AI ranking is available
    const ranked = applications
      .map((a: any, i: number) => ({
        ...a,
        rank: i + 1,
        score: (a.userId as any)?.totalPoints ?? 0,
      }))
      .sort((x: any, y: any) => y.score - x.score)
      .map((a: any, i: number) => ({ ...a, rank: i + 1 }));

    logger.info(`Candidates ranked for job ${jobId}`);
    return ranked;
  }
}
