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
import Footer from '@/components/layout/Footer'
import type { LessonTopic, TopicLesson, CodeExample } from './types'

// ─── Static code block ───────────────────────────────────────────────────────
function CodeBlock({ example }: { example: CodeExample }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(example.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ background: 'hsl(222 47% 9%)' }}>
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: 'hsl(222 47% 12%)', borderColor: 'hsl(222 47% 20%)' }}
      >
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] inline-block" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e] inline-block" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] inline-block" />
          <span className="ml-2 text-xs font-mono text-gray-400">{example.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'hsl(222 47% 20%)', color: '#7dd3fc' }}>
            {example.language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <pre
        className="p-5 overflow-x-auto text-sm"
        style={{ color: '#e6edf3', fontFamily: 'var(--font-mono)', lineHeight: 1.75 }}
      >
        <code>{example.code}</code>
      </pre>

      {/* Output block */}
      {example.output && (
        <div
          className="border-t px-5 py-3"
          style={{ background: 'hsl(222 47% 7%)', borderColor: 'hsl(222 47% 20%)' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Output</p>
          <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{example.output}</pre>
        </div>
      )}

      {/* Explanation */}
      {example.explanation && (
        <div
          className="border-t px-5 py-3"
          style={{ background: 'hsl(222 47% 11%)', borderColor: 'hsl(222 47% 20%)' }}
        >
          <p className="text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-line">{example.explanation}</p>
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
      <h3 className="text-sm font-bold uppercase tracking-wider text-primary font-mono">{label}</h3>
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
          <p className="text-sm text-foreground leading-relaxed">{lesson.intro}</p>
        </div>

        <div className="border-t border-border pt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
              What Is It?
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{lesson.whatIsIt}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
              Why Does It Matter?
            </h4>
            <p className="text-sm text-foreground leading-relaxed">{lesson.whyImportant}</p>
          </div>
        </div>
      </div>

      {/* ── Simple Explanation ── */}
      <div className="rounded-xl border border-primary/20 p-6" style={{ background: 'hsl(var(--primary) / 0.05)' }}>
        <SectionHeading icon={Lightbulb} label="Simple Explanation" />
        <p className="text-sm text-foreground leading-relaxed">{lesson.simpleExplanation}</p>
      </div>

      {/* ── Detailed Explanation ── */}
      <div className="card p-7">
        <SectionHeading icon={FileText} label="Detailed Explanation" />
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{lesson.detailedExplanation}</p>

        {lesson.formula && (
          <div
            className="mt-5 rounded-lg border border-border p-4"
            style={{ background: 'hsl(var(--secondary))' }}
          >
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Formula / Rule</p>
            <pre className="font-mono text-sm text-foreground">{lesson.formula}</pre>
          </div>
        )}

        {lesson.syntaxBlock && (
          <div
            className="mt-5 rounded-lg border border-border p-4"
            style={{ background: 'hsl(222 47% 9%)' }}
          >
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-2">Syntax</p>
            <pre className="font-mono text-sm text-green-300">{lesson.syntaxBlock}</pre>
          </div>
        )}
      </div>

      {/* ── Real-World Example ── */}
      <div className="rounded-xl border border-border p-6" style={{ background: 'hsl(var(--secondary) / 0.5)' }}>
        <SectionHeading icon={Target} label="Real-World Example" />
        <p className="text-sm text-foreground leading-relaxed">{lesson.realWorldExample}</p>
      </div>

      {/* ── Technical Details ── */}
      {lesson.technicalDetails && (
        <div className="card p-7">
          <SectionHeading icon={Code2} label="Technical Details" />
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{lesson.technicalDetails}</p>
        </div>
      )}

      {/* ── Code / Worked Examples ── */}
      {lesson.codeExamples.length > 0 && (
        <div className="space-y-5">
          <SectionHeading icon={Code2} label="Examples" />
          {lesson.codeExamples.map((ex, i) => (
            <CodeBlock key={i} example={ex} />
          ))}
        </div>
      )}

      {/* ── Common Mistakes ── */}
      {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
        <div className="card p-7">
          <SectionHeading icon={AlertCircle} label="Common Mistakes" />
          <ul className="space-y-2">
            {lesson.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-red-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-500">{i + 1}</span>
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
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
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
                  className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
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
        <p className="text-sm text-foreground leading-relaxed">{lesson.summary}</p>
        {lesson.nextTopic && (
          <p className="mt-3 text-xs font-mono text-muted-foreground">
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
            className={`text-sm px-3 py-1.5 rounded-lg border font-mono transition-colors ${
              revealed && oi === question.answer
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-border text-muted-foreground'
            }`}
          >
            {String.fromCharCode(65 + oi)}. {opt}
          </li>
        ))}
      </ul>
      <button
        onClick={() => setRevealed(!revealed)}
        className="text-xs font-mono text-primary hover:underline"
      >
        {revealed ? 'Hide Answer' : 'Reveal Answer'}
      </button>
      {revealed && (
        <p className="mt-2 text-xs text-muted-foreground font-mono">{question.explanation}</p>
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
          className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-card overflow-y-auto z-20"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="p-4">
            {/* Back */}
            <Link
              href="/library"
              className="mb-5 flex items-center gap-2 text-sm font-mono font-medium text-muted-foreground hover:text-primary transition-colors"
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
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Domain</p>
                <p className="text-sm font-bold text-foreground">{domainLabel}</p>
              </div>
            </div>

            <div className="mb-4 border-t border-border" />

            {/* Topics */}
            <p className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-1">Topics</p>
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
              <p className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-1">
                {currentTopic.name} — {currentTopic.lessons.length} Topics
              </p>
              <div className="space-y-0.5">
                {currentTopic.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors font-mono flex items-center gap-2 ${
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
        <main className="ml-64 flex-1 min-h-[calc(100vh-3.5rem)]">
          <div className="mx-auto max-w-4xl px-6 py-8">

            {/* Breadcrumb + title */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                <Link href="/library" className="hover:text-primary transition-colors">Library</Link>
                <span>/</span>
                <span>{domainLabel}</span>
                <span>/</span>
                <span>{currentTopic.name}</span>
                <span>/</span>
                <span className="text-foreground">{currentLesson.title}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{currentLesson.title}</h1>
              <p className="text-sm text-muted-foreground font-mono mt-1">
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
              <span className="text-xs font-mono text-muted-foreground">
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

          <div className="px-6 pb-8">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}
