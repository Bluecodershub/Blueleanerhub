/**
 * Judge0 Service — Backward Compat Wrapper
 * =========================================
 * Re-exports from the new execution module for backward compatibility.
 * New code should import from '@/services/execution/execution.manager'
 * or '@/services/execution/judge0.provider' directly.
 *
 * Migration path (Phase 2): Remove this file once all imports are updated.
 */

import { judge0Provider } from './execution/judge0.provider';
import type { ExecutionResult } from './execution/execution.types';
import { LANGUAGE_IDS } from './execution/judge0.provider';

export { LANGUAGE_IDS };
export type { ExecutionResult };

export interface TestCase {
  input: string;
  expected: string;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string | null;
  stderr: string | null;
  status: string;
  time?: string;
}

export async function executeCode(code: string, language: string, stdin?: string): Promise<ExecutionResult> {
  return judge0Provider.execute({ code, language, stdin });
}

export async function executeMultiple(code: string, language: string, testCases: TestCase[]): Promise<TestCaseResult[]> {
  return judge0Provider.executeMultiple(code, language, testCases);
}

export const judge0Service = { executeCode, executeMultiple, LANGUAGE_IDS };

export class Judge0Service {
  async execute(code: string, language: string, stdin?: string) {
    return executeCode(code, language, stdin);
  }

  async executeMultiple(code: string, language: string, testCases: TestCase[]) {
    return executeMultiple(code, language, testCases);
  }
}
