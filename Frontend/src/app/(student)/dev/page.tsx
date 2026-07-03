'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Plus,
  Search,
  Globe,
  Lock,
  Code2,
  Folder,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import RepoCard from '@/components/devportal/RepoCard'
import { reposAPI } from '@/lib/api-civilization'
import { useAuth } from '@/hooks/useAuth'

/** Maps a raw Repository record into RepoCard props. */
function normalizeRepo(raw: any, ownerSlug: string) {
  return {
    id: raw._id ?? raw.id,
    ownerSlug,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    language: raw.language,
    visibility: (raw.visibility ?? 'public') as 'public' | 'private',
    starCount: raw.starCount ?? 0,
    forkCount: raw.forkCount ?? 0,
    topics: raw.topics ?? [],
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
  }
}

export default function DevPortalPage() {
  const { user } = useAuth()
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')

  useEffect(() => {
    const fullName = user?.fullName
    if (!fullName) {
      setLoading(false)
      return
    }
    let active = true
    // The backend resolves repositories by the owner's fullName.
    reposAPI
      .getUserRepos(encodeURIComponent(fullName))
      .then((d: any) => {
        if (!active) return
        const list = d?.data?.data ?? d?.data ?? d
        setRepos(Array.isArray(list) ? list.map((r: any) => normalizeRepo(r, fullName)) : [])
      })
      .catch(() => active && setRepos([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user?.fullName])

  const totalStars = repos.reduce((sum, r) => sum + (r.starCount ?? 0), 0)

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
              { label: 'Your Repositories', value: repos.length, icon: Folder, color: 'text-purple-400' },
              { label: 'Public', value: repos.filter((r) => r.visibility === 'public').length, icon: Globe, color: 'text-sky-400' },
              { label: 'Total Stars', value: totalStars, icon: Star, color: 'text-foreground/70' },
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
                        ? 'bg-primary text-primary-foreground'
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
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading repositories…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <Folder className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <h2 className="mb-1 text-sm font-semibold text-foreground">
                  {repos.length === 0 ? 'No repositories yet' : 'No repositories match your search'}
                </h2>
                <p className="mb-5 text-xs text-muted-foreground">
                  {repos.length === 0
                    ? 'Create your first repository to start building your engineering portfolio.'
                    : 'Try a different search or filter.'}
                </p>
                {repos.length === 0 && (
                  <Link href="/dev/new">
                    <Button size="sm" className="gap-1.5 bg-primary/90 hover:bg-primary">
                      <Plus className="h-3.5 w-3.5" /> New repository
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
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
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-4 md:w-60">
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
