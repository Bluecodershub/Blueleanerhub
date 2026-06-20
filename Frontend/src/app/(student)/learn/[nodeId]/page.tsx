'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Code2,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Brain,
  Trophy,
  Clock,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Dumbbell,
  Star,
  Terminal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface ContentSection {
  type: 'intro' | 'concept' | 'example' | 'code' | 'quiz' | 'summary' | 'exercise'
  title?: string
  content: string
  language?: string
  explanation?: string
  quiz?: Array<{
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }>
}

interface CourseContent {
  _id: string
  nodeId: string
  domain: string
  nodeTitle: string
  estimatedMinutes: number
  level: string
  sections: ContentSection[]
  keyTakeaways: string[]
  furtherReading: Array<{ title: string; url?: string; description: string }>
  practiceExercises: Array<{
    title: string
    description: string
    starterCode?: string
    language?: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  }>
}

const SECTION_ICONS: Record<string, any> = {
  intro: BookOpen,
  concept: Brain,
  example: Lightbulb,
  code: Code2,
  quiz: Target,
  summary: Star,
  exercise: Dumbbell,
}

const SECTION_COLORS: Record<string, string> = {
  intro: 'border-sky-500/20 bg-sky-500/5',
  concept: 'border-purple-500/20 bg-purple-500/5',
  example: 'border-amber-500/20 bg-amber-500/5',
  code: 'border-emerald-500/20 bg-emerald-500/5',
  quiz: 'border-pink-500/20 bg-pink-500/5',
  summary: 'border-sky-500/20 bg-sky-500/5',
  exercise: 'border-orange-500/20 bg-orange-500/5',
}

function QuizBlock({ quizItems }: { quizItems: ContentSection['quiz'] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [checked, setChecked] = useState(false)

  if (!quizItems || quizItems.length === 0) return null

  const score = Object.entries(answers).filter(([i, ans]) => ans === quizItems[Number(i)]?.correctIndex).length

  return (
    <div className="space-y-5">
      {quizItems.map((q, qi) => (
        <div key={qi} className="rounded-xl border border-border bg-card/50 p-4">
          <p className="mb-3 text-sm font-semibold text-white">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi
              const isCorrect = oi === q.correctIndex
              let cls = 'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-all '
              if (!checked) {
                cls += selected
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border bg-card hover:border-border/80 hover:text-white text-muted-foreground'
              } else {
                if (isCorrect) cls += 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                else if (selected && !isCorrect) cls += 'border-red-500/40 bg-red-500/10 text-red-400'
                else cls += 'border-border/50 text-muted-foreground/60'
              }
              return (
                <label key={oi} className={cls} onClick={() => !checked && setAnswers(a => ({ ...a, [qi]: oi }))}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                  {checked && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4" />}
                </label>
              )
            })}
          </div>
          {checked && (
            <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              {q.explanation}
            </p>
          )}
        </div>
      ))}
      {!checked ? (
        <Button onClick={() => setChecked(true)} disabled={Object.keys(answers).length < quizItems.length} size="sm" className="rounded-xl bg-primary text-black">
          Check Answers
        </Button>
      ) : (
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Trophy className="h-4 w-4 text-amber-400" />
          Score: {score}/{quizItems.length}
          {score === quizItems.length && <span className="text-emerald-400">Perfect!</span>}
        </div>
      )}
    </div>
  )
}

function CodeBlock({ code, language, explanation }: { code: string; language?: string; explanation?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-3">
      {explanation && (
        <p className="text-sm text-muted-foreground">{explanation}</p>
      )}
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#0d1117]">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">{language || 'code'}</span>
          </div>
          <button onClick={copy} className="text-[11px] text-muted-foreground transition-colors hover:text-white">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="overflow-x-auto p-4">
          <code className="text-[13px] leading-relaxed text-gray-100 font-mono">{code}</code>
        </pre>
      </div>
    </div>
  )
}

function Section({ section, index }: { section: ContentSection; index: number }) {
  const Icon = SECTION_ICONS[section.type] || BookOpen
  const colorClass = SECTION_COLORS[section.type] || 'border-border bg-card/50'
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border p-5 ${colorClass}`}
    >
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0 text-white/70" />
          {section.title && (
            <h3 className="font-bold text-white">{section.title}</h3>
          )}
          {!section.title && (
            <span className="text-sm font-semibold capitalize text-white/70">{section.type}</span>
          )}
        </div>
        {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {section.type === 'code' ? (
                <CodeBlock code={section.content} language={section.language} explanation={section.explanation} />
              ) : section.type === 'quiz' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{section.content}</p>
                  <QuizBlock quizItems={section.quiz} />
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  {section.content.split('\n').map((line, li) => {
                    if (line.startsWith('# ')) return <h2 key={li} className="text-lg font-bold text-white">{line.slice(2)}</h2>
                    if (line.startsWith('## ')) return <h3 key={li} className="text-base font-semibold text-white/90">{line.slice(3)}</h3>
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={li} className="font-semibold text-white">{line.slice(2, -2)}</p>
                    if (line.startsWith('- ') || line.startsWith('• ')) return <p key={li} className="flex gap-2 text-sm text-muted-foreground"><span className="text-primary">•</span>{line.slice(2)}</p>
                    if (!line.trim()) return <div key={li} className="h-2" />
                    return <p key={li} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nodeId = params.nodeId as string
  const domain = searchParams.get('domain') || ''
  const nodeTitle = searchParams.get('title') || 'Lesson'

  const [content, setContent] = useState<CourseContent | null>(null)
  const [generating, setGenerating] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState('')
  const [readProgress, setReadProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Track scroll progress
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const handler = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total > 0) setReadProgress(Math.round((scrolled / total) * 100))
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [content])

  useEffect(() => {
    if (!nodeId) return

    const fetchOrGenerate = async () => {
      setGenerating(true)
      try {
        // Try to fetch existing content first
        const res = await api.get(`/adaptive-learning/content/${nodeId}`)
        setContent(res.data.data)
      } catch (err: any) {
        if (err?.response?.status === 404) {
          // Generate content
          if (!domain || !nodeTitle) {
            setError('Missing domain or node title to generate content.')
            setGenerating(false)
            return
          }
          try {
            const genRes = await api.post('/adaptive-learning/content/generate', {
              nodeId,
              domain,
              nodeTitle
            })
            setContent(genRes.data.data)
          } catch (genErr) {
            setError('Failed to generate lesson content. Please try again.')
          }
        } else {
          setError('Failed to load lesson content.')
        }
      } finally {
        setGenerating(false)
      }
    }

    fetchOrGenerate()
  }, [nodeId, domain, nodeTitle])

  const markComplete = async () => {
    if (completing) return
    setCompleting(true)
    try {
      await api.post('/adaptive-learning/progress/update', {
        domain,
        nodeId,
        status: 'COMPLETED'
      })
      setCompleted(true)
      toast.success('Node completed! XP awarded.')
      setTimeout(() => router.push('/student/roadmap'), 1500)
    } catch {
      toast.error('Failed to update progress.')
    } finally {
      setCompleting(false)
    }
  }

  if (generating) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white">AI Professor is preparing your lesson</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Generating personalized content for <span className="text-primary font-semibold">{nodeTitle}</span>...
          </p>
        </div>
        <div className="flex gap-2">
          {['Analyzing your level', 'Writing lesson content', 'Preparing examples', 'Building quizzes'].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.5 }}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground"
            >
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
              {step}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <h3 className="font-bold text-white">{error}</h3>
          <Button className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!content) return null

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* Reading progress bar */}
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-muted/30">
        <div
          className="h-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-150"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmap
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-sky-500/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="border-primary/30 bg-primary/10 text-primary">{content.domain}</Badge>
                <Badge variant="outline" className="border-border">{content.level}</Badge>
              </div>
              <h1 className="text-2xl font-black text-white">{content.nodeTitle}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{content.estimatedMinutes} min read</span>
                <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" />{content.sections.length} sections</span>
                <span className="flex items-center gap-1.5"><Target className="h-4 w-4" />{content.practiceExercises.length} exercises</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="text-right text-sm font-semibold text-white">{readProgress}% read</div>
              {readProgress >= 80 && !completed && (
                <Button onClick={markComplete} disabled={completing} className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500">
                  {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {completing ? 'Saving...' : 'Mark Complete & Earn XP'}
                </Button>
              )}
              {completed && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="space-y-6">
        {/* Sections */}
        <div className="space-y-4">
          {content.sections.map((section, i) => (
            <Section key={i} section={section} index={i} />
          ))}
        </div>

        {/* Key Takeaways */}
        {content.keyTakeaways.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
              <Star className="h-4 w-4 text-amber-400" />
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {content.keyTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Practice Exercises */}
        {content.practiceExercises.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-white">
              <Dumbbell className="h-4 w-4 text-orange-400" />
              Practice Exercises
            </h3>
            {content.practiceExercises.map((ex, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{ex.title}</span>
                  <Badge
                    className={
                      ex.difficulty === 'EASY' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : ex.difficulty === 'MEDIUM' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                      : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }
                  >
                    {ex.difficulty}
                  </Badge>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{ex.description}</p>
                {ex.starterCode && (
                  <CodeBlock code={ex.starterCode} language={ex.language || 'python'} />
                )}
                <Link href={`/ide?exercise=${encodeURIComponent(ex.title)}&code=${encodeURIComponent(ex.starterCode || '')}&lang=${ex.language || 'python'}`}>
                  <Button size="sm" variant="outline" className="mt-3 gap-2 rounded-xl">
                    <Play className="h-3.5 w-3.5" />
                    Practice in IDE
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Further Reading */}
        {content.furtherReading.length > 0 && (
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
              <BookOpen className="h-4 w-4 text-sky-400" />
              Further Reading
            </h3>
            <div className="space-y-3">
              {content.furtherReading.map((ref, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-3">
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-white">{ref.title}</p>
                    <p className="text-xs text-muted-foreground">{ref.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion CTA */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Lesson Complete!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            You have read through all sections. Mark this node as complete to unlock the next topic and earn XP.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/student/roadmap">
              <Button variant="outline" className="gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                Back to Roadmap
              </Button>
            </Link>
            <Link href={`/ide?context=${encodeURIComponent(content.nodeTitle)}`}>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Code2 className="h-4 w-4" />
                Practice in IDE
              </Button>
            </Link>
            {!completed && (
              <Button onClick={markComplete} disabled={completing} className="gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500">
                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
                {completing ? 'Saving...' : 'Complete & Earn XP'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
