import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import logger from '../utils/logger';
import { SessionMetadata, SandboxType, ExecutionResult } from './execution/execution.types';

interface HistoryEntry {
  timestamp: number;
  code: string;
  language: string;
  result: ExecutionResult;
  cellIndex?: number;
}

const isRedisAvailable = () => {
  try {
    return !!(config as any).redis?.url;
  } catch {
    return false;
  }
};

export class SessionService {
  private redisClient: any = null;
  private readonly SESSION_TTL = 7200;
  private readonly MAX_HISTORY_ENTRIES = 100;
  private readonly MAX_ACCUMULATED_CODE_BYTES = 128 * 1024;

  private memoryStore: Map<string, SessionMetadata> = new Map();
  private historyStore: Map<string, HistoryEntry[]> = new Map();

  private getSessionKey(sessionId: string): string {
    return `sandbox:session:${sessionId}`;
  }

  private getHistoryKey(sessionId: string): string {
    return `sandbox:history:${sessionId}`;
  }

  async init(): Promise<void> {
    if (isRedisAvailable()) {
      let client: any = null;
      try {
        const { Redis } = await import('ioredis');
        let errorLogged = false;
        client = new Redis((config as any).redis.url, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
          enableOfflineQueue: false,
          lazyConnect: true,
        });
        client.on('error', (error: Error) => {
          if (!errorLogged) {
            logger.warn('SessionService: Redis client error, using in-memory storage', {
              error: error.message,
            });
            errorLogged = true;
          }
          if (this.redisClient === client) {
            this.redisClient = null;
          }
        });

        await client.ping();
        this.redisClient = client;
        logger.info('SessionService: Redis connected');
      } catch (err) {
        logger.warn('SessionService: Redis unavailable, using in-memory storage', { error: err });
        client?.disconnect();
        this.redisClient = null;
      }
    } else {
      logger.info('SessionService: No Redis URL configured, using in-memory storage');
    }
  }

  async createSession(params: { userId?: string; sandboxType: SandboxType; language: string }): Promise<SessionMetadata> {
    const sessionId = uuidv4();
    const now = new Date();
    const metadata: SessionMetadata = {
      sessionId,
      userId: params.userId,
      sandboxType: params.sandboxType,
      language: params.language,
      createdAt: now,
      lastActive: now,
      executionCount: 0,
    };
    await this.saveSession(metadata);
    return metadata;
  }

  async getSession(sessionId: string): Promise<SessionMetadata | null> {
    try {
      if (this.redisClient) {
        const data = await this.redisClient.get(this.getSessionKey(sessionId));
        if (!data) return null;
        const session = JSON.parse(data);
        session.createdAt = new Date(session.createdAt);
        session.lastActive = new Date(session.lastActive);
        return session;
      }
      return this.memoryStore.get(sessionId) ?? null;
    } catch (err) {
      logger.error('Error retrieving session', { sessionId, error: err });
      return null;
    }
  }

  async updateSession(sessionId: string, updates: Partial<SessionMetadata>): Promise<SessionMetadata | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;
    const updated = { ...session, ...updates, lastActive: new Date() };
    await this.saveSession(updated);
    return updated;
  }

  async endSession(sessionId: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(this.getSessionKey(sessionId));
      await this.redisClient.del(this.getHistoryKey(sessionId));
    }
    this.memoryStore.delete(sessionId);
    this.historyStore.delete(sessionId);
  }

  async addExecutionHistory(
    sessionId: string,
    entry: { code: string; language: string; result: ExecutionResult; cellIndex?: number }
  ): Promise<void> {
    const historyEntry: HistoryEntry = {
      timestamp: Date.now(),
      code: entry.code,
      language: entry.language,
      result: entry.result,
      cellIndex: entry.cellIndex,
    };

    try {
      if (this.redisClient) {
        const key = this.getHistoryKey(sessionId);
        const existing = await this.redisClient.get(key);
        const history: HistoryEntry[] = existing ? JSON.parse(existing) : [];
        history.push(historyEntry);
        if (history.length > this.MAX_HISTORY_ENTRIES) {
          history.splice(0, history.length - this.MAX_HISTORY_ENTRIES);
        }
        await this.redisClient.set(key, JSON.stringify(history), 'EX', this.SESSION_TTL);
      } else {
        const history = this.historyStore.get(sessionId) ?? [];
        history.push(historyEntry);
        if (history.length > this.MAX_HISTORY_ENTRIES) {
          history.splice(0, history.length - this.MAX_HISTORY_ENTRIES);
        }
        this.historyStore.set(sessionId, history);
      }

      const savedSession = await this.getSession(sessionId);
      const nextCount = (savedSession?.executionCount ?? 0) + 1;
      await this.updateSession(sessionId, { executionCount: nextCount });
    } catch (err) {
      logger.error('Error saving execution history', { sessionId, error: err });
    }
  }

  async getExecutionHistory(sessionId: string): Promise<HistoryEntry[]> {
    try {
      if (this.redisClient) {
        const data = await this.redisClient.get(this.getHistoryKey(sessionId));
        return data ? JSON.parse(data) : [];
      }
      return this.historyStore.get(sessionId) ?? [];
    } catch (err) {
      logger.error('Error retrieving execution history', { sessionId, error: err });
      return [];
    }
  }

  async getAccumulatedCode(sessionId: string): Promise<string> {
    const history = await this.getExecutionHistory(sessionId);
    if (history.length === 0) return '';
    const successfulCells = history.filter((h) => h.result?.success);
    let accumulated = '';

    for (let index = successfulCells.length - 1; index >= 0; index -= 1) {
      const next = accumulated ? `${successfulCells[index].code}\n\n${accumulated}` : successfulCells[index].code;
      if (Buffer.byteLength(next, 'utf8') > this.MAX_ACCUMULATED_CODE_BYTES) break;
      accumulated = next;
    }

    return accumulated;
  }

  async clearExecutionHistory(sessionId: string): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.del(this.getHistoryKey(sessionId));
      }
      this.historyStore.delete(sessionId);
      await this.updateSession(sessionId, { executionCount: 0 });
    } catch (err) {
      logger.error('Error clearing execution history', { sessionId, error: err });
    }
  }

  private async saveSession(session: SessionMetadata): Promise<void> {
    try {
      const data = JSON.stringify(session);
      if (this.redisClient) {
        await this.redisClient.set(this.getSessionKey(session.sessionId), data, 'EX', this.SESSION_TTL);
      } else {
        this.memoryStore.set(session.sessionId, session);
        const timeout = setTimeout(() => {
          this.memoryStore.delete(session.sessionId);
          this.historyStore.delete(session.sessionId);
        }, this.SESSION_TTL * 1000);
        timeout.unref?.();
      }
    } catch (err) {
      logger.error('Error saving session', { sessionId: session.sessionId, error: err });
    }
  }

  getActiveSessionCount(): number {
    if (this.redisClient) return -1;
    return this.memoryStore.size;
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    const maxAge = this.SESSION_TTL * 1000;
    for (const [id, session] of this.memoryStore) {
      if (now - session.lastActive.getTime() > maxAge) {
        this.memoryStore.delete(id);
        this.historyStore.delete(id);
      }
    }
  }
}

export const sessionService = new SessionService();
