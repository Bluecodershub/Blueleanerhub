'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Zap, RefreshCw, Loader2, Crown, Medal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

type Period = 'all-time' | 'monthly' | 'weekly'

interface LeaderEntry {
  rank: number
  id: string
  name: string
  xp: number
  level: number
  streak: number
  longestStreak: number
}

const RANK_STYLES: Record<number, { bg: string; text: string; icon: typeof Crown }> = {
  1: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', icon: Crown },
  2: { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', icon: Medal },
  3: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', icon: Medal },
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [period, setPeriod] = useState<Period>('all-time')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get(`/gamification/leaderboard?period=${period}&limit=50`)
      setEntries(r.data.data ?? [])
    } catch {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { load() }, [load])

  const topThree = entries.slice(0, 3)
  const rest = entries.slice(3)
  const myRank = user ? entries.find(e => e.id === user.id || e.id === (user as any)._id) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Global Rankings</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Top learners ranked by XP earned</p>
          </div>
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList>
          <TabsTrigger value="all-time">All Time</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Your Rank Banner */}
      {myRank && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              #{myRank.rank}
            </div>
            <div>
              <p className="font-semibold text-foreground">Your Rank</p>
              <p className="text-xs text-muted-foreground font-mono">{myRank.xp.toLocaleString()} XP · Level {myRank.level}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-primary">You</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No rankings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Complete quizzes and challenges to appear on the leaderboard.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Reorder: 2nd, 1st, 3rd for podium effect on larger screens */}
              {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((entry) => {
                const style = RANK_STYLES[entry.rank] ?? {}
                const isFirst = entry.rank === 1
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: entry.rank * 0.1 }}
                    className={cn(
                      'relative rounded-xl border p-5 text-center',
                      style.bg ?? 'bg-card border-border',
                      isFirst && 'sm:-mt-4 sm:shadow-lg'
                    )}
                  >
                    {isFirst && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Crown className="h-8 w-8 text-amber-400 fill-amber-400/30" />
                      </div>
                    )}
                    <div className={cn('mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold', style.bg ?? 'bg-muted', style.text ?? 'text-foreground')}>
                      {entry.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <p className="font-semibold text-foreground truncate">{entry.name}</p>
                    <p className={cn('text-lg font-bold font-mono mt-1', style.text ?? 'text-foreground')}>
                      #{entry.rank}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        {entry.xp.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        {entry.streak}d
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Level {entry.level}</p>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Remaining Entries */}
          {rest.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {['Rank', 'Player', 'XP', 'Level', 'Streak'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rest.map((entry, i) => {
                    const isMe = entry.id === user?.id || entry.id === (user as any)?._id
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={cn(
                          'hover:bg-secondary/20 transition-colors',
                          isMe && 'bg-primary/5 border-l-2 border-primary'
                        )}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-muted-foreground">#{entry.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {entry.name?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className={cn('font-medium', isMe && 'text-primary')}>
                              {entry.name} {isMe && <span className="text-xs font-mono text-primary">(you)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 font-mono font-bold text-amber-500">
                            <Zap className="h-3 w-3" />
                            {entry.xp.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-foreground">{entry.level}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-orange-500 font-mono">
                            <Flame className="h-3 w-3" />
                            {entry.streak}d
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
