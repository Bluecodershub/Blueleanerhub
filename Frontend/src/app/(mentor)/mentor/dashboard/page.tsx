'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen, Users, ClipboardList, ArrowUpRight,
  Plus, Loader2, RefreshCw, GraduationCap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'

interface DashboardStats {
  totalClasses: number
  totalStudents: number
  upcomingSessions: number
  pendingSubmissions: number
}

interface ClassBatch {
  _id: string
  name: string
  description?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  studentCount: number
  sessionCount: number
}

export default function MentorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0, totalStudents: 0, upcomingSessions: 0, pendingSubmissions: 0,
  })
  const [classes, setClasses] = useState<ClassBatch[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [statsRes, classesRes] = await Promise.all([
        api.get('/mentor/dashboard/stats'),
        api.get('/mentor/classes?limit=5'),
      ])
      if (statsRes.data?.success) setStats(statsRes.data.data)
      setClasses(classesRes.data?.data ?? [])
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const statCards = [
    { title: 'Total Classes',   value: stats.totalClasses,       icon: BookOpen,      color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/mentor/classes' },
    { title: 'Total Students',  value: stats.totalStudents,      icon: Users,         color: 'text-blue-500',    bg: 'bg-blue-500/10',    href: '/mentor/students' },
    { title: 'Sessions',        value: stats.upcomingSessions,   icon: GraduationCap, color: 'text-amber-500',   bg: 'bg-amber-500/10',   href: '/mentor/sessions' },
    { title: 'Pending Grading', value: stats.pendingSubmissions, icon: ClipboardList, color: 'text-rose-500',    bg: 'bg-rose-500/10',    href: '/mentor/assignments' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Mentor Portal</span>
          </div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Here&apos;s what&apos;s happening in your classes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Link href="/mentor/classes/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Create Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-lg bg-muted mb-4" />
                <div className="h-8 w-16 bg-muted rounded mb-2" />
                <div className="h-4 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : statCards.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold font-mono">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Your Classes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Classes</CardTitle>
              <Link href="/mentor/classes">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
              ) : classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground text-sm">No classes yet</p>
                  <Link href="/mentor/classes/new" className="mt-3">
                    <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4" /> Create your first class
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <Link
                      key={cls._id}
                      href={`/mentor/classes/${cls._id}`}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <BookOpen className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium">{cls.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {cls.studentCount} students
                            </span>
                            {cls.isActive ? (
                              <span className="text-emerald-500 font-medium">Active</span>
                            ) : (
                              <span className="text-muted-foreground">Inactive</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {cls.endDate && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Ends {new Date(cls.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Create New Class',   href: '/mentor/classes/new',   icon: BookOpen },
                { label: 'View Submissions',   href: '/mentor/assignments',   icon: ClipboardList },
                { label: 'Manage Students',    href: '/mentor/students',      icon: Users },
                { label: 'Schedule Session',   href: '/mentor/sessions',      icon: GraduationCap },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium hover:bg-secondary/50 transition-colors">
                  <a.icon className="h-4 w-4 text-emerald-600" />
                  {a.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-sm">Platform Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Sessions and grading modules are being actively developed. Check back soon for live scheduling and auto-grading features.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
