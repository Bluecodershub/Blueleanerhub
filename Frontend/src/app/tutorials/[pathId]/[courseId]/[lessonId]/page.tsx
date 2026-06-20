'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CodePlayground from '@/components/tutorials/CodePlayground'
import { tutorialsAPI, trackingAPI } from '@/lib/api-civilization'
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  MessageSquare,
  Lightbulb,
  Menu,
  X,
  Play,
  Clock,
  BarChart3,
  Bookmark,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
  { id: '4', title: 'Functions in Python', completed: false, duration: '18 min', type: 'video' },
  { id: '5', title: 'Lists & Tuples', completed: false, duration: '14 min', type: 'article' },
  { id: '6', title: 'Dictionaries', completed: false, duration: '10 min', type: 'article' },
  { id: '7', title: 'File I/O', completed: false, duration: '16 min', type: 'article' },
  { id: '8', title: 'OOP Basics', completed: false, duration: '20 min', type: 'video' },
  { id: '9', title: 'Modules & Packages', completed: false, duration: '12 min', type: 'article' },
  {
    id: '10',
    title: 'Mini Project: Todo App',
    completed: false,
    duration: '35 min',
    type: 'project',
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
  // Split into paragraphs / code blocks for rendering
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
      // Inline code: replace `code` with styled span
      sections.push({ type: 'paragraph', value: line })
    }
    i++
  }

  return (
    <div className="space-y-4">
      {sections.map((s, idx) => {
        if (s.type === 'heading2') {
          return (
            <h2 key={idx} className="mb-3 mt-8 text-2xl font-black tracking-tight text-white">
              {s.value}
            </h2>
          )
        }
        if (s.type === 'heading3') {
          return (
            <h3 key={idx} className="mb-2 mt-6 text-xl font-bold text-white">
              {s.value}
            </h3>
          )
        }
        if (s.type === 'code') {
          return (
            <pre key={idx} className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
              <code className="font-mono text-sm leading-relaxed text-foreground/90">
                {s.value}
              </code>
            </pre>
          )
        }
        // Render inline backtick code
        const parts = s.value.split(/`([^`]+)`/)
        return (
          <p key={idx} className="text-base leading-relaxed text-muted-foreground">
            {parts.map((part, pi) =>
              pi % 2 === 1 ? (
                <code
                  key={pi}
                  className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-sm text-primary"
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

  // ── API data ────────────────────────────────────────────────────────────
  const [tutorialTitle, setTutorialTitle] = useState('')
  const [lessons, setLessons] = useState(FALLBACK_LESSONS)
  const [content, setContent] = useState('')
  const [starterCode, setStarterCode] = useState('')
  const [loadingContent, setLoadingContent] = useState(true)

  const tutorialId = useMemo(() => {
    const raw = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId
    const n = Number(raw)
    if (Number.isInteger(n) && n > 0) return String(n)
    if (typeof raw === 'string' && raw.length > 0) return raw
    return null
  }, [params.courseId])

  // Derive active lesson index from URL param (lesson-1 = index 0, etc.)
  const activeLessonIndex = useMemo(() => {
    const raw = Array.isArray(params.lessonId) ? params.lessonId[0] : (params.lessonId ?? '1')
    const n = parseInt(raw.toString().replace(/\D/g, ''), 10)
    return Number.isFinite(n) && n > 0 ? n - 1 : 0
  }, [params.lessonId])

  const activeLesson = lessons[activeLessonIndex] ?? lessons[0]

  // ── Fetch tutorial + sections ─────────────────────────────────────────
  useEffect(() => {
    if (!tutorialId) {
      setContent(FALLBACK_LESSON_CONTENT)
      setLoadingContent(false)
      return
    }

    tutorialsAPI
      .get(String(tutorialId))
      .then((data: any) => {
        const tut = data?.tutorial ?? data
        const sections: any[] = data?.sections ?? tut?.sections ?? []

        if (tut?.title) setTutorialTitle(tut.title)

        if (sections.length > 0) {
          // Build lesson list from sections
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
      .catch(() => {
        setContent(FALLBACK_LESSON_CONTENT)
      })
      .finally(() => setLoadingContent(false))
  }, [tutorialId, activeLessonIndex])

  // ── Telemetry & Bookmarks Load ─────────────────────────────────────────
  useEffect(() => {
    if (!tutorialId || !activeLesson) return

    const currentLessonId = (activeLesson as any).dbId || String(activeLessonIndex + 1)

    // Log lesson view telemetry
    void trackingAPI.logLessonView(String(tutorialId), currentLessonId).catch(() => {})

    // Check if bookmarked
    trackingAPI
      .getSavedLessons()
      .then((res: any) => {
        const saved = res?.data || []
        const matched = saved.some(
          (s: any) =>
            String(s.tutorialId) === String(tutorialId) && String(s.lessonId) === String(currentLessonId)
        )
        setIsBookmarked(matched)
      })
      .catch(() => {})
  }, [tutorialId, activeLesson, activeLessonIndex])

  // ── Session heartbeat ──
  useEffect(() => {
    const interval = setInterval(() => {
      void trackingAPI.heartbeatSession(15).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // ── Adaptive guidance ─────────────────────────────────────────────────
  useEffect(() => {
    if (!tutorialId) return

    void tutorialsAPI
      .trackBehavior(tutorialId as any, 'lesson_opened', {
        lessonId: params.lessonId,
        pathId: params.pathId,
      })
      .catch(() => undefined)

    void tutorialsAPI
      .adaptiveGuidance(tutorialId as any)
      .then((data: any) => {
        const guidance = Array.isArray(data?.guidance)
          ? data.guidance.filter((g: unknown) => typeof g === 'string')
          : []
        setAdaptiveGuidance(guidance.slice(0, 3))
      })
      .catch(() => setAdaptiveGuidance([]))
  }, [tutorialId, params.lessonId, params.pathId])

  const completedCount = lessons.filter((l) => l.completed).length
  const progress = Math.round((completedCount / lessons.length) * 100)

  const handleToggleBookmark = async () => {
    if (!tutorialId || !activeLesson) return
    const currentLessonId = (activeLesson as any).dbId || String(activeLessonIndex + 1)
    try {
      if (isBookmarked) {
        await trackingAPI.removeSavedLesson(String(tutorialId), currentLessonId)
        setIsBookmarked(false)
        toast.success('Removed from wishlist')
      } else {
        await trackingAPI.saveLesson(String(tutorialId), currentLessonId)
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
      if (tutorialId && sectionId) {
        await tutorialsAPI.complete(tutorialId as any, sectionId as any)
        await trackingAPI.trackProgress(String(tutorialId), String(sectionId), 100, 45)
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
    const pathId = Array.isArray(params.pathId) ? params.pathId[0] : params.pathId
    const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId
    router.push(`/tutorials/${pathId}/${courseId}/lesson-${newIndex + 1}`)
  }

  const playgroundCode =
    starterCode ||
    'score = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "F"\n\nprint(f"Grade: {grade}")'

  return (
    <div className="-mx-4 flex h-[calc(100vh-64px)] overflow-hidden bg-background sm:-mx-6 lg:-mx-8">
      {/* ─── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-card/50"
          >
            <div className="shrink-0 space-y-3 border-b border-border p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Course
                  </p>
                  <h2 className="mt-0.5 text-sm font-bold leading-snug text-white">
                    {tutorialTitle || 'Python Basics'}
                  </h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-bold text-primary">
                    {completedCount}/{lessons.length} · {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-1.5 bg-muted/40" />
              </div>
            </div>

            <div className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
              {lessons.map((lesson, i) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    const pathId = Array.isArray(params.pathId) ? params.pathId[0] : params.pathId
                    const courseId = Array.isArray(params.courseId)
                      ? params.courseId[0]
                      : params.courseId
                    router.push(`/tutorials/${pathId}/${courseId}/lesson-${i + 1}`)
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                    i === activeLessonIndex
                      ? 'bg-primary text-black shadow-sm shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="shrink-0">
                    {lesson.completed ? (
                      <CheckCircle2
                        className={`h-4 w-4 ${i === activeLessonIndex ? 'text-white' : 'text-emerald-400'}`}
                      />
                    ) : i === activeLessonIndex ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-border" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs font-semibold leading-snug ${i === activeLessonIndex ? 'text-white' : 'group-hover:text-foreground'}`}
                    >
                      {lesson.title}
                    </p>
                    <div
                      className={`mt-0.5 flex items-center gap-1.5 ${i === activeLessonIndex ? 'text-white/60' : 'text-muted-foreground/70'}`}
                    >
                      {typeIcon(lesson.type)}
                      <span className="text-[10px]">{lesson.duration}</span>
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
        {/* Content header */}
        <div className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-white"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span>{tutorialTitle || 'Python Basics'}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">{activeLesson?.title ?? 'Lesson'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={playgroundOpen ? 'default' : 'outline'}
              onClick={() => setPlaygroundOpen(!playgroundOpen)}
              className={`h-8 gap-1.5 rounded-xl border-border px-3 text-xs font-bold ${playgroundOpen ? 'bg-primary text-black' : ''}`}
            >
              <Play className="h-3.5 w-3.5" />
              {playgroundOpen ? 'Close' : 'Try it'}
            </Button>
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={`rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-white ${rightPanelOpen ? 'bg-muted/50 text-white' : ''}`}
            >
              <BookOpen className="h-4 w-4" />
            </button>
            <button 
              onClick={handleToggleBookmark}
              className={`rounded-lg p-2 transition-colors hover:bg-muted/50 ${isBookmarked ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main content split */}
        <div className="flex min-h-0 flex-1">
          {/* Article content */}
          <div
            className={`overflow-y-auto ${playgroundOpen ? 'w-1/2' : 'flex-1'} transition-all duration-300`}
          >
            <div className="mx-auto max-w-2xl px-6 py-10 pb-24 sm:px-10">
              {/* Lesson header */}
              <div className="mb-8 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="border-sky-500/20 bg-sky-500/10 text-[10px] text-sky-400">
                    {tutorialTitle || 'Python Basics'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-border text-[10px] text-muted-foreground"
                  >
                    <Clock className="mr-1 h-2.5 w-2.5" />
                    {activeLesson?.duration ?? '10 min'}
                  </Badge>
                </div>
                <h1 className="font-heading text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {activeLesson?.title ?? 'Lesson'}
                </h1>
              </div>

              {/* Content */}
              {loadingContent ? (
                <div className="flex items-center justify-center gap-3 py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading lesson content...</span>
                </div>
              ) : (
                <>
                  <LessonContent content={content} />

                  {adaptiveGuidance.length > 0 && (
                    <div className="bg-sky-500/8 my-8 rounded-2xl border border-sky-500/20 p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-sky-400" />
                        <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                          Adaptive Guidance
                        </p>
                      </div>
                      <ul className="space-y-1.5">
                        {adaptiveGuidance.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-0.5 shrink-0 text-sky-400">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Lesson footer */}
              <div className="mt-12 space-y-4 border-t border-border pt-8">
                {!lessonComplete ? (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing || loadingContent}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-60"
                  >
                    {completing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                    {completing ? 'Saving...' : 'Mark as Complete (+30 XP)'}
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/15 py-3 text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                    Lesson completed · +30 XP earned!
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigateLesson('prev')}
                    disabled={activeLessonIndex === 0}
                    className="h-12 flex-1 gap-2 rounded-2xl border-border px-6 font-bold"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => navigateLesson('next')}
                    disabled={activeLessonIndex === lessons.length - 1}
                    className="h-12 flex-1 gap-2 rounded-2xl bg-primary px-8 font-bold text-black hover:bg-primary/90"
                  >
                    Next Lesson
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Code playground */}
          <AnimatePresence>
            {playgroundOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col border-l border-border bg-[#0a0f1e]"
              >
                <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/5 px-5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      Live Playground
                    </span>
                  </div>
                  <button
                    onClick={() => setPlaygroundOpen(false)}
                    className="text-white/30 transition-colors hover:text-white/70"
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

      {/* ─── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex shrink-0 flex-col overflow-hidden border-l border-border bg-card/50"
          >
            <div className="flex shrink-0 border-b border-border">
              {(['notes', 'resources', 'discussion'] as SideTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSideTab(tab)}
                  className={`flex-1 py-3 text-[11px] font-bold capitalize transition-colors ${
                    sideTab === tab
                      ? 'border-b-2 border-primary text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {sideTab === 'notes' && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Your private notes for this lesson.
                  </p>
                  <textarea
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    placeholder="Write your notes here..."
                    className="h-48 w-full resize-none rounded-xl border border-border bg-background/60 p-3 text-sm text-foreground/90 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <Button
                    size="sm"
                    className="h-8 w-full rounded-xl bg-primary text-xs font-bold text-black hover:bg-primary/90"
                  >
                    Save Note
                  </Button>
                </div>
              )}

              {sideTab === 'resources' && (
                <div className="space-y-2">
                  <p className="mb-3 text-xs text-muted-foreground">
                    Supplementary materials for this lesson.
                  </p>
                  {STATIC_RESOURCES.map((r, i) => (
                    <div
                      key={i}
                      className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground/90 transition-colors group-hover:text-white">
                          {r.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{r.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sideTab === 'discussion' && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground opacity-30" />
                  <p className="text-xs text-muted-foreground">
                    Ask questions, share insights, and learn from others.
                  </p>
                  <Button size="sm" variant="outline" className="rounded-xl border-border text-xs">
                    Open Discussion
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
