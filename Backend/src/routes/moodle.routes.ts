/**
 * Moodle LMS Integration Routes (Admin only)
 * ------------------------------------------
 * Exposes connection status + manual sync triggers for the Admin Dashboard.
 * All endpoints are safe when Moodle is not configured (return connected:false).
 */
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  checkMoodleConnection,
  getMoodleCourses,
  getMoodleUsers,
  syncMoodleCourses,
  syncMoodleUsers,
  syncAllMoodle,
  getMoodleSyncSummary,
} from '../services/moodle.service';
import { db } from '../db';
import logger from '../utils/logger';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/status', async (_req, res) => {
  const status = await checkMoodleConnection();
  res.json({ success: true, data: status });
});

/** Connection status + last-sync + persisted mapping counts (real data only). */
router.get('/summary', async (_req, res) => {
  const [status, summary] = await Promise.all([checkMoodleConnection(), getMoodleSyncSummary()]);
  res.json({ success: true, data: { ...status, ...summary } });
});

router.get('/courses', async (_req, res) => {
  const result = await getMoodleCourses();
  res.json({ success: true, data: result });
});

router.get('/users', async (_req, res) => {
  const result = await getMoodleUsers();
  res.json({ success: true, data: result });
});

/** Persisted Moodle→local course mappings (empty until a successful sync). */
router.get('/mappings/courses', async (_req, res) => {
  const data = await db.query.moodleCourseMappings.findMany({});
  res.json({ success: true, data });
});

/** Recent sync-log entries for the admin audit trail. */
router.get('/sync/logs', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const data = await db.query.moodleSyncLogs.findMany({}, { limit });
  res.json({ success: true, data });
});

router.post('/sync/courses', async (req, res) => {
  const result = await syncMoodleCourses(req.user?.id);
  res.json({ success: true, data: result });
});

router.post('/sync/users', async (req, res) => {
  const result = await syncMoodleUsers(req.user?.id);
  res.json({ success: true, data: result });
});

router.post('/sync', async (req, res) => {
  const result = await syncAllMoodle(req.user?.id);
  logger.info(`[Moodle] Full sync triggered by admin ${req.user?.id}`);
  res.json({ success: true, data: result });
});

export default router;
