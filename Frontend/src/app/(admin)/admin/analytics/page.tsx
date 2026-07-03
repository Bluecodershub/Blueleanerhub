'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Trophy, Award, Zap, RefreshCw, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PlatformSummary {
  users: {
    total: number; newLast30Days: number; newLast7Days: number
    students: number; mentors: number; corporates: number; admins: number
  }
  hackathons: { total: number; draft: number; published: number; active: number; completed: number }
  certificates: { total: number }
  quizzes: { totalAttempts: number }
  totalXpAwarded: number
}

function MetricCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 glass"
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl mb-3', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-bold font-mono text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<PlatformSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/analytics')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    </div>
  )

  const roleData = [
    { label: 'Students',     count: data?.users.students   ?? 0, color: 'bg-sky-500' },
    { label: 'Institutions', count: data?.users.corporates ?? 0, color: 'bg-amber-500' },
    { label: 'Admins',     count: data?.users.admins     ?? 0, color: 'bg-rose-500' },
  ]
  const totalUsers = data?.users.total || 1

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest">Platform Analytics</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Live platform health metrics</p>
          </div>
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Top-level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Users"     value={data?.users.total ?? 0}        sub={`+${data?.users.newLast30Days ?? 0} last 30d`}    icon={Users}    color="bg-rose-600" />
        <MetricCard label="Hackathons"      value={data?.hackathons.total ?? 0}    sub={`${data?.hackathons.active ?? 0} active`}          icon={Trophy}   color="bg-amber-600" />
        <MetricCard label="Certificates"    value={data?.certificates.total ?? 0}  sub="Total issued"                                       icon={Award}    color="bg-emerald-600" />
        <MetricCard label="XP Awarded"      value={(data?.totalXpAwarded ?? 0).toLocaleString()} sub="Cumulative XP"                      icon={Zap}      color="bg-sky-600" />
      </div>

      {/* User Growth */}
      <div className="rounded-xl border border-border bg-card p-6 glass">
        <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-5">User Growth</h2>
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { label: 'All-time Users', value: data?.users.total ?? 0 },
            { label: 'New last 30 days', value: data?.users.newLast30Days ?? 0 },
            { label: 'New last 7 days', value: data?.users.newLast7Days ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 first:pl-0 last:pr-0 text-center">
              <p className="text-3xl font-bold font-mono text-foreground">{value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role Distribution */}
      <div className="rounded-xl border border-border bg-card p-6 glass">
        <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-5">Role Distribution</h2>
        <div className="space-y-4">
          {roleData.map(({ label, count, color }) => {
            const pct = Math.round((count / totalUsers) * 100)
            return (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="font-mono text-muted-foreground">{count.toLocaleString()} ({pct}%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', color)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hackathon + Quiz + Certs */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hackathon Status */}
        <div className="rounded-xl border border-border bg-card p-6 glass">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">Hackathon Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Draft',     count: data?.hackathons.draft     ?? 0, color: 'bg-muted-foreground' },
              { label: 'Published', count: data?.hackathons.published ?? 0, color: 'bg-sky-500' },
              { label: 'Active',    count: data?.hackathons.active    ?? 0, color: 'bg-emerald-500' },
              { label: 'Completed', count: data?.hackathons.completed ?? 0, color: 'bg-sky-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2.5 w-2.5 rounded-full', color)} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="font-mono text-sm font-bold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="rounded-xl border border-border bg-card p-6 glass">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">Quiz Engagement</h2>
          <div className="flex flex-col items-center justify-center h-24">
            <p className="text-4xl font-bold font-mono text-foreground">{(data?.quizzes.totalAttempts ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Total quiz attempts</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Avg. {totalUsers > 0 ? ((data?.quizzes.totalAttempts ?? 0) / totalUsers).toFixed(1) : 0} attempts per user
            </p>
          </div>
        </div>

        {/* Certificate Stats */}
        <div className="rounded-xl border border-border bg-card p-6 glass">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">Certificates</h2>
          <div className="flex flex-col items-center justify-center h-24">
            <p className="text-4xl font-bold font-mono text-foreground">{(data?.certificates.total ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-2">Total certificates issued</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Issued to {totalUsers > 0 ? Math.round((data?.certificates.total ?? 0) / totalUsers * 100) : 0}% of users
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
