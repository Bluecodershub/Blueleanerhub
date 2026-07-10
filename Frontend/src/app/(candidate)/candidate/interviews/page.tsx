'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Video, Loader2, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Interview {
  id: number
  job_title: string
  company?: string
  round?: string
  scheduled_at: string
  duration_min?: number
  mode: 'video' | 'onsite' | 'phone'
  meeting_link?: string
  interviewer_name?: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/candidate/interviews')
      .then((r) => setInterviews(r.data?.data ?? r.data ?? []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false))
  }, [])

  const upcoming = interviews
    .filter((i) => i.status === 'scheduled' && new Date(i.scheduled_at) >= new Date())
    .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at))
  const past = interviews.filter(
    (i) => i.status !== 'scheduled' || new Date(i.scheduled_at) < new Date(),
  )

  return (
    <div className="space-y-8 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          My <span className="text-primary">Interviews</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upcoming rounds and history. Video interviews open the built-in interview room.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No interviews scheduled yet.
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((iv) => (
                  <li key={iv.id}>
                    <Card className="border-t-2 border-t-primary">
                      <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              {iv.job_title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {iv.company} • {iv.round ?? 'Interview'}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(iv.scheduled_at).toLocaleString()}
                              </span>
                              {iv.duration_min && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {iv.duration_min} min
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {iv.mode}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {iv.mode === 'video' && (
                            <Link href={`/interview/${iv.id}`}>
                              <Button size="sm">Join Room</Button>
                            </Link>
                          )}
                          {iv.meeting_link && (
                            <a href={iv.meeting_link} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                External Link
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
                History ({past.length})
              </h2>
              <ul className="space-y-2">
                {past.map((iv) => (
                  <li
                    key={iv.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{iv.job_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {iv.company} • {new Date(iv.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={`border-none text-[10px] uppercase ${
                        iv.status === 'completed'
                          ? 'bg-success-light text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {iv.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
