'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Code2,
  Target,
  Trophy,
  Clock,
  Zap,
  CheckCircle,
  Play,
  BookOpen,
  ChevronRight,
  Search,
  Flame,
  Star,
  Users,
  Brain,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Difficulty = 'easy' | 'medium' | 'hard'
type Type = 'quiz' | 'coding'

interface Challenge {
  id: string
  title: string
  description: string
  type: Type
  difficulty: Difficulty
  xp: number
  timeLimit?: number
  solves: number
  acceptance: number
  tags: string[]
}

// Mock data - would come from API
const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    type: 'coding',
    difficulty: 'easy',
    xp: 50,
    solves: 1250,
    acceptance: 49,
    tags: ['Array', 'Hash Table'],
  },
  {
    id: '2',
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and data types.',
    type: 'quiz',
    difficulty: 'easy',
    xp: 25,
    timeLimit: 10,
    solves: 890,
    acceptance: 78,
    tags: ['JavaScript', 'Basics'],
  },
  {
    id: '3',
    title: 'Reverse Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    type: 'coding',
    difficulty: 'medium',
    xp: 100,
    solves: 620,
    acceptance: 72,
    tags: ['Linked List', 'Recursion'],
  },
  {
    id: '4',
    title: 'Python Data Structures Quiz',
    description: 'Advanced quiz covering lists, dictionaries, sets, and tuples in Python.',
    type: 'quiz',
    difficulty: 'medium',
    xp: 50,
    timeLimit: 15,
    solves: 445,
    acceptance: 65,
    tags: ['Python', 'Data Structures'],
  },
  {
    id: '5',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    type: 'coding',
    difficulty: 'hard',
    xp: 200,
    solves: 180,
    acceptance: 33,
    tags: ['String', 'Sliding Window', 'Hash Table'],
  },
  {
    id: '6',
    title: 'System Design Concepts Quiz',
    description: 'Test your understanding of system design principles and architecture patterns.',
    type: 'quiz',
    difficulty: 'hard',
    xp: 100,
    timeLimit: 20,
    solves: 92,
    acceptance: 45,
    tags: ['System Design', 'Architecture'],
  },
]

const difficultyConfig: Record<Difficulty, { label: string; color: string; bgColor: string }> = {
  easy: { label: 'Easy', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  hard: { label: 'Hard', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/20' },
}

const typeConfig: Record<Type, { label: string; icon: typeof Code2; color: string }> = {
  quiz: { label: 'Quiz', icon: Brain, color: 'text-violet-600' },
  coding: { label: 'Coding', icon: Code2, color: 'text-blue-600' },
}

export default function SpacesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<Type | 'all'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [search, setSearch] = useState('')
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    // Set a random daily challenge
    const codingChallenges = challenges.filter(c => c.type === 'coding')
    setDailyChallenge(codingChallenges[Math.floor(Math.random() * codingChallenges.length)])
  }, [])

  const filteredChallenges = challenges.filter((c) => {
    if (filter !== 'all' && c.type !== filter) return false
    if (difficulty !== 'all' && c.difficulty !== difficulty) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    totalSolved: 47,
    totalXP: 2850,
    currentStreak: 12,
    rank: 234,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Spaces</h1>
            <p className="text-muted-foreground">Practice coding and take AI-powered quizzes</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <span className="font-semibold text-amber-600">{stats.currentStreak} day streak</span>
            </div>
          </div>
        </header>

        {/* ── Stats Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSolved}</p>
                <p className="text-xs text-muted-foreground">Problems Solved</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total XP Earned</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Trophy className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">#{stats.rank}</p>
                <p className="text-xs text-muted-foreground">Global Rank</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Flame className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Daily Challenge ───────────────────────────────────────────── */}
        {dailyChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6"
          >
            <div className="absolute right-6 top-6">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Star className="mr-1 h-3 w-3 fill-amber-500" />
                Daily Challenge
              </Badge>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Coding Challenge</span>
                </div>
                <h2 className="mb-1 text-xl font-bold">{dailyChallenge.title}</h2>
                <p className="mb-3 max-w-xl text-sm text-muted-foreground">{dailyChallenge.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={difficultyConfig[dailyChallenge.difficulty].bgColor}>
                    <span className={difficultyConfig[dailyChallenge.difficulty].color}>
                      {difficultyConfig[dailyChallenge.difficulty].label}
                    </span>
                  </Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-amber-500" /> +{dailyChallenge.xp} XP
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" /> {dailyChallenge.solves.toLocaleString()} solves
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" /> {dailyChallenge.acceptance}% acceptance
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/student/spaces/${dailyChallenge.id}`)}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  View Solution
                </Button>
                <Button onClick={() => router.push(`/student/spaces/${dailyChallenge.id}`)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Challenge
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push('/daily-quiz')}
          >
            <Brain className="h-6 w-6 text-violet-500" />
            <span className="text-sm font-medium">Daily Quiz</span>
            <span className="text-xs text-muted-foreground">+10-30 XP</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => {
              setFilter('quiz')
              setDifficulty('medium')
            }}
          >
            <Target className="h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium">Practice Quiz</span>
            <span className="text-xs text-muted-foreground">AI Generated</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => setFilter('coding')}
          >
            <Code2 className="h-6 w-6 text-emerald-500" />
            <span className="text-sm font-medium">Code Challenge</span>
            <span className="text-xs text-muted-foreground">15+ Languages</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => router.push('/ide')}
          >
            <BookOpen className="h-6 w-6 text-amber-500" />
            <span className="text-sm font-medium">Open IDE</span>
            <span className="text-xs text-muted-foreground">Code Sandbox</span>
          </Button>
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex rounded-lg border border-border bg-card p-1">
              {(['all', 'quiz', 'coding'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                    filter === type
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type === 'all' ? 'All' : typeConfig[type].label}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
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
                  {diff === 'all' ? 'All Levels' : difficultyConfig[diff].label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:w-64"
            />
          </div>
        </div>

        {/* ── Challenge List ────────────────────────────────────────────── */}
        <div className="space-y-3">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge, i) => {
              const TypeIcon = typeConfig[challenge.type].icon
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/student/spaces/${challenge.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className={cn('rounded-lg bg-secondary p-2', typeConfig[challenge.type].color)}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold truncate">{challenge.title}</h3>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', difficultyConfig[challenge.difficulty].bgColor)}
                        >
                          <span className={difficultyConfig[challenge.difficulty].color}>
                            {difficultyConfig[challenge.difficulty].label}
                          </span>
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{challenge.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {challenge.timeLimit && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {challenge.timeLimit} min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-500" /> +{challenge.xp} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {challenge.solves.toLocaleString()} solves
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" /> {challenge.acceptance}% acceptance
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )
            })
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 font-semibold">No challenges found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search term
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
