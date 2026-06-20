# BlueLearnerHub Agent Guide

This repository is BlueLearnerHub, a multi-role education and hiring platform.
Use these instructions together with the system/developer instructions already
active in the agent harness.

## Project Shape

- `Frontend/`: Next.js App Router app, React, TypeScript, Tailwind, shadcn/Radix UI, Playwright and Jest tests.
- `Backend/`: Express TypeScript API, MongoDB/Mongoose models, auth, CSRF, rate limiting, Socket.IO, payments, AI bridge, and code execution adapters.
- `Worker/ai-services/`: Node AI gateway with optional Python/FastAPI ML worker.
- `code-runner/`: Optional Go service for sandboxed code execution.
- `Devops/`: Docker Compose, Kubernetes, Render, Railway, AWS, and setup scripts.
- `docs/`: page flow, development guide, and architecture notes.

## ECC Integration

ECC is integrated project-locally for Codex:

- `.codex/config.toml` contains project-local Codex settings, MCP server declarations, profiles, and multi-agent role wiring.
- `.codex/AGENTS.md` contains Codex-specific ECC notes.
- `.codex/agents/*.toml` defines read-only helper roles for exploration, review, and docs verification.
- `.agents/skills/` contains the existing project design skills plus ECC workflow skills such as `backend-patterns`, `frontend-patterns`, `security-review`, `tdd-workflow`, `e2e-testing`, and `verification-loop`.

Do not assume Claude-style hooks are active in Codex. Treat ECC hook-related
guidance as policy text unless a native hook surface is explicitly configured.

## Working Rules

- Preserve user changes. This repo may have a dirty worktree; do not revert unrelated edits.
- Prefer existing project patterns over new abstractions.
- Start from the route/page/controller/service already owning the behavior.
- Never hardcode secrets. Use `.env.example` files as documentation only.
- Backend authorization is authoritative; frontend route guards are not security boundaries.
- Mutating browser-facing routes must remain compatible with CSRF.
- AI worker calls should use `INTERNAL_SERVICE_SECRET` when configured.

## Validation

Run the narrowest useful checks first:

- Frontend: `cd Frontend && npm run type-check`, `npm run lint`, `npm run build`, or `npm test`.
- Backend: `cd Backend && npm run build` or `npm test`.
- AI worker: `cd Worker/ai-services && npm test`.
- Cross-stack local URLs: `http://localhost:3000`, `http://localhost:5000/health`, `http://localhost:8000/health`.

If a validation command cannot be run because dependencies, services, or
network access are missing, report that clearly instead of guessing.
