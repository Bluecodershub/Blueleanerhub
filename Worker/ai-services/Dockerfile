# =============================================================================
# BlueLearnerHub AI Services — Single unified container
# Node.js Express gateway (primary) with optional Python ML worker
# =============================================================================

FROM python:3.10-slim AS python-base

WORKDIR /python
COPY python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || true
RUN python -c "import spacy; spacy.load('en_core_web_sm')" 2>/dev/null || true
COPY python/ .

FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=python-base /usr/local/lib/python3.10 /usr/local/lib/python3.10
COPY --from=python-base /python /app/python

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PYTHON_WORKER_ENABLED=true

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["node", "index.js"]
