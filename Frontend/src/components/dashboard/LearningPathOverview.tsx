'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface Lesson {
  id: string
  title: string
  isCompleted: boolean
  isUnlocked: boolean
}

interface Path {
  id: string
  title: string
  domain: string
  progress: number
  totalLessons: number
  currentLesson: string
  lessons: Lesson[]
}

const activePaths: Path[] = [
  {
    id: '1',
    title: 'Advanced Machine Learning',
    domain: 'Computer Science',
    progress: 35,
    totalLessons: 12,
    currentLesson: 'Transformer Architecture',
    lessons: [
      { id: 'l1', title: 'Introduction to Transformers', isCompleted: true, isUnlocked: true },
      { id: 'l2', title: 'Self-Attention Mechanisms', isCompleted: true, isUnlocked: true },
      { id: 'l3', title: 'Transformer Architecture', isCompleted: false, isUnlocked: true },
      { id: 'l4', title: 'BERT vs GPT', isCompleted: false, isUnlocked: false },
    ],
  },
  {
    id: '2',
    title: 'Mechanical Statics & Dynamics',
    domain: 'Mechanical',
    progress: 15,
    totalLessons: 20,
    currentLesson: 'Vector Equilibrium',
    lessons: [
      { id: 'm1', title: 'Forces in 2D', isCompleted: true, isUnlocked: true },
      { id: 'm2', title: 'Vector Equilibrium', isCompleted: false, isUnlocked: true },
      { id: 'm3', title: 'Friction Analysis', isCompleted: false, isUnlocked: false },
    ],
  },
]

export const LearningPathOverview = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-lg font-black">
          <BookOpen className="h-5 w-5 text-foreground/80" />
          Active Mastery Tracks
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs font-bold text-foreground/90 hover:text-foreground"
        >
          View All Paths
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {activePaths.map((path) => (
          <motion.div
            key={path.id}
            whileHover={{ y: -2 }}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 transition-all dark:border-border dark:bg-card dark:shadow-none"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/90 dark:text-foreground/70">
                  {path.domain} Mastery
                </span>
                <h4 className="text-lg font-black text-slate-900 transition-colors group-hover:text-foreground/80 dark:text-white">
                  {path.title}
                </h4>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-foreground/80">
                <Play size={20} className="fill-current" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="italic text-muted-foreground">Progress: {path.progress}%</span>
                  <span className="text-slate-900 dark:text-white">
                    {path.totalLessons} Lessons Total
                  </span>
                </div>
                <Progress value={path.progress} className="h-2 bg-primary/10" />
              </div>

              <div className="rounded-2xl border border-slate-200/50 bg-slate-50 p-3 dark:border-border/50 dark:bg-secondary/50">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Next Lesson
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-foreground/80">
                    {path.currentLesson}
                  </span>
                  <Button
                    size="sm"
                    className="h-8 rounded-xl bg-primary text-[10px] font-black uppercase italic tracking-widest hover:bg-primary/90"
                  >
                    Resume
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
