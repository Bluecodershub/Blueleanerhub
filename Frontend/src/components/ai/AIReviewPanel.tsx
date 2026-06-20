'use client'

import { useState } from 'react'
import { Bot, Sparkles, Loader2, CheckCircle2, AlertTriangle, Lightbulb, ListChecks, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

type SubmissionType = 'code' | 'assignment' | 'project' | 'capstone' | 'hackathon'

interface Scores {
  overall?: number | null
  code_quality?: number | null
  logic?: number | null
  documentation?: number | null
  creativity?: number | null
  completion?: number | null
}

interface ReviewResult {
  scores: Scores
  strengths: string[]
  weaknesses: string[]
  mistakes: string[]
  suggestions: string[]
  improvement_roadmap: string[]
  summary: string
  structured: boolean
  disclaimer: string
}

const SCORE_LABELS: Record<keyof Scores, string> = {
  overall: 'Overall',
  code_quality: 'Code Quality',
  logic: 'Logic',
  documentation: 'Docs',
  creativity: 'Creativity',
  completion: 'Completion',
}

function scoreColor(v: number) {
  if (v >= 75) return 'text-emerald-400'
  if (v >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function FeedbackList({ icon: Icon, title, items, tone }: { icon: typeof CheckCircle2; title: string; items: string[]; tone: string }) {
  if (!items?.length) return null
  return (
    <div>
      <p className={`mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${tone}`}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Reusable structured-AI-review panel. Calls POST /ai/review/submission and
 * renders scores + feedback + the AI disclaimer. Honest states: loading,
 * "not configured" (503), error, and a fallback for unstructured model output.
 */
export default function AIReviewPanel({
  content,
  language,
  submissionType = 'code',
  context,
}: {
  content: string
  language?: string
  submissionType?: SubmissionType
  context?: string
}) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!content.trim() || loading) return
    setLoading(true)
    setError(null)
    setUnavailable(false)
    setResult(null)
    try {
      const res = await api.post('/ai/review/submission', { submissionType, content, language, context })
      setResult(res.data?.data as ReviewResult)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 503 || err?.response?.data?.error === 'AI_REVIEW_UNAVAILABLE') {
        setUnavailable(true)
      } else if (status === 401) {
        setError('Please log in to use AI review.')
      } else {
        setError('AI review is temporarily unavailable. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const scores = result?.scores ?? {}
  const scoreEntries = (Object.keys(SCORE_LABELS) as (keyof Scores)[])
    .map((k) => [k, scores[k]] as const)
    .filter(([, v]) => typeof v === 'number') as [keyof Scores, number][]

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 to-transparent p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-sky-400" />
          <h3 className="font-semibold text-foreground">AI Review</h3>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Assistive
          </span>
        </div>
        <Button onClick={run} disabled={loading || !content.trim()} size="sm" className="gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? 'Reviewing…' : result || unavailable || error ? 'Re-run review' : 'Get AI Review'}
        </Button>
      </div>

      {!result && !loading && !unavailable && !error && (
        <p className="mt-3 text-sm text-muted-foreground">
          Get instant, learning-focused feedback on your {submissionType}. A mentor can still review and override it.
        </p>
      )}

      {unavailable && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          AI review isn’t configured yet — your submission will still be reviewed by a mentor.
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-5">
          {/* Scores */}
          {scoreEntries.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {scoreEntries.map(([key, val]) => (
                <div key={key} className="rounded-xl border border-border bg-card/60 px-2 py-3 text-center">
                  <p className={`text-xl font-bold ${scoreColor(val)}`}>{val}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{SCORE_LABELS[key]}</p>
                </div>
              ))}
            </div>
          )}

          {result.summary && <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>}

          <div className="grid gap-5 sm:grid-cols-2">
            <FeedbackList icon={CheckCircle2} title="Strengths" items={result.strengths} tone="text-emerald-400" />
            <FeedbackList icon={AlertTriangle} title="Weaknesses" items={result.weaknesses} tone="text-amber-400" />
            <FeedbackList icon={AlertTriangle} title="Mistakes" items={result.mistakes} tone="text-red-400" />
            <FeedbackList icon={Lightbulb} title="Suggestions" items={result.suggestions} tone="text-sky-400" />
          </div>

          {result.improvement_roadmap?.length > 0 && (
            <div className="rounded-xl border border-border bg-card/40 p-4">
              <FeedbackList icon={ListChecks} title="Improvement roadmap" items={result.improvement_roadmap} tone="text-primary" />
            </div>
          )}

          {/* Mandatory disclaimer */}
          <div className="flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{result.disclaimer}</span>
          </div>
        </div>
      )}
    </div>
  )
}
