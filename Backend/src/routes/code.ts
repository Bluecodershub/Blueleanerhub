import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { strictLimiter } from '../middleware/rateLimiter';
import { executionManager } from '../services/execution/execution.manager';
import { sessionService } from '../services/session.service';
import { GamificationService } from '../services/gamification.service';
import { SessionMetadata } from '../services/execution/execution.types';
import logger from '../utils/logger';

const router = Router();
const MAX_CODE_BYTES = 64 * 1024;
const MAX_STDIN_BYTES = 16 * 1024;

function byteLength(value: string): number {
  return Buffer.byteLength(value, 'utf8');
}

function normalizeSandboxType(value: unknown): 'education' | 'hackathon' {
  return value === 'hackathon' ? 'hackathon' : 'education';
}

function ownsSession(session: SessionMetadata, userId: string): boolean {
  return !session.userId || session.userId === userId;
}

router.get('/languages', (_req, res) => {
  res.json({ success: true, data: Object.keys(executionManager.getLanguageIds()) });
});

router.get('/status', authenticate, (_req, res) => {
  res.json({ success: true, data: executionManager.getRuntimeStatus() });
});

router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await sessionService.getSession(sessionId);
    if (!session || !ownsSession(session, req.user!.id)) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    const history = await sessionService.getExecutionHistory(sessionId);
    res.json({ success: true, data: { session, history } });
  } catch (err) {
    logger.error('session fetch error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
});

interface SessionResult {
  session: SessionMetadata;
  recreated: boolean;
}

const getOrCreateSession = async (userId: string, body: any): Promise<SessionResult> => {
  const { sessionId, language, sandboxType } = body;
  if (sessionId) {
    const existing = await sessionService.getSession(sessionId);
    if (existing && !ownsSession(existing, userId)) {
      const error = new Error('Session not found');
      (error as any).statusCode = 404;
      throw error;
    }
    if (existing) return { session: existing, recreated: false };
  }
  const session = await sessionService.createSession({
    userId,
    language: language || 'python',
    sandboxType: normalizeSandboxType(sandboxType),
  });
  return { session, recreated: true };
};

// ── /execute — single-shot stateless or session-backed execution ────────────
router.post('/execute', strictLimiter, authenticate, async (req, res) => {
  try {
    const { code, language, stdin, sessionId, sandboxType, cellIndex, persistSession } = req.body as {
      code: string;
      language: string;
      stdin?: string;
      sessionId?: string;
      sandboxType?: string;
      cellIndex?: number;
      persistSession?: boolean;
    };

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, message: 'code is required' });
    }
    if (typeof language !== 'string' || !language.trim()) {
      return res.status(400).json({ success: false, message: 'language is required' });
    }
    if (stdin !== undefined && typeof stdin !== 'string') {
      return res.status(400).json({ success: false, message: 'stdin must be a string' });
    }
    if (byteLength(code) > MAX_CODE_BYTES) {
      return res.status(400).json({ success: false, message: 'Code exceeds 64 KB limit' });
    }
    if (stdin && byteLength(stdin) > MAX_STDIN_BYTES) {
      return res.status(400).json({ success: false, message: 'Input exceeds 16 KB limit' });
    }

    let activeSession: SessionMetadata | null = null;
    let sessionRecreated = false;
    if (sessionId || persistSession) {
      const sr = await getOrCreateSession(req.user!.id, { sessionId, language, sandboxType });
      activeSession = sr.session;
      sessionRecreated = sr.recreated;
    }

    const result = await executionManager.execute({
      code,
      language,
      stdin,
      sessionId: activeSession?.sessionId || undefined,
      sandboxType: normalizeSandboxType(sandboxType),
      cellIndex,
      persistSession,
    });

    if (result.success && req.user?.id) {
      GamificationService.awardXP(req.user.id, 5, 'code_execution').catch(() => {});
    }

    res.json({
      success: true,
      data: {
        ...result,
        sessionId: activeSession?.sessionId || null,
        sessionRecreated,
      },
    });
  } catch (err) {
    logger.error('code execute error', err);
    const statusCode = typeof (err as any)?.statusCode === 'number' ? (err as any).statusCode : 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ success: false, message: (err as Error).message });
    }
    res.status(500).json({ success: false, message: 'Code execution failed' });
  }
});

// ── /execute/cell — notebook cell execution with context accumulation ───────
router.post('/execute/cell', strictLimiter, authenticate, async (req, res) => {
  try {
    const { code, language, sessionId, cellIndex, sandboxType } = req.body as {
      code: string;
      language: string;
      sessionId: string;
      cellIndex?: number;
      sandboxType?: string;
    };

    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, message: 'code is required' });
    }
    if (typeof language !== 'string' || !language.trim()) {
      return res.status(400).json({ success: false, message: 'language is required' });
    }
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId is required for cell execution' });
    }
    if (byteLength(code) > MAX_CODE_BYTES) {
      return res.status(400).json({ success: false, message: 'Code exceeds 64 KB limit' });
    }

    const { session: activeSession, recreated: sessionRecreated } =
      await getOrCreateSession(req.user!.id, { sessionId, language, sandboxType });

    // Execute using the active (possibly new) session ID so history is written correctly
    const effectiveSessionId = activeSession.sessionId;
    const result = await executionManager.execute({
      code,
      language,
      sessionId: effectiveSessionId,
      cellIndex,
      sandboxType: normalizeSandboxType(sandboxType),
    });

    const history = await sessionService.getExecutionHistory(effectiveSessionId);

    if (result.success && req.user?.id) {
      GamificationService.awardXP(req.user.id, 5, 'code_execution').catch(() => {});
    }

    res.json({
      success: true,
      data: {
        ...result,
        sessionId: effectiveSessionId,
        sessionRecreated,
        executionCount: history.length,
      },
    });
  } catch (err) {
    logger.error('cell execute error', err);
    const statusCode = typeof (err as any)?.statusCode === 'number' ? (err as any).statusCode : 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ success: false, message: (err as Error).message });
    }
    res.status(500).json({ success: false, message: 'Cell execution failed' });
  }
});

// ── /session/:sessionId/clear — reset accumulated context ───────────────────
router.post('/session/:sessionId/clear', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.sessionId as string;
    const session = await sessionService.getSession(sessionId);
    if (!session || !ownsSession(session, req.user!.id)) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    await sessionService.clearExecutionHistory(sessionId);
    const updatedSession = await sessionService.getSession(sessionId);
    res.json({ success: true, data: { session: updatedSession } });
  } catch (err) {
    logger.error('session clear error', err);
    res.status(500).json({ success: false, message: 'Failed to clear session' });
  }
});

export default router;
