'use client'

import { useEffect, useState } from 'react'
import { Trophy, Loader2, Star, Zap, Award } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Badge {
  id: number
  slug: string
  name: string
  description: string
  icon?: string
  earned_at?: string
  progress?: number
  target?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}
interface Summary {
  xp: number
  level: number
  next_level_xp: number
  streak_days: number
  rank_percentile?: number
}

const RARITY: Record<string, string> = {
  common: 'bg-secondary text-muted-foreground',
  rare: 'bg-blue-500/10 text-blue-500',
  epic: 'bg-purple-500/10 text-purple-500',
  legendary: 'bg-amber-500/10 text-amber-500',
}

export default function AchievementsPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/gamification/summary').catch(() => ({ data: null })),
      api.get('/gamification/badges').catch(() => ({ data: [] })),
    ])
      .then(([s, b]) => {
        setSummary(s.data?.data ?? s.data)
        setBadges(b.data?.data ?? b.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const earned = badges.filter((b) => !!b.earned_at)
  const inProgress = badges.filter(
    (b) => !b.earned_at && typeof b.progress === 'number' && typeof b.target === 'number',
  )
  const locked = badges.filter(
    (b) => !b.earned_at && (typeof b.progress !== 'number' || typeof b.target !== 'number'),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const pctToNextLevel = summary
    ? Math.min(100, Math.round((summary.xp / (summary.next_level_xp || 1)) * 100))
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <h1 className="text-3xl md:text-4xl">
          Your <span className="text-primary">Achievements</span>
        </h1>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{summary?.level ?? '—'}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Level</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="mx-auto mb-2 h-6 w-6 text-amber-500" />
              <p className="text-2xl font-bold">
                {summary?.xp?.toLocaleString() ?? 0}
              </p>
              <p className="text-[10px] uppercase text-muted-foreground">XP</p>
              {summary && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pctToNextLevel}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="mx-auto mb-2 h-6 w-6 text-success" />
              <p className="text-2xl font-bold">{earned.length}</p>
              <p className="text-[10px] uppercase text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{summary?.streak_days ?? 0}d</p>
              <p className="text-[10px] uppercase text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
            Earned ({earned.length})
          </h2>
          {earned.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                Complete lessons and quizzes to earn your first badge.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {earned.map((b) => (
                <Card key={b.id}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <Trophy className="h-6 w-6 text-primary" />
                      {b.rarity && (
                        <Badge
                          className={`border-none text-[10px] uppercase ${RARITY[b.rarity]}`}
                        >
                          {b.rarity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                    {b.earned_at && (
                      <p className="text-[10px] text-muted-foreground">
                        Earned {new Date(b.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {inProgress.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
              In progress ({inProgress.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {inProgress.map((b) => {
                const pct = Math.min(100, Math.round(((b.progress ?? 0) / (b.target ?? 1)) * 100))
                return (
                  <Card key={b.id} className="opacity-90">
                    <CardContent className="space-y-2 p-5">
                      <div className="flex items-center justify-between">
                        <Trophy className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                      <div className="h-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {b.progress} / {b.target}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {locked.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
              Locked ({locked.length})
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {locked.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-dashed border-border p-3 text-center opacity-50"
                >
                  <Trophy className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xs font-semibold">{b.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
