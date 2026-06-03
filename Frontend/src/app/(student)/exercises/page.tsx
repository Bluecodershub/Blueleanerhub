'use client'

import { useState, useEffect, useMemo, useRef, startTransition } from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, Trophy, ChevronRight, Star, LayoutGrid, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { exercisesAPI, gamificationAPI } from '@/lib/api-civilization'
import { useAuth } from '@/hooks/useAuth'
import type { Exercise } from '@/types'
import { toast } from 'sonner'

const FALLBACK_CHALLENGES = [
  { id: 'c1', title: 'Self-Attention Mechanisms', domain: 'Computer Science', subDomain: 'Machine Learning', difficulty: 'Hard', points: 120, successRate: '68%', solved: true },
  { id: 'c2', title: 'Equilibrium of Rigid Bodies', domain: 'Mechanical', subDomain: 'Statics', difficulty: 'Medium', points: 60, successRate: '82%', solved: false },
  { id: 'c3', title: 'Operational Amplifiers Analysis', domain: 'Electrical', subDomain: 'Circuit Theory', difficulty: 'Hard', points: 120, successRate: '45%', solved: false },
  { id: 'c4', title: 'Supply Chain Optimization', domain: 'Management', subDomain: 'Operations', difficulty: 'Medium', points: 60, successRate: '75%', solved: true },
  { id: 'c5', title: 'Reinforced Concrete Design', domain: 'Civil', subDomain: 'Structures', difficulty: 'Hard', points: 150, successRate: '32%', solved: false },
]

const FALLBACK_DOMAINS = ['All Domains', 'Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Management']

const DIFF_COLOUR: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function ExerciseSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 rounded-xl bg-secondary" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-secondary" />
          <div className="h-5 w-56 rounded bg-secondary" />
          <div className="h-3 w-40 rounded bg-secondary" />
        </div>
      </div>
      <div className="h-14 w-14 rounded-xl bg-secondary" />
    </div>
  )
}

export default function ChallengeHub() {
  const { user } = useAuth()

  const [challenges, setChallenges] = useState<Exercise[]>(FALLBACK_CHALLENGES)
  const [domains, setDomains] = useState(FALLBACK_DOMAINS)
  const [activeDomain, setActiveDomain] = useState('All Domains')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [userXP, setUserXP] = useState(user?.totalPoints ?? 0)
  const [userLevel, setUserLevel] = useState(user?.level ?? 1)
  const loadingRef = useRef(true)

  useEffect(() => {
    loadingRef.current = true
    startTransition(() => { setLoading(true) })
    exercisesAPI.list({ sort })
      .then((response) => {
        if (!loadingRef.current) return
        if (response.error) { toast.error(response.error); return }
        const list = response.data ?? []
        if (Array.isArray(list) && list.length > 0) {
          setChallenges(list)
          const unique = ['All Domains', ...Array.from(new Set<string>(list.map((c) => c.domain).filter(Boolean)))]
          setDomains(unique)
        }
      })
      .catch(() => { toast.error('Failed to load exercises. Using fallback data.') })
      .finally(() => { if (loadingRef.current) setLoading(false) })
    return () => { loadingRef.current = false }
  }, [sort])

  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    gamificationAPI.leaderboard(50)
      .then((response) => {
        if (!mounted || response.error) return
        const raw = response.data ?? []
        const list = Array.isArray(raw) ? raw : []
        const me = list.find((u) => u.name === user.fullName || u.name === user.email)
        if (me) {
          setUserXP(me.xp ?? me.totalPoints ?? 0)
          setUserLevel(me.level ?? 1)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [user?.id, user?.fullName, user?.email])

  const visible = useMemo(() => {
    let list = challenges
    if (activeDomain !== 'All Domains') list = list.filter((c) => c.domain === activeDomain)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.domain?.toLowerCase().includes(q) || c.subDomain?.toLowerCase().includes(q))
    }
    return list
  }, [challenges, activeDomain, search])

  const solvedCount = challenges.filter((c) => c.solved).length

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12">
        <div className="absolute right-0 top-0 h-72 w-72 -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/5 blur-[100px]" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="outline" className="text-xs font-medium">
            Mastery Practice
          </Badge>
          <h1 className="text-3xl font-bold md:text-4xl">
            Coding Challenges
          </h1>
          <p className="text-base text-muted-foreground">
            Solve challenges across engineering and management disciplines. Earn points, climb the leaderboard, and build real skills.
          </p>
          <div className="flex gap-3 pt-2">
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Start Practicing
            </Button>
            <Link href="/hackathons">
              <Button variant="outline" className="gap-2">
                View Hackathons
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col items-stretch gap-4 rounded-xl border border-border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search challenges by name, domain, or topic..."
            className="h-11 rounded-lg border-0 bg-secondary pl-10 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => setActiveDomain(domain)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                activeDomain === domain
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge List */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              Challenges
              {!loading && <span className="text-sm font-normal text-muted-foreground">({visible.length})</span>}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="newest">Newest</option>
                <option value="points">Most Points</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ExerciseSkeleton key={i} />)
            ) : visible.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No challenges match your filters.
              </div>
            ) : (
              visible.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  whileHover={{ x: 4 }}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${challenge.solved ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {challenge.solved ? <Trophy size={20} /> : <Star size={20} />}
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{challenge.domain}</span>
                        {challenge.subDomain && (
                          <>
                            <span>·</span>
                            <span>{challenge.subDomain}</span>
                          </>
                        )}
                      </div>
                      <h4 className="font-semibold transition-colors group-hover:text-primary">
                        {challenge.title}
                      </h4>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap size={12} className="text-amber-500" /> {challenge.points} pts
                        </div>
                        <Badge className={`border text-[10px] font-semibold ${DIFF_COLOUR[challenge.difficulty] ?? 'bg-secondary text-foreground/70'}`}>
                          {challenge.difficulty}
                        </Badge>
                        {challenge.successRate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp size={12} className="text-emerald-500" /> {challenge.successRate} solve
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link href={`/exercises/${challenge.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${challenge.title}`}
                      className="h-10 w-10 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-1 w-full bg-primary" />
            <div className="p-6">
              <h3 className="mb-5 text-sm font-semibold">Your Stats</h3>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Trophy size={22} />
                </div>
                <div>
                  <p className="text-xl font-bold">Level {userLevel}</p>
                  <p className="text-xs text-muted-foreground">{userXP.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-medium">{challenges.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Solved</span>
                  <span className="font-medium">{solvedCount} / {challenges.length}</span>
                </div>
              </div>
              <Link href="/student/dashboard">
                <Button variant="outline" className="mt-5 w-full text-xs">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center">
            <div className="mb-3 mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Star size={22} />
            </div>
            <h4 className="mb-1 font-semibold">Coming Soon</h4>
            <p className="mb-4 text-xs text-muted-foreground">
              Real-time multiplayer coding battles
            </p>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Get Notified
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
