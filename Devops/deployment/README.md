# Deployment Configurations

This directory contains helpful templates and instructions for deploying
BlueLearnerHub across different platforms.

## Vercel (Frontend)
- The `frontend/vercel.json` file contains build settings and rewrites.
- Run `npm run deploy:vercel` from the project root after configuring the
  `VERCEL_TOKEN` environment variable.

> **Note:** only the frontend is deployed to Vercel; backend and agents
> should be hosted elsewhere (Render/Docker).

## Render (Backend)
- Example `render.yaml` (untracked) lives in this directory and can be used to
  define web services for `backend`, `ai-services`, `ai-agent`, and optionally
  `ai_system`/`telegram_bot` as background workers.

```yaml
services:
  - name: bluelearner-backend
    env: node
    buildCommand: "npm run build:backend"
    startCommand: "npm run start:backend"
    plan: starter
  - name: bluelearner-agent
    env: python
    buildCommand: "pip install -r ai-agent/requirements.txt"
    startCommand: "python ai-agent/agent.py"
    plan: free
  - name: bluelearner-aisystem
    env: python
    buildCommand: "pip install openclaw"
    startCommand: "python ai_system/orchestrator.py"
    plan: free
  - name: bluelearner-telegram
    env: python
    buildCommand: "pip install python-telegram-bot"
    startCommand: "python telegram_bot/bot.py"
    plan: free
```
## Docker
- Use the existing `docker-compose.yml` and `docker-compose.prod.yml` at the
  project root to start all services locally or in production.

## AWS
- See the `aws/` folder for CloudFormation templates, ECS task definitions,
  and deployment scripts (`deploy.sh` / `deploy.ps1`).

## GitHub Actions
- The workflow defined in `.github/workflows/ci-cd.yml` tests all services
  (frontend, backend, ai-services, ai-agent) and builds the apps when code is
  pushed to `main` or `develop`.

The information on this page should be updated whenever new platforms are
added or scripts change. For quick deployment steps, refer back to the root
`README.md`.
