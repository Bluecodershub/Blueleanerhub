'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Loader2, Calendar, Building2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface Application {
  id: number
  job_id: number
  job_title: string
  company?: string
  status: 'applied' | 'shortlisted' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  applied_at: string
  updated_at?: string
  next_step?: string
}

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-secondary text-muted-foreground',
  shortlisted: 'bg-primary/10 text-primary',
  interview: 'bg-blue-500/10 text-blue-500',
  offer: 'bg-success-light text-success',
  rejected: 'bg-destructive/10 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
}

export default function CandidateApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/candidate/applications')
      .then((r) => setApps(r.data?.data ?? r.data ?? []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? apps : apps.filter((a) => a.status === filter)
  const counts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {})

  const tabs: { key: string; label: string }[] = [
    { key: 'all', label: `All (${apps.length})` },
    { key: 'applied', label: `Applied (${counts.applied ?? 0})` },
    { key: 'shortlisted', label: `Shortlisted (${counts.shortlisted ?? 0})` },
    { key: 'interview', label: `Interview (${counts.interview ?? 0})` },
    { key: 'offer', label: `Offer (${counts.offer ?? 0})` },
    { key: 'rejected', label: `Rejected (${counts.rejected ?? 0})` },
  ]

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          My <span className="text-primary">Applications</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every role you&apos;ve applied to. Statuses sync from the recruiter side automatically.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === t.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            {apps.length === 0
              ? 'You haven’t applied to any jobs yet.'
              : 'No applications in this status.'}
            <div className="mt-4">
              <Link href="/candidate/jobs">
                <Button size="sm">Browse Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{a.job_title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {a.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {a.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(a.applied_at).toLocaleDateString()}
                        </span>
                        {a.next_step && (
                          <span className="text-primary">Next: {a.next_step}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`border-none text-[10px] font-bold uppercase ${STATUS_STYLES[a.status]}`}
                    >
                      {a.status}
                    </Badge>
                    <Link href={`/candidate/jobs/${a.job_id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
