'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  ListChecks,
  HelpCircle,
  Briefcase,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import type { Lesson, TopicContent, ContentSection } from '@/data/library/types'

function formatInlineText(text: string, codeClassName: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let cursor = 0
  let key = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index))
    }

    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push(<strong key={`strong-${key++}`}>{token.slice(2, -2)}</strong>)
    } else {
      nodes.push(<code key={`code-${key++}`} className={codeClassName}>{token.slice(1, -1)}</code>)
    }

    cursor = match.index + token.length
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor))
  }

  return nodes
}

// ─── Static Code Block ──────────────────────────────────────────────────────
function StaticCodeBlock({ code, output, language = 'python', fileName }: {
  code: string; output?: string; language?: string; fileName?: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-border" style={{ background: 'hsl(222 47% 9%)' }}>
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: 'hsl(222 47% 12%)', borderColor: 'hsl(222 47% 20%)' }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs font-mono text-gray-400">{fileName ?? language}</span>
        </div>
        <button onClick={copy} className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-5 overflow-x-auto text-sm scrollbar-thin" style={{ color: '#e6edf3', fontFamily: 'var(--font-mono)', lineHeight: 1.75 }}>
        <code>{code}</code>
      </pre>
      {output && (
        <div className="border-t px-4 py-3" style={{ borderColor: 'hsl(222 47% 20%)', background: 'hsl(222 47% 7%)' }}>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-1.5">Output</p>
          <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  )
}

// ─── Section Renderer ────────────────────────────────────────────────────────
function SectionBlock({ section }: { section: ContentSection }) {
  switch (section.type) {
    case 'text':
      return (
        <div className="prose-custom mb-5">
          {section.content.split('\n\n').map((para, i) => (
            <p key={i} className="mb-4 text-foreground/90 leading-relaxed text-[0.95rem]">
              {formatInlineText(para, 'bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary')}
            </p>
          ))}
          {section.example && (
            <StaticCodeBlock
              code={section.example.code}
              output={section.example.output}
              language={section.example.language}
              fileName={section.example.fileName}
            />
          )}
        </div>
      )

    case 'code':
      return section.example ? (
        <StaticCodeBlock
          code={section.example.code}
          output={section.example.output}
          language={section.example.language}
          fileName={section.example.fileName}
        />
      ) : null

    case 'note':
      return (
        <div className="my-4 flex gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-4">
          <Lightbulb className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 mb-1">Note</p>
            <p className="text-sm text-foreground/85 leading-relaxed">{section.content}</p>
          </div>
        </div>
      )

    case 'warning':
      return (
        <div className="my-4 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">Warning</p>
            <p className="text-sm text-foreground/85 leading-relaxed">{section.content}</p>
          </div>
        </div>
      )

    case 'formula':
      return (
        <div className="my-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary mb-2">Formula</p>
          <pre className="text-base font-mono font-bold text-foreground whitespace-pre-wrap">{section.content}</pre>
        </div>
      )

    case 'table':
      return section.table ? (
        <div className="my-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60">
                {section.table.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-mono font-bold text-foreground border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-card' : 'bg-secondary/20'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-foreground/85 border-b border-border/50 font-mono text-xs">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null

    case 'steps':
      return section.steps ? (
        <ol className="my-4 space-y-3 pl-1">
          {section.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-black text-xs font-bold">{i + 1}</span>
              <span className="text-sm text-foreground/85 leading-relaxed pt-0.5">
                {formatInlineText(step, 'bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary')}
              </span>
            </li>
          ))}
        </ol>
      ) : null

    case 'comparison':
      return section.items ? (
        <ul className="my-4 space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
              <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>{formatInlineText(item, 'bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary')}</span>
            </li>
          ))}
        </ul>
      ) : null

    default:
      return null
  }
}

// ─── Topic Content View ───────────────────────────────────────────────────────
function TopicView({ topic, topicContent }: { topic: string; topicContent: TopicContent }) {
  const [openQuiz, setOpenQuiz] = useState<number | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})

  return (
    <motion.div
      key={topic}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* Introduction */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-3">{topicContent.title}</h1>
        <p className="text-foreground/80 leading-relaxed text-[0.95rem] mb-4">{topicContent.introduction}</p>
        {topicContent.whyLearn && (
          <div className="flex gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
            <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">{topicContent.whyLearn}</p>
          </div>
        )}
      </div>

      {/* Content sections */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        {topicContent.sections.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </div>

      {/* Common Mistakes */}
      {topicContent.commonMistakes && topicContent.commonMistakes.length > 0 && (
        <div className="rounded-2xl border border-red-500/15 bg-red-500/5 p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-red-400 mb-3">
            <AlertTriangle className="h-4 w-4" /> Common Mistakes
          </h3>
          <ul className="space-y-2">
            {topicContent.commonMistakes.map((m, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/80">
                <span className="text-red-400 flex-shrink-0">✕</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best Practices */}
      {topicContent.bestPractices && topicContent.bestPractices.length > 0 && (
        <div className="rounded-2xl border border-green-500/15 bg-green-500/5 p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-green-400 mb-3">
            <ListChecks className="h-4 w-4" /> Best Practices
          </h3>
          <ul className="space-y-2">
            {topicContent.bestPractices.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/80">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exercises */}
      {topicContent.exercises && topicContent.exercises.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <ListChecks className="h-4 w-4 text-primary" /> Practice Exercises
          </h3>
          <div className="space-y-3">
            {topicContent.exercises.map((ex, i) => (
              <div key={i} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground/90 mb-1">{ex.question}</p>
                    {ex.hint && <p className="text-xs text-muted-foreground font-mono">Hint: {ex.hint}</p>}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ex.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                    ex.difficulty === 'intermediate' ? 'bg-sky-500/10 text-sky-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>{ex.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {topicContent.quiz && topicContent.quiz.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <HelpCircle className="h-4 w-4 text-primary" /> Quiz
          </h3>
          <div className="space-y-4">
            {topicContent.quiz.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-border bg-secondary/20 p-4">
                <p className="text-sm font-medium text-foreground mb-3">{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const answered = quizAnswers[qi] !== undefined
                    const isSelected = quizAnswers[qi] === oi
                    const isCorrect = oi === q.answer
                    return (
                      <button
                        key={oi}
                        onClick={() => !answered && setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors border ${
                          !answered ? 'border-border hover:border-primary/40 hover:bg-primary/5' :
                          isCorrect ? 'border-green-500/40 bg-green-500/10 text-green-400' :
                          isSelected ? 'border-red-500/40 bg-red-500/10 text-red-400' :
                          'border-border opacity-50'
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    )
                  })}
                </div>
                {quizAnswers[qi] !== undefined && (
                  <p className="mt-3 text-xs text-muted-foreground font-mono border-t border-border pt-2">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Questions */}
      {topicContent.interviewQuestions && topicContent.interviewQuestions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <Briefcase className="h-4 w-4 text-primary" /> Interview Questions
          </h3>
          <div className="space-y-3">
            {topicContent.interviewQuestions.map((iq, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenQuiz(openQuiz === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/40 transition-colors"
                >
                  <span className="text-left">{i + 1}. {iq.question}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      iq.difficulty === 'junior' ? 'bg-green-500/10 text-green-400' :
                      iq.difficulty === 'mid' ? 'bg-sky-500/10 text-sky-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>{iq.difficulty}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openQuiz === i ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {openQuiz === i && (
                  <div className="px-4 py-3 border-t border-border bg-secondary/20">
                    <p className="text-sm text-foreground/80 leading-relaxed">{iq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="text-base font-bold text-primary mb-2">Summary</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">{topicContent.summary}</p>
        {topicContent.nextTopic && (
          <p className="text-xs font-mono text-muted-foreground mt-3">Next: {topicContent.nextTopic}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
interface LessonLayoutProps {
  lesson: Lesson
  backLabel?: string
  backHref?: string
  domainIcon?: React.ReactNode
  domainColor?: string
}

export default function LessonLayout({
  lesson,
  backLabel = 'Library',
  backHref = '/library',
  domainIcon,
  domainColor = 'hsl(var(--primary))',
}: LessonLayoutProps) {
  const [selectedTopic, setSelectedTopic] = useState(lesson.topics[0]?.id ?? '')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentIndex = lesson.topics.findIndex(t => t.id === selectedTopic)
  const topicContent = lesson.content[selectedTopic]
  const prevTopic = currentIndex > 0 ? lesson.topics[currentIndex - 1] : null
  const nextTopic = currentIndex < lesson.topics.length - 1 ? lesson.topics[currentIndex + 1] : null

  const navigate = useCallback((id: string) => {
    setSelectedTopic(id)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex pt-14">
        {/* ── Left Sidebar ── */}
        <aside
          className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-72 border-r border-border bg-card overflow-y-auto scrollbar-thin z-30 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 pb-8">
            {/* Back link */}
            <Link
              href={backHref}
              className="mb-4 flex items-center gap-2 text-sm font-mono font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>

            {/* Lesson header */}
            <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1">{lesson.domain}</p>
              <p className="text-sm font-bold text-foreground leading-snug">{lesson.title}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                  lesson.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
                  lesson.difficulty === 'intermediate' ? 'bg-sky-500/10 text-sky-400' :
                  lesson.difficulty === 'advanced' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-primary/10 text-primary'
                }`}>{lesson.difficulty}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{lesson.topics.length} topics</span>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-3 border-t border-border" />

            {/* Topic list */}
            <p className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-1">
              Topics
            </p>
            <nav className="space-y-0.5">
              {lesson.topics.map((t, idx) => {
                const isActive = selectedTopic === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(t.id)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 text-sm rounded-lg transition-all text-left group ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span className={`flex-shrink-0 text-[11px] font-mono pt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-snug">{t.title}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto flex-shrink-0 mt-0.5" />}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="lg:ml-72 flex-1 min-h-[calc(100vh-3.5rem)]">
          {/* Mobile header bar */}
          <div className="lg:hidden sticky top-14 z-20 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="text-sm font-mono text-muted-foreground truncate">
              {lesson.topics[currentIndex]?.title}
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 md:py-8">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-1.5 text-xs font-mono text-muted-foreground flex-wrap">
              <Link href="/library" className="hover:text-primary transition-colors">Library</Link>
              <span>/</span>
              <Link href={`/library/${lesson.domainSlug}`} className="hover:text-primary transition-colors capitalize">{lesson.domainSlug.replace(/-/g, ' ')}</Link>
              <span>/</span>
              <span className="text-foreground">{lesson.title}</span>
            </div>

            {/* Topic content */}
            {topicContent ? (
              <TopicView topic={selectedTopic} topicContent={topicContent} />
            ) : (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="font-mono text-muted-foreground text-sm">Select a topic from the sidebar to start learning.</p>
              </div>
            )}

            {/* Prev / Next */}
            <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-border">
              <button
                onClick={() => prevTopic && navigate(prevTopic.id)}
                disabled={!prevTopic}
                className="flex items-center gap-2 text-sm font-mono font-medium rounded-xl border border-border px-4 py-2.5 transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{prevTopic?.title ?? 'Previous'}</span>
                <span className="sm:hidden">Previous</span>
              </button>
              <span className="text-xs font-mono text-muted-foreground">
                {currentIndex + 1} / {lesson.topics.length}
              </span>
              <button
                onClick={() => nextTopic && navigate(nextTopic.id)}
                disabled={!nextTopic}
                className="flex items-center gap-2 text-sm font-mono font-medium rounded-xl border border-primary/40 bg-primary/5 text-primary px-4 py-2.5 transition-colors hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none"
              >
                <span className="hidden sm:inline">{nextTopic?.title ?? 'Next'}</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}
