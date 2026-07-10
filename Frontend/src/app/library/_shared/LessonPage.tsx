'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  BookOpen,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Code2,
  HelpCircle,
  ClipboardList,
  Target,
  MessageSquare,
  FileText,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import type { LessonTopic, TopicLesson, CodeExample } from './types'

// ─── Static example block (code OR domain-native worked example) ─────────────
const KIND_LABELS: Record<string, string> = {
  code: 'Code',
  calculation: 'Worked Calculation',
  'worked-example': 'Worked Example',
  diagram: 'Diagram',
  spreadsheet: 'Spreadsheet',
  spice: 'SPICE Netlist',
  gcode: 'G-Code',
}

const KIND_OUTPUT_LABEL: Record<string, string> = {
  code: 'Output',
  calculation: 'Result',
  'worked-example': 'Answer',
  diagram: 'Interpretation',
  spreadsheet: 'Summary',
  spice: 'Simulation Result',
  gcode: 'Toolpath Result',
}

function CodeBlock({ example }: { example: CodeExample }) {
  const [copied, setCopied] = useState(false)
  const kind = example.kind ?? 'code'
  const isCode = kind === 'code' || kind === 'spice' || kind === 'gcode'
  const blockLabel = KIND_LABELS[kind] ?? 'Example'
  const outputLabel = KIND_OUTPUT_LABEL[kind] ?? 'Output'

  const handleCopy = () => {
    navigator.clipboard.writeText(example.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-secondary/50">
      {/* Header bar */}
      <div
        className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5"
      >
        <div className="flex items-center gap-2">
          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {blockLabel}
          </span>
          <span className="ml-2 text-xs font-semibold text-muted-foreground">{example.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {example.language}
          </span>
          {isCode && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      {/* Body: monospace for code/spice/gcode/diagram, calm sans for calculation/worked-example/spreadsheet */}
      {isCode || kind === 'diagram' ? (
        <pre
          className="overflow-x-auto p-5 text-sm text-foreground"
          style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.75 }}
        >
          <code>{example.code}</code>
        </pre>
      ) : (
        <pre
          className="overflow-x-auto whitespace-pre-wrap p-5 text-sm leading-7 text-foreground"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {example.code}
        </pre>
      )}

      {/* Output / Result block */}
      {example.output && (
        <div
          className="border-t border-border bg-card px-5 py-3"
        >
          <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">{outputLabel}</p>
          <pre className="whitespace-pre-wrap font-mono text-sm text-success">{example.output}</pre>
        </div>
      )}

      {/* Explanation */}
      {example.explanation && (
        <div
          className="border-t border-border bg-card px-5 py-3"
        >
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{example.explanation}</p>
        </div>
      )}
    </div>
  )
}

// ─── Section heading helper ───────────────────────────────────────────────────
function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-sans text-sm font-bold uppercase text-primary">{label}</h3>
    </div>
  )
}

// ─── Lesson content renderer ──────────────────────────────────────────────────
function LessonContent({ lesson }: { lesson: TopicLesson }) {
  return (
    <div className="space-y-8">

      {/* ── Introduction ── */}
      <div className="card p-7 space-y-5">
        <div>
          <SectionHeading icon={BookOpen} label="Introduction" />
          <p className="text-base leading-7 text-foreground">{lesson.intro}</p>
        </div>

        <div className="border-t border-border pt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 font-sans text-xs font-bold uppercase text-muted-foreground">
              What Is It?
            </h4>
            <p className="text-base leading-7 text-foreground">{lesson.whatIsIt}</p>
          </div>
          <div>
            <h4 className="mb-2 font-sans text-xs font-bold uppercase text-muted-foreground">
              Why Does It Matter?
            </h4>
            <p className="text-base leading-7 text-foreground">{lesson.whyImportant}</p>
          </div>
        </div>
      </div>

      {/* ── Simple Explanation ── */}
      <div className="rounded-xl border border-primary/20 p-6" style={{ background: 'hsl(var(--primary) / 0.05)' }}>
        <SectionHeading icon={Lightbulb} label="Simple Explanation" />
        <p className="text-base leading-7 text-foreground">{lesson.simpleExplanation}</p>
      </div>

      {/* ── Detailed Explanation ── */}
      <div className="card p-7">
        <SectionHeading icon={FileText} label="Detailed Explanation" />
        <p className="whitespace-pre-line text-base leading-7 text-foreground">{lesson.detailedExplanation}</p>

        {lesson.formula && (
          <div
            className="mt-5 rounded-lg border border-border p-4"
            style={{ background: 'hsl(var(--secondary))' }}
          >
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Formula / Rule</p>
            <pre className="font-mono text-sm text-foreground">{lesson.formula}</pre>
          </div>
        )}

        {lesson.syntaxBlock && (
          <div
            className="mt-5 rounded-lg border border-border p-4"
            style={{ background: 'hsl(var(--secondary))' }}
          >
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Syntax</p>
            <pre className="font-mono text-sm text-foreground">{lesson.syntaxBlock}</pre>
          </div>
        )}
      </div>

      {/* ── Real-World Example ── */}
      <div className="rounded-xl border border-border p-6" style={{ background: 'hsl(var(--secondary) / 0.5)' }}>
        <SectionHeading icon={Target} label="Real-World Example" />
        <p className="text-base leading-7 text-foreground">{lesson.realWorldExample}</p>
      </div>

      {/* ── Technical Details ── */}
      {lesson.technicalDetails && (
        <div className="card p-7">
          <SectionHeading icon={Code2} label="Technical Details" />
          <p className="whitespace-pre-line text-base leading-7 text-foreground">{lesson.technicalDetails}</p>
        </div>
      )}

      {/* ── Code / Worked Examples ── */}
      {lesson.codeExamples.length > 0 && (() => {
        const anyCode = lesson.codeExamples.some(ex => (ex.kind ?? 'code') === 'code')
        const label = anyCode ? 'Code Examples' : 'Worked Examples'
        return (
          <div className="space-y-5">
            <SectionHeading icon={Code2} label={label} />
            {lesson.codeExamples.map((ex, i) => (
              <CodeBlock key={i} example={ex} />
            ))}
          </div>
        )
      })()}

      {/* ── Common Mistakes ── */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <div className="card p-7">
          <SectionHeading icon={AlertCircle} label="Common Mistakes" />
          <ul className="space-y-2">
            {lesson.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <span className="text-xs font-bold text-destructive">{i + 1}</span>
                </span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Best Practices ── */}
      {lesson.bestPractices && lesson.bestPractices.length > 0 && (
        <div className="card p-7">
          <SectionHeading icon={CheckCircle2} label="Best Practices" />
          <ul className="space-y-2">
            {lesson.bestPractices.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Exercises ── */}
      {lesson.exercises.length > 0 && (
        <div className="card p-7">
          <SectionHeading icon={ClipboardList} label="Practice Exercises" />
          <ol className="space-y-3">
            {lesson.exercises.map((ex, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  {i + 1}
                </span>
                {ex}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Quiz ── */}
      {lesson.quizQuestions.length > 0 && (
        <div className="card p-7">
          <SectionHeading icon={HelpCircle} label="Quiz Questions" />
          <div className="space-y-6">
            {lesson.quizQuestions.map((q, qi) => (
              <QuizItem key={qi} question={q} index={qi} />
            ))}
          </div>
        </div>
      )}

      {/* ── Interview Questions ── */}
      {lesson.interviewQuestions.length > 0 && (
        <div className="card p-7">
          <SectionHeading icon={MessageSquare} label="Interview Questions" />
          <ol className="space-y-3">
            {lesson.interviewQuestions.map((iq, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary font-bold text-xs flex items-center justify-center border border-primary/30 rounded">
                  Q{i + 1}
                </span>
                {iq}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Summary ── */}
      <div
        className="rounded-xl border border-primary/30 p-6"
        style={{ background: 'hsl(var(--primary) / 0.06)' }}
      >
        <SectionHeading icon={CheckCircle2} label="Summary" />
        <p className="text-base leading-7 text-foreground">{lesson.summary}</p>
        {lesson.nextTopic && (
          <p className="mt-3 text-sm text-muted-foreground">
            Up Next: <span className="text-primary font-semibold">{lesson.nextTopic}</span>
          </p>
        )}
      </div>

    </div>
  )
}

// ─── Quiz item (toggle answer) ────────────────────────────────────────────────
function QuizItem({ question, index }: { question: { question: string; options: string[]; answer: number; explanation: string }; index: number }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-2">
        {index + 1}. {question.question}
      </p>
      <ul className="space-y-1 mb-2">
        {question.options.map((opt, oi) => (
          <li
            key={oi}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              revealed && oi === question.answer
                ? 'border-success/30 bg-success-light text-success'
                : 'border-border text-muted-foreground'
            }`}
          >
            {String.fromCharCode(65 + oi)}. {opt}
          </li>
        ))}
      </ul>
      <button
        onClick={() => setRevealed(!revealed)}
        className="text-xs font-semibold text-primary hover:underline"
      >
        {revealed ? 'Hide Answer' : 'Reveal Answer'}
      </button>
      {revealed && (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{question.explanation}</p>
      )}
    </div>
  )
}

// ─── Main exported LessonPage component ──────────────────────────────────────
interface LessonPageProps {
  domainLabel: string
  domainIcon: React.ElementType
  domainColor: string
  topics: LessonTopic[]
}

export default function LessonPage({ domainLabel, domainIcon: DomainIcon, domainColor, topics }: LessonPageProps) {
  const [selectedTopicId, setSelectedTopicId]   = useState(topics[0].id)
  const [selectedLessonId, setSelectedLessonId] = useState(topics[0].lessons[0].id)

  const currentTopic  = topics.find(t => t.id === selectedTopicId) ?? topics[0]
  const currentLesson = currentTopic.lessons.find(l => l.id === selectedLessonId) ?? currentTopic.lessons[0]
  const lessonIndex   = currentTopic.lessons.findIndex(l => l.id === selectedLessonId)

  const selectTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) return
    setSelectedTopicId(topicId)
    setSelectedLessonId(topic.lessons[0].id)
  }

  const goPrev = () => {
    if (lessonIndex > 0) setSelectedLessonId(currentTopic.lessons[lessonIndex - 1].id)
  }

  const goNext = () => {
    if (lessonIndex < currentTopic.lessons.length - 1)
      setSelectedLessonId(currentTopic.lessons[lessonIndex + 1].id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex pt-14">
        {/* ══════════════════ LEFT SIDEBAR ══════════════════ */}
        <aside
          className="fixed left-0 top-14 z-20 hidden h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r border-border bg-card md:block"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="p-4">
            {/* Back */}
            <Link
              href="/library"
              className="mb-5 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Link>

            {/* Domain badge */}
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${domainColor}1a` }}
              >
                <DomainIcon className="h-4 w-4" style={{ color: domainColor }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Domain</p>
                <p className="text-sm font-bold text-foreground">{domainLabel}</p>
              </div>
            </div>

            <div className="mb-4 border-t border-border" />

            {/* Topics */}
            <p className="mb-2 px-1 text-[10px] font-bold uppercase text-muted-foreground">Topics</p>
            <nav className="space-y-0.5">
              {topics.map((topic) => {
                const isActive = topic.id === selectedTopicId
                return (
                  <button
                    key={topic.id}
                    onClick={() => selectTopic(topic.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all text-left ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span className="truncate">{topic.name}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary" />}
                  </button>
                )
              })}
            </nav>

            {/* Lessons sub-list */}
            <div className="mt-5">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase text-muted-foreground">
                {currentTopic.name} — {currentTopic.lessons.length} Topics
              </p>
              <div className="space-y-0.5">
                {currentTopic.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
                      selectedLessonId === lesson.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    <span className="w-5 text-[10px] opacity-50">{idx + 1}.</span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ══════════════════ MAIN CONTENT ══════════════════ */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 md:ml-64">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

            {/* Breadcrumb + title */}
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/library" className="hover:text-primary transition-colors">Library</Link>
                <span>/</span>
                <span>{domainLabel}</span>
                <span>/</span>
                <span>{currentTopic.name}</span>
                <span>/</span>
                <span className="text-foreground">{currentLesson.title}</span>
              </div>
              <h1>{currentLesson.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Topic {lessonIndex + 1} of {currentTopic.lessons.length}
              </p>
            </div>

            {/* Lesson content */}
            <motion.div
              key={`${selectedTopicId}-${selectedLessonId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LessonContent lesson={currentLesson} />
            </motion.div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={goPrev}
                disabled={lessonIndex === 0}
                className="btn btn-outline flex items-center gap-2 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-xs font-semibold text-muted-foreground">
                {lessonIndex + 1} / {currentTopic.lessons.length}
              </span>
              <button
                onClick={goNext}
                disabled={lessonIndex === currentTopic.lessons.length - 1}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
