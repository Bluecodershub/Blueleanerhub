'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Clock,
  Loader2,
  BookmarkPlus,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Job {
  id: number
  title: string
  company?: string
  location: string
  job_type: string
  salary?: string
  skills?: string[]
  remote?: boolean
  created_at: string
  domain?: string
}

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)

  useEffect(() => {
    api
      .get('/jobs')
      .then((r) => setJobs(r.data?.data ?? r.data ?? []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter((j) => {
    if (remoteOnly && !j.remote) return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      j.title.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.skills ?? []).some((s) => s.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl">
            Browse <span className="text-primary">Jobs</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} opening{filtered.length === 1 ? '' : 's'} matched
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, skill, city"
              className="pl-9 md:w-72"
            />
          </div>
          <Button
            variant={remoteOnly ? 'default' : 'outline'}
            onClick={() => setRemoteOnly((v) => !v)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Remote
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No jobs match the current filter. Try clearing search or removing the remote filter.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((j) => (
            <li key={j.id}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{j.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {j.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" /> {j.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {j.location}
                          {j.remote && ' • Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {j.job_type}
                        </span>
                      </div>
                      {j.skills && j.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {j.skills.slice(0, 5).map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="border-border text-[10px]"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        api.post(`/jobs/${j.id}/save`).catch(() => {})
                      }
                    >
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Link href={`/candidate/jobs/${j.id}`}>
                      <Button size="sm">View</Button>
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
