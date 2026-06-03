import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import logger from '../utils/logger';
import { config } from '../config';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<number, string> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.corsOrigins,
        credentials: true,
      },
      // Handle 600+ concurrent connections
      pingTimeout: 60000,      // 60s ping timeout
      pingInterval: 25000,    // 25s ping interval
      transports: ['websocket', 'polling'], // Prefer websocket
      maxHttpBufferSize: 1e8, // 100MB for code submissions
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket: Socket, next) => {
      // 1. Try explicit auth.token (for non-browser clients or future use)
      const explicitToken = socket.handshake.auth?.token as string | undefined;
      if (explicitToken) {
        try {
          const decoded = verifyAccessToken(explicitToken);
          socket.data.userId = decoded.userId;
          socket.data.userEmail = decoded.email;
          return next();
        } catch {
          return next(new Error('Authentication error'));
        }
      }

      // 2. Fall back to signed cookie (browser clients using HttpOnly cookies)
      const rawCookie = socket.handshake.headers.cookie ?? '';
      const cookieToken = this.extractSignedCookie(rawCookie, 'accessToken');
      if (cookieToken) {
        try {
          const decoded = verifyAccessToken(cookieToken);
          socket.data.userId = decoded.userId;
          socket.data.userEmail = decoded.email;
          return next();
        } catch {
          return next(new Error('Authentication error'));
        }
      }

      next(new Error('Authentication error'));
    });
  }

  /**
   * Parse a signed cookie from a raw `Cookie` header string.
   * cookie-parser signs values as `s:<value>.<hmac>` using HMAC-SHA256.
   * We replicate that check here so Socket.IO can reuse the same cookie.
   */
  private extractSignedCookie(cookieHeader: string, name: string): string | null {
    const pairs = cookieHeader.split(';').map((s) => s.trim());
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      const key = decodeURIComponent(pair.slice(0, idx).trim());
      if (key !== name) continue;
      const raw = decodeURIComponent(pair.slice(idx + 1).trim());
      // Signed cookies from cookie-parser start with 's:'
      if (!raw.startsWith('s:')) return null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sig = require('cookie-signature') as { unsign: (val: string, secret: string) => string | false };
        const unsigned = sig.unsign(raw.slice(2), config.session.cookieSecret);
        return unsigned === false ? null : unsigned;
      } catch {
        return null;
      }
    }
    return null;
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId as number;

      logger.info(`User connected: ${userId} (socket: ${socket.id})`);
      this.connectedUsers.set(userId, socket.id);

      socket.join(`user:${userId}`);

      socket.on('quiz:start', (data) => this.handleQuizStart(socket, data));
      socket.on('quiz:answer', (data) => this.handleQuizAnswer(socket, data));
      socket.on('quiz:submit', (data) => this.handleQuizSubmit(socket, data));

      socket.on('hackathon:join', (data) => this.handleHackathonJoin(socket, data));
      socket.on('hackathon:code-update', (data) => this.handleCodeUpdate(socket, data));
      socket.on('hackathon:submission', (data) => this.handleSubmission(socket, data));

      socket.on('interview:join', (data) => this.handleInterviewJoin(socket, data));
      socket.on('interview:message', (data) => this.handleInterviewMessage(socket, data));

      // ── Sandbox execution streaming ──────────────────────────────────────
      socket.on('sandbox:join', (data: { sessionId: string }) => {
        if (data?.sessionId) {
          socket.join(`sandbox:${data.sessionId}`);
          logger.info(`User ${userId} joined sandbox session ${data.sessionId}`);
        }
      });

      socket.on('sandbox:leave', (data: { sessionId: string }) => {
        if (data?.sessionId) {
          socket.leave(`sandbox:${data.sessionId}`);
        }
      });

      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${userId}`);
        this.connectedUsers.delete(userId);
      });
    });
  }

  private handleQuizStart(socket: Socket, data: any) {
    const userId = socket.data.userId as number;
    socket.join(`quiz:${data.quizId}`);

    logger.info(`User ${userId} started quiz ${data.quizId}`);

    this.io.to(`quiz:${data.quizId}`).emit('quiz:user-joined', {
      userId,
      timestamp: new Date(),
    });
  }

  private handleQuizAnswer(socket: Socket, data: any) {
    socket.emit('quiz:answer-received', {
      questionId: data.questionId,
      timestamp: new Date(),
    });
  }

  private handleQuizSubmit(socket: Socket, data: any) {
    const userId = socket.data.userId as number;

    logger.info(`User ${userId} submitted quiz ${data.quizId}`);
    socket.leave(`quiz:${data.quizId}`);
  }

  private handleHackathonJoin(socket: Socket, data: any) {
    const userId = socket.data.userId as number;
    socket.join(`hackathon:${data.hackathonId}`);

    logger.info(`User ${userId} joined hackathon ${data.hackathonId}`);

    this.io.to(`hackathon:${data.hackathonId}`).emit('hackathon:user-joined', {
      userId,
      timestamp: new Date(),
    });
  }

  private handleCodeUpdate(socket: Socket, data: any) {
    const userId = socket.data.userId as number;

    if (data.teamId) {
      socket.to(`team:${data.teamId}`).emit('hackathon:code-updated', {
        userId,
        code: data.code,
        language: data.language,
        timestamp: new Date(),
      });
    }
  }

  private handleSubmission(socket: Socket, data: any) {
    const userId = socket.data.userId as number;

    logger.info(`User ${userId} submitted code for hackathon ${data.hackathonId}`);

    socket.emit('hackathon:submission-received', {
      submissionId: data.submissionId,
      timestamp: new Date(),
    });

    this.io.to(`hackathon:${data.hackathonId}`).emit('hackathon:leaderboard-update', {
      timestamp: new Date(),
    });
  }

  private handleInterviewJoin(socket: Socket, data: any) {
    const userId = socket.data.userId as number;
    socket.join(`interview:${data.sessionId}`);

    logger.info(`User ${userId} joined interview session ${data.sessionId}`);

    socket.to(`interview:${data.sessionId}`).emit('interview:participant-joined', {
      userId,
      timestamp: new Date(),
    });
  }

  private handleInterviewMessage(socket: Socket, data: any) {
    const userId = socket.data.userId as number;

    socket.to(`interview:${data.sessionId}`).emit('interview:message', {
      userId,
      message: data.message,
      timestamp: new Date(),
    });
  }

  public emitToUser(userId: number, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  public emitSandboxOutput(sessionId: string, chunk: string) {
    this.io.to(`sandbox:${sessionId}`).emit('sandbox:output', { sessionId, chunk, timestamp: Date.now() });
  }

  public emitSandboxResult(sessionId: string, result: any) {
    this.io.to(`sandbox:${sessionId}`).emit('sandbox:result', { sessionId, result, timestamp: Date.now() });
  }

  public broadcastToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        logger.info('✓ Socket.IO server closed');
        resolve();
      });
    });
  }
}
