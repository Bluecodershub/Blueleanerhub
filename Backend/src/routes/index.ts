import { Router } from 'express';
import authRoutes from './auth.routes';
import avatarRoutes from './avatar';
import quizRoutes from './quiz.routes';
import hackathonRoutes from './hackathon.routes';
import jobRoutes from './job.routes';
import learningRoutes from './learning.routes';
import analyticsRoutes from './analytics.routes';
import aiRoutes from './ai.routes';
import paymentRoutes from './payment.routes';
import errorRoutes from './errors.routes';
// ── NEW CIVILIZATION MODULES ──────────────────────────────────────────────
import tutorialRoutes     from './tutorials';
import qnaRoutes          from './qna';
import repositoryRoutes   from './repositories';
import certificateRoutes  from './certificates';
import trackRoutes        from './tracks';
import organizationRoutes from './organizations';
import dailyQuizRoutes    from './dailyQuiz.routes';
import notebookRoutes     from './notebooks';
import gamificationRoutes from './gamification';
import exerciseRoutes     from './exercises';
import codeRoutes         from './code';
import leadsRoutes        from './leads';
import oauthRoutes        from './oauth';
import spacesRoutes       from './spaces.routes';
import mentorRoutes       from './mentor.routes';
import corporateRoutes    from './corporate.routes';
import productRoutes    from './products.routes';
import adaptiveLearningRoutes from './adaptiveLearning.routes';
import trackingRoutes from './tracking.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notifications.routes';
import coursesRoutes from './courses.routes';
import moodleRoutes from './moodle.routes';
import legalRoutes from './legal.routes';
// ── API LAYERS ─────────────────────────────────────────────────────────────
import internalRoutes     from './internal.routes';
import serviceRoutes      from './service.routes';
import publicRoutes       from './public.routes';

const router = Router();
const v1Router = Router();

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * API LAYER ARCHITECTURE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  LAYER 1: PUBLIC API (/api/v1/*)                                    │
 * │  Frontend → Backend (JWT Auth)                                      │
 * │  - Login, Register, Profile fetch                                    │
 * │  - Live search (hackathons, jobs, candidates)                       │
 * │  - Student dashboard data                                            │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  LAYER 2: SERVICE API (/service/*)                                  │
 * │  Backend Services → Database (API Key Auth)                          │
 * │  - User insert, profile update                                       │
 * │  - Report queries, analytics                                         │
 * │  - Batch operations                                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  LAYER 3: INTERNAL API (/internal/*)                               │
 * │  Backend ↔ Backend (API Key Auth)                                   │
 * │  - Payment webhooks (Stripe)                                         │
 * │  - Token verification between services                               │
 * │  - Cross-service queries, reports                                    │
 * └─────────────────────────────────────────────────────────────────────┘
 */

// ── PUBLIC API v1 (Frontend-Facing) ──────────────────────────────────────────
v1Router.use('/auth', authRoutes);
v1Router.use('/auth/oauth', oauthRoutes);
v1Router.use('/avatar', avatarRoutes);
v1Router.use('/quiz', quizRoutes);
v1Router.use('/hackathons', hackathonRoutes);
v1Router.use('/jobs', jobRoutes);
v1Router.use('/learning', learningRoutes);
v1Router.use('/analytics', analyticsRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/payments', paymentRoutes);
v1Router.use('/errors', errorRoutes);
// ── NEW CIVILIZATION MODULES ──────────────────────────────────────────────
v1Router.use('/tutorials',     tutorialRoutes);     // Interactive Tutorial Engine
v1Router.use('/qna',           qnaRoutes);          // Q&A Knowledge Network
v1Router.use('/repositories',  repositoryRoutes);   // Developer Portal
v1Router.use('/certificates',  certificateRoutes);  // Verifiable Credentials
v1Router.use('/tracks',        trackRoutes);        // Learning Tracks
v1Router.use('/organizations', organizationRoutes); // Corporate & University
v1Router.use('/daily-quiz',    dailyQuizRoutes);    // AI Daily Quiz
v1Router.use('/notebooks',     notebookRoutes);      // Study Notebooks (NotebookLM)
v1Router.use('/gamification',  gamificationRoutes); // Achievements + Leaderboard
v1Router.use('/exercises',     exerciseRoutes);     // Practice Challenge Hub
v1Router.use('/code',          codeRoutes);         // Sandboxed Code Execution (Judge0)
v1Router.use('/leads',         leadsRoutes);        // Newsletter / Lead Capture
v1Router.use('/spaces',        spacesRoutes);        // Coding Challenges / Quiz Arena
v1Router.use('/mentor',        mentorRoutes);        // Mentor Dashboard
v1Router.use('/corporate',     corporateRoutes);    // Corporate Hiring Dashboard
v1Router.use('/products',      productRoutes);      // Product Catalog
v1Router.use('/adaptive-learning', adaptiveLearningRoutes); // AI Adaptive Learning System
v1Router.use('/tracking',          trackingRoutes);          // Telemetry and Wishlist Tracking
v1Router.use('/admin',             adminRoutes);             // Admin management panel
v1Router.use('/notifications',     notificationRoutes);      // User notifications
v1Router.use('/courses',           coursesRoutes);           // Course enrollment & capstone
v1Router.use('/moodle',            moodleRoutes);            // Moodle LMS integration (admin)
v1Router.use('/legal',             legalRoutes);             // Consent records + grievance redressal

// ── PUBLIC API v1 (Search & Profile) ─────────────────────────────────────────
v1Router.use('/public', publicRoutes);               // Live search, profile, candidate search

// Mount v1 API under /v1
router.use('/v1', v1Router);

// ── SERVICE API (Backend Services → Database) ────────────────────────────────
router.use('/service', serviceRoutes);            // User CRUD, profiles, reports

// ── INTERNAL API (Backend ↔ Backend) ────────────────────────────────────────
router.use('/internal', internalRoutes);          // Webhooks, token verification, cross-service

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: 'v1',
    layers: {
      public: '/api/v1/*',
      service: '/service/*',
      internal: '/internal/*',
    },
  });
});

export default router;
