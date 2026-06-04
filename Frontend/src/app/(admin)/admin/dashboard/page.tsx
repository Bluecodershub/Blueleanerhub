'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, Award, BarChart3, TrendingUp, TrendingDown, Shield, Zap, GraduationCap, Building2, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

function StatCard({
  title, value, subtitle, icon: Icon, color, href,
}: {
  title: string; value: string | number; subtitle: string
  icon: React.ElementType; color: string; href?: string
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {href && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="text-2xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs font-semibold text-foreground mt-0.5">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>
    </motion.div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<PlatformSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold uppercase text-primary">Admin Control Panel</span>
        </div>
        <h1>Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time snapshot of Bluelearnerhub activity.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users"     value={data?.users.total ?? 0}            subtitle={`+${data?.users.newLast7Days ?? 0} this week`}  icon={Users}       color="bg-primary/10"   href="/admin/users" />
        <StatCard title="Hackathons"      value={data?.hackathons.total ?? 0}        subtitle={`${data?.hackathons.active ?? 0} active now`}   icon={Trophy}      color="bg-primary/10"  href="/admin/hackathons" />
        <StatCard title="Certificates"    value={data?.certificates.total ?? 0}      subtitle="Total issued"                                   icon={Award}       color="bg-success-light" href="/admin/certificates" />
        <StatCard title="XP Awarded"      value={data?.totalXpAwarded?.toLocaleString() ?? 0} subtitle="Across all users"                    icon={Zap}         color="bg-warning-light" />
      </div>

      {/* Role Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Students',   count: data?.users.students   ?? 0, icon: Zap,           color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Mentors',    count: data?.users.mentors    ?? 0, icon: GraduationCap,  color: 'text-success', bg: 'bg-success-light' },
          { label: 'Corporates', count: data?.users.corporates ?? 0, icon: Building2,      color: 'text-warning', bg: 'bg-warning-light' },
          { label: 'Admins',     count: data?.users.admins     ?? 0, icon: Shield,         color: 'text-primary', bg: 'bg-primary/10' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bg)}>
              <Icon className={cn('h-5 w-5', color)} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hackathon Breakdown + Quiz Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-sans text-sm font-bold uppercase text-muted-foreground">Hackathon Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Draft',     count: data?.hackathons.draft     ?? 0, color: 'bg-muted' },
              { label: 'Published', count: data?.hackathons.published ?? 0, color: 'bg-primary' },
              { label: 'Active',    count: data?.hackathons.active    ?? 0, color: 'bg-success' },
              { label: 'Completed', count: data?.hackathons.completed ?? 0, color: 'bg-warning' },
            ].map(({ label, count, color }) => {
              const total = data?.hackathons.total || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{label}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-sans text-sm font-bold uppercase text-muted-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users',     href: '/admin/users',        icon: Users,    color: 'border-border hover:bg-secondary/60 text-primary' },
              { label: 'Moderate Events',  href: '/admin/hackathons',   icon: Trophy,   color: 'border-border hover:bg-secondary/60 text-primary' },
              { label: 'View Certs',       href: '/admin/certificates', icon: Award,    color: 'border-border hover:bg-secondary/60 text-primary' },
              { label: 'Platform Stats',   href: '/admin/analytics',    icon: BarChart3, color: 'border-border hover:bg-secondary/60 text-primary' },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-xs font-bold uppercase transition-colors', color)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* New Users Trend */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-sans text-sm font-bold uppercase text-muted-foreground">User Growth</h2>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-foreground">{data?.users.newLast30Days?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">New users last 30 days</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-3xl font-bold text-foreground">{data?.users.newLast7Days?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">New users last 7 days</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-3xl font-bold text-foreground">{data?.quizzes.totalAttempts?.toLocaleString() ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Total quiz attempts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
