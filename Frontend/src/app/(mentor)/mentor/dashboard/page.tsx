'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, ClipboardCheck, CalendarDays, BookOpen, Loader2, ArrowRight, GraduationCap, UserCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import {
  AppPage,
  MetricCard,
  MetricGrid,
  PageHeader,
  PageState,
  SectionPanel,
} from '@/components/layout/AppPage'

interface MentorStats {
  totalClasses: number
  totalStudents: number
  upcomingSessions: number
  pendingSubmissions: number
}

const STATS = [
  { key: 'pendingSubmissions', label: 'Pending reviews', icon: ClipboardCheck, tone: 'warning' as const, description: 'Student work awaiting feedback' },
  { key: 'totalStudents', label: 'Students', icon: Users, tone: 'info' as const, description: 'Learners across your classes' },
  { key: 'totalClasses', label: 'Classes', icon: BookOpen, tone: 'success' as const, description: 'Active teaching groups' },
  { key: 'upcomingSessions', label: 'Upcoming sessions', icon: CalendarDays, tone: 'primary' as const, description: 'Scheduled mentor sessions' },
] as const

const QUICK_LINKS = [
  { title: 'My classes', desc: 'View your batches and students.', href: '/mentor/classes', icon: Users },
  { title: 'My profile', desc: 'Set your expertise, bio, and availability.', href: '/mentor/profile', icon: UserCircle },
  { title: 'Community Q&A', desc: 'Answer student questions in the forum.', href: '/qna', icon: MessageSquare },
]

export default function MentorDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<MentorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/mentor/dashboard/stats')
      .then((r) => active && setStats(r.data?.data ?? null))
      .catch(() => active && setStats(null))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const firstName = user?.fullName?.split(' ')[0] ?? 'Mentor'

  return (
    <AppPage>
      <PageHeader
        eyebrow="Mentor workspace"
        icon={GraduationCap}
        title={`Welcome, ${firstName}`}
        description="Review student work, manage classes, and keep feedback moving."
      />

      <MetricGrid>
        {STATS.map(({ key, label, icon, tone, description }) => (
          <MetricCard
            key={key}
            label={label}
            value={loading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : (stats?.[key] ?? 0)}
            description={description}
            icon={icon}
            tone={tone}
          />
        ))}
      </MetricGrid>

      <SectionPanel title="Quick actions" description="Move directly into your primary teaching workflows.">
        <div className="grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((q, i) => {
            const Icon = q.icon
            return (
              <motion.div key={q.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  href={q.href}
                  className="group flex h-full flex-col rounded-[8px] border border-border bg-background/40 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/35"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[7px] border border-border bg-secondary/70">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{q.title}</h3>
                  <p className="flex-1 text-sm text-muted-foreground">{q.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </SectionPanel>

      {!loading && (stats?.pendingSubmissions ?? 0) === 0 && (
        <SectionPanel>
          <PageState
            icon={ClipboardCheck}
            title="No submissions awaiting review"
            description="New student work will appear here as soon as it is submitted."
          />
        </SectionPanel>
      )}
    </AppPage>
  )
}
