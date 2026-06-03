'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronLeft, ChevronRight, ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  completed: boolean
  active?: boolean
}

interface LearningLayoutProps {
  children: React.ReactNode
  sidebarTitle: string
  lessons: Lesson[]
  progress: number
  currentLessonTitle?: string
  prevLesson?: string
  nextLesson?: string
}

export const LearningLayout: React.FC<LearningLayoutProps> = ({
  children,
  sidebarTitle,
  lessons,
  progress,
  currentLessonTitle,
  prevLesson,
  nextLesson,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-56 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>
      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-[60] flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="m-0 font-heading text-xl font-black leading-tight tracking-tighter text-foreground">
                {sidebarTitle} <span className="font-medium text-primary">Tutorial</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                Mastery Path
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden min-w-[140px] flex-col gap-1.5 lg:flex">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span>Course Logic</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full border border-border/20 bg-secondary/50 p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {prevLesson && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-lg border-border/60 text-foreground hover:bg-secondary/80"
              >
                <Link href={prevLesson}>
                  <ChevronLeft size={16} />
                </Link>
              </Button>
            )}
            {nextLesson && (
              <Button
                asChild
                className="h-10 rounded-lg bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
              >
                <Link href={nextLesson} className="flex items-center gap-2">
                  Next Section <ArrowRight size={16} />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* Elite Dark Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="scrollbar-hide sticky top-[73px] z-50 hidden h-[calc(100vh-73px)] w-[280px] flex-col overflow-y-auto border-r border-border/40 bg-card py-8 md:flex"
            >
              <div className="mb-8 flex items-center justify-between px-6">
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                    Table of Logic
                  </h2>
                  <div className="mt-1.5 h-0.5 w-8 rounded-full bg-primary/40" />
                </div>
              </div>

              <nav className="flex-1 space-y-1 px-3">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/tutorials/python/basics/${lesson.id}`}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300',
                      lesson.active
                        ? 'reflective-glaze translate-x-1 bg-primary/10 font-bold text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full transition-all',
                        lesson.active
                          ? 'scale-125 bg-primary shadow-[0_0_8px_var(--primary)]'
                          : 'bg-muted-foreground/30 group-hover:bg-primary/50'
                      )}
                    />
                    <span className="truncate font-heading text-sm tracking-tight">
                      {lesson.title}
                    </span>
                    {lesson.completed && !lesson.active && (
                      <div className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      </div>
                    )}
                    {lesson.active && (
                      <motion.div
                        layoutId="active-marker"
                        className="absolute left-0 h-5 w-1 rounded-r-full bg-primary shadow-[0_0_8px_var(--primary)]"
                      />
                    )}
                  </Link>
                ))}
              </nav>

              <div className="mt-12 border-t border-border/30 px-6 py-6">
                <div className="glass-card space-y-3 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">
                    Pro Benefit
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Master this domain to unlock <strong>Verified Badges</strong>.
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Mastery Content */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-background/70">
          <div className="mx-auto max-w-4xl px-8 py-16 md:px-16 md:py-24 lg:px-24">
            <header className="mb-16">
              <div className="mb-6 flex items-center gap-3 opacity-60">
                <span className="rounded border border-border/50 bg-secondary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-foreground">
                  Domain: {sidebarTitle}
                </span>
                <ChevronRight size={12} className="text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Step {lessons.findIndex((l) => l.active) + 1}
                </span>
              </div>
              <h1 className="text-gradient mb-8 font-heading text-4xl font-black leading-[1.05] tracking-tighter text-foreground md:text-5xl lg:text-7xl">
                {currentLessonTitle}
              </h1>
              <div className="mb-12 h-1.5 w-24 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.35)]" />
            </header>

            <div
              className="prose prose-invert prose-blue prose-h2:text-4xl 
              prose-h2:font-heading prose-h2:font-black prose-h2:tracking-tight prose-h2:mt-16 prose-h2:mb-8 prose-h3:text-2xl
              prose-h3:font-heading prose-h3:font-bold prose-h3:text-foreground/90 prose-p:text-xl
              prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:tracking-tight prose-li:text-lg
              prose-li:text-muted-foreground prose-strong:text-foreground
              prose-strong:font-black prose-a:text-primary
              prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary
              prose-blockquote:bg-secondary/30 prose-blockquote:p-6 prose-blockquote:rounded-xl prose-blockquote:italic prose-code:bg-secondary/80
              prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-primary prose-code:font-mono prose-code:before:content-none prose-code:after:content-none max-w-none"
            >
              {children}
            </div>

            {/* Premium Section Navigation */}
            <div className="group mt-24 flex flex-col items-center justify-between gap-8 border-t border-border/30 pt-12 md:flex-row">
              <div className="flex flex-col gap-2">
                <h3 className="m-0 font-heading text-2xl font-black tracking-tight text-foreground">
                  Engineering Next Steps
                </h3>
                <p className="text-sm text-muted-foreground">
                  Prepare your cognitive framework for the next challenge.
                </p>
              </div>

              <div className="flex w-full items-center gap-4 md:w-auto">
                {prevLesson && (
                  <Button
                    variant="outline"
                    asChild
                    size="lg"
                    className="h-14 flex-1 rounded-xl border-border/60 px-8 font-black text-foreground transition-all hover:bg-secondary/80 active:scale-95 md:flex-none"
                  >
                    <Link href={prevLesson} className="flex items-center gap-2">
                      <ChevronLeft size={20} /> Back
                    </Link>
                  </Button>
                )}

                {nextLesson && (
                  <Button
                    asChild
                    size="lg"
                    className="group h-14 flex-1 rounded-xl bg-primary px-10 font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 md:flex-none"
                  >
                    <Link href={nextLesson} className="flex items-center gap-3">
                      Advance{' '}
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <footer className="mt-24 border-t border-border/30 bg-card/50 px-6 py-16 md:px-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-xs font-black text-primary">
                  BL
                </div>
                <p className="font-heading text-sm font-bold tracking-tight text-muted-foreground">
                  Mastery Platform <span className="ml-1 opacity-40">v2.0</span>
                </p>
              </div>
              <div className="flex items-center gap-8">
                <Link
                  href="#"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Curriculum
                </Link>
                <Link
                  href="#"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Research
                </Link>
                <Link
                  href="#"
                  className="text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                >
                  Documentation
                </Link>
              </div>
            </div>
          </footer>
        </main>

        {/* Dynamic Mobile Sidebar Trigger */}
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-8 right-8 z-[100] h-16 w-16 rounded-2xl bg-primary p-0 text-primary-foreground shadow-2xl shadow-primary/40 transition-all hover:scale-110 active:scale-90 md:hidden"
        >
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </Button>
      </div>
    </div>
  )
}
