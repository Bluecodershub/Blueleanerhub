import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { mkdir, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { ExecutionProvider, ExecutionRequest, ExecutionResult } from './execution.types';

const MAX_OUTPUT_BYTES = 10 * 1024;
const EXECUTION_TIMEOUT_MS = 10_000;

function isPython(language: string): boolean {
  const langKey = language.toLowerCase().replace(/[^a-z0-9]/g, '');
  return langKey === 'python' || langKey === 'python3';
}

function isEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.LOCAL_CODE_EXECUTION_ENABLED !== 'false';
}

function trimOutput(output: string): string {
  const buffer = Buffer.from(output, 'utf8');
  if (buffer.byteLength <= MAX_OUTPUT_BYTES) return output;
  return buffer.subarray(0, MAX_OUTPUT_BYTES).toString('utf8') + '\n[output truncated]';
}

function pythonCommands(): Array<{ command: string; args: string[] }> {
  if (process.platform === 'win32') {
    return [
      { command: 'py', args: ['-3'] },
      { command: 'python', args: [] },
    ];
  }

  return [
    { command: 'python3', args: [] },
    { command: 'python', args: [] },
  ];
}

async function runWithCommand(
  command: string,
  args: string[],
  filePath: string,
  stdin?: string,
): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args, filePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: {
        PATH: process.env.PATH,
        PYTHONIOENCODING: 'utf-8',
      },
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, EXECUTION_TIMEOUT_MS);
    timeout.unref?.();

    child.stdout.on('data', (chunk) => {
      stdout = trimOutput(stdout + chunk.toString('utf8'));
    });

    child.stderr.on('data', (chunk) => {
      stderr = trimOutput(stderr + chunk.toString('utf8'));
    });

    child.on('error', reject);

    child.on('close', (code) => {
      clearTimeout(timeout);

      if (timedOut) {
        resolve({
          stdout: stdout || null,
          stderr: 'Execution timed out after 10 seconds',
          compile_output: null,
          status: { id: 5, description: 'Time Limit Exceeded' },
          time: null,
          memory: null,
          success: false,
        });
        return;
      }

      resolve({
        stdout: stdout || null,
        stderr: stderr || null,
        compile_output: null,
        status: code === 0 ? { id: 3, description: 'Accepted' } : { id: 11, description: 'Runtime Error' },
        time: null,
        memory: null,
        success: code === 0,
      });
    });

    if (stdin) child.stdin.write(stdin);
    child.stdin.end();
  });
}

export class LocalPythonProvider implements ExecutionProvider {
  isAvailable(): boolean {
    return isEnabled();
  }

  getRuntimeStatus() {
    return {
      provider: 'local-python',
      configured: this.isAvailable(),
      apiUrl: 'local-process',
      requiresApiKey: false,
      supportedLanguages: ['python'],
      message: this.isAvailable()
        ? 'Local development Python runtime is available'
        : 'Local Python runtime is disabled',
    };
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    if (!this.isAvailable()) {
      return {
        stdout: null,
        stderr: 'Local Python runtime is disabled',
        compile_output: null,
        status: { id: 0, description: 'Service Unavailable' },
        time: null,
        memory: null,
        success: false,
      };
    }

    if (!isPython(request.language)) {
      return {
        stdout: null,
        stderr: `Unsupported language for local runtime: ${request.language}. Supported: python`,
        compile_output: null,
        status: { id: 6, description: 'Compilation Error' },
        time: null,
        memory: null,
        success: false,
      };
    }

    const dir = path.join(os.tmpdir(), 'bluelearnerhub-code', randomUUID());
    const filePath = path.join(dir, 'main.py');

    try {
      await mkdir(dir, { recursive: true });
      await writeFile(filePath, request.code, 'utf8');

      let lastError: unknown;
      for (const candidate of pythonCommands()) {
        try {
          return await runWithCommand(candidate.command, candidate.args, filePath, request.stdin);
        } catch (err) {
          lastError = err;
        }
      }

      const message = lastError instanceof Error ? lastError.message : 'Python executable not found';
      return {
        stdout: null,
        stderr: message,
        compile_output: null,
        status: { id: 0, description: 'Service Unavailable' },
        time: null,
        memory: null,
        success: false,
      };
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async executeMultiple(code: string, language: string, testCases: any[]): Promise<any[]> {
    const results: any[] = [];

    for (const testCase of testCases) {
      const result = await this.execute({ code, language, stdin: testCase.input });
      const actual = result.stdout?.trim() || '';
      const expected = testCase.expected.trim();

      results.push({
        passed: actual === expected,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        stderr: result.stderr,
        status: result.status.description,
      });
    }

    return results;
  }

  getLanguageIds(): Record<string, number> {
    return { python: -1 };
  }
}

export const localPythonProvider = new LocalPythonProvider();
