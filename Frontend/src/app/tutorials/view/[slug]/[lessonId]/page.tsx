'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CodePlayground from '@/components/tutorials/CodePlayground'
import { tutorialsAPI, trackingAPI } from '@/lib/api-civilization'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  MessageSquare,
  Lightbulb,
  Menu,
  X,
  Play,
  BarChart3,
  Bookmark,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Fallback static lesson (used when API is unavailable) ───────────────────

const FALLBACK_LESSON_CONTENT = `
Control flow in Python allows you to make decisions and repeat actions based on conditions.
It's the backbone of any non-trivial program — without it, code would execute
line-by-line with no ability to branch or repeat.

## Conditional Statements

Python uses \`if\`, \`elif\`, and \`else\` for branching logic.
Unlike many other languages, Python uses indentation to define code blocks — no curly braces needed.

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Your grade: {grade}")  # Output: Your grade: B
\`\`\`

## For Loops

\`for\` loops in Python iterate over any iterable — lists, strings, ranges, and more.

\`\`\`python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

for i in range(1, 6):
    print(f"Count: {i}")  # 1, 2, 3, 4, 5
\`\`\`

## While Loops

\`while\` loops continue executing as long as a condition is \`True\`.

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1  # Important: always update the condition

# Output: 0, 1, 2, 3, 4
\`\`\`
`

const FALLBACK_LESSONS = [
  { id: '1', title: 'Introduction to Python', completed: true, duration: '8 min', type: 'article' },
  {
    id: '2',
    title: 'Variables & Data Types',
    completed: true,
    duration: '12 min',
    type: 'article',
  },
  {
    id: '3',
    title: 'Control Flow & Loops',
    completed: false,
    duration: '15 min',
    type: 'article',
    active: true,
  },
]

const STATIC_RESOURCES = [
  { title: 'Python Official Docs', type: 'Link' },
  { title: 'Control Flow Cheat Sheet', type: 'PDF' },
  { title: 'Practice Problems', type: 'Exercise' },
]

type SideTab = 'notes' | 'resources' | 'discussion'

const typeIcon = (type: string) => {
  if (type === 'video') return <Play className="h-3 w-3" />
  if (type === 'project') return <BarChart3 className="h-3 w-3" />
  return <FileText className="h-3 w-3" />
}

// Render Markdown-ish content without a heavy dependency
function LessonContent({ content }: { content: string }) {
  const sections: {
    type: 'code' | 'heading2' | 'heading3' | 'paragraph'
    value: string
    lang?: string
  }[] = []
  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text'
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      sections.push({ type: 'code', value: codeLines.join('\n'), lang })
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'heading2', value: line.slice(3) })
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'heading3', value: line.slice(4) })
    } else if (line.trim()) {
      sections.push({ type: 'paragraph', value: line })
    }
    i++
  }

  return (
    <div className="space-y-6">
      {sections.map((s, idx) => {
        if (s.type === 'heading2') {
          return (
            <h2
              key={idx}
              className="mb-4 mt-12 font-serif text-3xl font-medium tracking-tight text-white"
            >
              {s.value}
            </h2>
          )
        }
        if (s.type === 'heading3') {
          return (
            <h3 key={idx} className="mb-3 mt-8 font-serif text-2xl font-medium text-white/90">
              {s.value}
            </h3>
          )
        }
        if (s.type === 'code') {
          return (
            <div
              key={idx}
              className="relative my-8 overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between border-b border-border/50 bg-secondary/30 px-5 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {s.lang}
                </span>
                <div className="flex gap-1.5 text-muted-foreground/30">
                  <div className="h-2 w-2 rounded-full bg-current" />
                  <div className="h-2 w-2 rounded-full bg-current" />
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
              </div>
              <pre className="overflow-x-auto p-6">
                <code className="font-mono text-sm leading-relaxed text-foreground/90">
                  {s.value}
                </code>
              </pre>
            </div>
          )
        }
        // Render inline backtick code
        const parts = s.value.split(/`([^`]+)`/)
        return (
          <p key={idx} className="font-serif text-lg leading-relaxed text-muted-foreground">
            {parts.map((part, pi) =>
              pi % 2 === 1 ? (
                <code
                  key={pi}
                  className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[0.9em] text-primary"
                >
                  {part}
                </code>
              ) : (
                part
              )
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [sideTab, setSideTab] = useState<SideTab>('notes')
  const [playgroundOpen, setPlaygroundOpen] = useState(false)
  const [lessonComplete, setLessonComplete] = useState(false)
  const [adaptiveGuidance, setAdaptiveGuidance] = useState<string[]>([])
  const [noteValue, setNoteValue] = useState('')
  const [completing, setCompleting] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const [tutorialTitle, setTutorialTitle] = useState('')
  const [lessons, setLessons] = useState(FALLBACK_LESSONS)
  const [content, setContent] = useState('')
  const [starterCode, setStarterCode] = useState('')
  const [loadingContent, setLoadingContent] = useState(true)

  const tutorialSlug = useMemo(() => {
    return Array.isArray(params.slug) ? params.slug[0] : params.slug
  }, [params.slug])

  const activeLessonIndex = useMemo(() => {
    const raw = Array.isArray(params.lessonId) ? params.lessonId[0] : (params.lessonId ?? '1')
    const n = parseInt(raw.toString().replace(/\D/g, ''), 10)
    return Number.isFinite(n) && n > 0 ? n - 1 : 0
  }, [params.lessonId])

  const activeLesson = lessons[activeLessonIndex] ?? lessons[0]

  useEffect(() => {
    if (!tutorialSlug) {
      setContent(FALLBACK_LESSON_CONTENT)
      setLoadingContent(false)
      return
    }

    tutorialsAPI
      .get(tutorialSlug)
      .then((data: any) => {
        const tut = data?.tutorial ?? data?.data ?? data
        const sections: any[] = data?.sections ?? tut?.sections ?? []
        if (tut?.title) setTutorialTitle(tut.title)

        if (sections.length > 0) {
          const built = sections.map((s: any, i: number) => ({
            id: String(i + 1),
            title: s.title ?? `Lesson ${i + 1}`,
            completed: s.completed ?? false,
            duration: s.estimatedMinutes ? `${s.estimatedMinutes} min` : '10 min',
            type: s.hasExercise ? 'project' : 'article',
            active: i === activeLessonIndex,
            dbId: s.id || s._id || String(i + 1),
          }))
          setLessons(built)
          const activeSection = sections[activeLessonIndex] ?? sections[0]
          if (activeSection) {
            setContent(activeSection.content ?? FALLBACK_LESSON_CONTENT)
            setStarterCode(activeSection.starterCode ?? '')
          } else {
            setContent(FALLBACK_LESSON_CONTENT)
          }
        } else {
          setContent(FALLBACK_LESSON_CONTENT)
        }
      })
      .catch(() => setContent(FALLBACK_LESSON_CONTENT))
      .finally(() => setLoadingContent(false))
  }, [tutorialSlug, activeLessonIndex])

  // ── Telemetry & Bookmarks Load ──
  useEffect(() => {
    if (!tutorialSlug || !activeLesson) return

    const currentLessonId = (activeLesson as any).dbId || String(activeLessonIndex + 1)

    // Log lesson view telemetry
    void trackingAPI.logLessonView(tutorialSlug, currentLessonId).catch(() => {})

    // Check if bookmarked
    trackingAPI
      .getSavedLessons()
      .then((res: any) => {
        const saved = res?.data || []
        const matched = saved.some(
          (s: any) =>
            s.tutorialSlug === tutorialSlug && String(s.lessonId) === String(currentLessonId)
        )
        setIsBookmarked(matched)
      })
      .catch(() => {})
  }, [tutorialSlug, activeLesson, activeLessonIndex])

  // ── Session heartbeat ──
  useEffect(() => {
    const interval = setInterval(() => {
      void trackingAPI.heartbeatSession(15).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!tutorialSlug) return
    void tutorialsAPI
      .trackBehavior(tutorialSlug as any, 'lesson_opened', { lessonId: params.lessonId })
      .catch(() => undefined)
    void tutorialsAPI
      .adaptiveGuidance(tutorialSlug as any)
      .then((data: any) => {
        const guidance = Array.isArray(data?.guidance)
          ? data.guidance.filter((g: unknown) => typeof g === 'string')
          : []
        setAdaptiveGuidance(guidance.slice(0, 3))
      })
      .catch(() => setAdaptiveGuidance([]))
  }, [tutorialSlug, params.lessonId])

  const completedCount = lessons.filter((l) => l.completed).length
  const progress = Math.round((completedCount / lessons.length) * 100)

  const handleToggleBookmark = async () => {
    if (!tutorialSlug || !activeLesson) return
    const currentLessonId = (activeLesson as any).dbId || String(activeLessonIndex + 1)
    try {
      if (isBookmarked) {
        await trackingAPI.removeSavedLesson(tutorialSlug, currentLessonId)
        setIsBookmarked(false)
        toast.success('Removed from wishlist')
      } else {
        await trackingAPI.saveLesson(tutorialSlug, currentLessonId)
        setIsBookmarked(true)
        toast.success('Saved to wishlist!')
      }
    } catch {
      setIsBookmarked(!isBookmarked)
      toast.success(isBookmarked ? 'Removed from wishlist' : 'Saved to wishlist!')
    }
  }

  const handleMarkComplete = async () => {
    if (lessonComplete) return
    setCompleting(true)
    try {
      const sectionId = (activeLesson as any).dbId || String(activeLessonIndex + 1)
      if (tutorialSlug && sectionId) {
        await tutorialsAPI.complete(tutorialSlug as any, sectionId as any)
        await trackingAPI.trackProgress(tutorialSlug, String(sectionId), 100, 45)
      }
      setLessonComplete(true)
      setLessons((prev) =>
        prev.map((l, i) => (i === activeLessonIndex ? { ...l, completed: true } : l))
      )
      toast.success('Lesson complete! +30 XP earned!')
    } catch {
      setLessonComplete(true)
      toast.success('Lesson complete! +30 XP earned!')
    } finally {
      setCompleting(false)
    }
  }

  const navigateLesson = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? activeLessonIndex + 1 : activeLessonIndex - 1
    if (newIndex < 0 || newIndex >= lessons.length) return
    router.push(`/tutorials/view/${tutorialSlug}/lesson-${newIndex + 1}`)
  }

  const playgroundCode =
    starterCode ||
    'score = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "F"\n\nprint(f"Grade: {grade}")'

  return (
    <div className="-mx-4 flex h-[calc(100vh-64px)] overflow-hidden bg-background sm:-mx-6 lg:-mx-8">
      <div className="bg-noise" />

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-card/60 backdrop-blur-xl"
          >
            <div className="shrink-0 space-y-6 border-b border-border p-8">
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className="mb-2 rounded-full border-primary/30 bg-primary/5 text-[9px] font-bold uppercase tracking-widest text-primary"
                  >
                    Curriculum
                  </Badge>
                  <h2 className="font-serif text-lg font-medium leading-tight text-white">
                    {tutorialTitle || 'Python Basics'}
                  </h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Overall Mastery</span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
              {lessons.map((lesson, i) => (
                <button
                  key={lesson.id}
                  onClick={() => router.push(`/tutorials/view/${tutorialSlug}/lesson-${i + 1}`)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-all hover:scale-[1.02]',
                    i === activeLessonIndex
                      ? 'bg-primary text-white shadow-xl shadow-primary/20'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <div className="shrink-0">
                    {lesson.completed ? (
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10',
                          i === activeLessonIndex && 'border-white/50 bg-white/20'
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            'h-3.5 w-3.5 text-emerald-400',
                            i === activeLessonIndex && 'text-white'
                          )}
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border border-border',
                          i === activeLessonIndex && 'border-white'
                        )}
                      >
                        <span className="text-[10px]">{i + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-medium leading-none',
                        i === activeLessonIndex ? 'text-white' : 'text-foreground'
                      )}
                    >
                      {lesson.title}
                    </p>
                    <div
                      className={cn(
                        'mt-1.5 flex items-center gap-2 text-[10px]',
                        i === activeLessonIndex ? 'text-white/70' : 'text-muted-foreground'
                      )}
                    >
                      {typeIcon(lesson.type)}
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── CENTER CONTENT ───────────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Navigation Bar */}
        <nav className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition-all hover:bg-secondary"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <span className="max-w-[150px] truncate">{tutorialTitle}</span>
              <ChevronRight className="h-3 w-3 opacity-30" />
              <span className="text-foreground">{activeLesson?.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant={playgroundOpen ? 'default' : 'outline'}
              onClick={() => setPlaygroundOpen(!playgroundOpen)}
              className={cn(
                'h-10 gap-2 rounded-full border-border px-6 text-[11px] font-black uppercase tracking-widest',
                playgroundOpen && 'bg-primary text-white shadow-lg shadow-primary/20'
              )}
            >
              <Play className={cn('h-3.5 w-3.5', playgroundOpen && 'fill-current')} />
              {playgroundOpen ? 'Close Editor' : 'Open Editor'}
            </Button>
            <div className="mx-2 h-8 w-[1px] bg-border" />
            <div className="flex items-center gap-1">
              <button 
                onClick={handleToggleBookmark}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:bg-secondary",
                  isBookmarked && "border-primary bg-primary/10 text-primary hover:text-primary"
                )}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </button>
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:bg-secondary',
                  rightPanelOpen && 'border-primary bg-primary text-white'
                )}
              >
                <BookOpen className="h-4 w-4" />
              </button>
            </div>
          </div>
        </nav>

        {/* Lesson Workspace */}
        <div className="flex min-h-0 flex-1">
          <div
            className={cn(
              'overflow-y-auto transition-all duration-500',
              playgroundOpen ? 'w-1/2' : 'flex-1'
            )}
          >
            <div className="mx-auto max-w-3xl px-12 py-16 pb-32">
              {/* Header */}
              <header className="mb-12 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className="border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Lesson {activeLessonIndex + 1}
                  </Badge>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    • {activeLesson?.duration} read
                  </span>
                </div>
                <h1 className="font-serif text-5xl font-medium tracking-tight text-white md:text-6xl">
                  {activeLesson?.title}
                </h1>
              </header>

              {loadingContent ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                  <p className="font-serif text-lg text-muted-foreground">
                    Synthesizing content...
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  <LessonContent content={content} />

                  {adaptiveGuidance.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-[2rem] border border-blue-500/20 bg-blue-500/5 p-8"
                    >
                      <div className="absolute right-0 top-0 p-4">
                        <Lightbulb size={40} className="text-blue-500/10" />
                      </div>
                      <div className="mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-400" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                          Contextual Insight
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {adaptiveGuidance.map((tip, i) => (
                          <li key={i} className="font-serif text-base text-muted-foreground/90">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Progress Navigation */}
              <div className="mt-24 space-y-8 border-t border-border/10 pt-16">
                {!lessonComplete ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing || loadingContent}
                    className="group relative flex w-full items-center justify-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/5 py-5 text-sm font-black uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {completing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6" />
                    )}
                    {completing ? 'Synchronizing Mastery...' : 'Mark Module as Complete (+30 XP)'}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/5 py-5 text-sm font-black uppercase tracking-widest text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                    Mastery Confirmed · +30 XP Distributed
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigateLesson('prev')}
                    disabled={activeLessonIndex === 0}
                    className="h-14 flex-1 rounded-full border-border text-[11px] font-bold uppercase tracking-widest hover:bg-secondary"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous Module
                  </Button>
                  <Button
                    onClick={() => navigateLesson('next')}
                    disabled={activeLessonIndex === lessons.length - 1}
                    className="h-14 flex-1 rounded-full bg-white text-[11px] font-bold uppercase tracking-widest text-black transition-transform hover:scale-105"
                  >
                    Next Module <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Playground Pane */}
          <AnimatePresence>
            {playgroundOpen && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '50%' }}
                exit={{ width: 0 }}
                className="relative flex flex-col border-l border-border bg-[#0a0f1e]"
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-black/20 px-6 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                      Runtime Environment
                    </span>
                  </div>
                  <button
                    onClick={() => setPlaygroundOpen(false)}
                    className="text-white/20 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodePlayground initialCode={playgroundCode} language="python" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ─── RIGHT SIDEBAR ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{ width: 340 }}
            exit={{ width: 0 }}
            className="flex shrink-0 flex-col overflow-hidden border-l border-border bg-card/60 backdrop-blur-xl"
          >
            <div className="flex border-b border-border bg-black/10">
              {(['notes', 'resources', 'discussion'] as SideTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSideTab(tab)}
                  className={cn(
                    'flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all',
                    sideTab === tab
                      ? 'bg-primary/10 text-primary shadow-[inset_0_-2px_0_hsl(var(--primary))]'
                      : 'text-muted-foreground hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-8">
              {sideTab === 'notes' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">Private Study Notes</h4>
                    <p className="text-xs text-muted-foreground">
                      Autosaved to your personal profile.
                    </p>
                  </div>
                  <textarea
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    placeholder="Capture your insights..."
                    className="h-64 w-full resize-none rounded-2xl border border-border bg-background/50 p-6 font-serif text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none"
                  />
                  <Button className="h-12 w-full rounded-xl bg-primary text-[11px] font-black uppercase tracking-widest text-white">
                    Persist Note
                  </Button>
                </div>
              )}

              {sideTab === 'resources' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white">Curated Extension Material</h4>
                  {STATIC_RESOURCES.map((r, i) => (
                    <div
                      key={i}
                      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-background/40 p-5 transition-all hover:bg-secondary"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-white">{r.title}</p>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground/60">
                          {r.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sideTab === 'discussion' && (
                <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
                  <div className="rounded-full bg-secondary p-8 text-muted-foreground/20">
                    <MessageSquare size={48} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Global Discourse</h4>
                    <p className="text-xs text-muted-foreground">
                      Join the conversation with other mastery students.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full border-border px-8 text-[11px] font-black uppercase tracking-widest"
                  >
                    Enter Discussion
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
