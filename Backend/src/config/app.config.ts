import { config as baseConfig } from './index';

export const config = {
  // Server
  port: baseConfig.port,
  host: baseConfig.host,
  nodeEnv: baseConfig.nodeEnv,

  // Frontend
  frontendUrl: baseConfig.frontendUrl,

  // CORS
  corsOrigins: baseConfig.corsOrigins,

  // Rate Limiting
  rateLimit: baseConfig.rateLimit,

  // File Upload
  upload: baseConfig.upload,
};

export default config;
