import { Request, Response, NextFunction } from 'express';
import { MentorProfile, MentorBatch, MentorSession, MentorAssignment, User, CapstoneSubmission } from '../db/models';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export class MentorController {
  // ─── Dashboard ──────────────────────────────────────────────────────────────
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const profile = await MentorProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
      if (!profile) {
        return res.json({ success: true, data: { totalClasses: 0, totalStudents: 0, upcomingSessions: 0, pendingSubmissions: 0 } });
      }

      const batches = await MentorBatch.find({ mentorId: new mongoose.Types.ObjectId(userId) }).lean();
      const totalStudents = batches.reduce((acc: number, b: any) => acc + (b.studentIds?.length || 0), 0);

      res.json({
        success: true,
        data: {
          totalClasses:       batches.length,
          totalStudents,
          upcomingSessions:   0,
          pendingSubmissions: 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Classes / Batches ─────────────────────────────────────────────────────
  async getClasses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page  = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip  = (page - 1) * limit;

      const batches = await MentorBatch.find({ mentorId: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const result = batches.map((b: any) => ({ ...b, studentCount: b.studentIds?.length || 0, sessionCount: 0 }));
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createClass(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, description, startDate, endDate } = req.body;

      if (!name) return res.status(400).json({ success: false, message: 'Class name is required' });

      // Ensure mentor profile exists
      await MentorProfile.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), expertise: [], experience: 0, isAvailable: true } },
        { upsert: true },
      );

      const batch = await MentorBatch.create({
        name,
        description,
        mentorId:   new mongoose.Types.ObjectId(userId),
        studentIds: [],
        startDate:  startDate ? new Date(startDate) : new Date(),
        endDate:    endDate ? new Date(endDate) : undefined,
        isActive:   true,
        createdAt:  new Date(),
      });

      logger.info(`Mentor ${userId} created class: ${name}`);
      res.status(201).json({ success: true, data: batch });
    } catch (error) {
      next(error);
    }
  }

  async getClassById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id }   = req.params;
      const userId   = req.user!.id;

      const batch = await MentorBatch.findOne({
        _id:      id,
        mentorId: new mongoose.Types.ObjectId(userId),
      }).lean();

      if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });

      const students = await User.find({ _id: { $in: (batch as any).studentIds } })
        .select('fullName email profilePicture avatarConfig')
        .lean();

      res.json({ success: true, data: { ...batch, students, sessions: [], pendingSubmissions: [] } });
    } catch (error) {
      next(error);
    }
  }

  async updateClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { name, description, startDate, endDate, isActive } = req.body;

      const updates: Record<string, any> = {};
      if (name        !== undefined) updates.name      = name;
      if (description !== undefined) updates.description = description;
      if (startDate   !== undefined) updates.startDate = new Date(startDate);
      if (endDate     !== undefined) updates.endDate   = new Date(endDate);
      if (isActive    !== undefined) updates.isActive  = isActive;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      const batch = await MentorBatch.findOneAndUpdate(
        { _id: id, mentorId: new mongoose.Types.ObjectId(userId) },
        updates,
        { new: true },
      );

      if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });
      res.json({ success: true, data: batch });
    } catch (error) {
      next(error);
    }
  }

  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const batch = await MentorBatch.findOneAndDelete({
        _id:      id,
        mentorId: new mongoose.Types.ObjectId(userId),
      });

      if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });
      res.json({ success: true, message: 'Class deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Sessions (stub — no Session model in MongoDB schema yet) ─────────────
  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = new mongoose.Types.ObjectId(req.user!.id);
      const sessions = await MentorSession.find({ mentorId })
        .populate('batchId', 'name')
        .sort({ scheduledAt: -1 })
        .limit(100)
        .lean();
      res.json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { title, scheduledAt, duration, durationMinutes, meetingLink, notes } = req.body;

      if (!title || !scheduledAt) {
        return res.status(400).json({ success: false, message: 'Title and scheduled time are required' });
      }

      const batch = await MentorBatch.findOne({ _id: id, mentorId: new mongoose.Types.ObjectId(userId) });
      if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });

      const session = await MentorSession.create({
        batchId: new mongoose.Types.ObjectId(id as string),
        mentorId: new mongoose.Types.ObjectId(userId),
        title,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: Number(durationMinutes ?? duration ?? 60),
        meetingLink,
        notes,
      });

      logger.info(`Session created for class ${id}: ${title}`);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = new mongoose.Types.ObjectId(req.user!.id);
      const { title, scheduledAt, durationMinutes, meetingLink, notes, status } = req.body;
      const updates: Record<string, any> = { updatedAt: new Date() };
      if (title !== undefined) updates.title = title;
      if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
      if (durationMinutes !== undefined) updates.durationMinutes = Number(durationMinutes);
      if (meetingLink !== undefined) updates.meetingLink = meetingLink;
      if (notes !== undefined) updates.notes = notes;
      if (status !== undefined) updates.status = status;

      const session = await MentorSession.findOneAndUpdate(
        { _id: req.params.id, mentorId },
        updates,
        { new: true },
      );
      if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  // ─── Assignments / Submissions (stub) ──────────────────────────────────────
  async getAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = new mongoose.Types.ObjectId(req.user!.id);
      const assignments = await MentorAssignment.find({ mentorId })
        .populate('batchId', 'name')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async createAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const mentorId = new mongoose.Types.ObjectId(req.user!.id);
      const { title, taskTitle, description, dueDate, maxScore } = req.body;
      const assignmentTitle = title || taskTitle;

      if (!assignmentTitle) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      const batch = await MentorBatch.findOne({ _id: id, mentorId });
      if (!batch) return res.status(404).json({ success: false, message: 'Class not found' });

      const assignment = await MentorAssignment.create({
        batchId: new mongoose.Types.ObjectId(id as string),
        mentorId,
        title: assignmentTitle,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        maxScore: Number(maxScore || 100),
      });

      logger.info(`Assignment created for class ${id}: ${assignmentTitle}`);
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissions(req: Request, res: Response, _next: NextFunction) {
    res.json({ success: true, data: [] });
  }

  async gradeSubmission(req: Request, res: Response, _next: NextFunction) {
    const { score, feedback } = req.body;
    if (score === undefined) return res.status(400).json({ success: false, message: 'Score is required' });
    res.json({ success: true, data: { id: req.params.id, score, feedback, status: 'GRADED' } });
  }

  // ─── Attendance (stub) ─────────────────────────────────────────────────────
  async markAttendance(req: Request, res: Response, _next: NextFunction) {
    const { studentId, attended } = req.body;
    res.json({ success: true, data: { sessionId: req.params.id, studentId, attended } });
  }

  async getAttendance(req: Request, res: Response, _next: NextFunction) {
    res.json({ success: true, data: [] });
  }

  // ─── Student Progress ───────────────────────────────────────────────────────
  async getStudentProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify mentor has this student in one of their batches
      const batch = await MentorBatch.findOne({
        mentorId:   new mongoose.Types.ObjectId(userId),
        studentIds: new mongoose.Types.ObjectId(id as string),
      });

      if (!batch) return res.status(403).json({ success: false, message: 'Access denied' });

      const student = await User.findById(id).select('fullName email profilePicture avatarConfig').lean();
      res.json({ success: true, data: { student, submissions: [], attendance: [] } });
    } catch (error) {
      next(error);
    }
  }

  // ─── Mentor Profile ────────────────────────────────────────────────────────
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const profile = await MentorProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
      if (!profile) return res.json({ success: true, data: null });

      const batches = await MentorBatch.find({ mentorId: new mongoose.Types.ObjectId(userId) }).lean();
      const totalStudents = batches.reduce((acc: number, b: any) => acc + (b.studentIds?.length || 0), 0);

      res.json({
        success: true,
        data: {
          ...profile,
          stats: { totalClasses: batches.length, totalStudents, completedSessions: 0 },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { expertise, experience, bio, hourlyRate, isAvailable } = req.body;

      const updates: Record<string, any> = {};
      if (expertise   !== undefined) updates.expertise   = expertise;
      if (experience  !== undefined) updates.experience  = experience;
      if (bio         !== undefined) updates.bio         = bio;
      if (hourlyRate  !== undefined) updates.hourlyRate  = hourlyRate;
      if (isAvailable !== undefined) updates.isAvailable = isAvailable;

      const profile = await MentorProfile.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $set: updates, $setOnInsert: { userId: new mongoose.Types.ObjectId(userId) } },
        { upsert: true, new: true },
      );

      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  // ─── Capstone Queue ────────────────────────────────────────────────────────
  async getCapstones(req: Request, res: Response, next: NextFunction) {
    try {
      const page  = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
      const skip  = (page - 1) * limit;
      const status = req.query.status as string | undefined;

      const filter: Record<string, any> = {};
      if (status) filter.status = status.toUpperCase();

      const [submissions, total] = await Promise.all([
        CapstoneSubmission.find(filter)
          .populate('userId', 'fullName email avatarConfig')
          .sort({ submittedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CapstoneSubmission.countDocuments(filter),
      ]);

      res.json({ success: true, data: { submissions, total, page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  }

  async gradeCapstone(req: Request, res: Response, next: NextFunction) {
    try {
      const mentorId = new mongoose.Types.ObjectId(req.user!.id);
      const { grade, feedback, status } = req.body;

      if (grade === undefined) {
        return res.status(400).json({ success: false, message: 'grade is required' });
      }

      const allowed = ['GRADED', 'REJECTED', 'UNDER_REVIEW'];
      const newStatus = allowed.includes(status) ? status : 'GRADED';

      const submission = await CapstoneSubmission.findByIdAndUpdate(
        req.params.id,
        { grade, feedback, status: newStatus, gradedBy: mentorId, gradedAt: new Date() },
        { new: true },
      );

      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
      }

      logger.info(`Mentor ${req.user!.id} graded capstone ${req.params.id}: ${grade}`);
      res.json({ success: true, data: submission });
    } catch (error) {
      next(error);
    }
  }
}

export default new MentorController();
