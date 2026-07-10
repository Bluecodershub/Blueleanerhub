'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Loader2,
  TrendingUp,
  Target,
  ArrowRight,
  BookOpen,
  Brain,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface AdaptiveState {
  mastery_pct: number
  current_streak: number
  recommendations: Array<{
    id: string
    kind: 'lesson' | 'quiz' | 'exercise'
    title: string
    reason: string
    href: string
    difficulty: 'easy' | 'medium' | 'hard'
  }>
  weak_topics: Array<{ topic: string; mastery_pct: number; suggested_href: string }>
  next_review: Array<{ topic: string; due_at: string }>
}

const DIFF: Record<string, string> = {
  easy: 'bg-success-light text-success',
  medium: 'bg-primary/10 text-primary',
  hard: 'bg-destructive/10 text-destructive',
}

export default function AdaptiveLearningPage() {
  const [state, setState] = useState<AdaptiveState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/adaptive-learning/state')
      .then((r) => setState(r.data?.data ?? r.data))
      .catch(() => setState(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          Adaptive <span className="text-primary">Learning</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalised recommendations from what you&apos;ve got wrong, half-known, and
          scheduled for spaced-review.
        </p>
      </header>

      {state && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Mastery
              </div>
              <p className="text-3xl font-bold text-primary">{state.mastery_pct}%</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${state.mastery_pct}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> Streak
              </div>
              <p className="text-3xl font-bold">{state.current_streak}d</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Daily practice keeps mastery from decaying.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <Target className="h-3 w-3" /> Reviews due
              </div>
              <p className="text-3xl font-bold">{state.next_review?.length ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Spaced-repetition items scheduled for today.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {state?.recommendations && state.recommendations.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
            For you right now
          </h2>
          <ul className="space-y-3">
            {state.recommendations.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {r.kind === 'lesson' ? (
                          <BookOpen className="h-5 w-5" />
                        ) : (
                          <Brain className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">{r.title}</h3>
                          <Badge className={`border-none text-[10px] uppercase ${DIFF[r.difficulty]}`}>
                            {r.difficulty}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
                      </div>
                    </div>
                    <Link href={r.href}>
                      <Button size="sm">
                        Start <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {state?.weak_topics && state.weak_topics.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
            Weak areas
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {state.weak_topics.map((w) => (
              <Card key={w.topic}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{w.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      Mastery: {w.mastery_pct}%
                    </p>
                    <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-destructive"
                        style={{ width: `${w.mastery_pct}%` }}
                      />
                    </div>
                  </div>
                  <Link href={w.suggested_href}>
                    <Button variant="outline" size="sm">
                      Improve
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
