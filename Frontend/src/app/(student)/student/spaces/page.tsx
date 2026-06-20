'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Code2,
  Flame,
  Loader2,
  Play,
  Search,
  Star,
  Target,
  Trophy,
  Zap,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LanguageBadge } from '@/components/ui/LanguageLogo'
import { cn } from '@/lib/utils'
import { RUNTIME_LANGUAGES } from '@/lib/languages'
import { spacesAPI } from '@/lib/api-civilization'

type Difficulty = 'easy' | 'medium' | 'hard'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  xp: number
  tags: string[]
  category?: string
  createdAt?: string
}

interface DailyChallenge {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  starterCode?: string
}

interface SpacesStats {
  totalSolved: number
  totalSubmissions: number
  passedSubmissions: number
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; bgColor: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  hard: { label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/20' },
}

function normalizeDifficulty(value: unknown): Difficulty {
  const key = String(value ?? 'easy').toLowerCase()
  if (key === 'medium') return 'medium'
  if (key === 'hard') return 'hard'
  return 'easy'
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'hard') return 120
  if (difficulty === 'medium') return 60
  return 30
}

function normalizeChallenge(raw: Record<string, unknown>): Challenge {
  const difficulty = normalizeDifficulty(raw.difficulty)
  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: String(raw.title ?? 'Untitled challenge'),
    description: String(raw.description ?? 'No description has been published for this challenge.'),
    difficulty,
    xp: Number(raw.points ?? pointsForDifficulty(difficulty)),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).filter(Boolean) : [],
    category: raw.category ? String(raw.category) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  }
}

function normalizeChallengeList(payload: unknown): Challenge[] {
  const raw = payload as { challenges?: unknown[]; data?: unknown[] } | unknown[] | undefined
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.challenges)
      ? raw.challenges
      : Array.isArray(raw?.data)
        ? raw.data
        : []

  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .map(normalizeChallenge)
    .filter((challenge) => Boolean(challenge.id))
}

function normalizeDaily(payload: unknown): DailyChallenge | null {
  const raw = (payload as { challenge?: Record<string, unknown> } | undefined)?.challenge
  if (!raw) return null
  const difficulty = normalizeDifficulty(raw.difficulty)
  return {
    id: String(raw._id ?? raw.id ?? ''),
    title: String(raw.title ?? 'Daily challenge'),
    description: String(raw.description ?? 'Open the daily challenge in the IDE.'),
    difficulty,
    starterCode: raw.starterCode ? String(raw.starterCode) : undefined,
  }
}

function normalizeStats(payload: unknown): SpacesStats {
  const data = payload as Partial<SpacesStats> | undefined
  return {
    totalSolved: Number(data?.totalSolved ?? 0),
    totalSubmissions: Number(data?.totalSubmissions ?? 0),
    passedSubmissions: Number(data?.passedSubmissions ?? 0),
  }
}

export default function SpacesPage() {
  const router = useRouter()
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [search, setSearch] = useState('')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [stats, setStats] = useState<SpacesStats>({ totalSolved: 0, totalSubmissions: 0, passedSubmissions: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSpaces() {
      setLoading(true)
      setError(null)
      const [challengeRes, statsRes, dailyRes] = await Promise.all([
        spacesAPI.listChallenges({ limit: '50' }),
        spacesAPI.getStats(),
        spacesAPI.getDaily(),
      ])

      if (!active) return

      if (challengeRes.error) {
        setError(challengeRes.error)
        setChallenges([])
      } else {
        setChallenges(normalizeChallengeList(challengeRes.data))
      }

      if (!statsRes.error) setStats(normalizeStats(statsRes.data))
      if (!dailyRes.error) setDailyChallenge(normalizeDaily(dailyRes.data))
      setLoading(false)
    }

    loadSpaces().catch((err) => {
      if (!active) return
      setError(err instanceof Error ? err.message : 'Failed to load spaces')
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge) => {
      if (difficulty !== 'all' && challenge.difficulty !== difficulty) return false
      if (!search) return true
      const query = search.toLowerCase()
      return (
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query) ||
        challenge.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [challenges, difficulty, search])

  const openDailyChallenge = () => {
    if (!dailyChallenge) return
    const params = new URLSearchParams({
      exercise: dailyChallenge.title,
      lang: 'python',
    })
    if (dailyChallenge.starterCode) params.set('code', dailyChallenge.starterCode)
    router.push(`/ide?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
        <header className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
              Coding spaces
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Practice with real runtime-backed challenges</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Spaces now loads challenges from the backend and routes code through the same execution layer used by the sandbox.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {RUNTIME_LANGUAGES.slice(0, 8).map((runtime) => (
              <LanguageBadge key={runtime.id} language={runtime.id} />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalSolved}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-amber-500/10 p-2">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalSubmissions}</p>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-sky-500/10 p-2">
                <Trophy className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{challenges.length}</p>
                <p className="text-xs text-muted-foreground">Live challenges</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-emerald-500/10 p-2">
                <Flame className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.passedSubmissions}</p>
                <p className="text-xs text-muted-foreground">Passed runs</p>
              </div>
            </div>
          </div>
        </div>

        {dailyChallenge && (
          <section className="rounded-lg border border-primary/20 bg-primary/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Daily challenge</span>
                </div>
                <h2 className="text-xl font-semibold">{dailyChallenge.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{dailyChallenge.description}</p>
                <Badge variant="outline" className={cn('mt-3 text-xs', difficultyConfig[dailyChallenge.difficulty].bgColor)}>
                  <span className={difficultyConfig[dailyChallenge.difficulty].color}>
                    {difficultyConfig[dailyChallenge.difficulty].label}
                  </span>
                </Badge>
              </div>
              <Button onClick={openDailyChallenge}>
                <Play className="mr-2 h-4 w-4" />
                Open in IDE
              </Button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push('/daily-quiz')}>
            <Brain className="h-6 w-6 text-sky-500" />
            <span className="text-sm font-medium">Daily quiz</span>
            <span className="text-xs text-muted-foreground">Backend quiz</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => setDifficulty('easy')}>
            <Target className="h-6 w-6 text-emerald-500" />
            <span className="text-sm font-medium">Easy set</span>
            <span className="text-xs text-muted-foreground">Start clean</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => setDifficulty('hard')}>
            <Code2 className="h-6 w-6 text-red-500" />
            <span className="text-sm font-medium">Hard set</span>
            <span className="text-xs text-muted-foreground">Deep practice</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 py-4" onClick={() => router.push('/ide')}>
            <BookOpen className="h-6 w-6 text-amber-500" />
            <span className="text-sm font-medium">Open IDE</span>
            <span className="text-xs text-muted-foreground">{RUNTIME_LANGUAGES.length} runtimes</span>
          </Button>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-lg border border-border bg-card p-1">
              {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    difficulty === diff
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {diff === 'all' ? 'All levels' : difficultyConfig[diff].label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search live challenges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 sm:w-72"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading challenges</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
              <h3 className="font-semibold">Spaces are unavailable</h3>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          ) : filteredChallenges.length > 0 ? (
            <div className="space-y-3">
              {filteredChallenges.map((challenge, i) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/student/spaces/${challenge.id}`}
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
                  >
                    <div className="rounded-md bg-secondary p-2 text-primary">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">{challenge.title}</h3>
                        <Badge variant="outline" className={cn('text-xs', difficultyConfig[challenge.difficulty].bgColor)}>
                          <span className={difficultyConfig[challenge.difficulty].color}>
                            {difficultyConfig[challenge.difficulty].label}
                          </span>
                        </Badge>
                        {challenge.category && <Badge variant="secondary" className="text-xs">{challenge.category}</Badge>}
                      </div>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{challenge.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" /> {challenge.xp} points
                        </span>
                        {challenge.tags.slice(0, 4).map((tag) => (
                          <span key={tag}>#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">No live challenges found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust your filters or publish exercises from the backend seed/admin tools.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
