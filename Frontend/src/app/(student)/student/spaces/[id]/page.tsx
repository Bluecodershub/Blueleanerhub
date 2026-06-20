'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  Code2,
  Copy,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  XCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LanguageLogo } from '@/components/ui/LanguageLogo'
import { cn } from '@/lib/utils'
import { codeAPI, spacesAPI } from '@/lib/api-civilization'
import {
  DEFAULT_RUNTIME_LANGUAGE,
  RUNTIME_LANGUAGES,
  getRuntimeLanguage,
  getStarterCode,
  type RuntimeLanguageId,
} from '@/lib/languages'
import { toast } from 'sonner'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type Difficulty = 'easy' | 'medium' | 'hard'

interface TestCase {
  input: string
  expected: string
}

interface Challenge {
  id: string
  title: string
  description: string
  category?: string
  difficulty: Difficulty
  points: number
  starterCode?: string
  testCases: TestCase[]
  tags: string[]
}

interface TestResult {
  passed?: boolean
  input?: string
  expected?: string
  actual?: string
  stderr?: string | null
  status?: string
  time?: string
}

interface OutputState {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  results?: TestResult[]
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; bgColor: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  hard: { label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/20' },
}

function normalizeDifficulty(value: unknown): Difficulty {
  const key = String(value ?? 'easy').toLowerCase()
  if (key === 'medium') return 'medium'
  if (key === 'hard') return 'hard'
  return 'easy'
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'hard') return 120
  if (difficulty === 'medium') return 60
  return 30
}

function normalizeChallenge(payload: unknown): Challenge | null {
  if (!payload || typeof payload !== 'object') return null
  const raw = payload as Record<string, unknown>
  const id = String(raw._id ?? raw.id ?? '')
  if (!id) return null

  const difficulty = normalizeDifficulty(raw.difficulty)
  const testCases = Array.isArray(raw.testCases)
    ? raw.testCases
        .filter((test): test is Record<string, unknown> => Boolean(test && typeof test === 'object'))
        .map((test) => ({
          input: String(test.input ?? ''),
          expected: String(test.expected ?? ''),
        }))
    : []

  return {
    id,
    title: String(raw.title ?? 'Untitled challenge'),
    description: String(raw.description ?? 'No description has been published for this challenge.'),
    category: raw.category ? String(raw.category) : undefined,
    difficulty,
    points: Number(raw.points ?? pointsForDifficulty(difficulty)),
    starterCode: raw.starterCode ? String(raw.starterCode) : undefined,
    testCases,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).filter(Boolean) : [],
  }
}

function readExecutionResult(responseData: unknown): Record<string, unknown> | null {
  const payload = responseData as { data?: unknown } | undefined
  const nested = payload?.data
  if (nested && typeof nested === 'object') return nested as Record<string, unknown>
  if (responseData && typeof responseData === 'object') return responseData as Record<string, unknown>
  return null
}

function CodeEditorSkeleton() {
  return (
    <div className="h-full animate-pulse bg-[#1f2430]">
      <div className="h-11 border-b border-white/10 bg-[#161a22]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-40 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
      </div>
    </div>
  )
}

export default function ChallengeDetailPage() {
  const params = useParams()
  const challengeId = String(params.id ?? '')

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState(DEFAULT_RUNTIME_LANGUAGE.starterCode)
  const [language, setLanguage] = useState(DEFAULT_RUNTIME_LANGUAGE.id)
  const [output, setOutput] = useState<OutputState | null>(null)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [activeCase, setActiveCase] = useState(0)

  useEffect(() => {
    let active = true

    async function loadChallenge() {
      setLoading(true)
      setError(null)
      const response = await spacesAPI.getChallenge(challengeId)
      if (!active) return

      if (response.error) {
        setError(response.error)
        setChallenge(null)
      } else {
        const nextChallenge = normalizeChallenge(response.data)
        if (!nextChallenge) {
          setError('Challenge not found')
          setChallenge(null)
        } else {
          setChallenge(nextChallenge)
          setCode(nextChallenge.starterCode?.trim() || DEFAULT_RUNTIME_LANGUAGE.starterCode)
        }
      }
      setLoading(false)
    }

    loadChallenge().catch((err) => {
      if (!active) return
      setError(err instanceof Error ? err.message : 'Failed to load challenge')
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [challengeId])

  const activeRuntime = useMemo(() => getRuntimeLanguage(language), [language])
  const currentTestCase = challenge?.testCases[activeCase]

  const handleLanguageChange = (nextLanguage: RuntimeLanguageId) => {
    setLanguage(nextLanguage)
    setCode(challenge?.starterCode?.trim() || getStarterCode(nextLanguage))
    setOutput(null)
  }

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Add code before running')
      return
    }

    setRunning(true)
    setOutput(null)

    try {
      const response = await codeAPI.execute(code, language, currentTestCase?.input, undefined, {
        sandboxType: 'education',
      })
      if (response.error) {
        setOutput({ type: 'error', title: 'Execution failed', message: response.error })
        return
      }

      const result = readExecutionResult(response.data)
      if (!result) {
        setOutput({ type: 'error', title: 'Execution failed', message: 'The execution service returned an empty response.' })
        return
      }

      const stderr = String(result.stderr ?? result.compile_output ?? '')
      const stdout = String(result.stdout ?? '')
      const success = Boolean(result.success)
      setOutput({
        type: success ? 'success' : 'error',
        title: success ? 'Run completed' : String((result.status as { description?: string } | undefined)?.description ?? 'Run failed'),
        message: stderr || stdout || '(program produced no output)',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Code execution failed'
      setOutput({ type: 'error', title: 'Execution failed', message })
      toast.error(message)
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!challenge || !code.trim()) {
      toast.error('Add code before submitting')
      return
    }

    setSubmitting(true)
    setOutput(null)

    try {
      const response = await spacesAPI.execute(challenge.id, language, code)
      if (response.error) {
        setOutput({ type: 'error', title: 'Submission failed', message: response.error })
        return
      }

      const payload = response.data as { passed?: boolean; results?: TestResult[]; execution?: Record<string, unknown> } | undefined
      const results = Array.isArray(payload?.results) ? payload.results : []
      const passed = Boolean(payload?.passed)
      const passedCount = results.filter((result) => result.passed).length
      const executionMessage = String(payload?.execution?.stderr ?? payload?.execution?.stdout ?? '')

      setOutput({
        type: passed ? 'success' : 'error',
        title: passed ? 'Accepted' : 'Not accepted',
        message: results.length > 0
          ? `${passedCount}/${results.length} test cases passed`
          : executionMessage || 'Submission completed without public test-case details.',
        results,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed'
      setOutput({ type: 'error', title: 'Submission failed', message })
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setCode(challenge?.starterCode?.trim() || getStarterCode(language))
    setOutput(null)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Could not copy code')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading challenge</p>
        </div>
      </div>
    )
  }

  if (error || !challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
          <h2 className="text-xl font-semibold">Challenge unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error ?? 'The challenge could not be loaded.'}</p>
          <Button asChild className="mt-5">
            <Link href="/student/spaces">Back to spaces</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex flex-col gap-4 border-b border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/student/spaces"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-semibold">{challenge.title}</h1>
              <Badge variant="outline" className={cn('text-xs', difficultyConfig[challenge.difficulty].bgColor)}>
                <span className={difficultyConfig[challenge.difficulty].color}>
                  {difficultyConfig[challenge.difficulty].label}
                </span>
              </Badge>
              {challenge.category && <Badge variant="secondary" className="text-xs">{challenge.category}</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{challenge.points} points</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <LanguageLogo language={activeRuntime.id} size={18} />
            {activeRuntime.name}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Terminal className="h-3.5 w-3.5" />
            Real runtime
          </Badge>
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="border-b border-border lg:border-b-0 lg:border-r">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
            <div className="border-b border-border bg-card px-4">
              <TabsList className="h-11 justify-start rounded-none bg-transparent p-0">
                <TabsTrigger value="description" className="rounded-none">Description</TabsTrigger>
                <TabsTrigger value="tests" className="rounded-none">Tests</TabsTrigger>
                <TabsTrigger value="results" className="rounded-none">Results</TabsTrigger>
              </TabsList>
            </div>

            <div className="max-h-[48rem] flex-1 overflow-y-auto p-6">
              <TabsContent value="description" className="mt-0 space-y-6">
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Problem statement</h2>
                  <div className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {challenge.description}
                  </div>
                </div>

                {challenge.tags.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {challenge.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tests" className="mt-0 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Public test cases</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These are the test cases published with this exercise.
                  </p>
                </div>

                {challenge.testCases.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {challenge.testCases.map((_, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={activeCase === index ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setActiveCase(index)}
                        >
                          Case {index + 1}
                        </Button>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border bg-card">
                      <div className="border-b border-border px-4 py-3 text-sm font-medium">
                        Case {activeCase + 1}
                      </div>
                      <div className="space-y-4 p-4">
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Input</p>
                          <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-sm">{currentTestCase?.input}</pre>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Expected output</p>
                          <pre className="overflow-x-auto rounded-md bg-secondary p-3 text-sm">{currentTestCase?.expected}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <Code2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <h3 className="font-semibold">No public test cases</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Run code with your own stdin or submit for backend judging when test cases are configured.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="results" className="mt-0">
                {output ? (
                  <div className="space-y-4">
                    <div className={cn(
                      'rounded-lg border p-4',
                      output.type === 'success'
                        ? 'border-emerald-500/20 bg-emerald-500/10'
                        : output.type === 'error'
                          ? 'border-red-500/20 bg-red-500/10'
                          : 'border-border bg-card'
                    )}>
                      <div className="mb-2 flex items-center gap-2">
                        {output.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : output.type === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Terminal className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold">{output.title}</h3>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{output.message}</pre>
                    </div>

                    {output.results && output.results.length > 0 && (
                      <div className="space-y-2">
                        {output.results.map((result, index) => (
                          <details key={index} className="rounded-lg border border-border bg-card p-4">
                            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                              <span className="flex items-center gap-2">
                                {result.passed ? (
                                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                Case {index + 1}: {result.passed ? 'passed' : 'failed'}
                              </span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </summary>
                            <div className="mt-4 grid gap-3 text-sm">
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Input</p>
                                <pre className="overflow-x-auto rounded-md bg-secondary p-3">{result.input}</pre>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Expected</p>
                                <pre className="overflow-x-auto rounded-md bg-secondary p-3">{result.expected}</pre>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Actual</p>
                                <pre className="overflow-x-auto rounded-md bg-secondary p-3">{result.actual || result.stderr || '(empty)'}</pre>
                              </div>
                            </div>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <Terminal className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <h3 className="font-semibold">No run output yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Run or submit your code to see runtime output.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <section className="flex min-h-[44rem] flex-col">
          <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {RUNTIME_LANGUAGES.map((runtime) => (
                <button
                  key={runtime.id}
                  type="button"
                  onClick={() => handleLanguageChange(runtime.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
                    language === runtime.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LanguageLogo language={runtime.id} size={18} />
                  <span>{runtime.name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="min-h-[30rem] flex-1">
            <Suspense fallback={<CodeEditorSkeleton />}>
              <MonacoEditor
                height="100%"
                language={activeRuntime.monacoLanguage}
                value={code}
                onChange={(value: string | undefined) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  wordWrap: 'on',
                }}
              />
            </Suspense>
          </div>

          <div className="border-t border-border bg-card">
            <div className="flex flex-col gap-3 p-4 sm:flex-row">
              <Button variant="outline" onClick={handleRunCode} disabled={running || submitting} className="flex-1 gap-2">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running ? 'Running' : 'Run selected case'}
              </Button>
              <Button onClick={handleSubmit} disabled={running || submitting} className="flex-1 gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {submitting ? 'Submitting' : 'Submit to judge'}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
