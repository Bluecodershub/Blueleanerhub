'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Loader2, RefreshCw, Users, BookOpen,
  ClipboardList, Video, TrendingUp, Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalClasses: number
  totalStudents: number
  upcomingSessions: number
  pendingSubmissions: number
}

export default function MentorAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/mentor/dashboard/stats')
      if (res.data?.success) setStats(res.data.data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const metrics = stats ? [
    { label: 'Total Classes',   value: stats.totalClasses,       icon: BookOpen,      color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Active teaching batches' },
    { label: 'Total Students',  value: stats.totalStudents,      icon: Users,         color: 'text-blue-500',    bg: 'bg-blue-500/10',    desc: 'Enrolled across all classes' },
    { label: 'Sessions',        value: stats.upcomingSessions,   icon: Video,         color: 'text-amber-500',   bg: 'bg-amber-500/10',   desc: 'Upcoming scheduled sessions' },
    { label: 'Pending Grading', value: stats.pendingSubmissions, icon: ClipboardList, color: 'text-rose-500',    bg: 'bg-rose-500/10',    desc: 'Submissions awaiting review' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold">Teaching Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Overview of your classes and student progress.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, color, bg, desc }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass border-border hover:border-emerald-500/20 transition-all">
                  <CardContent className="pt-6">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl mb-3', bg)}>
                      <Icon className={cn('h-5 w-5', color)} />
                    </div>
                    <p className="text-3xl font-bold font-mono text-foreground">{value}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" /> Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && [
                  { label: 'Class engagement rate', value: Math.min(Math.round((stats.totalStudents / Math.max(stats.totalClasses * 10, 1)) * 100), 100) },
                  { label: 'Grading completion',    value: stats.pendingSubmissions === 0 ? 100 : Math.max(0, 100 - stats.pendingSubmissions * 10) },
                  { label: 'Session coverage',      value: Math.min(stats.upcomingSessions * 20, 100) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-bold text-foreground font-mono">{value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Add Class',      href: '/mentor/classes',     color: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
                  { label: 'Grade Work',     href: '/mentor/grades',      color: 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10' },
                  { label: 'Add Students',   href: '/mentor/students',    color: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' },
                  { label: 'Sessions',       href: '/mentor/sessions',    color: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' },
                ].map(({ label, href, color }) => (
                  <a key={href} href={href}
                    className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-xs font-mono font-bold uppercase tracking-wide transition-colors', color)}
                  >
                    {label}
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

