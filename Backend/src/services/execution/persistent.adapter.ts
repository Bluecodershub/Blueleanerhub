import { ExecutionProvider, ExecutionRequest, ExecutionResult } from './execution.types';
import { judge0Provider } from './judge0.provider';
import { localPythonProvider } from './localPython.provider';
import { sessionService } from '../session.service';

export class PersistentStateAdapter implements ExecutionProvider {
  private buildSessionCode(language: string, accumulatedCode: string, currentCode: string): string {
    if (!accumulatedCode) return currentCode;

    const langKey = language.toLowerCase().replace(/[^a-z]/g, '');
    if (langKey !== 'python') {
      return `${accumulatedCode}\n\n${currentCode}`;
    }

    return [
      'import contextlib as __blue_contextlib',
      'import io as __blue_io',
      '__blue_previous_stdout = __blue_io.StringIO()',
      'with __blue_contextlib.redirect_stdout(__blue_previous_stdout):',
      ...accumulatedCode.split('\n').map((line) => `    ${line}`),
      '',
      currentCode,
    ].join('\n');
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const { sessionId, code, language, stdin, cellIndex } = request;
    const provider = !judge0Provider.getRuntimeStatus().configured && localPythonProvider.isAvailable()
      ? localPythonProvider
      : judge0Provider;

    if (!sessionId) {
      return provider.execute(request);
    }

    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return provider.execute(request);
    }

    const accumulatedCode = await sessionService.getAccumulatedCode(sessionId);
    const fullCode = this.buildSessionCode(language, accumulatedCode, code);

    const result = await provider.execute({
      code: fullCode,
      language,
      stdin,
    });

    await sessionService.addExecutionHistory(sessionId, { code, language, result, cellIndex });

    return result;
  }

  async executeMultiple(code: string, language: string, testCases: any[]): Promise<any[]> {
    return judge0Provider.executeMultiple(code, language, testCases);
  }

  getLanguageIds(): Record<string, number> {
    return judge0Provider.getLanguageIds();
  }
}

export const persistentAdapter = new PersistentStateAdapter();
