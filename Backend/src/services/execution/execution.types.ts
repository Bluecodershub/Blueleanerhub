import { v4 as uuidv4 } from 'uuid';

export type SandboxType = 'education' | 'hackathon';

export interface SessionMetadata {
  sessionId: string;
  userId?: string;
  sandboxType: SandboxType;
  language: string;
  createdAt: Date;
  lastActive: Date;
  executionCount: number;
}

export interface ExecutionRequest {
  code: string;
  language: string;
  stdin?: string;
  sessionId?: string;
  sandboxType?: SandboxType;
  cellIndex?: number;
  persistSession?: boolean;
}

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
  success: boolean;
}

export interface ExecutionProvider {
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
  executeMultiple(code: string, language: string, testCases: any[]): Promise<any[]>;
  getLanguageIds(): Record<string, number>;
}

// ─── Runtime Adapter (Phase 3 preparation) ──────────────────────────────────
export type RuntimeStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface RuntimeAdapter {
  readonly runtimeType: string;
  start(sessionId: string): Promise<RuntimeStatus>;
  stop(sessionId: string): Promise<void>;
  getStatus(sessionId: string): Promise<RuntimeStatus>;
  execute(
    sessionId: string,
    request: ExecutionRequest,
    onOutput?: (chunk: string) => void,
  ): Promise<ExecutionResult>;
  restart(sessionId: string): Promise<RuntimeStatus>;
}

// ─── Execution history ───────────────────────────────────────────────────────
export function createExecutionId(): string {
  return uuidv4();
}

export interface ExecutionHistoryEntry {
  executionId: string;
  timestamp: Date;
  code: string;
  language: string;
  result: ExecutionResult;
  cellIndex?: number;
}

// ─── Kernel state ────────────────────────────────────────────────────────────
export interface KernelState {
  sessionId: string;
  runtimeType: string;
  status: RuntimeStatus;
  startedAt: Date | null;
  history: string[];
  lastResult: ExecutionResult | null;
}
