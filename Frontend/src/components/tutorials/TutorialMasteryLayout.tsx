'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Play,
  CheckCircle2,
  Share2,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Lesson {
  id: string
  title: string
  completed: boolean
  active?: boolean
}

interface TutorialMasteryLayoutProps {
  children: React.ReactNode
  playground?: React.ReactNode
  sidebarTitle: string
  lessons: Lesson[]
  progress: number
}

export const TutorialMasteryLayout: React.FC<TutorialMasteryLayoutProps> = ({
  children,
  playground,
  sidebarTitle,
  lessons,
  progress,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(true)

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#f8fafc] dark:bg-background">
      {/* 1. Lesson Sidebar (Professional Learning Layout) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex shrink-0 flex-col border-r border-slate-200 bg-white dark:border-border dark:bg-card"
          >
            <div className="border-b border-slate-200 p-6 dark:border-border">
              <h2 className="mb-1 text-sm font-black uppercase tracking-widest text-foreground/90 dark:text-foreground/70">
                Course Content
              </h2>
              <h3 className="text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                {sidebarTitle}
              </h3>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                  <span>Overall Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-primary/10" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-4">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${
                      lesson.active
                        ? 'bg-primary text-black shadow-lg shadow-primary/15'
                        : 'text-muted-foreground hover:bg-slate-50 dark:text-muted-foreground dark:hover:bg-secondary'
                    }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle2
                        size={16}
                        className={lesson.active ? 'text-white' : 'text-foreground/80'}
                      />
                    ) : (
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${lesson.active ? 'border-white' : 'border-slate-300 dark:border-border'}`}
                      />
                    )}
                    <span className="text-sm font-bold tracking-tight">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. Main content area */}
      <main className="relative flex min-w-0 flex-1 flex-col bg-white dark:bg-background">
        {/* Sub-header */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/50 px-6 backdrop-blur-md dark:border-border dark:bg-background/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-secondary"
            >
              <Menu size={20} />
            </Button>
            <div className="h-4 w-px bg-slate-200 dark:border-border" />
            <span className="text-xs font-bold text-muted-foreground">
              Current: {lessons.find((l) => l.active)?.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-xs font-bold">
              <Share2 size={14} /> Share
            </Button>
            <Button
              onClick={() => setIsPlaygroundOpen(!isPlaygroundOpen)}
              className={`h-9 gap-2 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                isPlaygroundOpen
                  ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-secondary dark:text-white'
                  : 'bg-primary text-black hover:bg-primary/90'
              }`}
            >
              <Play size={14} className={isPlaygroundOpen ? '' : 'fill-current'} />
              {isPlaygroundOpen ? 'Close Playground' : 'Try it Yourself'}
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex min-h-0 flex-1">
          <div className="custom-scrollbar flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-8 py-12">
              <motion.article
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose dark:prose-invert prose-blue prose-headings:font-black 
                  prose-headings:tracking-tighter prose-h1:text-4xl
                  prose-h1:mb-8 prose-p:text-lg
                  prose-p:leading-relaxed prose-p:text-muted-foreground dark:prose-p:text-foreground/80 prose-strong:text-slate-900
                  dark:prose-strong:text-white max-w-none"
              >
                {children}
              </motion.article>

              {/* Lesson Nav Footer */}
              <div className="mt-20 flex items-center justify-between border-t border-slate-200 pt-10 dark:border-border">
                <Button variant="outline" className="h-12 gap-2 rounded-2xl px-6 font-bold">
                  <ChevronLeft size={18} /> Previous
                </Button>
                <Button className="h-12 gap-2 rounded-2xl bg-primary px-10 font-black italic tracking-tighter text-black shadow-lg shadow-primary/15 hover:bg-primary/90">
                  Next Chapter <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Interactive Playground (Integrated IDE) */}
          <AnimatePresence>
            {isPlaygroundOpen && playground && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex flex-col border-l border-slate-200 bg-[#0f172a] dark:border-border"
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#0f172a] px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Live Playground
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-white/40 hover:text-white"
                    >
                      <Maximize2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPlaygroundOpen(false)}
                      className="h-8 w-8 rounded-lg text-white/40 hover:text-white"
                    >
                      <Minimize2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">{playground}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
