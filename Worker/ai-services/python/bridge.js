'use strict';
const { spawn } = require('child_process');
const path = require('path');
const logger = require('../utils/logger');

const MAX_PENDING = 100;
const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const STARTUP_TIMEOUT_MS = 30000;

class PythonBridge {
  constructor() {
    this.proc = null;
    this.pending = new Map();
    this.id = 0;
    this.buffer = '';
    this._ready = false;
    this._startupPromise = null;
  }

  async start() {
    if (this._startupPromise) return this._startupPromise;

    this._startupPromise = new Promise((resolve) => {
      const scriptPath = path.join(__dirname, 'worker.py');
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

      try {
        this.proc = spawn(pythonCmd, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, PYTHONUNBUFFERED: '1' },
        });
      } catch {
        logger.warn('Python not available — advanced ML features disabled');
        this._ready = false;
        this.proc = null;
        resolve();
        return;
      }

      const startupTimer = setTimeout(() => {
        if (!this._ready) {
          logger.warn('Python ML worker startup timed out after 30s');
          this._ready = false;
          this.proc?.kill();
          this.proc = null;
          resolve();
        }
      }, STARTUP_TIMEOUT_MS);

      this.proc.stdout.on('data', (data) => {
        this.buffer += data.toString();
        this._processBuffer();
      });

      this.proc.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) logger.debug('[Python]', msg);
      });

      this.proc.on('error', (err) => {
        clearTimeout(startupTimer);
        logger.warn('Python worker failed to start', { error: err.message });
        this._ready = false;
        this.proc = null;
        resolve();
      });

      this.proc.on('close', (code) => {
        clearTimeout(startupTimer);
        logger.warn(`Python worker exited (code ${code})`);
        this._ready = false;
        this.proc = null;
        for (const [, { reject }] of this.pending) {
          reject(new Error('Python worker closed'));
        }
        this.pending.clear();
      });
    });

    return this._startupPromise;
  }

  _processBuffer() {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line);
        if (response.id === 0 && response.ready === true) {
          this._ready = true;
          logger.info('Python ML worker ready (confirmed)');
          continue;
        }
        const entry = this.pending.get(response.id);
        if (entry) {
          this.pending.delete(response.id);
          if (response.error) {
            entry.reject(new Error(response.error));
          } else {
            entry.resolve(response.result);
          }
        }
      } catch {
        logger.warn('PythonBridge: failed to parse response');
      }
    }
  }

  async call(method, params = {}) {
    await this.start();

    if (!this._ready || !this.proc) {
      throw new Error('Python ML worker is not available');
    }

    if (this.pending.size >= MAX_PENDING) {
      throw new Error(`Python worker busy: ${MAX_PENDING} pending requests`);
    }

    const id = ++this.id;
    let payload;
    try {
      payload = JSON.stringify({ id, method, params }) + '\n';
    } catch (err) {
      this.id--; // roll back the id increment on serialization failure
      throw new Error(`Failed to serialize request: ${err.message}`);
    }

    if (Buffer.byteLength(payload, 'utf8') > MAX_PAYLOAD_BYTES) {
      this.id--;
      throw new Error(`Payload too large: ${Buffer.byteLength(payload, 'utf8')} bytes (max ${MAX_PAYLOAD_BYTES})`);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Python worker timeout: ${method}`));
      }, 60000);

      this.pending.set(id, {
        resolve: (r) => { clearTimeout(timer); resolve(r); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });

      this.proc.stdin.write(payload);
    });
  }

  isAvailable() {
    return this._ready && this.proc !== null;
  }

  async shutdown() {
    if (this.proc) {
      this.proc.kill();
      this.proc = null;
      this._ready = false;
    }
  }
}

module.exports = new PythonBridge();
