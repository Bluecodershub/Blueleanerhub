'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Timer,
  Brain,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Target,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import api from '@/lib/api'

type Step = 'intro' | 'quiz' | 'review' | 'result'

type QuizQuestion = {
  id: string
  type: string
  content: string
  options: string[]
  correctAnswer: string
  explanation: string
  difficulty: string
  topic: string
  xp: number
}

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const LETTER_OPTIONS = ['A', 'B', 'C', 'D']

export default function QuizPage() {
  const [step, setStep] = useState<Step>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quizId, setQuizId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const q = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const score = answers.filter((a, i) => a === questions[i]?.correctAnswer).length
  const totalXP = answers.reduce(
    (acc, a, i) => (a === questions[i]?.correctAnswer ? acc + (questions[i]?.xp ?? 0) : acc),
    0
  )

  useEffect(() => {
    api.get('/quiz', { params: { limit: 1 } })
      .then((res) => {
        const list = res.data?.data?.data ?? []
        const quiz = Array.isArray(list) ? list[0] : null
        if (!quiz) {
          setQuestions([])
          return
        }

        const loadedQuestions = (quiz.questions ?? []).map((item: any, index: number) => ({
          id: item.id ?? String(index + 1),
          type: 'Multiple Choice',
          content: item.question,
          options: item.options ?? [],
          correctAnswer: item.options?.[item.correctIndex] ?? '',
          explanation: item.explanation ?? 'Review this concept in your lessons and try again.',
          difficulty: quiz.difficulty === 'EASY' ? 'Easy' : quiz.difficulty === 'HARD' ? 'Hard' : 'Medium',
          topic: quiz.category ?? quiz.title ?? 'General',
          xp: quiz.difficulty === 'HARD' ? 30 : quiz.difficulty === 'MEDIUM' ? 20 : 15,
        }))

        setQuizId(String(quiz._id))
        setQuestions(loadedQuestions)
        setAnswers(Array(loadedQuestions.length).fill(null))
        setTimeLeft(quiz.timeLimit ?? 120)
      })
      .catch((err) => {
        setLoadError(err.response?.data?.message || err.message || 'Failed to load quiz')
        setQuestions([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (step !== 'result' || !quizId || submitted) return
    const payload = questions.reduce<Record<string, number>>((acc, question, index) => {
      const answer = answers[index]
      acc[question.id] = answer ? question.options.indexOf(answer) : -1
      return acc
    }, {})

    setSubmitted(true)
    api.post(`/quiz/${quizId}/submit`, { answers: payload }).catch(() => {})
  }, [answers, questions, quizId, step, submitted])

  useEffect(() => {
    if (step !== 'quiz') return
    if (timeLeft <= 0) {
      setStep('result')
      return
    }
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(t)
  }, [step, timeLeft])

  const handleSelect = (option: string) => {
    if (showFeedback) return
    setSelectedAnswer(option)
  }

  const handleConfirm = useCallback(() => {
    if (!selectedAnswer) return
    const newAnswers = [...answers]
    newAnswers[currentIndex] = selectedAnswer
    setAnswers(newAnswers)
    setShowFeedback(true)
  }, [selectedAnswer, answers, currentIndex])

  const handleNext = useCallback(() => {
    setShowFeedback(false)
    setSelectedAnswer(null)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setStep('result')
    }
  }, [currentIndex, questions.length])

  const isCorrect = selectedAnswer === q?.correctAnswer

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <Brain className="mb-5 h-14 w-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold">No quiz available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {loadError || 'A mentor or admin needs to publish a quiz before this practice flow can start.'}
        </p>
        <Button asChild className="mt-6">
          <Link href="/student/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  // ── INTRO ──
  if (step === 'intro') {
    return (
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md space-y-8 text-center"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
            <Brain className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-black tracking-tight text-foreground">
              Practice Quiz
            </h1>
            <p className="text-muted-foreground">
              {questions.length} questions · AI-curated for your skill level · Earn XP for
              correct answers
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Target, label: 'Questions', value: `${questions.length} MCQs` },
              { icon: Timer, label: 'Time Limit', value: '2 Minutes' },
              { icon: Zap, label: 'XP Reward', value: '+100 XP max' },
              { icon: BookOpen, label: 'Topics', value: 'DSA · Python' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="space-y-2 rounded-2xl border border-border bg-card p-4">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setStep('quiz')}
            className="h-13 w-full gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-5 w-5" />
            Start Quiz
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── QUIZ ──
  if (step === 'quiz') {
    return (
      <div className="relative mx-auto max-w-3xl space-y-6 pb-20">
        {/* Ambient */}
        <div className="bg-sky-500/8 pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-primary/8 pointer-events-none absolute -right-16 top-40 h-56 w-56 rounded-full blur-3xl" />

        {/* Progress bar header */}
        <div className="sticky top-0 z-10 space-y-3 bg-background/80 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-border font-mono text-xs text-foreground/80">
              {currentIndex + 1} / {questions.length}
            </Badge>

            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold ${
                timeLeft < 30
                  ? 'animate-pulse border-red-500/20 bg-red-500/10 text-red-400'
                  : 'border-border text-foreground/70'
              }`}
            >
              <Timer className="h-4 w-4" />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>

            <Badge className={`border text-[10px] ${difficultyColors[q.difficulty]}`}>
              {q.difficulty}
            </Badge>
          </div>

          <Progress value={progress} className="h-1.5 bg-muted/40" />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Topic + question */}
            <div className="relative space-y-4 overflow-hidden rounded-2xl bg-card p-6 sm:p-8">
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-primary" />
              <div className="from-primary/8 pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent" />
              <div className="flex items-center gap-2">
                <Badge className="border-sky-500/20 bg-sky-500/10 text-[10px] font-bold uppercase text-sky-400">
                  {q.topic}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-border text-[10px] text-muted-foreground"
                >
                  {q.type}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {q.content}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const letter = LETTER_OPTIONS[idx]
                const isSelected = selectedAnswer === option
                const isAnswerCorrect = option === q.correctAnswer

                let variant = 'default'
                if (showFeedback) {
                  if (isAnswerCorrect) variant = 'correct'
                  else if (isSelected && !isAnswerCorrect) variant = 'wrong'
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleSelect(option)}
                    whileHover={!showFeedback ? { scale: 1.01 } : {}}
                    whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    aria-pressed={isSelected}
                    className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-5 ${
                      variant === 'correct'
                        ? 'border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : variant === 'wrong'
                          ? 'border-red-500/40 bg-red-500/10'
                          : isSelected
                            ? 'border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.12)]'
                            : 'border-border bg-card/40 hover:border-border/80 hover:bg-card/70'
                    } ${showFeedback ? 'cursor-default' : ''}`}
                  >
                    {/* Letter bubble */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors ${
                        variant === 'correct'
                          ? 'bg-emerald-500 text-white'
                          : variant === 'wrong'
                            ? 'bg-red-500 text-white'
                            : isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-border bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {showFeedback && variant === 'correct' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : showFeedback && variant === 'wrong' ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        letter
                      )}
                    </div>

                    <span
                      className={`flex-1 text-sm font-medium leading-snug ${
                        variant === 'correct'
                          ? 'text-emerald-300'
                          : variant === 'wrong'
                            ? 'text-red-300'
                            : isSelected
                              ? 'text-primary'
                              : 'text-foreground/80'
                      }`}
                    >
                      {option}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Feedback explanation */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`rounded-2xl border p-5 ${
                    isCorrect
                      ? 'border-emerald-500/20 bg-emerald-500/10'
                      : 'border-red-500/20 bg-red-500/10'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span
                      className={`text-sm font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {isCorrect ? `Correct! +${q.xp} XP` : 'Incorrect'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1)
                    setSelectedAnswer(answers[currentIndex - 1])
                    setShowFeedback(false)
                  }
                }}
                disabled={currentIndex === 0}
                className="gap-2 rounded-xl text-muted-foreground hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {!showFeedback ? (
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedAnswer}
                  className="h-11 gap-2 rounded-xl bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Confirm Answer
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="h-11 gap-2 rounded-xl bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {currentIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  // ── RESULT ──
  if (step === 'result') {
    const percentage = Math.round((score / questions.length) * 100)
    const isGreat = percentage >= 80

    return (
      <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md space-y-6"
        >
          {/* Score card */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="from-primary/8 pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent" />

            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
              <Trophy
                className={`h-12 w-12 ${isGreat ? 'text-amber-400' : 'text-muted-foreground'}`}
              />
            </div>

            <h1 className="mb-1 font-heading text-4xl font-black tracking-tight text-foreground">
              {isGreat ? 'Outstanding!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">Quiz complete</p>

            <div className="mb-2 text-6xl font-black text-foreground">{percentage}%</div>
            <p className="mb-6 text-sm text-muted-foreground">
              {score} of {questions.length} correct
            </p>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                  XP Earned
                </p>
                <p className="text-2xl font-black text-amber-400">+{totalXP}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">
                  Accuracy
                </p>
                <p className="text-2xl font-black text-foreground">{percentage}%</p>
              </div>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-left">
              <Zap className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold text-white">Streak Protected</p>
                <p className="text-[10px] text-muted-foreground">You're on a 5-day streak!</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setStep('review')}
              variant="outline"
              className="h-12 gap-2 rounded-2xl border-border font-bold"
            >
              <BookOpen className="h-4 w-4" />
              Review Answers
            </Button>
            <Button
              onClick={() => {
                setStep('intro')
                setCurrentIndex(0)
                setAnswers(Array(questions.length).fill(null))
                setTimeLeft(120)
              }}
              className="h-12 gap-2 rounded-2xl bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Quiz
            </Button>
            <Link href="/student/dashboard">
              <Button
                variant="ghost"
                className="h-12 w-full gap-2 rounded-2xl text-muted-foreground hover:text-white"
              >
                Back to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── REVIEW ──
  if (step === 'review') {
    const rq = questions[reviewIndex]
    const userAnswer = answers[reviewIndex]
    const isRight = userAnswer === rq.correctAnswer

    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Answer Review</h2>
          <Button
            variant="ghost"
            onClick={() => setStep('result')}
            className="text-sm text-muted-foreground hover:text-white"
          >
            Back to Results
          </Button>
        </div>

        {/* Review navigation */}
        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => {
            const a = answers[i]
            const correct = a === questions[i].correctAnswer
            return (
              <button
                key={i}
                onClick={() => setReviewIndex(i)}
                className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${
                  reviewIndex === i
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : ''
                } ${
                  !a
                    ? 'border border-border bg-muted text-muted-foreground'
                    : correct
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <motion.div
          key={reviewIndex}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6">
            <div className="flex items-center gap-2">
              {isRight ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <Badge className={`border text-[10px] ${difficultyColors[rq.difficulty]}`}>
                {rq.difficulty}
              </Badge>
              <Badge className="border-sky-500/20 bg-sky-500/10 text-[10px] text-sky-400">
                {rq.topic}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-white">{rq.content}</h3>
          </div>

          <div className="space-y-3">
            {rq.options.map((option, idx) => {
              const isUserAnswer = userAnswer === option
              const isCorrectOption = option === rq.correctAnswer
              return (
                <div
                  key={option}
                  className={`flex items-center gap-4 rounded-2xl border p-4 ${
                    isCorrectOption
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : isUserAnswer && !isCorrectOption
                        ? 'border-red-500/30 bg-red-500/10'
                        : 'border-border bg-card/30'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                      isCorrectOption
                        ? 'bg-emerald-500 text-white'
                        : isUserAnswer
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {LETTER_OPTIONS[idx]}
                  </div>
                  <span
                    className={`flex-1 text-sm ${
                      isCorrectOption
                        ? 'font-medium text-emerald-300'
                        : isUserAnswer
                          ? 'text-red-300'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {option}
                  </span>
                  {isCorrectOption && (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400">
                      Correct
                    </Badge>
                  )}
                  {isUserAnswer && !isCorrectOption && (
                    <Badge className="border-red-500/20 bg-red-500/10 text-[10px] text-red-400">
                      Your answer
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>

          <div className="bg-sky-500/8 space-y-2 rounded-2xl border border-sky-500/20 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-400">Explanation</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{rq.explanation}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
              disabled={reviewIndex === 0}
              variant="outline"
              className="flex-1 gap-2 rounded-xl border-border"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={() =>
                reviewIndex < questions.length - 1
                  ? setReviewIndex(reviewIndex + 1)
                  : setStep('result')
              }
              className="flex-1 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {reviewIndex < questions.length - 1 ? 'Next' : 'Done'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return null
}
