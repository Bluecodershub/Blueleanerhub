/**
 * Learning Tracks Controller
 * ==========================
 * Structured career learning paths — enroll, track progress.
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { LearningTrack, TrackCourse, TrackEnrollment, Course, Certificate } from '../db';
import { GamificationService } from '../services/gamification.service';
import logger from '../utils/logger';

export const listTracks = async (req: Request, res: Response) => {
  try {
    const { domain, difficulty } = req.query as Record<string, string>;

    const filter: Record<string, any> = { isPublished: true };
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;

    const rows = await LearningTrack.find(filter).sort({ enrollmentCount: -1 }).lean();
    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error('listTracks error', err);
    res.status(500).json({ success: false, message: 'Failed to load tracks' });
  }
};

export const getTrack = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const userId = req.user?.id;

    const track = await LearningTrack.findOne({ slug, isPublished: true }).lean();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    // Load courses in this track ordered by orderIndex
    const trackCourseDocs = await TrackCourse.find({ trackId: track._id }).sort({ orderIndex: 1 }).lean();
    const courseIds = trackCourseDocs.map((tc) => tc.courseId);
    const courseDocs = await Course.find({ _id: { $in: courseIds } }).lean();
    const courseMap = new Map(courseDocs.map((c) => [String(c._id), c]));

    const trackCoursesData = trackCourseDocs.map((tc) => ({
      course: courseMap.get(String(tc.courseId)) ?? null,
      orderIndex: tc.orderIndex,
      isRequired: tc.isRequired,
    }));

    // Check enrollment
    let enrollment: any = null;
    if (userId) {
      enrollment = await TrackEnrollment.findOne({ userId, trackId: track._id }).lean();
    }

    res.json({ success: true, data: { ...track, courses: trackCoursesData, enrollment } });
  } catch (err) {
    logger.error('getTrack error', err);
    res.status(500).json({ success: false, message: 'Failed to load track' });
  }
};

export const enrollInTrack = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const trackId = String(req.params.id);

    if (!mongoose.isValidObjectId(trackId)) {
      return res.status(400).json({ success: false, message: 'Invalid track id' });
    }

    const track = await LearningTrack.findById(trackId).lean();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    const existing = await TrackEnrollment.findOne({ userId, trackId }).lean();
    if (existing) return res.json({ success: true, data: existing, alreadyEnrolled: true });

    const enrollment = await TrackEnrollment.create({ userId, trackId, progressPercentage: 0 });

    // Increment enrollment counter
    await LearningTrack.findByIdAndUpdate(trackId, { $inc: { enrollmentCount: 1 } });

    await GamificationService.awardXP(userId, 10, 'TRACK_ENROLLED');

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    logger.error('enrollInTrack error', err);
    res.status(500).json({ success: false, message: 'Enrollment failed' });
  }
};

export const getTrackProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const trackId = String(req.params.id);

    const enrollment = await TrackEnrollment.findOne({ userId, trackId }).lean();
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled' });

    res.json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load progress' });
  }
};

export const completeTrack = async (req: Request, res: Response) => {
  try {
    const userId  = req.user!.id;
    const trackId = String(req.params.id);

    const track = await LearningTrack.findById(trackId).lean();
    if (!track) return res.status(404).json({ success: false, message: 'Track not found' });

    const enrollment = await TrackEnrollment.findOneAndUpdate(
      { userId, trackId },
      { progressPercentage: 100, completedAt: new Date() },
      { new: true },
    ).lean();

    if (!enrollment) return res.status(404).json({ success: false, message: 'Not enrolled in this track' });

    // Auto-issue certificate if one doesn't already exist for this track
    const existingCert = await Certificate.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'COURSE',
      title: { $regex: (track as any).title, $options: 'i' },
    }).lean();

    let certificate: any = null;
    if (!existingCert) {
      const verificationCode = uuidv4();
      certificate = await Certificate.create({
        userId:           new mongoose.Types.ObjectId(userId),
        title:            `${(track as any).title} — Track Completion`,
        type:             'COURSE',
        verificationCode,
      });
      logger.info(`Auto-issued track certificate for user ${userId}: ${(track as any).title}`);
    }

    await GamificationService.awardXP(userId, 500, 'TRACK_COMPLETED');

    res.json({
      success: true,
      data: { enrollment, certificate },
      message: certificate ? 'Track completed and certificate issued!' : 'Track marked as complete.',
    });
  } catch (err) {
    logger.error('completeTrack error', err);
    res.status(500).json({ success: false, message: 'Failed to complete track' });
  }
};
