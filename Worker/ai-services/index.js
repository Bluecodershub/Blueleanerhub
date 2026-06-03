'use strict';

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const config       = require('./config');
const routes       = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger       = require('./utils/logger');
const aiProvider   = require('./services/aiProvider.service');
const pythonBridge = require('./python/bridge');

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.cors.origins.includes(origin)) {
      return cb(null, true);
    }
    logger.warn('CORS blocked', { origin });
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isProd ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({
    service: 'BlueLearnerHub AI Services',
    version: '2.0.0',
    status:  'ok',
    uptime:  Math.floor(process.uptime()),
    env:     config.nodeEnv,
  });
});

app.get('/health', async (_req, res) => {
  const provider = await aiProvider.getProvider();
  res.json({
    status:  'ok',
    uptime:  Math.floor(process.uptime()),
    memory:  process.memoryUsage(),
    providers: {
      bluelearner: process.env.BLUELEARNER_ENABLED === 'true' ? 'configured' : 'disabled',
      local:  config.ollama.url ? 'configured' : 'not configured',
      active: provider.type,
    },
    python: pythonBridge.isAvailable(),
  });
});

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, '0.0.0.0', async () => {
  const provider = await aiProvider.getProvider();

  logger.info(`AI Services running`, { port: PORT, env: config.nodeEnv });
  logger.info(`Active AI provider: ${provider.type}`);

  if (config.python.enabled) {
    pythonBridge.start().then(() => {
      if (pythonBridge.isAvailable()) {
        logger.info('Python ML worker connected');
      }
    });
  } else {
    logger.info('Python ML worker disabled by config');
  }

  logger.info('Routes mounted', {
    core:   '/api/ai/{generate,chat,quiz/generate,review,learning-path}',
    agent:  '/api/agent/{run,ask}',
    model:  '/api/model/{predict,info}',
    python: '/api/v1/{hackathon,interview,quiz,predict,notebooks,review}/*',
    compat: '/api/v1/ai/quiz/generate  /api/v1/chat  /api/v1/quiz/generate',
  });
});

module.exports = app;
