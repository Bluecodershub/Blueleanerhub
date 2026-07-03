'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CodingCharacter from '@/components/animations/characters/CodingCharacter'

interface DailyChallengeProps {
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xpReward: number
  category: string
  timeRemaining?: number
  completed?: boolean
  onStart?: () => void
}

export function DailyChallenge({
  title,
  description,
  difficulty,
  xpReward,
  category,
  timeRemaining = 0,
  completed = false,
  onStart,
}: DailyChallengeProps) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)

  useEffect(() => {
    if (timeRemaining <= 0) return
    const h = Math.floor(timeRemaining / 3600)
    const m = Math.floor((timeRemaining % 3600) / 60)
    setHours(h)
    setMinutes(m)

    const interval = setInterval(() => {
      const newTime = timeRemaining - Math.floor((Date.now() / 1000) % 86400)
      setHours(Math.floor(Math.max(0, newTime) / 3600))
      setMinutes(Math.floor((Math.max(0, newTime) % 3600) / 60))
    }, 60000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const difficultyColors = {
    Easy: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
  }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-primary/5 p-8 shadow-2xl shadow-primary/10 md:p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, borderColor: 'rgba(16, 185, 129, 0.4)' }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Decor */}
      <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-[60px]" />

      <div className="relative flex flex-col items-center gap-8 md:flex-row">
        {/* Character/Visual Side */}
        <div className="relative hidden flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 transition-colors group-hover:bg-primary/10 md:flex">
          <CodingCharacter size={120} />
          <div className="mt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">
              CHALLENGE_STATUS
            </p>
            <p className="text-xs font-bold text-white/40">
              {completed ? 'VERIFIED' : 'PENDING...'}
            </p>
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-full border border-border bg-primary/15 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-foreground/70" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                DAILY_REVENUE_CHALLENGE
              </span>
            </div>

            {!completed && timeRemaining > 0 && (
              <div className="flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-red-400">
                <Clock className="h-4 w-4 animate-pulse" />
                <span className="text-xs font-black tracking-widest">
                  {hours}H {minutes}M REMAINING
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-3xl font-black italic tracking-tighter text-white transition-colors group-hover:text-foreground/70 md:text-4xl">
              {title}
            </h4>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div
              className={`rounded-xl border-2 px-5 py-2 text-xs font-black italic tracking-widest ${difficultyColors[difficulty]}`}
            >
              {difficulty.toUpperCase()}
            </div>
            <div className="rounded-xl border border-border bg-secondary/50 px-5 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/60">
              {category}
            </div>
            <div className="ai-glow ml-auto flex items-center gap-2 text-xl font-black text-[var(--xp-gold)] md:ml-0">
              <Zap className="h-6 w-6 fill-current" />+{xpReward} XP
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4">
            {completed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/15 px-8 py-4 text-lg font-black italic tracking-tight text-foreground/70">
                <CheckCircle2 className="h-6 w-6" />
                CHALLENGE_SOLVED
              </div>
            ) : (
              <Button
                onClick={onStart}
                className="group/btn h-16 rounded-2xl bg-primary px-10 text-xl font-black italic tracking-tighter text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                SOLVE_NOW
                <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
              </Button>
            )}
            <p className="hidden max-w-[200px] text-xs font-bold italic text-white/20 lg:block">
              Complete this to maintain your 12-day streak and earn exclusive domain badges.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
