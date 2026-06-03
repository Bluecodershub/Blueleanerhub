'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

const PARTICLE_COLORS = ['#fbbf24', '#60a5fa', '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee']

function XPParticles({ burst }: { burst: boolean }) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([])

  useEffect(() => {
    if (burst) {
      setParticles(
        Array.from({ length: 12 }, (_, i) => ({
          id: i,
          x: (Math.random() - 0.5) * 80,
          y: -(20 + Math.random() * 40),
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        }))
      )
      const timer = setTimeout(() => setParticles([]), 1200)
      return () => clearTimeout(timer)
    }
  }, [burst])

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute"
          style={{ left: '100%', top: '50%' }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

interface XPProgressBarProps {
  currentXP: number
  nextLevelXP: number
  level: number
  compact?: boolean
}

export function XPProgressBar({
  currentXP,
  nextLevelXP,
  level,
  compact = false,
}: XPProgressBarProps) {
  const percentage = Math.min((currentXP / nextLevelXP) * 100, 100)
  const [showBurst, setShowBurst] = useState(false)
  const isNearLevelUp = percentage >= 95

  useEffect(() => {
    if (percentage >= 100) {
      setShowBurst(true)
      const timer = setTimeout(() => setShowBurst(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [percentage])

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="level-badge text-xs">LV {level}</span>
        <div className="xp-bar relative flex-1">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
          <XPParticles burst={showBurst} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {currentXP}/{nextLevelXP}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            className="level-badge"
            animate={showBurst ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            Level {level}
          </motion.span>
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Zap className="h-4 w-4 text-[var(--xp-gold)]" />
            <span className="text-foreground">{currentXP.toLocaleString()} XP</span>
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {(nextLevelXP - currentXP).toLocaleString()} XP to Level {level + 1}
        </span>
      </div>
      <div className="xp-bar relative h-3">
        <motion.div
          className={`xp-bar-fill ${isNearLevelUp ? 'xp-bar-fill-pulse' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        />
        <XPParticles burst={showBurst} />
      </div>
    </div>
  )
}
