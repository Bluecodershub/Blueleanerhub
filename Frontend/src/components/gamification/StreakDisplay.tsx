'use client'

import { motion } from 'framer-motion'
import { Flame, Shield } from 'lucide-react'

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  hasStreakProtection?: boolean
  compact?: boolean
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  hasStreakProtection = false,
  compact = false,
}: StreakDisplayProps) {
  const streakLevel =
    currentStreak >= 30
      ? 'legendary'
      : currentStreak >= 14
        ? 'epic'
        : currentStreak >= 7
          ? 'great'
          : currentStreak >= 3
            ? 'good'
            : 'start'

  const streakColors = {
    start: 'text-muted-foreground',
    good: 'text-foreground/70',
    great: 'text-foreground/80',
    epic: 'text-[var(--streak-orange)]',
    legendary: 'text-red-500',
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="streak-flame">
          <Flame className={`h-5 w-5 ${streakColors[streakLevel]}`} />
        </div>
        <span className={`text-sm font-bold ${streakColors[streakLevel]}`}>{currentStreak}</span>
        {hasStreakProtection && <Shield className="h-3.5 w-3.5 text-[var(--achievement-cyan)]" />}
      </div>
    )
  }

  return (
    <div className="bg-[var(--streak-orange)]/5 border-[var(--streak-orange)]/15 flex items-center gap-4 rounded-2xl border p-4">
      <div className="streak-flame">
        <motion.div
          animate={
            currentStreak > 0
              ? {
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Flame className={`h-8 w-8 ${streakColors[streakLevel]}`} />
        </motion.div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-heading text-2xl font-black">{currentStreak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
          {hasStreakProtection && (
            <span className="bg-[var(--achievement-cyan)]/10 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-[var(--achievement-cyan)]">
              <Shield className="h-3 w-3" /> Protected
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">Best: {longestStreak} days</p>
      </div>
    </div>
  )
}
