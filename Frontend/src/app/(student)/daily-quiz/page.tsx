'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { dailyQuizAPI } from '@/lib/api-civilization'
import type { PublicQuiz, DailyQuizResult, MCQPublic } from '@/types'
import { toast } from 'sonner'

// ─── Constants ───────────────────────────────────────────────────────────────

const DOMAINS_FALLBACK = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'Node.js',
  'PostgreSQL', 'Docker', 'System Design',
]

const DIFFICULTY_COLORS: Record<MCQPublic['difficulty'], string> = {
  easy:   'bg-muted text-foreground/70',
  medium: 'bg-sky-900/50 text-sky-400',
  hard:   'bg-purple-900/50 text-purple-400',
}

type QuizState = 'domain-select' | 'in-progress' | 'submitting' | 'completed' | 'already-done'

const TODAY = new Date().toISOString().slice(0, 10)

// ─── Component ───────────────────────────────────────────────────────────────

export default function DailyQuizPage() {
  const router = useRouter()

  const [state,          setState]         = useState<QuizState>('domain-select')
  const [selectedDomain, setDomain]        = useState('TypeScript')
  const [domains,        setDomains]       = useState<string[]>(DOMAINS_FALLBACK)
  const [quiz,           setQuiz]          = useState<PublicQuiz | null>(null)
  const [loadingQuiz,    setLoading]       = useState(false)

  // Per-question state (no correctIndex — purely UI)
  const [current, setCurrent] = useState(0)
  const [chosen,  setChosen]  = useState<number | null>(null)
  // answers[i] = option index chosen for question i
  const [answers, setAnswers] = useState<number[]>([])

  // Result returned by the server after submission
  const [result, setResult] = useState<DailyQuizResult | null>(null)

  // ── Domain list ────────────────────────────────────────────────────────────

  useEffect(() => {
    dailyQuizAPI.domains()
      .then((response) => {
        if (!response.error && response.data?.length) {
          setDomains(response.data)
        }
      })
      .catch(() => { /* keep fallback */ })
  }, [])

  // ── Load quiz (questions only — no correctIndex) ───────────────────────────

  const loadQuiz = async (domain: string) => {
    setLoading(true)
    try {
      const response = await dailyQuizAPI.getQuiz(domain)
      if (response.error) {
        toast.error(response.error)
        setLoading(false)
        return
      }
      const data = response.data
      if (data?.questions?.length) {
        setQuiz(data)
        if (data.alreadySubmitted) {
          setState('already-done')
        }
      } else {
        toast.error('Quiz unavailable for this domain. Try another.')
      }
    } catch {
      toast.error('Failed to load quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    setAnswers([])
    setChosen(null)
    setCurrent(0)
    setResult(null)
    await loadQuiz(selectedDomain)
    setState('in-progress')
  }

  // ── Answer selection (no scoring here — purely UI state) ──────────────────

  const handleChoose = (idx: number) => {
    if (chosen !== null) return   // already answered this question
    setChosen(idx)
  }

  // ── Advance to next question or submit on last ─────────────────────────────

  const handleNext = async () => {
    if (chosen === null || !quiz) return

    const updatedAnswers = [...answers, chosen]
    setAnswers(updatedAnswers)

    if (current + 1 >= quiz.questions.length) {
      setState('submitting')
      try {
        const response = await dailyQuizAPI.submitAnswers(selectedDomain, updatedAnswers)
        if (response.error) {
          if (response.message?.includes('already') || response.message?.includes('409')) {
            setState('already-done')
            toast.info('You already completed this quiz today.')
          } else {
            toast.error(response.error || 'Failed to submit quiz. Please try again.')
            setState('in-progress')
            setAnswers(updatedAnswers)
            setCurrent(quiz.questions.length - 1)
            setChosen(chosen)
          }
          return
        }
        setResult(response.data ?? null)
        setState('completed')
      } catch {
        toast.error('Failed to submit quiz. Please try again.')
        setState('in-progress')
        setAnswers(updatedAnswers)
        setCurrent(quiz.questions.length - 1)
        setChosen(chosen)
      }
    } else {
      setCurrent(current + 1)
      setChosen(null)
    }
  }

  const resetToSelect = () => {
    setState('domain-select')
    setAnswers([])
    setQuiz(null)
    setResult(null)
    setCurrent(0)
    setChosen(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const q     = quiz?.questions[current]
  const total = quiz?.questions.length ?? 0

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-b from-card to-background px-6 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-4 py-1.5">
            <Zap className="h-4 w-4 text-foreground/70" />
            <span className="text-sm font-medium text-foreground/70">
              Daily Challenge · {TODAY}
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Daily Quiz</h1>
          <p className="text-sm text-muted-foreground">
            5 questions · AI-generated · New every day · Earn XP
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8">

        {/* ── Already submitted ── */}
        {state === 'already-done' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-8 w-8 text-foreground/60" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Already completed!</h2>
            <p className="mb-2 text-sm text-muted-foreground">
              You&apos;ve already taken the <span className="font-semibold text-foreground">{selectedDomain}</span> quiz today.
            </p>
            {quiz?.previousResult && (
              <p className="mb-6 text-sm text-muted-foreground">
                Your score: <span className="font-semibold text-foreground">{quiz.previousResult.score}%</span>
                {' · '}XP earned: <span className="font-semibold text-foreground/70">+{quiz.previousResult.xp_earned}</span>
              </p>
            )}
            <p className="mb-8 text-xs text-muted-foreground">Come back tomorrow for a new quiz!</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" className="gap-2" onClick={resetToSelect}>
                <RotateCcw className="h-4 w-4" /> Try another domain
              </Button>
              <Button onClick={() => router.push('/student/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Domain Select ── */}
        {state === 'domain-select' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="mb-4 text-lg font-semibold">Choose a domain</h2>
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    selectedDomain === d
                      ? 'border-primary bg-muted/20 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-border-accent hover:text-foreground'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <Button
              onClick={startQuiz}
              disabled={loadingQuiz}
              className="h-12 w-full text-base font-semibold"
            >
              {loadingQuiz ? 'Loading…' : `Start ${selectedDomain} Quiz`}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* ── In Progress ── */}
        {(state === 'in-progress' || state === 'submitting') && q && (
          <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Progress bar */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Question {current + 1} of {total}
              </span>
              <span className="text-sm text-muted-foreground">
                {answers.length} answered
              </span>
            </div>
            <Progress value={(current / total) * 100} className="mb-6 h-1.5" />

            <Card className="mb-4 border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold leading-relaxed text-foreground">
                    {q.question}
                  </h2>
                  <Badge className={`shrink-0 text-xs ${DIFFICULTY_COLORS[q.difficulty]}`}>
                    {q.difficulty}
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {q.options.map((opt, idx) => {
                    let style = 'border-border bg-secondary text-foreground hover:border-border-accent'
                    if (chosen !== null) {
                      if (idx === chosen) style = 'border-primary bg-primary/10 text-foreground'
                      else style = 'border-border bg-secondary/50 text-muted-foreground cursor-default'
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleChoose(idx)}
                        disabled={chosen !== null || state === 'submitting'}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${style}`}
                      >
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Hint when answered */}
            <AnimatePresence>
              {chosen !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="mb-5 border-border bg-card">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Answer locked in. Results will be revealed after you complete the quiz.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleNext}
              disabled={chosen === null || state === 'submitting'}
              className="w-full font-semibold"
            >
              {state === 'submitting'
                ? 'Submitting…'
                : current + 1 >= total
                  ? 'Submit & See Results'
                  : 'Next Question'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* ── Completed — results from server ── */}
        {state === 'completed' && result && quiz && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-cat-indigo shadow-lg shadow-primary/30">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-1 text-2xl font-bold">Quiz Complete!</h2>
              <p className="text-sm text-muted-foreground">
                {result.correctCount}/{result.totalQuestions} correct on today&apos;s {selectedDomain} quiz
              </p>
            </div>

            {/* Score card */}
            <Card className="mb-5 border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-5 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{result.score}%</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{result.correctCount}</p>
                    <p className="text-xs text-muted-foreground">Correct</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">+{result.xpEarned}</p>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                </div>

                <Progress value={result.score} className="mb-4 h-2" />

                {/* Per-question review */}
                <div className="space-y-4">
                  {quiz.questions.map((question, i) => {
                    const given = answers[i] ?? -1
                    const correct = result.correctAnswers[i]
                    const isRight = given === correct

                    return (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="mb-2 flex items-start gap-2">
                          {isRight
                            ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                          }
                          <span className="text-sm leading-relaxed text-foreground">
                            {question.question}
                          </span>
                        </div>

                        {/* Show correct answer if wrong */}
                        {!isRight && (
                          <p className="ml-6 text-xs text-emerald-500">
                            Correct: {question.options[correct]}
                          </p>
                        )}

                        {/* Explanation */}
                        {result.explanations[i] && (
                          <p className="ml-6 mt-1 text-xs leading-relaxed text-muted-foreground">
                            {result.explanations[i]}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={resetToSelect}
                variant="outline"
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Try Another Domain
              </Button>
              <Button
                className="flex-1 font-semibold"
                onClick={() => router.push('/student/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
