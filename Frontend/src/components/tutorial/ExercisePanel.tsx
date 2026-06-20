'use client'

/**
 * ExercisePanel — Practice challenge with test case runner
 */

import { useState } from 'react'
import { Terminal, CheckCircle2, XCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import CodePlayground from './CodePlayground'

interface TestCase {
  input: string
  expectedOutput: string
  isHidden: boolean
}

interface TestResult {
  input: string
  expected: string
  actual: string
  passed: boolean
  hidden: boolean
}

interface ExercisePanelProps {
  prompt: string
  testCases: TestCase[]
  xpReward: number
  language: string
  onRun: (
    code: string,
    language: string
  ) => Promise<{ stdout: string; stderr: string; success: boolean }>
  onComplete: () => Promise<void>
}

export default function ExercisePanel({
  prompt,
  testCases,
  xpReward,
  language,
  onRun,
  onComplete,
}: ExercisePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [allPassed, setAllPassed] = useState(false)

  const visibleTests = testCases.filter((t) => !t.isHidden)

  const handleRunTests = async (code: string) => {
    const results: TestResult[] = []

    for (const tc of testCases) {
      try {
        const result = await onRun(code, language)
        const actual = result.stdout.trim()
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          actual,
          passed: actual === tc.expectedOutput.trim(),
          hidden: tc.isHidden,
        })
      } catch {
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Execution error',
          passed: false,
          hidden: tc.isHidden,
        })
      }
    }

    setTestResults(results)
    const passed = results.every((r) => r.passed)
    setAllPassed(passed)

    if (passed) {
      await onComplete()
    }

    return { stdout: '', stderr: '', success: passed }
  }

  return (
    <div className="flex flex-col">
      {/* Header (collapsible on mobile) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-muted-foreground dark:hover:bg-gray-800/50 md:cursor-default"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary/80" />
          <span>Practice Exercise</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-foreground dark:bg-muted dark:text-foreground/60">
            +{xpReward} XP
          </span>
        </div>
        <div className="md:hidden">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      <div className={cn('flex flex-col', !isExpanded && 'hidden md:flex')}>
        {/* Prompt */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-border dark:bg-background-secondary/50">
          <p className="text-sm text-gray-700 dark:text-muted-foreground">{prompt}</p>
        </div>

        {/* Visible test cases */}
        {visibleTests.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-border">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Test Cases
            </p>
            <div className="flex flex-col gap-2">
              {visibleTests.map((tc, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-gray-100 px-3 py-2 font-mono text-xs dark:bg-card"
                >
                  <span className="text-gray-500">Input: </span>
                  <span className="text-gray-800 dark:text-foreground">{tc.input}</span>
                  <br />
                  <span className="text-gray-500">Expected: </span>
                  <span className="text-foreground dark:text-foreground/70">
                    {tc.expectedOutput}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code + run button */}
        <div className="border-t border-gray-200 dark:border-border">
          <CodePlayground
            starterCode=""
            language={language}
            onRun={handleRunTests}
            height="200px"
          />
        </div>

        {/* Test results */}
        {testResults.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-border">
            {allPassed ? (
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 dark:bg-background">
                <CheckCircle2 className="h-5 w-5 text-foreground/90" />
                <div>
                  <p className="text-sm font-semibold text-foreground dark:text-foreground/60">
                    All tests passed!
                  </p>
                  <p className="text-xs text-foreground/90 dark:text-foreground/70">
                    +{xpReward} XP awarded
                  </p>
                </div>
                <Zap className="ml-auto h-5 w-5 text-foreground/80" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {testResults
                  .filter((r) => !r.hidden)
                  .map((r, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-2 rounded-lg px-3 py-2 font-mono text-xs',
                        r.passed
                          ? 'bg-secondary text-foreground dark:bg-background dark:text-foreground/60'
                          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                      )}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <div>
                        <div>Input: {r.input}</div>
                        {!r.passed && (
                          <>
                            <div>Expected: {r.expected}</div>
                            <div>Got: {r.actual}</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
