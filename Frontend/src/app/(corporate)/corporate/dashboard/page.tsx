'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Trophy, Users, Briefcase, ArrowUpRight, Plus, Star,
  RefreshCw, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  AppPage,
  DashboardLoading,
  MetricCard,
  MetricGrid,
  PageHeader,
  PageState,
  SectionPanel,
} from '@/components/layout/AppPage'

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
  PUBLISHED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
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
    { label: 'Jobs posted', value: stats.jobsPosted, icon: Briefcase, tone: 'primary' as const, href: '/corporate/jobs', description: 'Open and historical roles' },
    { label: 'Hackathons hosted', value: stats.hackathonsHosted, icon: Trophy, tone: 'warning' as const, href: '/corporate/hackathons', description: 'Draft, active, and completed' },
    { label: 'Hackathon participants', value: stats.hackathonParticipants, icon: Users, tone: 'success' as const, href: '/corporate/candidates', description: 'Talent reached through events' },
    { label: 'Job applicants', value: stats.totalCandidates, icon: Zap, tone: 'info' as const, href: '/corporate/jobs', description: 'Candidates in hiring pipelines' },
  ] : []

  if (loading) {
    return <DashboardLoading />
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow="Hiring workspace"
        icon={Briefcase}
        title="Dashboard overview"
        description="Monitor hiring activity, hackathon participation, and candidate pipelines from one workspace."
        actions={
          <>
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link href="/corporate/hackathons/new">
              <Plus className="h-4 w-4" /> Create Hackathon
            </Link>
          </Button>
          </>
        }
      />

      <MetricGrid>
        {statCards.map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value.toLocaleString()}
            description={stat.description}
            icon={stat.icon}
            tone={stat.tone}
            href={stat.href}
          />
        ))}
      </MetricGrid>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionPanel
          className="lg:col-span-2"
          title="Your hackathons"
          description="Current events and their participation."
          action={
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/corporate/hackathons">
                  View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          }
        >
              {hackathons.length === 0 ? (
                <PageState
                  icon={Trophy}
                  title="No hackathons yet"
                  description="Create your first event to start building a verified talent pool."
                  action={{ label: 'Create hackathon', href: '/corporate/hackathons/new' }}
                />
              ) : (
                <div className="space-y-3">
                  {hackathons.map((h) => (
                    <div key={h._id} className="flex items-center justify-between gap-4 rounded-[8px] border border-border/80 p-4 transition-colors hover:bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[7px] border border-primary/20 bg-primary/[0.08]">
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
        </SectionPanel>

        <div className="space-y-5">
          <SectionPanel
            title="Top candidates"
            description="Highest-scoring available profiles."
            action={
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link href="/corporate/candidates">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            }
          >
              {candidates.length === 0 ? (
                <PageState
                  icon={Users}
                  title="No candidates yet"
                  description="Host a hackathon or publish a role to begin receiving profiles."
                />
              ) : (
                <div className="space-y-3">
                  {candidates.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-3 rounded-[7px] p-2 transition-colors hover:bg-secondary/30">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-primary/20 bg-primary/[0.08] font-bold text-primary">
                          {c.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-black">
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
          </SectionPanel>

          <SectionPanel title="Quick actions" contentClassName="space-y-2">
              {[
                { label: 'Post a Job',          href: '/corporate/jobs',           icon: Briefcase },
                { label: 'Create Hackathon',    href: '/corporate/hackathons/new', icon: Trophy },
                { label: 'Browse Candidates',   href: '/corporate/candidates',     icon: Users },
                { label: 'AI Resume Screening', href: '/corporate/ai-screening',   icon: Zap },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-[7px] border border-border/80 p-3 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-secondary/50">
                  <a.icon className="h-4 w-4 text-primary" />
                  {a.label}
                </Link>
              ))}
          </SectionPanel>
        </div>
      </div>
    </AppPage>
  )
}
