# BlueLearnerHub Codebase Arc

Generated from the repository on 2026-06-08.

This document describes the platform from top to bottom: user entry points, frontend routing, backend APIs, data ownership, AI services, infrastructure, and the main product loops.

## One-Line Shape

BlueLearnerHub is a multi-role education and hiring platform with a Next.js frontend, an Express/MongoDB backend, a local AI worker gateway, and DevOps assets for Docker, cloud deployment, and Kubernetes.

## Top-Level Repository Map

| Path | Responsibility |
| --- | --- |
| `Frontend/` | Next.js 16 App Router application, React 19, TypeScript, Tailwind, role-based UI, API client, frontend tests, Playwright tests. |
| `Backend/` | Express TypeScript API, MongoDB/Mongoose models, auth, CSRF, rate limiting, controllers, service layer, Socket.IO, payments, code execution. |
| `Worker/ai-services/` | Node.js AI gateway on port 8000, optional Python/FastAPI worker, local model/Ollama/BlueLearner routing, AI-only endpoints. |
| `Worker/ai-agent/` | Legacy or auxiliary Python CLI agent. Present but not part of the main request path. |
| `Devops/` | Docker Compose, production Compose, Kubernetes manifests, AWS ECS/CloudFormation assets, Render/Railway config, setup scripts. |
| `.github/` | GitHub automation and repository workflow assets. |

## Runtime Architecture

```text
Browser
  |
  | Next.js pages, layouts, auth_hint proxy cookie
  v
Frontend: Next.js app, port 3000
  |
  | Axios with credentials, CSRF header on mutations
  v
Backend: Express API, port 5000
  |
  | Mongoose queries, transactions, Redis cache/rate limits
  v
MongoDB primary database

Backend also calls:
  - Redis for auth cache, sessions, rate-limit state, and cache helpers.
  - Worker/ai-services on port 8000 for local AI generation and ML tasks.
  - Judge0 or local execution adapters for code execution.
  - Stripe for subscription checkout and webhooks.
  - SendGrid or Resend for transactional email when configured.

Worker/ai-services may call:
  - BlueLearner fine-tuned local model worker.
  - Ollama local LLM fallback.
  - Optional Python/FastAPI routes for ML-specific tasks.
```

## Request Lifecycle

1. A user enters through a Next.js route under `Frontend/src/app`.
2. `Frontend/src/proxy.ts` checks protected URL prefixes using the non-sensitive `auth_hint` cookie.
3. Role layouts such as `(student)/layout.tsx`, `(mentor)/layout.tsx`, and `(admin)/layout.tsx` wrap protected areas with `RoleGuard`.
4. `AuthContext` calls `GET /api/v1/auth/me` through `Frontend/src/lib/api.ts` to hydrate the real user session.
5. Mutating frontend API calls include `X-CSRF-Token`, read from the `_csrf` cookie.
6. `Backend/src/app.ts` applies security middleware: Helmet, CORS, body parsing, cookie parsing, request context, logging, rate limiting, CSRF, and route mounting.
7. `Backend/src/routes/index.ts` mounts public API modules under `/api/v1/*`, service APIs under `/api/service/*`, and internal APIs under `/api/internal/*`.
8. Route handlers call controllers and services. Services use Mongoose models through direct model imports or the `db` compatibility layer in `Backend/src/db/index.ts`.
9. Backend returns JSON to the frontend. Some modules also update XP, notifications, analytics, or telemetry.

## Frontend Arc

The frontend is a Next.js App Router application.

| Concern | Implementation |
| --- | --- |
| Framework | Next.js 16.2.6, React 19.2.3, TypeScript. |
| Styling | Tailwind CSS, shadcn/Radix primitives, Lucide icons, Framer Motion. |
| State | React context for auth, TanStack React Query provider, local component state. |
| API client | `Frontend/src/lib/api.ts` creates Axios `baseURL = NEXT_PUBLIC_API_URL + /api/v1`. |
| Domain client wrappers | `Frontend/src/lib/api-civilization.ts` wraps tracks, tutorials, notebooks, hackathons, Q&A, repos, certificates, organizations, daily quiz, gamification, code, AI, analytics. |
| Auth UI | `(auth)` routes plus `AuthContext`, `RoleGuard`, and role-specific login pages. |
| Route protection | `src/proxy.ts` performs first-pass redirect based on `auth_hint`; backend remains the source of truth. |
| Layouts | Marketing, auth, student, mentor, corporate, admin, and candidate page groups. |
| Error tracking | Sentry config exists; root providers wrap the app in error boundaries. |

Important frontend nuance:

- Route group folders such as `(student)` do not appear in URLs.
- The student layout only applies full student shell and `RoleGuard` to a defined set of paths. Some pages that live under `(student)` render without the student shell and may rely on backend 401s if they call protected APIs.

## Backend Arc

The backend is the primary platform API.

| Concern | Implementation |
| --- | --- |
| Runtime | Node.js, Express 4, TypeScript, CommonJS build. |
| Entry points | `Backend/src/server.ts` starts MongoDB, Redis, session service, Express app, Socket.IO, and daily quiz cron. `Backend/src/app.ts` builds the Express app. |
| Database | MongoDB via Mongoose. `MONGODB_URL` is preferred. |
| Cache/rate limits | Redis via `ioredis`; falls back where helper code allows it. |
| Auth | Signed HttpOnly access token cookie or Bearer token. Refresh token flow exists. |
| CSRF | Double-submit cookie pattern for mutating requests. |
| Authorization | `authenticate` plus `authorize(...)` middleware and route-specific role guards. |
| AI integration | `Backend/src/services/ai.service.ts` defaults to `AI_PROVIDER=local`, calling the AI gateway at `AI_SERVICE_URL`. |
| Code execution | `Backend/src/services/execution/*` manages runtime providers including Judge0 and local Python provider. |
| Payments | Stripe checkout, portal, and webhook routes under `/api/v1/payments`. |
| Realtime | Socket.IO service initialized in `server.ts`. |

## Backend API Layers

`Backend/src/routes/index.ts` defines three layers.

| Layer | Base path | Audience | Auth |
| --- | --- | --- | --- |
| Public API | `/api/v1/*` | Frontend and browser clients | Route-level public, optional auth, or JWT auth. |
| Service API | `/api/service/*` | Backend services and trusted callers | Internal API key. |
| Internal API | `/api/internal/*` | Backend-to-backend and webhooks | Internal API key or route-specific verification. |

Major `/api/v1` mounts:

| Mount | Product area |
| --- | --- |
| `/auth` and `/auth/oauth` | Login, register, refresh, profile, role logins, OAuth callbacks. |
| `/avatar` | Avatar read and save/update. |
| `/learning` | Domain, specialization, course, module, and lab catalog. |
| `/adaptive-learning` | Onboarding assessment, skill scoring, roadmap, generated content, mentor chat, sandbox assist. |
| `/tracks` | Learning tracks, enrollments, progress, completion certificates. |
| `/tutorials` | Tutorial listing, detail, progress, run-code, behavior events, adaptive guidance. |
| `/quiz` and `/daily-quiz` | Quizzes, attempts, leaderboards, AI quiz generation, daily quiz. |
| `/exercises` and `/code` | Practice exercises and sandboxed execution. |
| `/hackathons` | Hackathon browse, host, register, teams, payment, submissions, leaderboard, adaptive guidance. |
| `/jobs` | Job listings, applications, candidate ranking. |
| `/qna` | Questions, answers, tags, votes, accepted answers. |
| `/repositories` | Developer portal repositories, files, commits, issues, pull requests, stars. |
| `/notebooks` | Study notebooks, sources, PDF ingestion, chat, generate, annotations, adaptive guidance. |
| `/certificates` | My certificates, public verification, issue certificates. |
| `/organizations` | Organization directory, members, talent pools, challenges. |
| `/spaces` | Coding challenge and quiz arena surfaces. |
| `/mentor` | Mentor dashboard, classes, sessions, assignments, submissions, capstones. |
| `/corporate` | Corporate dashboard, jobs, candidates, shortlist, hackathons, ATS screening, bounties, profile. |
| `/admin` | Platform analytics, users, RBAC, courses, lessons, assessments, quizzes, submissions, payments, moderation. |
| `/payments` | Stripe checkout, portal, webhook. |
| `/notifications` | User notifications and read state. |
| `/tracking` | Lesson wishlist, progress, session heartbeat, recommendations, stats. |
| `/analytics` | User and platform analytics. |
| `/public` | Public search, profile, jobs search, hackathon search, candidate search. |
| `/ai` | Chat, quiz generation, review, recommendations, learning path, agent run. |

## Data Model Arc

Most persistent state is centralized in `Backend/src/db/models.ts` and re-exported through `Backend/src/db/index.ts`.

| Domain | Main models |
| --- | --- |
| Identity | `User`, `RefreshToken`, `PasswordResetToken`, `UserCredits`, `UserSubscription`, `CorporateProfile`. |
| Learning | `Domain`, `Specialization`, `Course`, `Module`, `Lab`, `Tutorial`, `LearningTrack`, `TrackCourse`, `TrackEnrollment`, `CourseEnrollment`. |
| Adaptive learning | `UserBackground`, `Assessment`, `SkillScores`, `LearningPath`, `CourseContent`, `RoadmapNodeProgress`, `MentorInteraction`. |
| Practice | `Exercise`, `ExerciseSubmission`, `DailyChallenge`, `Space`. |
| Quizzes | `Quiz`, `QuizAttempt`, `DailyQuizAttempt`. |
| Hackathons | `Hackathon`, `HackathonTeam`, `HackathonSubmission`. |
| Career/hiring | `Job`, `JobApplication`, corporate and candidate query flows. |
| Mentor | `MentorProfile`, `MentorBatch`, sessions/classes/assignments handled through mentor controller routes. |
| Community | `QnA`, `Organization`, `Lead`, `Notification`. |
| Notebook | `Notebook` plus notebook source/chat/annotation behavior in notebook controllers. |
| Developer portal | `Repository`, `RepositoryFile`, `Commit`, `Issue`, `PullRequest`, `RepositoryStar`. |
| Gamification | `UserAchievement`, `UserProgress`, `XpTracking`, streak/activity/recommendation models. |
| Commerce | `PaymentTransaction`, `UserSubscription`. |
| Observability | `FrontendError`, analytics and tracking collections. |

The `db` object includes a compatibility shim that mimics some older SQL/Drizzle-style access patterns while delegating to Mongoose. New backend code should prefer existing local patterns in the module being edited.

## AI Services Arc

`Worker/ai-services` is the AI gateway.

| Layer | Role |
| --- | --- |
| `index.js` | Express app, health check, CORS, request parsing, route mounting. |
| `routes/index.js` | Applies internal service auth to AI routes, mounts `/api/ai`, `/api/agent`, `/api/model`, `/api/v1`, and compatibility aliases. |
| `services/aiProvider.service.js` | Chooses BlueLearner first, then local Ollama fallback. Gemini is disabled in this stack. |
| `python/bridge.js` and `routes/python.routes.js` | Optional bridge to Python ML tasks. |
| `app/main.py` | Optional FastAPI app with ML endpoints, internal auth middleware, and route includes. |

Backend AI calls are protected with `INTERNAL_SERVICE_SECRET` when configured. The backend calls the worker through `AI_SERVICE_URL`, defaulting to `http://localhost:8000`.

## Product Flow Arc

1. Visitor lands on marketing pages and chooses a role.
2. Auth pages register or log in a user.
3. Student flow starts at onboarding or dashboard.
4. Adaptive assessment builds `SkillScores` and `LearningPath`.
5. Roadmap nodes lead to generated lessons in `CourseContent`.
6. Students practice through quizzes, daily quiz, exercises, IDE, labs, notebooks, Q&A, dev repos, organizations, and hackathons.
7. Progress emits tracking, XP, achievements, leaderboard updates, certificates, and notifications.
8. Mentors manage classes, assignments, sessions, submissions, grades, quizzes, hackathons, and student progress.
9. Corporate users manage hackathons, jobs, candidates, shortlists, reports, bounties, and profile data.
10. Admins govern users, content, quizzes, submissions, payments, certificates, hackathons, RBAC, and analytics.

## Security Model

| Area | Current behavior |
| --- | --- |
| Browser route hint | `auth_hint=1` cookie on frontend domain only says "a session may exist"; it carries no secret. |
| Real auth | Backend verifies signed HttpOnly `accessToken` cookie or Bearer token. |
| Refresh | Frontend retries one refresh on 401 through `/auth/refresh-token`. |
| CSRF | Backend issues `_csrf`; frontend mirrors it in `X-CSRF-Token` on mutations. |
| CORS | Backend allowlist comes from config plus production domains. |
| Banned/inactive users | Auth middleware checks `isActive` and `isBanned`; Redis auth cache TTL is 60 seconds. |
| Internal AI calls | Worker routes require `X-Internal-Service` when `INTERNAL_SERVICE_SECRET` is set. |
| Rate limits | General API limiter plus stricter auth, reset, notebook, code, and webhook limiters. |

## Testing and Quality Surfaces

| Area | Commands |
| --- | --- |
| Frontend unit tests | `cd Frontend && npm test` |
| Frontend lint | `cd Frontend && npm run lint` |
| Frontend type check | `cd Frontend && npm run type-check` |
| Frontend build | `cd Frontend && npm run build` |
| Frontend E2E | `cd Frontend && npm run test:e2e` |
| Backend tests | `cd Backend && npm test` |
| Backend build | `cd Backend && npm run build` |
| Worker tests | `cd Worker/ai-services && npm test` |

## Deployment Arc

| Target | Assets |
| --- | --- |
| Local all-in-one | `Devops/docker-compose.yml` runs MongoDB, Redis, backend, AI services, frontend, and nginx. |
| Production Compose | `Devops/docker-compose.prod.yml`. |
| Kubernetes | `Devops/k8s/*` for namespace, deployments, ingress, HPA, PVC, monitoring. |
| Render | `Devops/render.yaml`. |
| Railway | `Devops/railway.json`. |
| AWS | `Devops/aws/*` for ECS tasks, deploy scripts, CloudFormation. |
| Nginx | `Devops/docker/nginx/*`. |

## Notable Drift and Cleanup Targets

These are documentation or consistency issues visible in the current repo:

- Several existing markdown files contain mojibake characters from encoding drift.
- `Backend/.env.example` correctly documents MongoDB as primary, while `Backend/.env.production.example` still starts with a PostgreSQL `DATABASE_URL` example.
- `Frontend/DEVELOPMENT.md` references `Frontend/.env.example`, but no frontend `.env.example` file is currently present.
- `Backend/package.json` has `npm run seed` pointing at `scripts/seed.js`, but the visible seed file is `src/db/seed.ts`.
- There are duplicate or parallel route surfaces for some student concepts, for example `/student/hackathons` and `/hackathons`, `/student/library` and `/library`, `/student/leaderboard` and `/leaderboard`.
