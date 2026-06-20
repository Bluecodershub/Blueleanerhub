import { ExecutionProvider, ExecutionRequest, ExecutionResult, SandboxType } from './execution.types';
import { judge0Provider } from './judge0.provider';
import { goRunnerProvider } from './goRunner.provider';
import { localPythonProvider } from './localPython.provider';
import { persistentAdapter } from './persistent.adapter';

export class ExecutionManager {
  private providers: Map<SandboxType, ExecutionProvider> = new Map();
  private sessionProvider: ExecutionProvider;

  constructor() {
    this.providers.set('education', judge0Provider);
    this.providers.set('hackathon', judge0Provider);
    this.sessionProvider = persistentAdapter;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const { sessionId } = request;

    if (sessionId) {
      return this.sessionProvider.execute(request);
    }

    // Prefer the Go code-runner microservice when configured.
    if (goRunnerProvider.isConfigured()) {
      return goRunnerProvider.execute(request);
    }

    const sandboxType = request.sandboxType || 'education';
    if (!judge0Provider.getRuntimeStatus().configured && localPythonProvider.isAvailable()) {
      return localPythonProvider.execute(request);
    }
    const provider = this.providers.get(sandboxType) || judge0Provider;
    return provider.execute(request);
  }

  async executeMultiple(code: string, language: string, testCases: any[]): Promise<any[]> {
    if (goRunnerProvider.isConfigured()) {
      return goRunnerProvider.executeMultiple(code, language, testCases);
    }
    if (!judge0Provider.getRuntimeStatus().configured && localPythonProvider.isAvailable()) {
      return localPythonProvider.executeMultiple(code, language, testCases);
    }
    return judge0Provider.executeMultiple(code, language, testCases);
  }

  getLanguageIds(): Record<string, number> {
    if (goRunnerProvider.isConfigured()) return goRunnerProvider.getLanguageIds();
    if (!judge0Provider.getRuntimeStatus().configured && localPythonProvider.isAvailable()) {
      return localPythonProvider.getLanguageIds();
    }
    return judge0Provider.getLanguageIds();
  }

  getRuntimeStatus() {
    if (goRunnerProvider.isConfigured()) return goRunnerProvider.getRuntimeStatus();
    const judge0Status = judge0Provider.getRuntimeStatus();
    if (judge0Status.configured) return judge0Status;
    const localStatus = localPythonProvider.getRuntimeStatus();
    if (localStatus.configured) return localStatus;
    return judge0Status;
  }

  registerProvider(type: SandboxType, provider: ExecutionProvider): void {
    this.providers.set(type, provider);
  }
}

export const executionManager = new ExecutionManager();
