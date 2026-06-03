'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy, Users, Briefcase, ArrowUpRight, Plus, Star,
  Loader2, RefreshCw, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DashStats {
  jobsPosted: number
  hackathonsHosted: number
  totalCandidates: number
  hackathonParticipants: number
}

interface Hackathon {
  _id: string
  name: string
  status: string
  startDate: string
  endDate: string
  prizePool?: number
  participantCount: number
}

interface Candidate {
  _id: string
  fullName: string
  email: string
  totalPoints: number
  level: number
  domain?: string
  skills?: string[]
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT:     'bg-muted/50 text-muted-foreground border-border',
  PUBLISHED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

export default function CorporateDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [statsRes, hackRes, candRes] = await Promise.all([
        api.get('/corporate/dashboard/stats'),
        api.get('/corporate/hackathons'),
        api.get('/corporate/candidates?limit=5'),
      ])
      setStats(statsRes.data.data)
      setHackathons((hackRes.data.data ?? []).slice(0, 4))
      setCandidates(candRes.data.data?.candidates ?? [])
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const statCards = stats ? [
    { label: 'Jobs Posted',         value: stats.jobsPosted,           icon: Briefcase, color: 'bg-primary/10',        iconColor: 'text-primary',      href: '/corporate/jobs' },
    { label: 'Hackathons Hosted',   value: stats.hackathonsHosted,     icon: Trophy,    color: 'bg-amber-500/10',      iconColor: 'text-amber-500',    href: '/corporate/hackathons' },
    { label: 'Hackathon Participants', value: stats.hackathonParticipants, icon: Users, color: 'bg-emerald-500/10',    iconColor: 'text-emerald-500',  href: '/corporate/candidates' },
    { label: 'Job Applicants',      value: stats.totalCandidates,      icon: Zap,       color: 'bg-violet-500/10',     iconColor: 'text-violet-500',   href: '/corporate/jobs' },
  ] : []

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your hiring.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Link href="/corporate/hackathons/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Hackathon
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', s.color)}>
                    <s.icon className={cn('h-5 w-5', s.iconColor)} />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold font-mono">{s.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hackathons */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Hackathons</CardTitle>
              <Link href="/corporate/hackathons">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {hackathons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Trophy className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No hackathons yet</p>
                  <Link href="/corporate/hackathons/new" className="mt-3">
                    <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create one</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {hackathons.map((h) => (
                    <div key={h._id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{h.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase', STATUS_STYLES[h.status] ?? 'text-muted-foreground')}>
                              {h.status}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" /> {h.participantCount}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {h.prizePool != null && (
                          <p className="font-semibold text-primary text-sm">
                            ${h.prizePool.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {new Date(h.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Candidates */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Top Candidates</CardTitle>
              <Link href="/corporate/candidates">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No participants yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Host a hackathon to discover talent</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidates.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/30 transition-colors">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {c.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{c.fullName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-mono font-bold">{c.totalPoints.toLocaleString()} XP</span>
                          <span className="text-xs text-muted-foreground">· Lv {c.level}</span>
                        </div>
                      </div>
                      {c.domain && (
                        <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                          {c.domain}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Post a Job',          href: '/corporate/jobs',           icon: Briefcase },
                { label: 'Create Hackathon',    href: '/corporate/hackathons/new', icon: Trophy },
                { label: 'Browse Candidates',   href: '/corporate/candidates',     icon: Users },
                { label: 'AI Resume Screening', href: '/corporate/ai-screening',   icon: Zap },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium hover:bg-secondary/50 transition-colors">
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
