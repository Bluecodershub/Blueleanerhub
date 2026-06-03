'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Plus,
  Search,
  Globe,
  Lock,
  TrendingUp,
  Users,
  Code2,
  Folder,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import RepoCard from '@/components/devportal/RepoCard'
import { reposAPI } from '@/lib/api-civilization'
import { useAuth } from '@/hooks/useAuth'

const MOCK_REPOS = [
  {
    id: 1,
    ownerSlug: 'arjun-sharma',
    slug: 'neural-network-from-scratch',
    name: 'neural-network-from-scratch',
    description:
      'Building a deep neural network using only NumPy. Educational implementation with detailed comments.',
    language: 'Python',
    visibility: 'public' as const,
    starCount: 128,
    forkCount: 34,
    topics: ['machine-learning', 'deep-learning', 'numpy', 'education'],
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 2,
    ownerSlug: 'priya-mechanical',
    slug: 'fem-analysis-tool',
    name: 'fem-analysis-tool',
    description:
      'Finite Element Method solver for 2D structural problems. Supports truss, beam, and frame elements.',
    language: 'Python',
    visibility: 'public' as const,
    starCount: 67,
    forkCount: 18,
    topics: ['civil-engineering', 'fem', 'structural-analysis'],
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 3,
    ownerSlug: 'rahul-finance',
    slug: 'dcf-valuation-model',
    name: 'dcf-valuation-model',
    description:
      'Discounted Cash Flow valuation model with Monte Carlo simulation for uncertainty analysis.',
    language: 'Python',
    visibility: 'public' as const,
    starCount: 89,
    forkCount: 22,
    topics: ['finance', 'valuation', 'monte-carlo'],
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
]

const TRENDING = [
  { name: 'circuit-simulator', stars: 342, lang: 'JavaScript' },
  { name: 'thermal-analysis', stars: 201, lang: 'Python' },
  { name: 'algo-visualizer', stars: 567, lang: 'TypeScript' },
]

export default function DevPortalPage() {
  const { user } = useAuth()
  const [repos, setRepos] = useState(MOCK_REPOS as any[])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')

  useEffect(() => {
    if (!user?.fullName) {
      return
    }
    const username = user.fullName.toLowerCase().replace(/\s+/g, '-')
    reposAPI
      .getUserRepos(username)
      .then((d: any) => {
        const list = d?.data ?? d
        if (Array.isArray(list) && list.length > 0) setRepos(list)
      })
      .catch(() => {})
  }, [user?.fullName])

  const filtered = repos.filter((r) => {
    const matchSearch = !search || r.name.includes(search) || r.description?.includes(search)
    const matchFilter = filter === 'all' || r.visibility === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card to-background px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium uppercase tracking-wider text-purple-400">
                Developer Portal
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Your Code Universe</h1>
            <p className="mt-2 max-w-xl text-gray-400">
              Host projects, collaborate on code, submit to hackathons, build your engineering
              portfolio.
            </p>
          </motion.div>

          <div className="mt-6 flex flex-wrap gap-6">
            {[
              { label: 'Repositories', value: '48,200', icon: Folder, color: 'text-purple-400' },
              { label: 'Developers', value: '12,800', icon: Users, color: 'text-blue-400' },
              { label: 'Stars Given', value: '220K', icon: Star, color: 'text-foreground/70' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="font-bold">{value}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Controls */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a repository..."
                  className="border-border bg-secondary pl-9 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'public', 'private'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      filter === f
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f === 'private' && <Lock className="h-3 w-3" />}
                    {f === 'public' && <Globe className="h-3 w-3" />}
                    {f}
                  </button>
                ))}
                <Link href="/dev/new">
                  <Button size="sm" className="ml-1 gap-1.5 bg-primary/90 hover:bg-primary">
                    <Plus className="h-3.5 w-3.5" /> New
                  </Button>
                </Link>
              </div>
            </div>

            {/* Repo list */}
            <div className="flex flex-col gap-3">
              {filtered.map((repo, i) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <RepoCard {...repo} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-4 md:w-60">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-foreground">Trending Today</span>
                </div>
                {TRENDING.map((r, i) => (
                  <div
                    key={r.name}
                    className="flex items-center gap-2 border-b border-border py-2 last:border-0"
                  >
                    <span className="w-4 text-xs font-bold text-muted-foreground/50">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-blue-400">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.lang}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-foreground/70">
                      <Star className="h-3 w-3" />
                      {r.stars}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Your Profile</p>
                <Link href="/dev/me">
                  <Button
                    variant="outline"
                    className="w-full border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    View Developer Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
