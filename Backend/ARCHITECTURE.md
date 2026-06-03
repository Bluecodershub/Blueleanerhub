# Backend Architecture Documentation

## Overview

BluelearnerHub uses a **hybrid multi-service architecture** with the following components:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                          │
│                           Port: 3000                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│   Backend (Node.js/Express)     │   │   AI Services (Node.js + Python)│
│         Port: 5000               │   │          Port: 8000              │
│                                 │   │                                  │
│  - REST API (all core features) │   │  - Gemini AI (primary)           │
│  - JWT Authentication           │   │  - Ollama (local fallback)       │
│  - Socket.IO WebSockets         │   │  - Quiz Generation               │
│  - MongoDB + Mongoose            │   │                                  │
│  - Redis (caching / rate limits) │   │                                  │
│  - Stripe Payments               │   │                                  │
└─────────────────────────────────┘   └─────────────────────────────────┘
            │                                   │
            ▼                                   ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│        MongoDB (port 27017)      │   │         Redis (port 6379)        │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

## Primary vs Secondary Services

### Primary Backend: Node.js/Express (`backend/`)
**Status: ACTIVE - Primary**

This is the **main backend** handling all core platform features:

| Feature | Endpoint | Service |
|---------|----------|---------|
| Authentication | `/api/v1/auth/*` | JWT + HttpOnly signed cookies |
| User Management | `/api/v1/auth/profile` | Mongoose / User model |
| Adaptive Learning | `/api/v1/adaptive-learning/*` | AdaptiveLearningService + Gemini |
| Learning Catalog | `/api/v1/learning/*` | Domain / Course / Module / Lab models |
| Learning Tracks | `/api/v1/tracks/*` | LearningTrack / TrackEnrollment models |
| Quizzes | `/api/v1/quiz/*` | Quiz / QuizAttempt models |
| Hackathons | `/api/v1/hackathons/*` | Hackathon / HackathonTeam models |
| Jobs | `/api/v1/jobs/*` | Job / JobApplication models |
| Analytics | `/api/v1/analytics/*` | MongoDB aggregations |
| Developer Portal | `/api/v1/repositories/*` | Repository / Commit / Issue / PR models |
| Gamification | `/api/v1/gamification/*` | GamificationService + XpTracking model |
| Real-time | Socket.IO | WebSocket (sandbox events) |
| Payments | `/api/v1/payments/*` | Stripe + UserSubscription model |

### AI Services: Node.js + Python (`worker/ai-services/`)
**Status: ACTIVE - AI-Only (Node.js primary, Python experimental)**

These are **specialized AI services** called by the primary backend:

| Service | Called From | Purpose |
|---------|-------------|---------|
| `/api/ai/generate` | Backend `/api/v1/ai/*` | AI content generation |
| `/api/ai/quiz` | Backend Quiz endpoint | AI-generated quizzes |
| `/api/ai/chat` | Frontend AI Companion | Real-time AI tutoring |

## Database: MongoDB + Mongoose

**Primary database: MongoDB** via Mongoose ODM (migrated from PostgreSQL in May 2026).

All models live in `backend/src/db/models.ts`. The `db` object in `backend/src/db/index.ts` exposes:
- `db.query.<model>.findMany/findFirst/findById/create/update/updateById/delete` — typed Mongoose helpers
- `db.transaction(callback)` — Mongoose session + transaction via AsyncLocalStorage
- `db.paginate(model, filter, options)` — cursor-based pagination helper

### Key Models

| Model | Collection | Purpose |
|-------|-----------|---------|
| `User` | users | Core identity, XP, streaks |
| `RefreshToken` | refreshtokens | JWT rotation (TTL index on expiresAt) |
| `PasswordResetToken` | passwordresettokens | Password reset (TTL index on expiresAt) |
| `Assessment` | assessments | Adaptive quiz sessions (statuses: IN_PROGRESS, COMPLETED, ABANDONED) |
| `SkillScores` | skillscores | Post-assessment placement results |
| `LearningPath` | learningpaths | Personalized node roadmaps |
| `MentorInteraction` | mentorinteractions | AI mentor chat (capped at 100 messages) |
| `LearningTrack` | learningtracks | Curated learning paths |
| `TrackEnrollment` | trackenrollments | User → track enrolment + progress |
| `Repository` | repositories | Developer portal repos |
| `Commit / Issue / PullRequest` | — | Developer portal VCS |
| `XpTracking` | xptrackings | Per-event XP log (used by weekly/monthly leaderboard) |

### Security Notes
- **`isBanned` / `isActive`** are checked in `middleware/auth.ts` on every request. Call `invalidateUserAuthCache(userId)` after banning a user to evict the 60s Redis cache immediately.
- **TTL indexes** on `RefreshToken.expiresAt` and `PasswordResetToken.expiresAt` auto-purge expired documents.
- **Organization.type** enum is normalized to `'UNIVERSITY' | 'COMPANY' | 'COMMUNITY'` (all uppercase).

## Rate Limiting

All rate limiters in `middleware/rateLimiter.ts` use a Redis-backed store (`RedisRateLimitStore`) so counters are shared across all app instances. Falls back to per-instance counting when Redis is unavailable.

| Limiter | Window | Max | Applied to |
|---------|--------|-----|-----------|
| `generalLimiter` | 1 min | 500 | All `/api` routes |
| `authLimiter` | 15 min | 5 | Login / register |
| `codeExecutionLimiter` | 1 min | 10 | Code execution |
| `passwordResetLimiter` | 1 hour | 3 | Password reset |

## API Layer Architecture

```
/api/v1/*     — Public API (JWT auth, frontend-facing)
/service/*    — Service API (API key auth, backend-to-DB)
/internal/*   — Internal API (API key auth, backend-to-backend, Stripe webhooks)
```

## Email Verification

Users receive a verification email after registration (fire-and-forget). Routes:
- `GET /api/v1/auth/verify-email?token=<raw_token>` — verify (public)
- `POST /api/v1/auth/resend-verification` — resend (authenticated)

Tokens are SHA-256 hashed before storage. 24-hour TTL enforced in MongoDB document.

## AI Services: Node.js Layer (`worker/ai-services/index.js`)
**Status: ACTIVE - Production**

The Node.js AI layer handles all production AI traffic via the Gemini provider.

The **Python/FastAPI layer** (`worker/ai-services/app/`) is **experimental** and not in production.

## Deployment

### Development:
```bash
cd devops && docker-compose up
# Or individually:
cd backend && npm run dev       # Port 5000
cd worker/ai-services && npm start  # Port 8000
```

### Production:
- **Backend**: Express on Render / ECS Fargate (port 5000)
- **AI Services**: Node.js on Render / ECS Fargate (port 8000)
- **Database**: MongoDB Atlas
- **Cache**: Redis (Upstash or Redis Cloud)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | ✅ prod | MongoDB Atlas connection string |
| `REDIS_URL` | ✅ prod | Redis connection (rate limits, cache) |
| `JWT_SECRET` | ✅ all | JWT signing key (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ all | Refresh token signing key |
| `COOKIE_SECRET` | ✅ all | Cookie signing key |
| `SESSION_SECRET` | ✅ all | Session signing key |
| `GEMINI_API_KEY` | ✅ prod | Google Gemini AI |
| `STRIPE_SECRET_KEY` | ✅ prod | Stripe payments |
| `SENDGRID_API_KEY` | recommended | Transactional email |

---

**Last Updated**: May 2026
**Architecture Version**: 3.0 (MongoDB)
