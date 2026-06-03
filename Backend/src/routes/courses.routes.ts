import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import mongoose from 'mongoose';
import { Assessment, Course, CourseEnrollment, CapstoneSubmission, Domain, Specialization } from '../db/models';
import logger from '../utils/logger';
import { asString } from '../utils/request';

const router = Router();

// ─── Course Enrollment ────────────────────────────────────────────────────────

router.post('/:id/enroll', authenticate, apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId   = new mongoose.Types.ObjectId(req.user!.id);
    const courseId = asString(req.params.id);

    const existing = await CourseEnrollment.findOne({ userId, courseId }).lean();
    if (existing) {
      return res.json({ success: true, data: existing, alreadyEnrolled: true });
    }

    if (mongoose.Types.ObjectId.isValid(courseId)) {
      const course = await Course.findById(courseId).select('specializationId').lean();
      const specialization = course?.specializationId
        ? await Specialization.findById(course.specializationId).select('domainId').lean()
        : null;
      const domain = specialization?.domainId
        ? await Domain.findById(specialization.domainId).select('slug name').lean()
        : null;
      const domainKeys = [domain?.slug, domain?.name].filter(Boolean) as string[];

      if (domainKeys.length > 0) {
        const completedAssessment = await Assessment.findOne({
          userId,
          domain: { $in: domainKeys },
          status: 'COMPLETED',
        }).select('_id').lean();

        if (!completedAssessment) {
          return res.status(403).json({
            success: false,
            message: 'Complete the domain assessment before enrolling in this course.',
            requiresAssessment: true,
            domain: domainKeys[0],
          });
        }
      }
    }

    const enrollment = await CourseEnrollment.create({ userId, courseId, status: 'ACTIVE', progressPercent: 0 });
    logger.info(`User ${req.user!.id} enrolled in course ${courseId}`);
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
});

router.get('/enrolled', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.id);
    const enrollments = await CourseEnrollment.find({ userId })
      .sort({ enrolledAt: -1 })
      .lean();
    res.json({ success: true, data: enrollments });
  } catch (err) {
    next(err);
  }
});

// ─── Capstone Submission ──────────────────────────────────────────────────────

router.post('/:id/capstone', authenticate, apiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId   = new mongoose.Types.ObjectId(req.user!.id);
    const courseId = req.params.id;
    const { repoUrl, demoUrl, description, courseTitle } = req.body;

    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: 'description is required' });
    }

    // Only one active submission per course per student
    const existing = await CapstoneSubmission.findOne({ userId, courseId, status: { $ne: 'REJECTED' } }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Capstone already submitted for this course' });
    }

    const submission = await CapstoneSubmission.create({
      userId, courseId, courseTitle, repoUrl, demoUrl, description,
    });

    logger.info(`User ${req.user!.id} submitted capstone for course ${courseId}`);
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/capstone', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId   = new mongoose.Types.ObjectId(req.user!.id);
    const courseId = req.params.id;
    const submission = await CapstoneSubmission.findOne({ userId, courseId }).lean();
    res.json({ success: true, data: submission ?? null });
  } catch (err) {
    next(err);
  }
});

export default router;
