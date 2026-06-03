'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { generateAvatarURL } from '@/utils/generateAvatar'

interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  level: number
  avatar: string
  avatarConfig?: any
  trend: 'up' | 'down' | 'same'
  isCurrentUser?: boolean
}

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[]
  currentUserRank?: number
  totalUsers?: number
}

export function LeaderboardPreview({
  entries,
  currentUserRank,
  totalUsers,
}: LeaderboardPreviewProps) {
  const rankColors = ['text-[var(--xp-gold)]', 'text-gray-400', 'text-foreground']
  const rankBgs = ['bg-[var(--xp-gold)]/10', 'bg-gray-400/10', 'bg-primary/80/10']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[var(--xp-gold)]" />
          <h3 className="font-heading text-lg font-bold">Leaderboard</h3>
        </div>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          View All <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
              entry.isCurrentUser ? 'border border-primary/20 bg-primary/10' : 'hover:bg-muted/30'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                i < 3 ? `${rankBgs[i]} ${rankColors[i]}` : 'bg-muted text-muted-foreground'
              }`}
            >
              {entry.rank}
            </div>

            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-sm">
              {entry.avatarConfig ? (
                <img
                  src={generateAvatarURL(entry.avatarConfig)}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                entry.avatar
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-semibold ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}
              >
                {entry.name}{' '}
                {entry.isCurrentUser && (
                  <span className="text-xs text-muted-foreground">(You)</span>
                )}
              </p>
              <p className="font-mono text-xs text-muted-foreground">Level {entry.level}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {entry.xp.toLocaleString()}
              </span>
              {entry.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-blue-400" />}
              {entry.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
              {entry.trend === 'same' && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          </motion.div>
        ))}
      </div>

      {currentUserRank && totalUsers && (
        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            You're ranked <span className="font-bold text-primary">#{currentUserRank}</span> out of{' '}
            {totalUsers.toLocaleString()} learners
          </p>
        </div>
      )}
    </div>
  )
}
