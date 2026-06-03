import http from 'http';
import * as Sentry from '@sentry/node';
import { createApp } from './app';
import { SocketService } from './sockets';
import { testRedisConnection, redisClient } from './utils/database';
import { connectDB, closeDB } from './db/mongodb';
import { config } from './config';
import logger from './utils/logger';
import { initDailyQuizCron } from './services/dailyQuiz.service';
import { sessionService } from './services/session.service';

logger.info('SERVER.TS starting');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: config.nodeEnv,
    tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
  });
  logger.info('Sentry initialized');
}

async function startServer() {
  try {
    logger.info('Initializing critical services');

    await connectDB();
    logger.info('✅ MongoDB (primary database) connection successful');

    try {
      await testRedisConnection();
      logger.info('Redis connection successful');
    } catch (error) {
      logger.warn('Redis connection failed - caching will be disabled', error);
    }

    await sessionService.init();

    const app = createApp();
    const httpServer = http.createServer(app);
    const socketService = new SocketService(httpServer);
    logger.info('Socket.IO initialized');

    initDailyQuizCron();
    logger.info('Daily Quiz cron initialized');

    const PORT = config.port;

    await new Promise<void>((resolve, reject) => {
      httpServer.listen(PORT, config.host, () => {
        logger.info(`Backend server ready on http://${config.host}:${PORT}`);
        resolve();
      });
      httpServer.on('error', reject);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);

      httpServer.close((err) => {
        if (err) {
          logger.error('Error closing HTTP server', err);
        } else {
          logger.info('HTTP server closed');
        }
      });

      socketService.close();
      logger.info('Socket.IO connections closed');

      try {
        await closeDB();
        logger.info('MongoDB connection closed');
      } catch (error) {
        logger.error('Error closing MongoDB connection', error);
      }

      if (redisClient) {
        try {
          redisClient.disconnect();
          logger.info('Redis connection closed');
        } catch (error) {
          logger.error('Error closing Redis connection', error);
        }
      }

      logger.info('Server shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    httpServer.on('listening', () => {
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);

    try {
      await closeDB();
      if (redisClient) redisClient.disconnect();
    } catch (cleanupError) {
      logger.error('Error during startup cleanup', cleanupError);
    }

    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
  process.exit(1);
});

process.on('warning', (warning) => {
  logger.warn('Process Warning', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Fatal error starting server', error);
    process.exit(1);
  });
}

export { startServer };
