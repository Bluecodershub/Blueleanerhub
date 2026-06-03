'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Loader2, RefreshCw, Briefcase, Trophy,
  Users, TrendingUp, Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  participantCount: number
}

export default function CorporateReportsPage() {
  const [stats, setStats] = useState<DashStats | null>(null)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [statsRes, hackRes] = await Promise.all([
        api.get('/corporate/dashboard/stats'),
        api.get('/corporate/hackathons'),
      ])
      setStats(statsRes.data.data)
      setHackathons(hackRes.data.data ?? [])
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const funnelSteps = stats ? [
    { label: 'Jobs Posted',              count: stats.jobsPosted,             color: 'bg-amber-500',   pct: 100 },
    { label: 'Total Candidates',         count: stats.totalCandidates,        color: 'bg-blue-500',    pct: stats.jobsPosted > 0 ? Math.min(Math.round((stats.totalCandidates / stats.jobsPosted) * 10), 100) : 0 },
    { label: 'Hackathon Participants',   count: stats.hackathonParticipants,  color: 'bg-emerald-500', pct: stats.totalCandidates > 0 ? Math.round((stats.hackathonParticipants / Math.max(stats.totalCandidates, 1)) * 100) : 0 },
  ] : []

  const statusColor: Record<string, string> = {
    DRAFT:     'bg-muted/50 text-muted-foreground',
    PUBLISHED: 'bg-blue-500/10 text-blue-400',
    ACTIVE:    'bg-emerald-500/10 text-emerald-400',
    COMPLETED: 'bg-violet-500/10 text-violet-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Reports</span>
          </div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Hiring funnel and hackathon performance overview.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats && [
              { label: 'Jobs Posted',         value: stats.jobsPosted,           icon: Briefcase, color: 'text-amber-500',   bg: 'bg-amber-500/10' },
              { label: 'Hackathons Hosted',   value: stats.hackathonsHosted,     icon: Trophy,    color: 'text-violet-500',  bg: 'bg-violet-500/10' },
              { label: 'Total Candidates',    value: stats.totalCandidates,      icon: Users,     color: 'text-blue-500',    bg: 'bg-blue-500/10' },
              { label: 'Participants',        value: stats.hackathonParticipants, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map(({ label, value, icon: Icon, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass border-border">
                  <CardContent className="pt-5 pb-5">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl mb-3', bg)}>
                      <Icon className={cn('h-5 w-5', color)} />
                    </div>
                    <p className="text-3xl font-bold font-mono text-foreground">{value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">{label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Hiring funnel */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" /> Hiring Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {funnelSteps.map(({ label, count, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="font-mono font-bold text-muted-foreground">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', color)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Hackathon performance table */}
          {hackathons.length > 0 && (
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" /> Hackathon Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Hackathon</th>
                      <th className="text-left py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Dates</th>
                      <th className="text-right py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {hackathons.map(h => (
                      <tr key={h._id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 font-medium text-foreground">{h.name}</td>
                        <td className="py-3">
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', statusColor[h.status] ?? 'bg-muted text-muted-foreground')}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {new Date(h.startDate).toLocaleDateString()} – {new Date(h.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-foreground">{h.participantCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
