import { config } from '../config';

type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

function log(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? JSON.stringify(meta) : '';
  console.log(`${timestamp} [${level}]: ${message} ${metaStr}`);
}

const logger = {
  error: (message: string, meta?: any) => log('error', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  info: (message: string, meta?: any) => log('info', message, meta),
  http: (message: string, meta?: any) => log('http', message, meta),
  debug: (message: string, meta?: any) => log('debug', message, meta),
  
  // Winston-compatible methods
  log: (level: LogLevel, message: string, meta?: any) => log(level, message, meta),
  add: () => {},
  setLevel: () => {},
  level: config.logging.level,
};

export default logger;
