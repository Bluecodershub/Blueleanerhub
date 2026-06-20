# BlueLearnerHub Development Guide

Generated from the repository on 2026-06-08.

This is the practical guide for running, changing, and validating the platform locally.

## Prerequisites

| Tool | Notes |
| --- | --- |
| Node.js | Use Node 20+; Node 22 LTS is a good default. |
| npm | Use the npm bundled with your Node version. |
| Docker Desktop | Optional, but easiest for MongoDB, Redis, and full stack orchestration. |
| MongoDB | Required for backend runtime if not using Docker Compose. |
| Redis | Optional in development, recommended for realistic auth cache, rate limits, and sessions. |
| Python | Optional, only needed for the Python ML worker under `Worker/ai-services/app`. |
| Ollama or BlueLearner model worker | Optional, needed for real local AI generation. Without a provider, AI calls fail explicitly. |

## Install Dependencies

This repo is not currently wired as a root npm workspace. Install per service.

```powershell
cd D:\Bluelearnerhub\Frontend
npm install

cd D:\Bluelearnerhub\Backend
npm install

cd D:\Bluelearnerhub\Worker\ai-services
npm install
```

## Local Environment Files

### Backend

Create `Backend/.env` from `Backend/.env.example`.

Minimum useful local values:

```env
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
MONGODB_URL=mongodb://localhost:27017/bluelearnerhub
REDIS_URL=redis://localhost:6379
JWT_SECRET=<64-char-random-secret>
JWT_REFRESH_SECRET=<different-64-char-random-secret>
SESSION_SECRET=<64-char-random-secret>
COOKIE_SECRET=<64-char-random-secret>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
AI_SERVICE_URL=http://localhost:8000
AI_PROVIDER=local
INTERNAL_SERVICE_SECRET=<shared-secret-if-enabled>
```

Generate secrets with:

```powershell
openssl rand -hex 32
```

### Frontend

There is no `Frontend/.env.example` in the current file list, so create `Frontend/.env.local` manually:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=BluelearnerHub
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<local-random-secret>
NEXT_PUBLIC_ENABLE_AI_COMPANION=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### AI Worker

Create `Worker/ai-services/.env` from `Worker/ai-services/.env.example`.

Useful local values:

```env
PORT=8000
NODE_ENV=development
INTERNAL_SERVICE_SECRET=<same-as-backend-if-enabled>
BLUELEARNER_ENABLED=false
BLUELEARNER_URL=http://localhost:8002
OLLAMA_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama3
PYTHON_WORKER_ENABLED=true
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## Run the Stack

### Option 1: Docker Compose

Use this when you want MongoDB, Redis, backend, AI service, frontend, and nginx together.

1. Create `Devops/.env` from `Devops/.env.example`.
2. Fill all required secrets.
3. Start from the `Devops` directory so relative paths resolve.

```powershell
cd D:\Bluelearnerhub\Devops
docker compose up --build
```

Default local ports:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:5000` |
| Backend health | `http://localhost:5000/health` |
| Backend API health | `http://localhost:5000/api/health` |
| AI worker | `http://localhost:8000` |
| AI worker health | `http://localhost:8000/health` |
| MongoDB | `127.0.0.1:27017` |
| Redis | `127.0.0.1:6379` |

### Option 2: Manual Processes

Start MongoDB and Redis yourself, then run each service:

```powershell
cd D:\Bluelearnerhub\Worker\ai-services
npm run dev
```

```powershell
cd D:\Bluelearnerhub\Backend
npm run dev
```

```powershell
cd D:\Bluelearnerhub\Frontend
npm run dev
```

Open `http://localhost:3000`.

## Service Scripts

### Frontend

```powershell
npm run dev
npm run build
npm start
npm run lint
npm run lint:fix
npm run type-check
npm test
npm run test:e2e
```

### Backend

```powershell
npm run dev
npm run build
npm start
npm test
npm run lint
npm run migrate
```

Note: `npm run seed` currently points to `scripts/seed.js`, but the visible seed file is `src/db/seed.ts`. Confirm or fix this before relying on the seed script.

### AI Worker

```powershell
npm start
npm run dev
npm test
```

Optional Python worker:

```powershell
cd D:\Bluelearnerhub\Worker\ai-services
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

## Development Workflow

1. Pick the product area and start at the route file under `Frontend/src/app`.
2. Check whether the page uses direct `api.*` calls or a wrapper in `Frontend/src/lib/api-civilization.ts`.
3. Find the matching backend mount in `Backend/src/routes/index.ts`.
4. Follow the route to its controller in `Backend/src/controllers`.
5. Follow controller logic into services under `Backend/src/services`.
6. Confirm data model ownership in `Backend/src/db/models.ts`.
7. Add or update focused tests near the changed layer.
8. Run the narrowest validation command first, then build/type-check if the change touches shared contracts.

## Adding Frontend Features

Use existing App Router conventions:

| Need | Preferred location |
| --- | --- |
| Page route | `Frontend/src/app/<route>/page.tsx` or a role route group such as `(student)`. |
| Shared UI primitive | `Frontend/src/components/ui`. |
| Domain component | `Frontend/src/components/<domain>`. |
| API wrapper | `Frontend/src/lib/api-civilization.ts` for platform modules or `api.ts` for shared Axios behavior. |
| Auth/role handling | `Frontend/src/context/AuthContext.tsx`, `Frontend/src/components/auth/RoleGuard.tsx`, `Frontend/src/lib/authRoutes.ts`. |
| Navigation | Role layouts and `Frontend/src/components/layout/Sidebar.tsx`. |

Rules of thumb:

- Use the shared `api` Axios instance so credentials and CSRF behavior remain consistent.
- Put route-level shell and role gating in layouts, not in every leaf page.
- Keep role-specific navigation aligned with actual routes. There are already duplicate public/student surfaces, so avoid adding a third path for the same workflow unless intentional.
- For protected mutating actions, expect backend CSRF validation.

## Adding Backend Features

Follow the existing route-controller-service-model shape:

1. Add or extend a route file under `Backend/src/routes`.
2. Mount it in `Backend/src/routes/index.ts` if it is a new module.
3. Put HTTP parsing and response logic in a controller under `Backend/src/controllers`.
4. Put domain logic in `Backend/src/services`.
5. Add or extend Mongoose models in `Backend/src/db/models.ts`.
6. Add indexes with the model when query shape is known.
7. Use `authenticate`, `authorize`, validators, and route-specific limiters where appropriate.
8. Add tests under `Backend/tests` for controller/service behavior.

Backend security expectations:

- Never trust the frontend role guard. Backend routes must enforce auth and authorization.
- Mutating browser-facing routes must work with CSRF.
- Internal worker calls should include `X-Internal-Service` when `INTERNAL_SERVICE_SECRET` is configured.
- Any ban, deactivation, or role-sensitive auth change should consider Redis auth cache invalidation.

## Adding AI Features

For browser-facing AI:

1. Frontend calls `/api/v1/ai/*` or a domain endpoint such as notebooks/adaptive learning.
2. Backend validates auth and credits where applicable.
3. Backend calls `aiService` or the domain service.
4. `aiService` calls the Node AI gateway at `AI_SERVICE_URL`.
5. The worker chooses BlueLearner or local Ollama.

For worker-native routes:

- Add routes under `Worker/ai-services/routes`.
- Keep `internalAuth` on production routes.
- Return explicit failure when no provider is available. Do not silently fake successful AI output unless a test-only stub is clearly configured.

## Database Notes

MongoDB is the primary runtime database.

Important files:

| File | Purpose |
| --- | --- |
| `Backend/src/db/mongodb.ts` | Mongo connection lifecycle and health state. |
| `Backend/src/db/models.ts` | Mongoose schemas and indexes. |
| `Backend/src/db/index.ts` | Model exports, query helper, compatibility layer, transaction wrapper. |
| `Devops/database/migrations` | Legacy or auxiliary SQL migrations. These are not the primary Mongo runtime path. |

## Auth and Route Protection

The frontend has two layers:

1. `src/proxy.ts` redirects protected prefixes when `auth_hint` is missing.
2. Role layouts use `RoleGuard` to check the hydrated user role.

The backend is the source of truth:

- `authenticate` checks signed cookies or Bearer tokens.
- `authorize` checks allowed roles.
- `isActive` and `isBanned` are checked during user resolution.

Role home routes:

| Role | Home |
| --- | --- |
| `STUDENT` | `/student/dashboard` |
| `MENTOR` | `/mentor/dashboard` |
| `CORPORATE` | `/corporate/dashboard` |
| `ADMIN` | `/admin/dashboard` |

## Common Debugging Checks

| Symptom | Check |
| --- | --- |
| Frontend redirects to login even after login | Check `auth_hint` cookie on the frontend domain and `GET /api/v1/auth/me`. |
| Mutating requests fail with 403 | Check `_csrf` cookie and `X-CSRF-Token` header. |
| Backend starts but auth fails | Check `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET`, and `SESSION_SECRET` length and placeholders. |
| AI endpoints fail | Check `AI_SERVICE_URL`, worker health, `INTERNAL_SERVICE_SECRET`, BlueLearner/Ollama availability. |
| Code execution fails | Check `JUDGE0_API_URL`, `JUDGE0_API_KEY`, and execution provider configuration. |
| Production cookies fail | Check `FRONTEND_URL`, `BACKEND_URL`, CORS origins, HTTPS, and SameSite settings. |
| Admin APIs return 403 | Confirm the backend user role is exactly `ADMIN`. |
| Corporate APIs return 403 | Confirm the user has the corporate role and corporate route middleware accepts it. |

## Validation Before Handoff

For frontend-only changes:

```powershell
cd D:\Bluelearnerhub\Frontend
npm run type-check
npm run lint
npm run build
```

For backend-only changes:

```powershell
cd D:\Bluelearnerhub\Backend
npm run build
npm test
```

For AI-worker changes:

```powershell
cd D:\Bluelearnerhub\Worker\ai-services
npm test
```

For cross-stack changes, run the relevant service locally and verify:

- `http://localhost:3000`
- `http://localhost:5000/health`
- `http://localhost:5000/api/health`
- `http://localhost:8000/health`

## Current Cleanup Backlog

- Replace mojibake characters in existing markdown and source comments.
- Align `Backend/.env.production.example` with MongoDB primary configuration.
- Add a real `Frontend/.env.example`.
- Confirm or fix backend seed script path.
- Consolidate duplicate student/public routes where product intent allows it.
- Document which routes are intentionally public but call protected APIs.
