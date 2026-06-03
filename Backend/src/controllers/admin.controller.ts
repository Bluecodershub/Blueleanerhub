import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  User, Hackathon, Certificate, Quiz, Tutorial,
  UserProgress, QuizAttempt, HackathonTeam, XpTracking,
  Course, Assessment, SkillScores, PaymentTransaction,
  HackathonSubmission, CapstoneSubmission, CourseEnrollment,
} from '../db/models';
import logger from '../utils/logger';
import { hashPassword } from '../utils/encryption';

async function paginateModel(
  req: Request,
  model: mongoose.Model<any>,
  itemKey: string,
  options: {
    filter?: Record<string, any>;
    sort?: Record<string, 1 | -1>;
    select?: string;
    populate?: Parameters<mongoose.Query<any, any>['populate']>[0][];
  } = {},
) {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const skip  = (page - 1) * limit;

  let query = model.find(options.filter ?? {});
  if (options.select) query = query.select(options.select);
  for (const populate of options.populate ?? []) query = query.populate(populate);

  const [items, total] = await Promise.all([
    query.sort(options.sort ?? { createdAt: -1 }).skip(skip).limit(limit).lean(),
    model.countDocuments(options.filter ?? {}),
  ]);

  return { [itemKey]: items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ─── User Management ──────────────────────────────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const role   = req.query.role   as string | undefined;
    const search = req.query.search as string | undefined;
    const skip   = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (role)   filter.role = role.toUpperCase();
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ fullName: re }, { email: re }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('fullName email role domain isActive isBanned createdAt lastLoginAt totalPoints level')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { users, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, fullName, role, password, isActive = true } = req.body;
    const allowed = ['STUDENT', 'MENTOR', 'CORPORATE', 'ADMIN'];
    const normalizedRole = String(role || '').toUpperCase();

    if (!email || !fullName || !password || !allowed.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: `email, fullName, password, and role (${allowed.join(', ')}) are required`,
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      email: normalizedEmail,
      fullName,
      passwordHash: await hashPassword(password),
      role: normalizedRole,
      isActive: Boolean(isActive),
    });

    logger.info(`Admin ${req.user!.id} created ${normalizedRole} account ${user._id}`);
    res.status(201).json({
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -emailVerificationToken')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const uid = new mongoose.Types.ObjectId(req.params.id as string);
    const [quizCount, hackathonCount, xpTotal] = await Promise.all([
      QuizAttempt.countDocuments({ userId: uid }),
      HackathonTeam.countDocuments({ $or: [{ leaderId: uid }, { memberIds: uid }] }),
      XpTracking.aggregate([{ $match: { userId: uid } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      data: { user, stats: { quizCount, hackathonCount, xpTotal: xpTotal[0]?.total ?? 0 } },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    const allowed = ['STUDENT', 'MENTOR', 'CORPORATE', 'ADMIN'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: `role must be one of: ${allowed.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: 'fullName email role' },
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Admin ${req.user!.id} changed user ${req.params.id} role to ${role}`);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function banUser(req: Request, res: Response, next: NextFunction) {
  try {
    const ban = req.body.banned !== false; // default true = ban
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: ban, isActive: !ban },
      { new: true, select: 'fullName email isBanned isActive' },
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    logger.info(`Admin ${req.user!.id} ${ban ? 'banned' : 'unbanned'} user ${req.params.id}`);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// ─── Hackathon Moderation ─────────────────────────────────────────────────────

export async function listAllHackathons(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string | undefined;
    const skip   = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (status) filter.status = status.toUpperCase();

    const [hackathons, total] = await Promise.all([
      Hackathon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Hackathon.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { hackathons, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function moderateHackathon(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const allowed = ['DRAFT', 'PUBLISHED', 'ACTIVE', 'COMPLETED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: 'name status organizerName' },
    );
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

    logger.info(`Admin ${req.user!.id} set hackathon ${req.params.id} status to ${status}`);
    res.json({ success: true, data: hackathon });
  } catch (err) {
    next(err);
  }
}

export async function deleteHackathon(req: Request, res: Response, next: NextFunction) {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });
    logger.info(`Admin ${req.user!.id} deleted hackathon ${req.params.id}`);
    res.json({ success: true, message: 'Hackathon deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Certificate Management ───────────────────────────────────────────────────

export async function listAllCertificates(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip  = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      Certificate.find()
        .populate('userId', 'fullName email')
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Certificate.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { certificates, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    logger.info(`Admin ${req.user!.id} revoked certificate ${req.params.id}`);
    res.json({ success: true, message: 'Certificate revoked' });
  } catch (err) {
    next(err);
  }
}

// ─── Platform Analytics (admin-only aggregate) ───────────────────────────────

export async function getPlatformSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newUsers30d, newUsers7d, roleDistribution,
      totalHackathons, hackathonByStatus,
      totalCertificates,
      totalQuizAttempts,
      xpAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.aggregate([
        { $group:   { _id: '$role', count: { $sum: 1 } } },
        { $project: { role: '$_id', count: 1, _id: 0 } },
      ]),
      Hackathon.countDocuments(),
      Hackathon.aggregate([
        { $group:   { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      Certificate.countDocuments(),
      QuizAttempt.countDocuments(),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$totalPoints' } } }]),
    ]);

    const hackathonStatus: Record<string, number> = {};
    hackathonByStatus.forEach((h: any) => { hackathonStatus[h.status] = h.count; });

    const roleMap: Record<string, number> = {};
    roleDistribution.forEach((r: any) => { roleMap[r.role] = r.count; });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newLast30Days: newUsers30d,
          newLast7Days:  newUsers7d,
          students:  roleMap['STUDENT']   ?? 0,
          mentors:   roleMap['MENTOR']    ?? 0,
          corporates: roleMap['CORPORATE'] ?? 0,
          admins:    roleMap['ADMIN']     ?? 0,
        },
        hackathons: {
          total:     totalHackathons,
          draft:     hackathonStatus['DRAFT']     ?? 0,
          published: hackathonStatus['PUBLISHED'] ?? 0,
          active:    hackathonStatus['ACTIVE']    ?? 0,
          completed: hackathonStatus['COMPLETED'] ?? 0,
        },
        certificates: { total: totalCertificates },
        quizzes:      { totalAttempts: totalQuizAttempts },
        totalXpAwarded: xpAgg[0]?.total ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

// â”€â”€â”€ Catalog / Learning Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function listCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paginateModel(req, Course, 'courses', {
      select: 'title slug difficulty specializationId isPublished enrollmentCount estimatedHours createdAt',
      populate: [{ path: 'specializationId', select: 'name slug domainId' }],
      sort: { createdAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listLessons(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paginateModel(req, Tutorial, 'lessons', {
      select: 'title slug category difficulty duration isPublished viewCount createdAt',
      sort: { createdAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listAssessments(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    const filter = status ? { status: status.toUpperCase() } : {};
    const data = await paginateModel(req, Assessment, 'assessments', {
      filter,
      select: 'userId domain status currentStep totalQuestions overallScore startedAt completedAt',
      populate: [{ path: 'userId', select: 'fullName email role' }],
      sort: { startedAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listSkillReports(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paginateModel(req, SkillScores, 'results', {
      select: 'userId domain overallLevel estimatedLevel strengths weaknesses updatedAt',
      populate: [{ path: 'userId', select: 'fullName email role' }],
      sort: { updatedAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listQuizzes(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paginateModel(req, Quiz, 'quizzes', {
      select: 'title domain difficulty questionCount isPublished createdAt',
      sort: { createdAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip  = (page - 1) * limit;

    const [hackathonSubmissions, capstoneSubmissions, hackathonTotal, capstoneTotal] = await Promise.all([
      HackathonSubmission.find()
        .populate('userId', 'fullName email')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CapstoneSubmission.find()
        .populate('userId', 'fullName email')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HackathonSubmission.countDocuments(),
      CapstoneSubmission.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        submissions: [
          ...hackathonSubmissions.map((item: any) => ({ ...item, type: 'HACKATHON' })),
          ...capstoneSubmissions.map((item: any) => ({ ...item, type: 'CAPSTONE' })),
        ].slice(0, limit),
        total: hackathonTotal + capstoneTotal,
        page,
        limit,
        totalPages: Math.ceil((hackathonTotal + capstoneTotal) / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paginateModel(req, PaymentTransaction, 'payments', {
      select: 'userId amount currency status provider planId createdAt updatedAt',
      populate: [{ path: 'userId', select: 'fullName email role' }],
      sort: { createdAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listEnrollments(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await paginateModel(req, CourseEnrollment, 'enrollments', {
      select: 'userId courseId status progressPercent enrolledAt completedAt',
      populate: [{ path: 'userId', select: 'fullName email role' }],
      sort: { enrolledAt: -1 },
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getRoleAccessControl(_req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      roles: [
        { role: 'STUDENT', access: ['student dashboard', 'courses', 'assessments', 'hackathons', 'certificates'] },
        { role: 'MENTOR', access: ['mentor dashboard', 'classes', 'submissions', 'capstones', 'quizzes'] },
        { role: 'CORPORATE', access: ['corporate dashboard', 'hackathons', 'candidates', 'shortlists', 'reports'] },
        { role: 'ADMIN', access: ['all management surfaces', 'analytics', 'role-based access control'] },
      ],
    },
  });
}
