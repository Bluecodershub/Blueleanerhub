# ECC For Codex In BlueLearnerHub

This directory contains the project-local Codex side of the ECC integration.

## What Is Available

- Root `AGENTS.md` describes BlueLearnerHub-specific project rules.
- `.codex/config.toml` enables workspace-write sandboxing, on-request approval, optional MCP servers, and multi-agent roles.
- `.codex/agents/` defines read-only explorer, reviewer, and docs-researcher helper roles.
- `.agents/skills/` contains both existing project design skills and ECC workflow skills.

Useful ECC skills in this repo include:

- `backend-patterns`: API, persistence, caching, and backend architecture guidance.
- `frontend-patterns`: React, Next.js, component, and client-state patterns.
- `nextjs-turbopack`: Next.js 16 and Turbopack guidance.
- `api-design`: REST API design and contract hygiene.
- `security-review`: security checklist and vulnerability review.
- `tdd-workflow`: test-first workflow guidance.
- `e2e-testing`: Playwright test planning and execution.
- `verification-loop`: build, test, lint, and typecheck verification.
- `mle-workflow`: ML worker and model lifecycle guidance.
- `documentation-lookup`: primary-doc verification workflow.

## Boundaries

Codex does not currently provide full Claude-style hook parity. Treat hook
content from ECC as instruction-backed policy unless native hooks are explicitly
configured by the user.

Networked MCP tools may require credentials or network access. Use them only
when they materially help the task, and ask for approval before any external
write action such as posting, publishing, pushing, merging, or changing remote
resources.
