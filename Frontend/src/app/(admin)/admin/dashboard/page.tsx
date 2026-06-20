'use client'

import { useState, useEffect } from 'react'
import { Users, Trophy, Award, BarChart3, Shield, Zap, Building2, AlertTriangle } from 'lucide-react'
import api from '@/lib/api'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MoodleStatusCard } from '@/components/admin/MoodleStatusCard'
import {
  AppPage,
  DashboardLoading,
  MetricCard,
  MetricGrid,
  PageHeader,
  SectionPanel,
} from '@/components/layout/AppPage'

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

export default function AdminDashboardPage() {
  const [data, setData] = useState<PlatformSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [openGrievances, setOpenGrievances] = useState(0)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    // Surface unresolved grievances (DPDP/IT-Rules duty) — non-blocking.
    api.get('/admin/grievances?limit=1')
      .then(r => setOpenGrievances(r.data?.data?.openCount ?? 0))
      .catch(() => {})
  }, [])

  if (loading) {
    return <DashboardLoading />
  }

  return (
    <AppPage>
      <PageHeader
        eyebrow="Admin control panel"
        icon={Shield}
        title="Platform overview"
        description="Monitor users, learning activity, competitions, credentials, and compliance operations."
      />

      {/* Open grievances alert — DPDP/IT-Rules duty to resolve */}
      {openGrievances > 0 && (
        <Link href="/admin/grievances" className="block">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 transition-colors hover:bg-amber-500/15">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {openGrievances} open grievance{openGrievances === 1 ? '' : 's'} awaiting review
                </p>
                <p className="text-xs text-muted-foreground">Resolve within the 30-day window. Click to manage.</p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-amber-400">Review →</span>
          </div>
        </Link>
      )}

      <MetricGrid>
        <MetricCard label="Total users" value={(data?.users.total ?? 0).toLocaleString()} description={`+${data?.users.newLast7Days ?? 0} this week`} icon={Users} tone="primary" href="/admin/users" />
        <MetricCard label="Hackathons" value={(data?.hackathons.total ?? 0).toLocaleString()} description={`${data?.hackathons.active ?? 0} active now`} icon={Trophy} tone="warning" href="/admin/hackathons" />
        <MetricCard label="Certificates" value={(data?.certificates.total ?? 0).toLocaleString()} description="Total credentials issued" icon={Award} tone="success" href="/admin/certificates" />
        <MetricCard label="XP awarded" value={(data?.totalXpAwarded ?? 0).toLocaleString()} description="Across all learner activity" icon={Zap} tone="info" />
      </MetricGrid>

      <MetricGrid className="xl:grid-cols-3">
        <MetricCard label="Students" value={(data?.users.students ?? 0).toLocaleString()} description="Active learner accounts" icon={Zap} tone="primary" />
        <MetricCard label="Institutions" value={(data?.users.corporates ?? 0).toLocaleString()} description="Approved college and corporate accounts" icon={Building2} tone="warning" />
        <MetricCard label="Administrators" value={(data?.users.admins ?? 0).toLocaleString()} description="Privileged platform operators" icon={Shield} tone="neutral" />
      </MetricGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionPanel title="Hackathon status" description="Distribution across the event lifecycle.">
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
        </SectionPanel>

        <SectionPanel title="Quick actions" description="Common administrative workflows.">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users',     href: '/admin/users',        icon: Users,    color: 'border-border hover:bg-secondary/60 text-primary' },
              { label: 'Moderate Events',  href: '/admin/hackathons',   icon: Trophy,   color: 'border-border hover:bg-secondary/60 text-primary' },
              { label: 'View Certs',       href: '/admin/certificates', icon: Award,    color: 'border-border hover:bg-secondary/60 text-primary' },
              { label: 'Platform Stats',   href: '/admin/analytics',    icon: BarChart3, color: 'border-border hover:bg-secondary/60 text-primary' },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className={cn('flex flex-col items-center gap-2 rounded-[8px] border p-4 text-center text-xs font-semibold transition-colors', color)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          </div>
        </SectionPanel>
      </div>

      {/* Moodle LMS Integration Status */}
      <MoodleStatusCard />

      <SectionPanel title="User growth" description="Recent registration and assessment activity.">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">{data?.users.newLast30Days?.toLocaleString() ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">New users last 30 days</p>
          </div>
          <div className="border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">{data?.users.newLast7Days?.toLocaleString() ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">New users last 7 days</p>
          </div>
          <div className="border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">{data?.quizzes.totalAttempts?.toLocaleString() ?? 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total quiz attempts</p>
          </div>
        </div>
      </SectionPanel>
    </AppPage>
  )
}
