'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  status: 'locked' | 'unlocked' | 'new'
  unlockedAt?: string
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: 'sm' | 'md' | 'lg'
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  }

  return (
    <motion.div
      className="group flex cursor-pointer flex-col items-center gap-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`achievement-badge ${achievement.status} ${sizeClasses[size]}`}>
        {achievement.status === 'locked' ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : (
          <motion.span
            initial={achievement.status === 'new' ? { scale: 0, rotate: -45 } : {}}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {achievement.icon}
          </motion.span>
        )}
      </div>
      <div className="text-center">
        <p
          className={`text-xs font-semibold leading-tight ${achievement.status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}
        >
          {achievement.title}
        </p>
      </div>
    </motion.div>
  )
}

interface AchievementGridProps {
  achievements: Achievement[]
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">Achievements</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {achievements.filter((a) => a.status !== 'locked').length}/{achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-6">
        {achievements.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <AchievementBadge achievement={achievement} size="md" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
