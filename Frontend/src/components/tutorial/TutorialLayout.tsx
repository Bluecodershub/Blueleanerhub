'use client'

/**
 * TutorialLayout — Three-Panel Interactive Tutorial Engine
 * =========================================================
 * Design inspiration: MDN Docs + Codecademy + Linear
 *
 * Layout:
 *   [Left: Section Nav] [Center: Content + Code] [Right: Exercise Panel]
 *
 * On mobile: single column, tab-switched
 */

import { useState, useCallback } from 'react'
import { CheckCircle, ChevronRight, Code2, BookOpen, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import ContentViewer from './ContentViewer'
import CodePlayground from './CodePlayground'
import ExercisePanel from './ExercisePanel'
import TutorialProgress from './TutorialProgress'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TutorialSection {
  id: number
  title: string
  content: string
  sectionOrder: number
  language?: string
  starterCode?: string
  hasExercise: boolean
  exercisePrompt?: string
  exerciseTestCases?: Array<{
    input: string
    expectedOutput: string
    isHidden: boolean
  }>
  exerciseXpReward: number
  completed: boolean
}

export interface TutorialData {
  id: number
  slug: string
  title: string
  description: string
  domain: string
  difficulty: string
  estimatedMinutes: number
  xpReward: number
  sections: TutorialSection[]
  totalSections: number
  completedSections: number
  progressPercent: number
}

interface TutorialLayoutProps {
  tutorial: TutorialData
  onSectionComplete: (sectionId: number) => Promise<void>
  onRunCode: (
    code: string,
    language: string
  ) => Promise<{ stdout: string; stderr: string; success: boolean }>
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION NAVIGATOR (left panel)
// ─────────────────────────────────────────────────────────────────────────────

function SectionNav({
  sections,
  activeId,
  onSelect,
}: {
  sections: TutorialSection[]
  activeId: number
  onSelect: (id: number) => void
}) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150',
            s.id === activeId
              ? 'bg-sky-50 font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300'
              : 'text-gray-600 hover:bg-gray-100 dark:text-muted-foreground dark:hover:bg-gray-800'
          )}
        >
          <span className="flex-shrink-0">
            {s.completed ? (
              <CheckCircle className="h-4 w-4 text-foreground/80" />
            ) : (
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border-2 text-[10px] font-bold',
                  s.id === activeId
                    ? 'border-sky-600 text-primary'
                    : 'border-gray-300 text-gray-400'
                )}
              >
                {s.sectionOrder}
              </span>
            )}
          </span>
          <span className="truncate">{s.title}</span>
          {s.id === activeId && <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0" />}
        </button>
      ))}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export default function TutorialLayout({
  tutorial,
  onSectionComplete,
  onRunCode,
}: TutorialLayoutProps) {
  const [activeSectionId, setActiveSectionId] = useState(
    tutorial.sections.find((s) => !s.completed)?.id ?? tutorial.sections[0]?.id
  )
  const [activeTab, setActiveTab] = useState<'content' | 'code' | 'exercise'>('content')

  const activeSection = tutorial.sections.find((s) => s.id === activeSectionId)

  const handleSectionComplete = useCallback(async () => {
    if (!activeSectionId) return
    await onSectionComplete(activeSectionId)

    // Auto-advance to next section
    const currentIndex = tutorial.sections.findIndex((s) => s.id === activeSectionId)
    const next = tutorial.sections[currentIndex + 1]
    if (next) setActiveSectionId(next.id)
  }, [activeSectionId, tutorial.sections, onSectionComplete])

  if (!activeSection) return null

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white dark:bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 dark:border-border">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {tutorial.domain}
          </span>
          <span className="text-gray-300">·</span>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            {tutorial.title}
          </h1>
        </div>

        <TutorialProgress
          completed={tutorial.completedSections}
          total={tutorial.totalSections}
          percent={tutorial.progressPercent}
          xpReward={tutorial.xpReward}
        />
      </header>

      {/* Body: three panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Section navigator */}
        <aside className="hidden w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-border md:block">
          <SectionNav
            sections={tutorial.sections}
            activeId={activeSectionId!}
            onSelect={setActiveSectionId}
          />
        </aside>

        {/* CENTER: Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile tab switcher */}
          <div className="flex border-b border-gray-200 dark:border-border md:hidden">
            {[
              { key: 'content', icon: BookOpen, label: 'Read' },
              { key: 'code', icon: Code2, label: 'Code' },
              { key: 'exercise', icon: Terminal, label: 'Practice' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors',
                  activeTab === key
                    ? 'border-b-2 border-sky-600 text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content + Code split (desktop) */}
          <div className="flex flex-1 overflow-hidden">
            {/* Content panel */}
            <div
              className={cn('flex-1 overflow-y-auto', activeTab !== 'content' && 'hidden md:block')}
            >
              <ContentViewer section={activeSection} onComplete={handleSectionComplete} />
            </div>

            {/* Code + Exercise panel (desktop right split) */}
            <div
              className={cn(
                'flex w-[45%] flex-col border-l border-gray-200 dark:border-border',
                activeTab === 'content' && 'hidden md:flex'
              )}
            >
              {/* Code playground */}
              <div
                className={cn(
                  'flex-1 overflow-hidden',
                  activeTab === 'exercise' && 'hidden md:flex md:flex-col'
                )}
              >
                <CodePlayground
                  starterCode={activeSection.starterCode ?? ''}
                  language={activeSection.language ?? 'python'}
                  onRun={onRunCode}
                />
              </div>

              {/* Exercise panel */}
              {activeSection.hasExercise && (
                <div
                  className={cn(
                    'border-t border-gray-200 dark:border-border',
                    activeTab === 'code' && 'hidden md:block'
                  )}
                >
                  <ExercisePanel
                    prompt={activeSection.exercisePrompt ?? ''}
                    testCases={activeSection.exerciseTestCases ?? []}
                    xpReward={activeSection.exerciseXpReward}
                    language={activeSection.language ?? 'python'}
                    onRun={onRunCode}
                    onComplete={handleSectionComplete}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
