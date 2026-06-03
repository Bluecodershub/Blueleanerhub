'use strict';
const config = require('../config');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL || 'info'] ?? 2;

function format(level, message, meta) {
  const ts = new Date().toISOString();
  if (config.isProd) {
    return JSON.stringify({ ts, level, message, ...(meta || {}) });
  }
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${ts}] ${level.toUpperCase().padEnd(5)} ${message}${metaStr}`;
}

const logger = {
  error: (msg, meta) => { if (currentLevel >= 0) console.error(format('error', msg, meta)); },
  warn:  (msg, meta) => { if (currentLevel >= 1) console.warn(format('warn',  msg, meta)); },
  info:  (msg, meta) => { if (currentLevel >= 2) console.log(format('info',   msg, meta)); },
  debug: (msg, meta) => { if (currentLevel >= 3) console.log(format('debug',  msg, meta)); },
};

module.exports = logger;
