'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, Zap, Flame, TrendingUp, Loader2, RefreshCw,
  Crown, Medal, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Period = 'weekly' | 'monthly' | 'all-time'

interface LeaderboardEntry {
  rank: number
  userId: string
  fullName: string
  totalPoints: number
  level: number
  domain?: string
  avatarConfig?: Record<string, any>
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'weekly',   label: 'This Week' },
  { value: 'monthly',  label: 'This Month' },
  { value: 'all-time', label: 'All Time' },
]

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ElementType }> = {
  1: { bg: 'bg-amber-500/10 border-amber-500/30',   text: 'text-amber-400',  icon: Crown },
  2: { bg: 'bg-slate-400/10 border-slate-400/30',   text: 'text-slate-300',  icon: Medal },
  3: { bg: 'bg-amber-700/10 border-amber-700/30',   text: 'text-amber-600',  icon: Medal },
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all-time')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = async (p: Period) => {
    setLoading(true)
    try {
      const res = await api.get(`/gamification/leaderboard?period=${p}&limit=50`)
      const raw: any[] = res.data?.data ?? []
      const mapped: LeaderboardEntry[] = raw.map((e, i) => ({
        rank: e.rank ?? i + 1,
        userId: e.userId ?? e._id ?? '',
        fullName: e.fullName ?? e.name ?? 'Anonymous',
        totalPoints: e.totalPoints ?? e.xp ?? e.points ?? 0,
        level: e.level ?? 1,
        domain: e.domain,
        avatarConfig: e.avatarConfig,
      }))
      setEntries(mapped)
    } catch {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(period) }, [period])

  const top3 = entries.slice(0, 3)
  const rest  = entries.slice(3)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Global Rankings</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Top learners ranked by XP. Keep grinding to climb the ranks!</p>
        </div>

        {/* Period tabs */}
        <div className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card p-1">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={cn(
                'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                period === value
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-amber-500/10 p-5 mb-4">
              <Trophy className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No data yet</h3>
            <p className="text-sm text-muted-foreground">Complete quizzes and challenges to earn XP and appear on the leaderboard.</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div className="flex items-end justify-center gap-4">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry) => {
                  if (!entry) return null
                  const style = RANK_STYLES[entry.rank] ?? { bg: 'bg-card', text: 'text-foreground', icon: Star }
                  const Icon = style.icon
                  const heights: Record<number, string> = { 1: 'h-32', 2: 'h-24', 3: 'h-20' }
                  return (
                    <motion.div key={entry.userId}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: entry.rank * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl font-bold', style.bg, style.text)}>
                        {entry.fullName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground text-sm max-w-[80px] truncate">{entry.fullName.split(' ')[0]}</p>
                        <div className="flex items-center gap-1 justify-center">
                          <Zap className="h-3 w-3 text-amber-400" />
                          <span className="text-xs font-mono font-bold text-amber-400">{entry.totalPoints.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className={cn('flex items-center justify-center rounded-lg border px-3 text-xs font-bold font-mono', heights[entry.rank] ?? 'h-16', style.bg, style.text)}>
                        <div className="flex flex-col items-center gap-1">
                          <Icon className="h-5 w-5" />
                          <span>#{entry.rank}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Full list */}
            <div className="space-y-2">
              {entries.map((entry, i) => {
                const style = RANK_STYLES[entry.rank]
                return (
                  <motion.div key={entry.userId}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-sm',
                      style ? cn(style.bg) : 'border-border bg-card hover:border-primary/20'
                    )}
                  >
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold font-mono shrink-0', style ? style.text : 'text-muted-foreground')}>
                      #{entry.rank}
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground font-bold shrink-0">
                      {entry.fullName?.[0]?.toUpperCase() ?? '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{entry.fullName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px] font-mono capitalize">{entry.domain ?? 'Learner'}</Badge>
                        <span className="text-xs text-muted-foreground">Lv.{entry.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span className="font-mono font-bold text-foreground">{entry.totalPoints.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">XP</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* CTA */}
            <div className="text-center space-y-3 pt-4">
              <p className="text-sm text-muted-foreground">Want to climb higher? Earn XP by completing quizzes, tracks, and hackathons.</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/daily-quiz">
                  <Button variant="outline" className="gap-2">
                    <Star className="h-4 w-4 text-amber-500" /> Daily Quiz
                  </Button>
                </Link>
                <Link href="/hackathons">
                  <Button className="gap-2">
                    <Trophy className="h-4 w-4" /> Join Hackathon
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
