import { config } from '../../config';
import logger from '../../utils/logger';
import { ExecutionProvider, ExecutionRequest, ExecutionResult } from './execution.types';

export const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  typescript: 74,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  rust: 73,
  sql: 82,
  bash: 46,
  ruby: 72,
  php: 68,
  csharp: 51,
  swift: 83,
  kotlin: 78,
};

export class Judge0Provider implements ExecutionProvider {
  getRuntimeStatus() {
    const apiUrl = config.judge0.apiUrl.replace(/\/$/, '');
    const usesRapidApi = apiUrl.includes('rapidapi.com');
    const configured = !usesRapidApi || Boolean(config.judge0.apiKey);

    return {
      provider: 'judge0',
      configured,
      apiUrl,
      requiresApiKey: usesRapidApi,
      supportedLanguages: Object.keys(LANGUAGE_IDS),
      message: configured
        ? 'Code execution runtime is configured'
        : 'JUDGE0_API_KEY is required when JUDGE0_API_URL uses RapidAPI',
    };
  }

  private async submitToJudge0(sourceCode: string, languageId: number, stdin?: string): Promise<ExecutionResult> {
    const apiKey = config.judge0.apiKey;
    const apiUrl = config.judge0.apiUrl.replace(/\/$/, '');
    const usesRapidApi = apiUrl.includes('rapidapi.com');
    if (usesRapidApi && !apiKey) throw new Error('JUDGE0_API_KEY not configured');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (usesRapidApi && apiKey) {
      headers['X-RapidAPI-Key'] = apiKey;
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    const submitRes = await fetch(`${apiUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source_code: sourceCode,
        language_id: languageId,
        stdin: stdin ?? '',
        cpu_time_limit: 5,
        wall_time_limit: 10,
        memory_limit: 128000,
        max_output_size: 10240,
        enable_network: false,
      }),
    });

    if (!submitRes.ok) {
      throw new Error(`Judge0 submission failed: ${submitRes.status} ${submitRes.statusText}`);
    }

    const result = await submitRes.json() as any;

    return {
      stdout: result.stdout ?? null,
      stderr: result.stderr ?? null,
      compile_output: result.compile_output ?? null,
      status: result.status ?? { id: 0, description: 'Unknown' },
      time: result.time ?? null,
      memory: result.memory ?? null,
      success: result.status?.id === 3,
    };
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const langKey = request.language.toLowerCase().replace(/[^a-z]/g, '');
    const languageId = LANGUAGE_IDS[langKey];

    if (!languageId) {
      return {
        stdout: null,
        stderr: `Unsupported language: ${request.language}. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}`,
        compile_output: null,
        status: { id: 6, description: 'Compilation Error' },
        time: null,
        memory: null,
        success: false,
      };
    }

    try {
      return await this.submitToJudge0(request.code, languageId, request.stdin);
    } catch (err: any) {
      logger.warn('Judge0 execution failed', { message: err.message });
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
      const expected = testCase.expected.trim();
      const passed = actual === expected;

      results.push({
        passed,
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
    return LANGUAGE_IDS;
  }
}

export const judge0Provider = new Judge0Provider();
