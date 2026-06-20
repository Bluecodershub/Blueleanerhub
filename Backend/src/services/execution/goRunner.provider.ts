import { config } from '../../config';
import logger from '../../utils/logger';
import { ExecutionProvider, ExecutionRequest, ExecutionResult } from './execution.types';

/**
 * Calls the Bluelearnerhub Go code-runner microservice (../../../code-runner).
 * Enabled only when CODE_RUNNER_URL is set; otherwise the manager falls back to
 * its other providers. The Go runner sandboxes each run in Docker and persists
 * submissions to MongoDB.
 */

// Languages the Go runner understands (see code-runner/internal/executor/languages.go).
const SUPPORTED = new Set([
  'python', 'javascript', 'typescript', 'c', 'cpp', 'csharp', 'java', 'go', 'rust', 'php', 'ruby',
]);

interface RunnerResponse {
  id: string;
  status: string; // success | error | timeout | disabled | unsupported_language | internal_error
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  message?: string;
}

export class GoRunnerProvider implements ExecutionProvider {
  isConfigured(): boolean {
    return Boolean(config.codeRunner.url);
  }

  getRuntimeStatus() {
    return {
      provider: 'go-code-runner',
      configured: this.isConfigured(),
      apiUrl: config.codeRunner.url || null,
      requiresApiKey: false,
      supportedLanguages: Array.from(SUPPORTED),
      message: this.isConfigured()
        ? 'Go code-runner is configured'
        : 'CODE_RUNNER_URL is not set — using fallback execution provider',
    };
  }

  /** Maps the runner's string status to the Judge0-style ExecutionResult shape. */
  private toResult(r: RunnerResponse): ExecutionResult {
    const statusMap: Record<string, { id: number; description: string }> = {
      success: { id: 3, description: 'Accepted' },
      error: { id: 11, description: 'Runtime/Compile Error' },
      timeout: { id: 5, description: 'Time Limit Exceeded' },
      disabled: { id: 0, description: 'Execution Disabled' },
      unsupported_language: { id: 6, description: 'Unsupported Language' },
      internal_error: { id: 0, description: 'Internal Error' },
    };
    const status = statusMap[r.status] ?? { id: 0, description: r.status || 'Unknown' };
    return {
      stdout: r.stdout || null,
      stderr: r.stderr || r.message || null,
      compile_output: null,
      status,
      time: r.timeMs != null ? (r.timeMs / 1000).toFixed(3) : null,
      memory: null,
      success: r.status === 'success',
    };
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const langKey = request.language.toLowerCase().replace(/[^a-z]/g, '');
    if (!SUPPORTED.has(langKey)) {
      return {
        stdout: null,
        stderr: `Unsupported language: ${request.language}. Supported: ${Array.from(SUPPORTED).join(', ')}`,
        compile_output: null,
        status: { id: 6, description: 'Unsupported Language' },
        time: null,
        memory: null,
        success: false,
      };
    }

    const url = config.codeRunner.url.replace(/\/$/, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.codeRunner.apiKey) headers['X-Runner-Key'] = config.codeRunner.apiKey;

    try {
      const res = await fetch(`${url}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language: langKey,
          source: request.code,
          stdin: request.stdin ?? '',
        }),
      });
      if (!res.ok) {
        throw new Error(`runner responded ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as RunnerResponse;
      return this.toResult(data);
    } catch (err: any) {
      logger.warn('Go code-runner execution failed', { message: err.message });
      return {
        stdout: null,
        stderr: err.message ?? 'Code execution service unavailable',
        compile_output: null,
        status: { id: 0, description: 'Service Unavailable' },
        time: null,
        memory: null,
        success: false,
      };
    }
  }

  async executeMultiple(code: string, language: string, testCases: any[]): Promise<any[]> {
    const results: any[] = [];
    for (const testCase of testCases) {
      const result = await this.execute({ code, language, stdin: testCase.input });
      const actual = result.stdout?.trim() || '';
      const expected = String(testCase.expected ?? '').trim();
      results.push({
        passed: actual === expected,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        stderr: result.stderr,
        status: result.status.description,
        time: result.time || undefined,
      });
    }
    return results;
  }

  getLanguageIds(): Record<string, number> {
    // The Go runner keys on language name, not numeric id; expose a name map
    // so callers relying on getLanguageIds() still see supported languages.
    const map: Record<string, number> = {};
    let i = 1;
    for (const l of SUPPORTED) map[l] = i++;
    return map;
  }
}

export const goRunnerProvider = new GoRunnerProvider();
