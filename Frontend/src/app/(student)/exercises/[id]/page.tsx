'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Zap,
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { exercisesAPI, codeAPI, gamificationAPI } from '@/lib/api-civilization'
import AIReviewPanel from '@/components/ai/AIReviewPanel'
import { toast } from 'sonner'
import { CodeExecutionResponse } from '@/types'
import dynamic from 'next/dynamic'

const CodePlayground = dynamic(() => import('@/components/tutorial/CodePlayground'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-secondary" />,
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number
  text: string
  options: string[]
  correctIndex: number
  explanation?: string
}

interface CodeChallenge {
  description: string
  starterCode: string
  language: string
  expectedOutput?: string
}

interface Exercise {
  id: string
  title: string
  domain: string
  subDomain: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  points: number
  questions: Question[]
  codeChallenge?: CodeChallenge
}

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFF_COLOUR: Record<string, string> = {
  Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const XP_PER_CORRECT: Record<string, number> = { Easy: 10, Medium: 20, Hard: 30 }

// ─── Fallback exercise (when API unavailable) ─────────────────────────────────

const FALLBACK: Exercise = {
  id: 'demo',
  title: 'Sample Challenge',
  domain: 'Computer Science',
  subDomain: 'Algorithms',
  difficulty: 'Medium',
  points: 60,
  questions: [
    {
      id: 1,
      text: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
      explanation:
        'Binary search halves the search space each iteration, giving O(log n) time complexity.',
    },
    {
      id: 2,
      text: 'Which data structure uses LIFO ordering?',
      options: ['Queue', 'Stack', 'Heap', 'Tree'],
      correctIndex: 1,
      explanation:
        'A stack follows Last-In-First-Out (LIFO) — the last element pushed is the first popped.',
    },
    {
      id: 3,
      text: 'What does a hash table offer for average-case lookup?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      correctIndex: 2,
      explanation:
        'Hash tables provide O(1) average-case time for insertions, deletions, and lookups.',
    },
  ],
}

// ─── Component ────────────────────────────────────────────────────────────────

type State = 'loading' | 'intro' | 'in-progress' | 'completed'

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [pageState, setPageState] = useState<State>('loading')
  const [tab, setTab] = useState<'mcq' | 'code'>('mcq')
  const [current, setCurrent] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [xpEarned, setXpEarned] = useState(0)
  const [lastCode, setLastCode] = useState('')
  const [lastLang, setLastLang] = useState('')

  useEffect(() => {
    exercisesAPI
      .get(id)
      .then((d: any) => {
        const data = d?.data ?? d
        if (data?.id) {
          setExercise(data)
        } else {
          setExercise(FALLBACK)
        }
      })
      .catch(() => setExercise(FALLBACK))
      .finally(() => setPageState('intro'))
  }, [id])

  if (pageState === 'loading' || !exercise) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const questions = exercise.questions ?? []
  const total = questions.length
  const q = questions[current]
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctIndex).length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

  const handleRunCode = async (code: string, language: string) => {
    setLastCode(code)
    setLastLang(language)
    try {
      const d = await codeAPI.execute(code, language) as CodeExecutionResponse
      const result = d?.data ?? d
      if (result?.success) {
        setXpEarned((x) => x + 10)
        toast.success('+10 XP for running code!')
      }
      return {
        stdout: result?.stdout ?? '',
        stderr: result?.stderr ?? result?.compile_output ?? '',
        success: !!result?.success,
      }
    } catch {
      return { stdout: '', stderr: 'Execution service unavailable', success: false }
    }
  }

  const handleChoose = (idx: number) => {
    if (revealed) return
    setChosen(idx)
    setRevealed(true)
    if (idx === q.correctIndex) {
      setXpEarned((x) => x + (XP_PER_CORRECT[exercise.difficulty] ?? 20))
    }
  }

  const handleNext = () => {
    const updatedAnswers = [...answers, chosen]
    setAnswers(updatedAnswers)
    if (current + 1 >= total) {
      // Persist XP to backend
      gamificationAPI.achievements().catch(() => {})
      toast.success(`Challenge complete! +${xpEarned} XP earned`)
      setPageState('completed')
    } else {
      setCurrent(current + 1)
      setChosen(null)
      setRevealed(false)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setChosen(null)
    setRevealed(false)
    setAnswers([])
    setXpEarned(0)
    setPageState('in-progress')
  }

  // ── Intro screen ──────────────────────────────────────────────────────────

  if (pageState === 'intro') {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-12">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Challenges
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2.5rem] border border-border bg-card"
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary" />
          <div className="space-y-6 p-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {exercise.domain} · {exercise.subDomain}
                </p>
                <h1 className="text-3xl font-black italic tracking-tight">{exercise.title}</h1>
              </div>
              <Badge
                className={`shrink-0 border px-3 py-1 text-xs font-black ${DIFF_COLOUR[exercise.difficulty]}`}
              >
                {exercise.difficulty}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border bg-background/50 p-6">
              <div className="text-center">
                <p className="text-2xl font-black text-primary">{total}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Questions
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-xp-gold">{exercise.points}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Points
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-achievement-cyan">
                  {total * (XP_PER_CORRECT[exercise.difficulty] ?? 20)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Max XP
                </p>
              </div>
            </div>

            {/* Tab selector */}
            {exercise.codeChallenge && (
              <div className="flex gap-2 rounded-xl border border-border bg-background/50 p-1">
                <button
                  onClick={() => setTab('mcq')}
                  className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-widest transition-all ${tab === 'mcq' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Quiz ({total}Q)
                </button>
                <button
                  onClick={() => setTab('code')}
                  className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Code Challenge
                </button>
              </div>
            )}

            <Button
              onClick={() => setPageState('in-progress')}
              className="h-14 w-full rounded-2xl bg-primary text-base font-black italic tracking-tighter shadow-xl shadow-primary/20 hover:bg-primary/90"
            >
              START_CHALLENGE <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Completed screen ──────────────────────────────────────────────────────

  if (pageState === 'completed') {
    return (
      <div className="mx-auto max-w-2xl space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-[2.5rem] border border-border bg-card text-center"
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary" />
          <div className="space-y-8 p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/20">
              <Trophy className="h-10 w-10 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tight">CHALLENGE_COMPLETE</h2>
              <p className="text-muted-foreground">{exercise.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border bg-background/50 p-6">
              <div className="text-center">
                <p className="text-3xl font-black text-primary">{score}%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Score
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-xp-gold">+{xpEarned}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  XP Earned
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-reward-green">
                  {correctCount}/{total}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Correct
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleRestart}
                variant="outline"
                className="h-12 flex-1 rounded-xl font-black italic"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> RETRY
              </Button>
              <Link href="/exercises" className="flex-1">
                <Button className="h-12 w-full rounded-xl bg-primary font-black italic shadow-lg shadow-primary/15 hover:bg-primary/90">
                  MORE_CHALLENGES
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── In-progress screen ────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      {/* Tab switcher (only when code challenge exists) */}
      {exercise?.codeChallenge && (
        <div className="flex gap-2 rounded-xl border border-border bg-card p-1">
          <button
            onClick={() => setTab('mcq')}
            className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-widest transition-all ${tab === 'mcq' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Quiz ({total}Q)
          </button>
          <button
            onClick={() => setTab('code')}
            className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Code
          </button>
        </div>
      )}

      {/* Code execution tab */}
      {tab === 'code' && exercise?.codeChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2.5rem] border border-border bg-card"
        >
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary" />
          <div className="space-y-4 p-6">
            <p className="text-sm font-semibold leading-relaxed text-muted-foreground">
              {exercise.codeChallenge.description}
            </p>
            <CodePlayground
              starterCode={exercise.codeChallenge.starterCode}
              language={exercise.codeChallenge.language}
              onRun={handleRunCode}
              height="320px"
            />
            <AIReviewPanel
              content={lastCode}
              language={lastLang || exercise.codeChallenge.language}
              submissionType="code"
              context={exercise.codeChallenge.description}
            />
          </div>
        </motion.div>
      )}

      {/* MCQ tab */}
      {tab === 'mcq' && (
        <>
          {/* Progress bar */}
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span>
                Question {current + 1} of {total}
              </span>
              <span className="flex items-center gap-1 text-xp-gold">
                <Zap className="h-3.5 w-3.5" /> {xpEarned} XP
              </span>
            </div>
            <Progress value={(current / total) * 100} className="h-1.5" />
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="overflow-hidden rounded-[2.5rem] border border-border bg-card"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary" />
              <div className="space-y-6 p-8">
                <p className="text-xl font-bold leading-snug">{q?.text}</p>

                <div className="space-y-3">
                  {q?.options?.map((opt, idx) => {
                    const isCorrect = idx === q.correctIndex
                    const isChosen = idx === chosen
                    let cls =
                      'border border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5'
                    if (revealed && isCorrect) cls = 'border border-green-500/50 bg-green-500/10'
                    else if (revealed && isChosen && !isCorrect)
                      cls = 'border border-red-500/50 bg-red-500/10'

                    return (
                      <button
                        key={idx}
                        onClick={() => handleChoose(idx)}
                        disabled={revealed}
                        className={`flex w-full items-center justify-between rounded-2xl p-4 text-left text-sm font-semibold transition-all ${cls}`}
                      >
                        <span>{opt}</span>
                        {revealed && isCorrect && (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                        )}
                        {revealed && isChosen && !isCorrect && (
                          <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {revealed && q?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground"
                  >
                    <span className="font-black text-foreground/80">Explanation: </span>
                    {q.explanation}
                  </motion.div>
                )}

                {revealed && (
                  <Button
                    onClick={handleNext}
                    className="h-12 w-full rounded-xl bg-primary font-black italic shadow-lg shadow-primary/15 hover:bg-primary/90"
                  >
                    {current + 1 >= total ? 'FINISH' : 'NEXT_QUESTION'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
