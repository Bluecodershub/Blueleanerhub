// src/components/dashboard/StreakCounter.tsx

'use client'

import { motion } from 'framer-motion'

interface StreakCounterProps {
  currentStreak: number
}

export default function StreakCounter({ currentStreak }: StreakCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="dark:from-muted/60/30 dark:to-muted/30/30 flex items-center gap-3 rounded-lg bg-gradient-to-r from-muted to-muted/60 px-6 py-4"
    >
      <span className="animate-pulse text-4xl">🔥</span>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
        <p className="text-2xl font-bold text-foreground/80 dark:text-foreground/70">
          {currentStreak} days
        </p>
      </div>
    </motion.div>
  )
}
