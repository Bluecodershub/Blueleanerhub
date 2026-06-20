import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import * as ctrl from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// ── Platform Analytics ───────────────────────────────────────────────────────
router.get('/analytics',                 apiLimiter, ctrl.getPlatformSummary);
router.get('/rbac',                      apiLimiter, ctrl.getRoleAccessControl);

// ── User Management ──────────────────────────────────────────────────────────
router.post('/users',                    apiLimiter, ctrl.createUser);
router.get('/users',                     apiLimiter, ctrl.listUsers);
router.get('/users/:id',                 apiLimiter, ctrl.getUserDetail);
router.put('/users/:id/role',            apiLimiter, ctrl.updateUserRole);
router.put('/users/:id/ban',             apiLimiter, ctrl.banUser);

// â”€â”€ Learning / Content Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/courses',                   apiLimiter, ctrl.listCourses);
router.get('/lessons',                   apiLimiter, ctrl.listLessons);
router.get('/assessments',               apiLimiter, ctrl.listAssessments);
router.get('/skill-reports',             apiLimiter, ctrl.listSkillReports);
router.get('/enrollments',               apiLimiter, ctrl.listEnrollments);
router.get('/quizzes',                   apiLimiter, ctrl.listQuizzes);
router.get('/submissions',               apiLimiter, ctrl.listSubmissions);
router.get('/payments',                  apiLimiter, ctrl.listPayments);

// ── Hackathon Moderation ─────────────────────────────────────────────────────
router.get('/hackathons',                apiLimiter, ctrl.listAllHackathons);
router.put('/hackathons/:id/status',     apiLimiter, ctrl.moderateHackathon);
router.delete('/hackathons/:id',         apiLimiter, ctrl.deleteHackathon);

// ── Certificate Management ───────────────────────────────────────────────────
router.get('/certificates',              apiLimiter, ctrl.listAllCertificates);
router.delete('/certificates/:id',       apiLimiter, ctrl.revokeCertificate);

// ── Legal & Compliance (Grievances + Consent audit) ─────────────────────────
router.get('/grievances',                apiLimiter, ctrl.listGrievances);
router.patch('/grievances/:id',          apiLimiter, ctrl.updateGrievance);
router.get('/consents',                  apiLimiter, ctrl.listConsents);

export default router;
