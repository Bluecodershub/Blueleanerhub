import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import mentorController from '../controllers/mentor.controller';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All mentor routes require MENTOR or ADMIN role
router.use(authenticate, authorize('MENTOR', 'ADMIN'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', mentorController.getDashboardStats.bind(mentorController));

// ─── Profile ────────────────────────────────────────────────────────────────
router.get('/profile', mentorController.getProfile.bind(mentorController));
router.put('/profile', mentorController.updateProfile.bind(mentorController));

// ─── Classes / Batches ────────────────────────────────────────────────────────
router.get('/classes', mentorController.getClasses.bind(mentorController));
router.post('/classes', apiLimiter, mentorController.createClass.bind(mentorController));
router.get('/classes/:id', mentorController.getClassById.bind(mentorController));
router.put('/classes/:id', mentorController.updateClass.bind(mentorController));
router.delete('/classes/:id', mentorController.deleteClass.bind(mentorController));

// ─── Sessions ───────────────────────────────────────────────────────────────
router.get('/sessions', mentorController.getSessions.bind(mentorController));
router.post('/classes/:id/sessions', apiLimiter, mentorController.createSession.bind(mentorController));
router.put('/sessions/:id', mentorController.updateSession.bind(mentorController));

// ─── Assignments ───────────────────────────────────────────────────────────
router.get('/assignments', mentorController.getAssignments.bind(mentorController));
router.post('/classes/:id/assignments', apiLimiter, mentorController.createAssignment.bind(mentorController));

// ─── Submissions / Grading ─────────────────────────────────────────────────
router.get('/submissions', mentorController.getSubmissions.bind(mentorController));
router.put('/submissions/:id/grade', mentorController.gradeSubmission.bind(mentorController));

// ─── Attendance ─────────────────────────────────────────────────────────────
router.post('/sessions/:id/attendance', mentorController.markAttendance.bind(mentorController));
router.get('/sessions/:id/attendance', mentorController.getAttendance.bind(mentorController));

// ─── Student Progress ───────────────────────────────────────────────────────
router.get('/students/:id/progress', mentorController.getStudentProgress.bind(mentorController));

// ─── Capstone Grading ──────────────────────────────────────────────────────
router.get('/capstones',            mentorController.getCapstones.bind(mentorController));
router.put('/capstones/:id/grade',  apiLimiter, mentorController.gradeCapstone.bind(mentorController));

export default router;
