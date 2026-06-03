'use strict';
require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  cors: {
    origins: (
      process.env.CORS_ORIGINS ||
      `${process.env.FRONTEND_URL || 'http://localhost:3000'},${process.env.BACKEND_URL || 'http://localhost:5000'}`
    )
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  ollama: {
    url:   process.env.OLLAMA_URL      || 'http://localhost:11434',
    model: process.env.LOCAL_LLM_MODEL || 'llama3',
  },

  python: {
    enabled: process.env.PYTHON_WORKER_ENABLED !== 'false',
    timeout: parseInt(process.env.PYTHON_WORKER_TIMEOUT || '60000', 10),
  },
};

// ── Startup validation ────────────────────────────────────────────────────────
if (config.isProd && process.env.LOCAL_LLM_PROVIDER === 'stub') {
  console.error('[config] FATAL: LOCAL_LLM_PROVIDER=stub is not allowed in production.');
  process.exit(1);
}

module.exports = config;
