import { judge0Provider } from './judge0.provider';
import { ExecutionRequest, ExecutionResult, RuntimeAdapter, RuntimeStatus } from './execution.types';

let socketServiceInstance: any = null;

export function setSocketService(instance: any): void {
  socketServiceInstance = instance;
}

type OutputCallback = (chunk: string) => void;
const outputCallbacks = new Map<string, Set<OutputCallback>>();

export function registerOutputCallback(sessionId: string, cb: OutputCallback): () => void {
  if (!outputCallbacks.has(sessionId)) {
    outputCallbacks.set(sessionId, new Set());
  }
  outputCallbacks.get(sessionId)!.add(cb);
  return () => {
    outputCallbacks.get(sessionId)?.delete(cb);
    if (outputCallbacks.get(sessionId)?.size === 0) {
      outputCallbacks.delete(sessionId);
    }
  };
}

export function emitOutput(sessionId: string, chunk: string): void {
  outputCallbacks.get(sessionId)?.forEach((cb) => {
    try { cb(chunk); } catch { /* ignore */ }
  });
}

export class Judge0RuntimeAdapter implements RuntimeAdapter {
  readonly runtimeType = 'judge0';

  async start(_sessionId: string): Promise<RuntimeStatus> {
    return 'running';
  }

  async stop(_sessionId: string): Promise<void> {
    // Judge0 has no persistent runtime to stop
  }

  async getStatus(_sessionId: string): Promise<RuntimeStatus> {
    return 'running';
  }

  async execute(
    sessionId: string,
    request: ExecutionRequest,
    onOutput?: (chunk: string) => void,
  ): Promise<ExecutionResult> {
    // This adapter is the socket-streaming path only. Code accumulation and
    // history writes are exclusively handled by PersistentStateAdapter (HTTP
    // path) to avoid double-accumulation when both paths share a session.
    const result = await judge0Provider.execute(request);

    if (result.stdout) {
      for (const line of result.stdout.split('\n')) {
        const chunk = line + '\n';
        socketServiceInstance?.emitSandboxOutput(sessionId, chunk);
        emitOutput(sessionId, chunk);
        onOutput?.(chunk);
      }
    }
    if (result.stderr) {
      const chunk = `[stderr] ${result.stderr}\n`;
      socketServiceInstance?.emitSandboxOutput(sessionId, chunk);
      emitOutput(sessionId, chunk);
      onOutput?.(chunk);
    }

    socketServiceInstance?.emitSandboxResult(sessionId, result);

    return result;
  }

  async restart(_sessionId: string): Promise<RuntimeStatus> {
    return 'running';
  }
}

// ─── Runtime registry ───────────────────────────────────────────────────────
const runtimeInstances = new Map<string, RuntimeAdapter>();

export function registerRuntime(type: string, adapter: RuntimeAdapter): void {
  runtimeInstances.set(type, adapter);
}

export function getRuntime(type?: string): RuntimeAdapter {
  if (type && runtimeInstances.has(type)) {
    return runtimeInstances.get(type)!;
  }
  return runtimeInstances.get('judge0') ?? new Judge0RuntimeAdapter();
}

export const defaultRuntime = new Judge0RuntimeAdapter();
registerRuntime('judge0', defaultRuntime);
