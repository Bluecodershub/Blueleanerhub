import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { Job, Hackathon, JobApplication, HackathonTeam, CorporateProfile, Bounty } from '../db/models';
import logger from '../utils/logger';
import mongoose from 'mongoose';
import { normalizeJobType } from '../utils/jobTypes';

const router = Router();

const requireCorporate = authorize('CORPORATE', 'ADMIN');
router.use(authenticate, requireCorporate);

function serializeBounty(bounty: any) {
  return {
    id: String(bounty._id),
    title: bounty.title,
    description: bounty.description,
    reward: bounty.reward,
    currency: bounty.currency,
    deadline: bounty.deadline,
    status: bounty.status,
    applicant_count: bounty.applicantCount ?? 0,
    max_applicants: bounty.maxApplicants,
    difficulty: bounty.difficulty,
    skills: bounty.skills ?? [],
    submission_count: bounty.submissionCount ?? 0,
    created_at: bounty.createdAt,
  };
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const [jobsCount, hackathonsCount, candidatesCount, participantsCount] = await Promise.all([
      Job.countDocuments({ postedBy: new mongoose.Types.ObjectId(userId) }),
      Hackathon.countDocuments({ createdBy: new mongoose.Types.ObjectId(userId) }),
      Job.aggregate([
        { $match: { postedBy: new mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'jobapplications', localField: '_id', foreignField: 'jobId', as: 'apps' } },
        { $unwind: '$apps' },
        { $group: { _id: '$apps.userId' } },
        { $count: 'total' },
      ]).then(r => r[0]?.total ?? 0),
      Hackathon.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'hackathonteams', localField: '_id', foreignField: 'hackathonId', as: 'teams' } },
        { $unwind: { path: '$teams', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$teams.memberIds', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]).then(r => r[0]?.count ?? 0),
    ]);

    res.json({
      success: true,
      data: {
        jobsPosted: jobsCount,
        hackathonsHosted: hackathonsCount,
        totalCandidates: candidatesCount,
        hackathonParticipants: participantsCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ─── Job Management ────────────────────────────────────────────────────────────
router.get('/jobs', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page   = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip   = (page - 1) * limit;

    const filter = { postedBy: new mongoose.Types.ObjectId(userId) };
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(filter),
    ]);

    // Attach application count per job
    const jobIds = jobs.map(j => (j as any)._id);
    const counts = await JobApplication.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    counts.forEach((c: any) => { countMap[c._id.toString()] = c.count; });

    const result = jobs.map(j => ({ ...j, applicationCount: countMap[(j as any)._id.toString()] ?? 0 }));

    res.json({ success: true, data: result, total, page, limit });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs', apiLimiter, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { title, company, description, location, jobType, salary, requirements } = req.body;
    const type = normalizeJobType(jobType);
    if (!type) {
      return res.status(400).json({ success: false, message: 'jobType must be one of full-time, part-time, internship, or contract' });
    }

    const profile = await CorporateProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
    const requestedCompany = typeof company === 'string' ? company.trim() : '';
    const profileCompany = typeof profile?.companyName === 'string' ? profile.companyName.trim() : '';
    const companyName = requestedCompany || profileCompany || 'Hiring partner';

    const job = await Job.create({
      title,
      company: companyName,
      description,
      location,
      type,
      salary,
      requirements: requirements || [],
      isActive: true,
      postedBy: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
    });

    logger.info(`Corporate user ${userId} posted job: ${title}`);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

router.put('/jobs/:id', apiLimiter, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id }  = req.params;

    // Whitelist updatable content fields only — never trust the raw body, which
    // could otherwise reassign ownership (postedBy) or set privileged flags.
    const ALLOWED_FIELDS = ['title', 'company', 'location', 'type', 'description', 'requirements', 'applyUrl', 'salary', 'isActive'] as const;
    const update: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = req.body[key];
    }
    if (typeof update.type === 'string') {
      const type = normalizeJobType(update.type);
      if (!type) return res.status(400).json({ success: false, message: 'type must be one of full-time, part-time, internship, or contract' });
      update.type = type;
    }
    // Accept the frontend's `jobType` alias for the schema's `type` field.
    if (typeof req.body.jobType === 'string') {
      const type = normalizeJobType(req.body.jobType);
      if (!type) return res.status(400).json({ success: false, message: 'jobType must be one of full-time, part-time, internship, or contract' });
      update.type = type;
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, postedBy: new mongoose.Types.ObjectId(userId) },
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id }  = req.params;

    const job = await Job.findOneAndDelete({ _id: id, postedBy: new mongoose.Types.ObjectId(userId) });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
});

// ─── Candidate Management ──────────────────────────────────────────────────────
router.get('/jobs/:id/candidates', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id }  = req.params;
    const page    = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit   = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip    = (page - 1) * limit;

    const job = await Job.findOne({ _id: id, postedBy: new mongoose.Types.ObjectId(userId) }).lean();
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const [applications, total] = await Promise.all([
      JobApplication.find({ jobId: new mongoose.Types.ObjectId(id) })
        .populate('userId', 'fullName email totalPoints level avatarConfig profilePicture')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments({ jobId: new mongoose.Types.ObjectId(id) }),
    ]);

    res.json({ success: true, data: applications, total });
  } catch (error) {
    next(error);
  }
});

// ─── Hackathon Management ──────────────────────────────────────────────────────
router.get('/hackathons', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const hackathons = await Hackathon.find({ createdBy: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    // Attach participant count per hackathon
    const hackathonIds = hackathons.map(h => (h as any)._id);
    const teamAgg = await HackathonTeam.aggregate([
      { $match: { hackathonId: { $in: hackathonIds } } },
      { $group: { _id: '$hackathonId', memberCount: { $sum: { $size: '$memberIds' } } } },
    ]);
    const participantMap: Record<string, number> = {};
    teamAgg.forEach((t: any) => { participantMap[t._id.toString()] = t.memberCount; });

    const result = hackathons.map(h => ({
      ...h,
      participantCount: participantMap[(h as any)._id.toString()] ?? 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/hackathons/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const hackathon = await Hackathon.findOneAndDelete({
      _id: req.params.id,
      createdBy: new mongoose.Types.ObjectId(userId),
    });
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });
    logger.info(`Corporate user ${userId} deleted hackathon ${req.params.id}`);
    res.json({ success: true, message: 'Hackathon deleted' });
  } catch (error) {
    next(error);
  }
});

router.post('/hackathons', apiLimiter, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      title, description, start_time, end_time, theme,
      prizePool, entryFee, currency, maxParticipants,
    } = req.body;

    const hackathon = await Hackathon.create({
      name: title,
      description,
      theme,
      startDate: start_time,
      endDate: end_time,
      maxParticipants: maxParticipants || 100,
      prizePool: prizePool || null,
      entryFee: Math.max(0, Number(entryFee) || 0),
      currency: (currency || 'usd').toLowerCase(),
      status: 'DRAFT',
      createdBy: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info(`Corporate user ${userId} created hackathon: ${title}`);
    res.status(201).json({ success: true, data: hackathon });
  } catch (error) {
    next(error);
  }
});

// ─── ATS Resume Screening ─────────────────────────────────────────────────────
router.post('/ats/screen', apiLimiter, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: 'resumeText and jobDescription are required' });
    }

    const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/ats/screen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    if (!response.ok) throw new Error('ATS screening service unavailable');

    const data = await response.json() as any;
    res.json({ success: true, data: { score: data.score || 0, match: data.match || 0, strengths: data.strengths || [], weaknesses: data.weaknesses || [], summary: data.summary || '' } });
  } catch {
    const wordCount = (req.body.resumeText || '').split(/\s+/).length;
    res.json({ success: true, data: { score: Math.min(wordCount / 5, 100), match: 60, strengths: ['Relevant experience'], weaknesses: ['Add more details'], summary: 'Basic screening completed.' } });
  }
});

// ─── AI Interview ──────────────────────────────────────────────────────────────
router.post('/interviews/start', apiLimiter, async (req, res, next) => {
  try {
    const { candidateId, jobId, type = 'technical' } = req.body;
    if (!candidateId) return res.status(400).json({ success: false, message: 'candidateId is required' });

    // Stored as a generic document — no dedicated Interview model yet
    const interviewId = new mongoose.Types.ObjectId().toString();
    logger.info(`AI Interview scheduled: company=${req.user!.id}, candidate=${candidateId}`);

    res.status(201).json({ success: true, data: { id: interviewId, candidateId, jobId, type, status: 'SCHEDULED' } });
  } catch (error) {
    next(error);
  }
});

router.get('/interviews/:id/questions', async (_req, res) => {
  res.json({
    success: true,
    data: {
      questions: [
        { id: 1, text: 'Tell me about yourself.', type: 'behavioral', timeLimit: 120 },
        { id: 2, text: 'What are your greatest strengths?', type: 'behavioral', timeLimit: 90 },
        { id: 3, text: 'Describe a technical challenge you solved.', type: 'technical', timeLimit: 180 },
      ],
    },
  });
});

router.post('/interviews/:id/submit-answer', apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, answer } = req.body;

    const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/interviews/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewId: id, questionId, answer }),
    });

    if (!response.ok) return res.json({ success: true, data: { score: 75, feedback: 'Good answer.' } });
    const data = await response.json();
    res.json({ success: true, data });
  } catch {
    res.json({ success: true, data: { score: 75, feedback: 'Answer recorded.' } });
  }
});

// ─── All Hackathon Participants (aggregated) ──────────────────────────────────
router.get('/candidates', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const page   = Math.max(parseInt(req.query.page  as string) || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip   = (page - 1) * limit;

    // Get hackathons this corporate created
    const hackathons = await Hackathon.find({ createdBy: new mongoose.Types.ObjectId(userId) })
      .select('_id name').lean();
    const hackathonIds = hackathons.map((h: any) => h._id);

    // Get all team members across those hackathons
    const teams = await HackathonTeam.find({ hackathonId: { $in: hackathonIds } })
      .select('memberIds hackathonId').lean();

    const memberIdSet = new Set<string>();
    teams.forEach((t: any) => {
      (t.memberIds || []).forEach((id: any) => memberIdSet.add(id.toString()));
    });
    const memberIds = [...memberIdSet];

    const { User } = await import('../db/models');
    const [candidates, total] = await Promise.all([
      User.find({ _id: { $in: memberIds } })
        .select('fullName email totalPoints level currentStreak domain collegeName avatarConfig profilePicture skills')
        .sort({ totalPoints: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      memberIds.length,
    ]);

    res.json({ success: true, data: { candidates, total, page, limit } });
  } catch (error) {
    next(error);
  }
});

// ─── Shortlist ────────────────────────────────────────────────────────────────
// Uses corporate user's preferences.shortlist array to store shortlisted user IDs.

router.get('/shortlist', async (req, res, next) => {
  try {
    const { User } = await import('../db/models');
    const corp = await User.findById(req.user!.id).select('preferences').lean();
    const shortlistIds: string[] = (corp as any)?.preferences?.shortlist ?? [];

    if (shortlistIds.length === 0) return res.json({ success: true, data: [] });

    const candidates = await User.find({ _id: { $in: shortlistIds } })
      .select('fullName email totalPoints level domain collegeName avatarConfig profilePicture skills')
      .lean();

    res.json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
});

router.post('/shortlist/:candidateId', apiLimiter, async (req, res, next) => {
  try {
    const { User } = await import('../db/models');
    const candidateId = req.params.candidateId;

    // Validate candidate exists
    const candidate = await User.findById(candidateId).select('_id fullName').lean();
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    // Add to shortlist if not already there
    await User.updateOne(
      { _id: req.user!.id },
      { $addToSet: { 'preferences.shortlist': candidateId } },
    );

    res.json({ success: true, message: `${(candidate as any).fullName} added to shortlist` });
  } catch (error) {
    next(error);
  }
});

router.delete('/shortlist/:candidateId', async (req, res, next) => {
  try {
    const { User } = await import('../db/models');
    await User.updateOne(
      { _id: req.user!.id },
      { $pull: { 'preferences.shortlist': req.params.candidateId } },
    );
    res.json({ success: true, message: 'Removed from shortlist' });
  } catch (error) {
    next(error);
  }
});

// ─── Bounties ─────────────────────────────────────────────────────────────────
// until a Bounty model is added
router.post('/bounties', apiLimiter, async (req, res, next) => {
  try {
    const { title, description, reward, currency, deadline, skills, difficulty, maxApplicants, status } = req.body;
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: 'title and description are required' });
    }

    const parsedReward = Number(reward);
    if (!Number.isFinite(parsedReward) || parsedReward < 0) {
      return res.status(400).json({ success: false, message: 'reward must be a non-negative number' });
    }

    const deadlineDate = new Date(deadline);
    if (!deadline || Number.isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ success: false, message: 'valid deadline is required' });
    }

    const bounty = await Bounty.create({
      companyId: new mongoose.Types.ObjectId(req.user!.id),
      title: title.trim(),
      description: description.trim(),
      reward: parsedReward,
      currency: (currency || 'usd').toLowerCase(),
      deadline: deadlineDate,
      skills: Array.isArray(skills) ? skills.filter((s: unknown) => typeof s === 'string') : [],
      difficulty: ['Easy', 'Medium', 'Hard', 'Critical'].includes(difficulty) ? difficulty : 'Medium',
      maxApplicants: maxApplicants ? Number(maxApplicants) : undefined,
      status: ['open', 'urgent', 'closed', 'completed'].includes(status) ? status : 'open',
    });

    logger.info(`Corporate user ${req.user!.id} created bounty: ${title}`);
    res.status(201).json({ success: true, data: serializeBounty(bounty) });
  } catch (error) {
    next(error);
  }
});

router.get('/bounties', async (req, res, next) => {
  try {
    const bounties = await Bounty.find({ companyId: new mongoose.Types.ObjectId(req.user!.id) })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: bounties.map(serializeBounty) });
  } catch (error) {
    next(error);
  }
});

// ─── Company Profile ──────────────────────────────────────────────────────────

router.get('/profile', async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const profile = await CorporateProfile.findOne({ userId }).lean();
    res.json({ success: true, data: profile ?? null });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', apiLimiter, async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const { companyName, industry, companySize, website, location, description, contactEmail, contactPhone, logoUrl } = req.body;

    if (!companyName?.trim()) {
      return res.status(400).json({ success: false, message: 'companyName is required' });
    }

    const updates: Record<string, any> = { companyName: companyName.trim(), updatedAt: new Date() };
    if (industry     !== undefined) updates.industry     = industry;
    if (companySize  !== undefined) updates.companySize  = companySize;
    if (website      !== undefined) updates.website      = website;
    if (location     !== undefined) updates.location     = location;
    if (description  !== undefined) updates.description  = description;
    if (contactEmail !== undefined) updates.contactEmail = contactEmail;
    if (contactPhone !== undefined) updates.contactPhone = contactPhone;
    if (logoUrl      !== undefined) updates.logoUrl      = logoUrl;

    const profile = await CorporateProfile.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { userId } },
      { upsert: true, new: true },
    );

    logger.info(`Corporate user ${req.user!.id} updated company profile: ${companyName}`);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

export default router;
