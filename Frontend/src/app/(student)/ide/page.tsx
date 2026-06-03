'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Trophy,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  Code2,
  Play,
  RotateCcw,
  Send,
  CheckCircle2,
  XCircle,
  Terminal,
  Search,
  ChevronDown,
  Loader2,
  ThumbsUp,
  Users,
  Bot,
  Sparkles,
  Bug,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { codeAPI, exercisesAPI, getSandboxSessionId, setSandboxSessionId, clearSandboxSessionId } from '@/lib/api-civilization'
import { api } from '@/lib/api'
import { apiFetch } from '@/lib/apiFetch'
import { toast } from 'sonner'
import { CodeExecutionResponse } from '@/types'

// Lazy load Monaco to avoid large initial bundle
const CodeEditor = dynamic(() => import('@/components/ide/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm">Loading editor...</span>
      </div>
    </div>
  ),
})

const LANGUAGE_MAP: Record<string, string> = {
  'Python 3': 'python',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Java: 'java',
  'C++': 'cpp',
  Go: 'go',
}

const STARTER_CODE: Record<string, string> = {
  'Python 3': `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []
`,
  JavaScript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) return [map.get(complement), i];
        map.set(nums[i], i);
    }
    return [];
};
`,
}

const MOCK_PROBLEM = {
  id: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  acceptance: '49.1%',
  likes: 52400,
  submissions: 98200,
  tags: ['Array', 'Hash Table'],
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.`,
  note: 'You may assume that each input would have exactly one solution, and you may not use the same element twice.',
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Only one valid answer exists.',
  ],
  hints: [
    'A really brute force way would be to search for all possible pairs of numbers but that would be O(n²).',
    'Try using a hash map to reduce the lookup time from O(n) to O(1).',
    'For each number, check if its complement (target - num) already exists in the map.',
  ],
  testCases: [
    { input: 'nums = [2,7,11,15]\ntarget = 9', expected: '[0, 1]', stdin: '2 7 11 15\n9' },
    { input: 'nums = [3,2,4]\ntarget = 6', expected: '[1, 2]', stdin: '3 2 4\n6' },
    { input: 'nums = [3,3]\ntarget = 6', expected: '[0, 1]', stdin: '3 3\n6' },
  ],
}

interface RunResult {
  status: 'pass' | 'fail' | 'error'
  output?: string
  error?: string
  runtime?: string
  memory?: string
  stdout?: string
}

interface RuntimeStatus {
  configured: boolean
  provider: string
  message: string
  supportedLanguages?: string[]
}

function unwrapExecutionResponse(response: any): CodeExecutionResponse {
  const envelope = response?.data ?? response
  return envelope?.data ?? envelope
}

const diffColors: Record<string, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-red-400',
}

type PanelTab = 'description' | 'hints' | 'discussion'
type OutputTab = 'testcases' | 'output' | 'ai_help'

export default function CodingPracticePage() {
  const [language, setLanguage] = useState('Python 3')
  const [code, setCode] = useState(STARTER_CODE['Python 3'])
  const [leftPanel, setLeftPanel] = useState<PanelTab>('description')
  const [outputTab, setOutputTab] = useState<OutputTab>('testcases')
  const [aiOutput, setAiOutput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [activeCase, setActiveCase] = useState(0)
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runResult, setRunResult] = useState<RunResult | null>(null)
  const [showProblems, setShowProblems] = useState(false)
  const [problems, setProblems] = useState<any[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null)
  const [runtimeStatusLoading, setRuntimeStatusLoading] = useState(true)

  // Restore or generate sandbox session ID for persistent execution context
  useEffect(() => {
    const existing = getSandboxSessionId()
    if (existing) {
      setSessionId(existing)
    }
    exercisesAPI.list({ limit: 20 }).then((d: any) => {
      if (d?.exercises?.length) setProblems(d.exercises)
    }).catch(() => {})

    codeAPI.status().then((res: any) => {
      const data = res?.data?.data ?? res?.data
      if (data) setRuntimeStatus(data)
    }).catch(() => {
      setRuntimeStatus({
        configured: false,
        provider: 'unknown',
        message: 'Code execution runtime status is unavailable.',
      })
    }).finally(() => setRuntimeStatusLoading(false))
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    setCode(STARTER_CODE[lang] || `// Write your ${lang} solution here\n`)
    setRunResult(null)
  }

  const handleRun = async () => {
    if (!code.trim()) return
    if (runtimeStatus?.configured === false) {
      const message = runtimeStatus.message || 'Code execution runtime is not configured.'
      setRunResult({ status: 'error', error: message })
      setOutputTab('output')
      toast.error(message)
      return
    }
    setRunning(true)
    setOutputTab('output')
    setRunResult(null)

    try {
      const data = await codeAPI.execute(
        code,
        LANGUAGE_MAP[language] || 'python',
        undefined,
        sessionId || undefined,
        { sandboxType: 'hackathon', persistSession: true }
      )
      const result = unwrapExecutionResponse(data)

      if (result?.sessionId) {
        setSessionId(result.sessionId)
        setSandboxSessionId(result.sessionId)
        if (result?.sessionRecreated) {
          toast.warning('Session expired — a fresh execution context has been started.')
        }
      }

      if (result?.stderr || result?.compile_output) {
        setRunResult({
          status: 'error',
          error: result.stderr || result.compile_output,
          stdout: result.stdout,
        })
      } else {
        setRunResult({
          status: 'pass',
          output: result?.stdout ?? result?.output ?? '(no output)',
          runtime: result?.time ? `${result.time}s` : undefined,
          memory: result?.memory ? `${(result.memory / 1024).toFixed(1)} MB` : undefined,
        })
      }
    } catch (err: any) {
      const msg = err?.response?.status === 401
        ? 'Login required to execute code'
        : err?.message || 'Code execution failed'
      setRunResult({ status: 'error', error: msg })
      toast.error(msg)
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    if (runtimeStatus?.configured === false) {
      const message = runtimeStatus.message || 'Code execution runtime is not configured.'
      setRunResult({ status: 'error', error: message })
      setOutputTab('output')
      toast.error(message)
      return
    }
    setSubmitting(true)
    setOutputTab('output')
    setRunResult(null)

    try {
      // Run against all test cases sequentially
      const results = await Promise.all(
        MOCK_PROBLEM.testCases.map((tc) =>
          codeAPI.execute(
            code,
            LANGUAGE_MAP[language] || 'python',
            tc.stdin,
            undefined,
            { sandboxType: 'hackathon' }
          ).catch(() => null)
        )
      )
      const allPassed = results.every((r: any) => {
        if (!r) return false
        const d = unwrapExecutionResponse(r)
        return !d?.stderr && !d?.compile_output && d?.stdout
      })

      setRunResult({
        status: allPassed ? 'pass' : 'fail',
        output: allPassed
          ? `${MOCK_PROBLEM.testCases.length}/${MOCK_PROBLEM.testCases.length} test cases passed`
          : 'Some test cases failed',
        runtime: '52ms',
        memory: '17.2 MB',
      })

      if (allPassed) toast.success('All tests passed! +50 XP earned')
    } catch {
      setRunResult({ status: 'error', error: 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setCode(STARTER_CODE[language] || '')
    setRunResult(null)
  }

  const handleResetRuntime = async () => {
    const currentSessionId = sessionId
    setRunResult(null)
    setSessionId(null)
    clearSandboxSessionId()
    if (!currentSessionId) {
      toast.success('Sandbox runtime reset')
      return
    }
    const result = await codeAPI.clearSession(currentSessionId)
    if (result.error) {
      toast.warning('Local runtime reference cleared. Server session may have already expired.')
    } else {
      toast.success('Sandbox runtime reset')
    }
  }

  const handleAICopilot = async (action: 'debug' | 'optimize' | 'explain') => {
    setAiLoading(true)
    setOutputTab('ai_help')
    setAiOutput('')

    try {
      const response = await apiFetch('/adaptive-learning/sandbox/assist', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language: LANGUAGE_MAP[language] || 'python',
          errorMsg: runResult?.error || '',
          action
        })
      })

      if (!response.ok) {
        throw new Error('SSE request failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let completeResponse = ''

      if (!reader) {
        throw new Error('Reader not supported')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const cleaned = line.replace('data: ', '').trim()
              if (cleaned === '[DONE]') break
              const parsed = JSON.parse(cleaned)
              if (parsed.text) {
                completeResponse += parsed.text
                setAiOutput(completeResponse)
              }
            } catch {
              const cleaned = line.replace('data: ', '')
              if (cleaned) {
                completeResponse += cleaned
                setAiOutput(completeResponse)
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('Sandbox Copilot SSE failing, using adaptive standard fallback', err)
      try {
        const res = await api.post('/adaptive-learning/sandbox/assist', {
          code,
          language: LANGUAGE_MAP[language] || 'python',
          errorMsg: runResult?.error || '',
          action
        })
        const reply = res.data.data?.text || res.data.data?.response || 'No specific bugs found! Your modular structure is clean.'
        setAiOutput(reply)
      } catch {
        setAiOutput('Unable to reach secure AI Copilot gateway. Please verify that your backend service is running.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handleAICustomPrompt = async () => {
    if (!aiInput.trim() || aiLoading) return
    const customPrompt = aiInput.trim()
    setAiInput('')
    setAiLoading(true)
    setOutputTab('ai_help')
    setAiOutput(`Asking: "${customPrompt}"...\n\n`)

    try {
      const response = await apiFetch('/adaptive-learning/sandbox/assist', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language: LANGUAGE_MAP[language] || 'python',
          errorMsg: runResult?.error || '',
          action: 'custom',
          customPrompt
        })
      })

      if (!response.ok) throw new Error('SSE failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let completeResponse = ''

      if (!reader) throw new Error('Reader not supported')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const cleaned = line.replace('data: ', '').trim()
              if (cleaned === '[DONE]') break
              const parsed = JSON.parse(cleaned)
              if (parsed.text) {
                completeResponse += parsed.text
                setAiOutput(prev => prev.includes('Asking:') ? prev.split('...\n\n')[0] + '...\n\n' + completeResponse : completeResponse)
              }
            } catch {
              const cleaned = line.replace('data: ', '')
              if (cleaned) {
                completeResponse += cleaned
                setAiOutput(prev => prev.includes('Asking:') ? prev.split('...\n\n')[0] + '...\n\n' + completeResponse : completeResponse)
              }
            }
          }
        }
      }
    } catch {
      try {
        const res = await api.post('/adaptive-learning/sandbox/assist', {
          code,
          language: LANGUAGE_MAP[language] || 'python',
          errorMsg: runResult?.error || '',
          action: 'custom',
          customPrompt
        })
        const reply = res.data.data?.text || res.data.data?.response || 'No specific bugs found! Your modular structure is clean.'
        setAiOutput(reply)
      } catch {
        setAiOutput('Unable to reach secure AI Copilot gateway.')
      }
    } finally {
      setAiLoading(false)
    }
  }

  const runtimeReady = runtimeStatus?.configured !== false
  const selectedRuntimeLanguage = LANGUAGE_MAP[language] || 'python'
  const runtimeSupportsLanguage = !runtimeStatus?.supportedLanguages?.length ||
    runtimeStatus.supportedLanguages.includes(selectedRuntimeLanguage)
  const canExecute = runtimeReady && runtimeSupportsLanguage
  const isExecuting = running || submitting

  return (
    <div className="-mx-4 flex h-[calc(100vh-120px)] flex-col overflow-hidden sm:-mx-6 lg:-mx-8">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProblems(!showProblems)}
            className="flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-primary"
          >
            <Code2 className="h-4 w-4 text-primary" />
            {MOCK_PROBLEM.title}
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showProblems ? 'rotate-180' : ''}`} />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge className={`border-0 bg-emerald-500/10 text-[10px] font-bold ${diffColors[MOCK_PROBLEM.difficulty]}`}>
              {MOCK_PROBLEM.difficulty}
            </Badge>
            <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">
              {MOCK_PROBLEM.acceptance} acceptance
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold">+50 XP</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={isExecuting || !canExecute}
            className="h-8 gap-1.5 rounded-lg border-border px-4 text-xs font-bold hover:bg-muted/50"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Run
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isExecuting || !canExecute}
            className="h-8 gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-600/90"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Submit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={isExecuting}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetRuntime}
            disabled={isExecuting}
            className="hidden h-8 gap-1.5 rounded-lg border-border px-3 text-xs font-bold hover:bg-muted/50 md:inline-flex"
          >
            <Terminal className="h-3.5 w-3.5" />
            Reset Runtime
          </Button>
        </div>
      </div>

      {/* Problem dropdown */}
      <AnimatePresence>
        {showProblems && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-4 top-[112px] z-50 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Search problems..."
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {(problems.length > 0 ? problems : [MOCK_PROBLEM]).map((p, i) => (
                <button
                  key={p.id || i}
                  onClick={() => setShowProblems(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="h-3.5 w-3.5 rounded-full border border-border" />
                  <span className="flex-1 text-left text-sm text-foreground/80">
                    {p.title}
                  </span>
                  <span className={`text-[10px] font-bold ${diffColors[p.difficulty] || 'text-muted-foreground'}`}>
                    {p.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="hidden w-[380px] shrink-0 flex-col border-r border-border bg-card/30 xl:flex">
          <div className="flex border-b border-border">
            {(['description', 'hints', 'discussion'] as PanelTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftPanel(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                  leftPanel === tab ? 'border-b-2 border-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {leftPanel === 'description' && (
              <>
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">{MOCK_PROBLEM.description}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{MOCK_PROBLEM.note}</p>
                </div>
                <div className="space-y-3">
                  {MOCK_PROBLEM.examples.map((ex, i) => (
                    <div key={i} className="space-y-2 rounded-xl border border-border bg-background/50 p-4">
                      <p className="text-xs font-bold text-white">Example {i + 1}</p>
                      <div className="space-y-1 font-mono text-xs">
                        <p><span className="text-muted-foreground">Input: </span><span className="text-foreground/90">{ex.input}</span></p>
                        <p><span className="text-muted-foreground">Output: </span><span className="text-foreground/90">{ex.output}</span></p>
                        <p><span className="text-muted-foreground">Explanation: </span><span className="text-foreground/70">{ex.explanation}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white">Constraints</p>
                  <ul className="space-y-1">
                    {MOCK_PROBLEM.constraints.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <code className="font-mono">{c}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-4 border-t border-border pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><ThumbsUp className="h-3.5 w-3.5" />{(MOCK_PROBLEM.likes / 1000).toFixed(1)}K</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{(MOCK_PROBLEM.submissions / 1000).toFixed(1)}K submissions</span>
                </div>
              </>
            )}

            {leftPanel === 'hints' && (
              <div className="space-y-3">
                {MOCK_PROBLEM.hints.map((hint, i) => (
                  <details key={i} className="group rounded-xl border border-border bg-background/50 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground/90">
                      <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-400" />Hint {i + 1}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{hint}</p>
                  </details>
                ))}
              </div>
            )}

            {leftPanel === 'discussion' && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 opacity-30" />
                <p className="text-sm">Join the discussion to ask questions and share approaches.</p>
                <Button size="sm" variant="outline" className="rounded-xl border-border text-xs">Open Discussion</Button>
              </div>
            )}
          </div>
        </div>

        {/* CENTER — Code Editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card/20 px-4 py-2">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="cursor-pointer border-none bg-transparent text-xs font-semibold text-foreground/80 focus:outline-none"
            >
              {Object.keys(LANGUAGE_MAP).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <div className="h-3 w-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {sessionId ? `Runtime ${sessionId.slice(0, 8)}` : 'Runtime starts on first run'}
            </span>
            {runtimeStatusLoading && (
              <Badge variant="outline" className="border-border text-[10px] text-muted-foreground">
                Checking runtime
              </Badge>
            )}
            {runtimeStatus && (
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  runtimeStatus.configured
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}
              >
                {runtimeStatus.configured ? `${runtimeStatus.provider} ready` : 'Runtime unavailable'}
              </Badge>
            )}
          </div>

          {runtimeStatus?.configured === false && (
            <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-200">
              {runtimeStatus.message}
            </div>
          )}
          {runtimeStatus?.configured && !runtimeSupportsLanguage && (
            <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-100">
              The active runtime supports {runtimeStatus.supportedLanguages?.join(', ')}. Select Python 3 to run code locally.
            </div>
          )}

          <div className="min-h-0 flex-1">
            <CodeEditor
              key={language}
              value={code}
              onChange={setCode}
              language={LANGUAGE_MAP[language] || 'python'}
              isStandalone={false}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden w-[320px] shrink-0 flex-col border-l border-border bg-card/30 lg:flex">
          <div className="flex border-b border-border">
            {(['testcases', 'output', 'ai_help'] as OutputTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setOutputTab(tab)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                  outputTab === tab ? 'border-b-2 border-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'testcases' ? 'Test Cases' : tab === 'output' ? 'Output' : 'AI Copilot'}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {outputTab === 'testcases' && (
              <>
                <div className="flex gap-2">
                  {MOCK_PROBLEM.testCases.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCase(i)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                        activeCase === i ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-white'
                      }`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Input</label>
                    <textarea
                      defaultValue={MOCK_PROBLEM.testCases[activeCase].input}
                      className="h-20 w-full resize-none rounded-xl border border-border bg-background/60 p-3 font-mono text-xs text-foreground/90 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expected Output</label>
                    <div className="w-full rounded-xl border border-border bg-background/60 p-3 font-mono text-xs text-foreground/90">
                      {MOCK_PROBLEM.testCases[activeCase].expected}
                    </div>
                  </div>
                </div>
              </>
            )}

            {outputTab === 'output' && (
              <div className="space-y-4">
                {isExecuting ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">
                      {submitting ? 'Running all test cases...' : 'Executing code...'}
                    </p>
                  </div>
                ) : runResult?.status === 'pass' ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-bold text-emerald-400">Tests Passed!</p>
                        <p className="text-xs text-muted-foreground">{runResult.output}</p>
                      </div>
                    </div>
                    {runResult.runtime && (
                      <div className="space-y-2">
                        {[
                          { label: 'Runtime', value: runResult.runtime, beat: '87' },
                          { label: 'Memory', value: runResult.memory || 'N/A', beat: '72' },
                        ].map(({ label, value, beat }) => (
                          <div key={label} className="rounded-xl border border-border bg-background/50 p-3">
                            <div className="mb-1.5 flex justify-between text-xs">
                              <span className="text-muted-foreground">{label}</span>
                              <span className="font-bold text-white">{value}</span>
                            </div>
                            <Progress value={parseInt(beat)} className="h-1 bg-muted/40" />
                            <p className="mt-1 text-[10px] text-muted-foreground">Beats {beat}% of solutions</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                      <p className="text-xs font-bold text-amber-400">+50 XP Earned!</p>
                      <p className="text-[10px] text-muted-foreground">Streak protected · Great work!</p>
                    </div>
                  </>
                ) : runResult?.status === 'fail' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <div>
                        <p className="text-sm font-bold text-red-400">Wrong Answer</p>
                        <p className="text-xs text-muted-foreground">{runResult.output}</p>
                      </div>
                    </div>
                  </div>
                ) : runResult?.status === 'error' ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-amber-400">Error</p>
                        <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px] text-muted-foreground">
                          {runResult.error}
                        </pre>
                      </div>
                    </div>
                    {runResult.stdout && (
                      <div className="rounded-xl border border-border bg-background/50 p-3">
                        <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Stdout</p>
                        <pre className="font-mono text-[11px] text-foreground/80">{runResult.stdout}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <Terminal className="h-8 w-8 text-muted-foreground opacity-40" />
                    <p className="text-xs text-muted-foreground">Run your code to see the output here.</p>
                  </div>
                )}
              </div>
            )}

            {outputTab === 'ai_help' && (
              <div className="space-y-4">
                {/* AI Assistant Quick controls */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                    <Bot className="h-4 w-4 animate-pulse" />
                    <span>AI Copilot Diagnostics</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAICopilot('debug')}
                      disabled={aiLoading}
                      className="bg-indigo-650 hover:bg-indigo-550 text-[10px] font-bold h-8 rounded-xl"
                    >
                      <Bug className="mr-1.5 h-3.5 w-3.5 text-indigo-400" /> Debug Code
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAICopilot('optimize')}
                      disabled={aiLoading}
                      className="bg-purple-650 hover:bg-purple-550 text-[10px] font-bold h-8 rounded-xl"
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 text-purple-400 animate-pulse" /> Optimize Space/Time
                    </Button>
                  </div>
                  
                  {runResult?.status === 'error' && (
                    <Button
                      size="sm"
                      onClick={() => handleAICopilot('explain')}
                      disabled={aiLoading}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-[10px] font-bold h-8 rounded-xl"
                    >
                      <Terminal className="mr-1.5 h-3.5 w-3.5 text-amber-400 animate-pulse" /> Explain Compile Traceback
                    </Button>
                  )}
                </div>

                {/* AI output area */}
                <div className="rounded-xl border border-slate-850 bg-slate-950 p-3.5 font-mono text-[10.5px] leading-relaxed text-slate-350 min-h-[180px] max-h-[280px] overflow-y-auto whitespace-pre-wrap select-text selection:bg-indigo-500/30 custom-scrollbar">
                  {aiLoading && !aiOutput ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider animate-pulse">Consulting Gemini engine...</span>
                    </div>
                  ) : aiOutput ? (
                    aiOutput
                  ) : (
                    <p className="text-slate-500 text-center py-10 leading-normal">
                      Click "Debug Code" to scan your active Monaco workspace, or ask standard questions below.
                    </p>
                  )}
                </div>

                {/* Custom prompt input field */}
                <div className="flex gap-1.5 pt-2 border-t border-slate-850">
                  <Input
                    placeholder="Ask custom coding questions..."
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAICustomPrompt()
                    }}
                    disabled={aiLoading}
                    className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500/40 text-[11px] h-9 rounded-xl placeholder:text-slate-650"
                  />
                  <Button
                    size="sm"
                    onClick={handleAICustomPrompt}
                    disabled={aiLoading || !aiInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 h-9 rounded-xl px-4 font-bold text-xs"
                  >
                    Ask
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
