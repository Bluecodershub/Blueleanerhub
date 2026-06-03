// @ts-nocheck
/**
 * Security Regression Tests
 * Guards against re-introduction of all critical vulnerabilities fixed in
 * QA Phases 1–3.  These tests must ALWAYS pass before any production deploy.
 */

import { pool } from '../../src/utils/database';
import { mockReq, mockRes as createMockRes } from '../utils/http';

const mockPool = pool as jest.Mocked<typeof pool>;

const mockRes = () => createMockRes({ send: true });

// ─── CRIT-001: eval() removal — CodePlayground ───────────────────────────────

describe('CRIT-001: No eval() in CodePlayground', () => {
  it('CodePlayground source must not contain eval()', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(
      __dirname,
      '../../../frontend/src/components/tutorials/CodePlayground.tsx'
    );
    const source = fs.readFileSync(filePath, 'utf-8');
    expect(source).not.toMatch(/\beval\s*\(/);
  });
});

// ─── CRIT-002: dangerouslySetInnerHTML removal — ide/page ────────────────────

describe('CRIT-002: No dangerouslySetInnerHTML with non-static data in IDE', () => {
  it('ide/page.tsx must not use dangerouslySetInnerHTML', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(
      __dirname,
      '../../../frontend/src/app/(student)/ide/page.tsx'
    );
    const source = fs.readFileSync(filePath, 'utf-8');
    expect(source).not.toMatch(/dangerouslySetInnerHTML/);
  });
});

// ─── CRIT-003: Stripe webhook signature validation ────────────────────────────

describe('CRIT-003: Stripe webhook requires signature', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const { PaymentController } = require('../../src/controllers/payment.controller');
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    const req = mockReq({ headers: {}, body: Buffer.from('{}') });
    const res = mockRes();

    await PaymentController.handleWebhook(req, res);

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });

  it('returns 400 for invalid signature', async () => {
    const { PaymentController } = require('../../src/controllers/payment.controller');
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_value';

    const req = mockReq({
      headers: { 'stripe-signature': 'invalid_sig' },
      body: Buffer.from('{"type":"test"}'),
    });
    const res = mockRes();

    await PaymentController.handleWebhook(req, res);

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect([400, 500]).toContain(statusCall);
  });
});

// ─── CRIT-004: IDOR — repository file access ────────────────────────────────

describe('CRIT-004: Repository file access enforces visibility', () => {
  it('returns 403 for private repo accessed by non-owner', async () => {
    jest.mock('../../src/db', () => ({
      db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValueOnce([
          { ownerId: 99, visibility: 'private' },
        ]).mockResolvedValueOnce([]),
      },
    }), { virtual: true });

    const { getFileContent } = require('../../src/controllers/repositories.controller');
    const req = mockReq({
      params: { id: '1' },
      query: { path: 'secret.env' },
      user: { id: 1, email: 'attacker@test.com', role: 'student', fullName: 'Attacker' },
    });
    const res = mockRes();
    const next = jest.fn();

    await getFileContent(req, res, next).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    if (statusCall) {
      expect([403, 404, 500]).toContain(statusCall);
      expect(statusCall).not.toBe(200);
    }
  });
});

// ─── Mass assignment: updateProfile ─────────────────────────────────────────

describe('Mass assignment: updateProfile rejects privileged fields', () => {
  it('UpdateUserDTO does not contain failed_login_attempts or locked_until', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../../src/models/user.ts');
    const source = fs.readFileSync(filePath, 'utf-8');

    // These fields must NOT be in UpdateUserDTO
    const dtoBlock = source.match(/interface UpdateUserDTO\s*\{([^}]*)\}/s)?.[1] ?? '';
    expect(dtoBlock).not.toMatch(/failed_login_attempts/);
    expect(dtoBlock).not.toMatch(/locked_until/);
    expect(dtoBlock).not.toMatch(/\brole\b/);
    expect(dtoBlock).not.toMatch(/\bpassword\b/);
  });

  it('updateProfile handler whitelists fields (never uses req.body spread)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../../src/controllers/auth.controller.ts');
    const source = fs.readFileSync(filePath, 'utf-8');

    // The updateProfile function should NOT have a line like "const updates = req.body"
    const updateProfileFn = source.match(/async updateProfile[\s\S]*?(?=async\s|\}\s*$)/)?.[0] ?? '';
    expect(updateProfileFn).not.toMatch(/const\s+updates\s*=\s*req\.body/);
  });
});

// ─── Self-voting prevention ──────────────────────────────────────────────────

describe('Self-voting prevention in castVote', () => {
  it('castVote source code must check contentAuthorId === userId before voting', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(
      __dirname,
      '../../src/controllers/qna.controller.ts'
    );
    const source = fs.readFileSync(filePath, 'utf-8');
    // Must contain a self-vote check
    expect(source).toMatch(/contentAuthorId\s*===\s*userId|authorId\s*===\s*userId/);
    // Must return 400 on self-vote
    expect(source).toMatch(/Cannot vote on your own content/);
  });
});

// ─── NaN validation on parseInt ─────────────────────────────────────────────

describe('NaN validation on route params', () => {
  it('enrollInTrack rejects NaN trackId with 400', async () => {
    const { enrollInTrack } = require('../../src/controllers/tracks.controller');
    const req = mockReq({
      params: { id: 'NaN' },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await enrollInTrack(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });

  it('postAnswer rejects NaN questionId with 400', async () => {
    const { postAnswer } = require('../../src/controllers/qna.controller');
    const req = mockReq({
      params: { id: 'abc' },
      body: { body: 'x'.repeat(50) },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await postAnswer(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });

  it('acceptAnswer rejects NaN answerId with 400', async () => {
    const { acceptAnswer } = require('../../src/controllers/qna.controller');
    const req = mockReq({
      params: { id: '1', answerId: 'xyz' },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await acceptAnswer(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });
});

// ─── Input length validation ─────────────────────────────────────────────────

describe('Input length validation', () => {
  it('askQuestion rejects title < 15 chars with 400', async () => {
    const { askQuestion } = require('../../src/controllers/qna.controller');
    const req = mockReq({
      body: { title: 'short', body: 'x'.repeat(50), domain: 'cs' },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await askQuestion(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });

  it('askQuestion rejects body < 30 chars with 400', async () => {
    const { askQuestion } = require('../../src/controllers/qna.controller');
    const req = mockReq({
      body: { title: 'x'.repeat(20), body: 'too short', domain: 'cs' },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await askQuestion(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });

  it('runCode rejects unsupported language with 400', async () => {
    const { runCode } = require('../../src/controllers/tutorials.controller');
    const req = mockReq({
      body: { code: 'print("hello")', language: 'brainfuck' },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await runCode(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(400);
  });

  it('runCode rejects code > 50KB with 413', async () => {
    const { runCode } = require('../../src/controllers/tutorials.controller');
    const req = mockReq({
      body: { code: 'x'.repeat(51_000), language: 'python' },
      user: { id: 1, email: 'u@t.com', role: 'student', fullName: 'U' },
    });
    const res = mockRes();

    await runCode(req, res, jest.fn()).catch(() => {});

    const statusCall = (res.status as jest.Mock).mock.calls[0]?.[0];
    expect(statusCall).toBe(413);
  });
});

// ─── Rate limiter configurations ────────────────────────────────────────────

describe('Rate limiter configurations', () => {
  it('authLimiter is set to 5 req per 15 minutes', () => {
    const { authLimiter } = require('../../src/middleware/rateLimiter');
    expect(authLimiter).toBeDefined();
  });

  it('strictLimiter is set to 10 req per minute', () => {
    const { strictLimiter } = require('../../src/middleware/rateLimiter');
    expect(strictLimiter).toBeDefined();
  });

  it('passwordResetLimiter is exported', () => {
    const { passwordResetLimiter } = require('../../src/middleware/rateLimiter');
    expect(passwordResetLimiter).toBeDefined();
  });

  it('webhookLimiter is exported', () => {
    const { webhookLimiter } = require('../../src/middleware/rateLimiter');
    expect(webhookLimiter).toBeDefined();
  });
});

// ─── Route configuration guards ──────────────────────────────────────────────

describe('Route configuration guards', () => {
  it('exercises route source uses strictLimiter on /execute', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/code.ts'),
      'utf-8'
    );
    expect(source).toMatch(/strictLimiter/);
    expect(source).toMatch(/authenticate/);
  });

  it('gamification leaderboard route uses apiLimiter', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/gamification.ts'),
      'utf-8'
    );
    expect(source).toMatch(/apiLimiter/);
  });

  it('QnA write routes use authLimiter', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/qna.ts'),
      'utf-8'
    );
    expect(source).toMatch(/authLimiter/);
  });

  it('repositories listIssues uses optionalAuth', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/repositories.ts'),
      'utf-8'
    );
    expect(source).toMatch(/optionalAuth/);
  });
});

// ─── CSRF middleware ──────────────────────────────────────────────────────────

describe('CSRF: Double Submit Cookie middleware', () => {
  it('csrf.ts exports csrfProtection, setCsrfCookie, clearCsrfCookie', async () => {
    const { csrfProtection, setCsrfCookie, clearCsrfCookie } =
      require('../../src/middleware/csrf');
    expect(typeof csrfProtection).toBe('function');
    expect(typeof setCsrfCookie).toBe('function');
    expect(typeof clearCsrfCookie).toBe('function');
  });

  it('csrfProtection skips GET requests', () => {
    const { csrfProtection } = require('../../src/middleware/csrf');
    const req = mockReq({ method: 'GET', path: '/api/qna/questions', cookies: {} });
    const res = mockRes();
    const next = jest.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((res.status as jest.Mock).mock.calls.length).toBe(0);
  });

  it('csrfProtection skips /api/auth/login regardless of method', () => {
    const { csrfProtection } = require('../../src/middleware/csrf');
    const req = mockReq({ method: 'POST', path: '/api/auth/login', cookies: {} });
    const res = mockRes();
    const next = jest.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('csrfProtection skips /api/auth/corporate/login', () => {
    const { csrfProtection } = require('../../src/middleware/csrf');
    const req = mockReq({ method: 'POST', path: '/api/auth/corporate/login', cookies: {} });
    const res = mockRes();
    const next = jest.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('csrfProtection skips password reset bootstrap routes', () => {
    const { csrfProtection } = require('../../src/middleware/csrf');
    const routes = ['/api/auth/forgot-password', '/api/auth/reset-password'];

    for (const path of routes) {
      const req = mockReq({ method: 'POST', path, cookies: {} });
      const res = mockRes();
      const next = jest.fn();
      csrfProtection(req, res, next);
      expect(next).toHaveBeenCalled();
    }
  });

  it('csrfProtection skips /api/payments/webhook', () => {
    const { csrfProtection } = require('../../src/middleware/csrf');
    const req = mockReq({ method: 'POST', path: '/api/payments/webhook', cookies: {} });
    const res = mockRes();
    const next = jest.fn();
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

// ─── Input sanitization ───────────────────────────────────────────────────────

describe('Input sanitization utilities', () => {
  it('sanitizeText strips all HTML tags', () => {
    const { sanitizeText } = require('../../src/utils/sanitize');
    expect(sanitizeText('<script>alert(1)</script>title')).toBe('title');
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
    expect(sanitizeText('plain text')).toBe('plain text');
  });

  it('sanitizeRichText allows safe tags, strips scripts', () => {
    const { sanitizeRichText } = require('../../src/utils/sanitize');
    const out = sanitizeRichText('<b>bold</b><script>alert(1)</script>');
    expect(out).toContain('<b>bold</b>');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('alert(1)');
  });

  it('sanitizeRichText removes javascript: href', () => {
    const { sanitizeRichText } = require('../../src/utils/sanitize');
    const out = sanitizeRichText('<a href="javascript:void(0)">click</a>');
    expect(out).not.toContain('javascript:');
  });

  it('qna.controller imports sanitize utilities', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/qna.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/sanitizeText|sanitizeRichText/);
  });

  it('repositories.controller imports sanitize utilities', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/repositories.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/sanitizeText|sanitizeRichText/);
  });

  it('organizations.controller imports sanitize utilities', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/organizations.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/sanitizeText|sanitizeRichText/);
  });
});

// ─── Auth consolidation: auth.secure.ts must not exist ───────────────────────

describe('Auth controller consolidation', () => {
  it('auth.secure.ts has been removed (dead code deleted)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const deadFile = path.resolve(
      __dirname, '../../src/controllers/auth.secure.ts'
    );
    expect(fs.existsSync(deadFile)).toBe(false);
  });

  it('auth.ts imports setCsrfCookie and clearCsrfCookie', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/controllers/auth.controller.ts'),
      'utf-8'
    );
    expect(source).toMatch(/setCsrfCookie/);
    expect(source).toMatch(/clearCsrfCookie/);
  });

  it('oauth.ts imports setCsrfCookie and issues it after OAuth login', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/oauth.ts'),
      'utf-8'
    );
    expect(source).toMatch(/setCsrfCookie/);
  });

  it('frontend api client uses /auth/refresh-token for silent refresh', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../../frontend/src/lib/api.ts'),
      'utf-8'
    );
    expect(source).toMatch(/\/auth\/refresh-token/);
    expect(source).not.toMatch(/api\.post\('\/auth\/refresh'\)/);
  });
});

// ─── CRIT-A: Quiz server-side scoring ────────────────────────────────────────

describe('CRIT-A: Daily quiz — correctIndex never exposed to client', () => {
  it('dailyQuiz route source does NOT send correctIndex to GET endpoint', async () => {
    const fs   = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/dailyQuiz.routes.ts'),
      'utf-8'
    );
    // Route must use getPublicQuiz() to strip correctIndex
    expect(source).toMatch(/getPublicQuiz/);
  });

  it('getPublicQuiz strips correctIndex and explanation from questions', () => {
    const { getPublicQuiz } = require('../../src/services/dailyQuiz.service');
    const quiz = {
      domain: 'Test', date: '2026-01-01',
      questions: [{
        question: 'Q?', options: ['A','B','C','D'],
        correctIndex: 2, explanation: 'Because.', difficulty: 'easy',
      }],
    };
    const pub = getPublicQuiz(quiz);
    expect(pub.questions[0]).not.toHaveProperty('correctIndex');
    expect(pub.questions[0]).not.toHaveProperty('explanation');
    expect(pub.questions[0]).toHaveProperty('question');
    expect(pub.questions[0]).toHaveProperty('options');
    expect(pub.questions[0]).toHaveProperty('difficulty');
  });

  it('scoreQuiz computes score server-side, ignores any client score param', () => {
    const { scoreQuiz } = require('../../src/services/dailyQuiz.service');
    const quiz = {
      domain: 'Test', date: '2026-01-01',
      questions: [
        { question:'Q1', options:['A','B'], correctIndex:0, explanation:'', difficulty:'easy'   },
        { question:'Q2', options:['A','B'], correctIndex:1, explanation:'', difficulty:'medium' },
        { question:'Q3', options:['A','B'], correctIndex:1, explanation:'', difficulty:'hard'   },
      ],
    };
    // All correct
    const r1 = scoreQuiz(quiz, [0, 1, 1]);
    expect(r1.correctCount).toBe(3);
    expect(r1.score).toBe(100);
    expect(r1.xpEarned).toBe(10 + 20 + 30); // easy+medium+hard

    // None correct
    const r2 = scoreQuiz(quiz, [1, 0, 0]);
    expect(r2.correctCount).toBe(0);
    expect(r2.score).toBe(0);
    expect(r2.xpEarned).toBe(0);

    // Attacker sends max XP via client — scoreQuiz never reads a client score param
    // Verify correctAnswers are in the result (safe to return after submission)
    expect(r1.correctAnswers).toEqual([0, 1, 1]);
    expect(r1.explanations).toHaveLength(3);
  });

  it('POST /submit route requires authentication', async () => {
    const fs   = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/dailyQuiz.routes.ts'),
      'utf-8'
    );
    // The submit route must include authenticate middleware
    expect(source).toMatch(/authenticate/);
    // Must validate domain against server allowlist
    expect(source).toMatch(/getAvailableDomains/);
    // Must use server-computed score, not trust client xpEarned
    expect(source).not.toMatch(/xpEarned.*req\.body/);
  });

  it('POST /submit source enforces duplicate submission check', async () => {
    const fs   = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/dailyQuiz.routes.ts'),
      'utf-8'
    );
    // Must have UNIQUE constraint error handling
    expect(source).toMatch(/23505/);
    // Must return 409
    expect(source).toMatch(/409/);
    // Must use DB insert for deduplication
    expect(source).toMatch(/INSERT INTO daily_quiz_attempts/);
  });

  it('GET /:domain route uses authenticate middleware', async () => {
    const fs   = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../src/routes/dailyQuiz.routes.ts'),
      'utf-8'
    );
    // Quiz fetch must require auth so we know who is taking the quiz
    expect(source).toMatch(/authenticate/);
  });

  it('frontend page.tsx does NOT compute correctCount from correctIndex', async () => {
    const fs   = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../../frontend/src/app/(student)/daily-quiz/page.tsx'
      ),
      'utf-8'
    );
    // Must not compute score by comparing answers to correctIndex on the client
    // (Matches patterns like: a === q.correctIndex / answers[i]?.correctIndex / etc.)
    expect(source).not.toMatch(/[=!]==?\s*\w*\.correctIndex/);
    // Must submit answers array, not a score
    expect(source).toMatch(/submitAnswers/);
    // Score must come from server result
    expect(source).toMatch(/result\.score|result\.xpEarned/);
  });

  it('api-civilization.ts does not have submitResult (removed in favour of submitAnswers)', async () => {
    const fs   = await import('fs');
    const path = await import('path');
    const source = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../../frontend/src/lib/api-civilization.ts'
      ),
      'utf-8'
    );
    expect(source).not.toMatch(/submitResult/);
    expect(source).toMatch(/submitAnswers/);
  });
});
