'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Video, Calendar, Clock, User, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Session {
  id: number
  student_name: string
  student_id: number
  topic?: string
  scheduled_at: string
  duration_min: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  meeting_link?: string
  price?: number
}

const STATUS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500',
  confirmed: 'bg-primary/10 text-primary',
  completed: 'bg-success-light text-success',
  cancelled: 'bg-muted text-muted-foreground',
  no_show: 'bg-destructive/10 text-destructive',
}

export default function MentorSessionsPage() {
  const [tab, setTab] = useState<'upcoming' | 'requests' | 'past'>('upcoming')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api
      .get('/mentor/sessions')
      .then((r) => setSessions(r.data?.data ?? r.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const now = Date.now()
  const filtered = sessions.filter((s) => {
    if (tab === 'requests') return s.status === 'pending'
    if (tab === 'upcoming')
      return s.status === 'confirmed' && new Date(s.scheduled_at).getTime() >= now
    return s.status === 'completed' || s.status === 'cancelled' || s.status === 'no_show'
  })

  const respond = (id: number, status: 'confirmed' | 'cancelled') =>
    api.patch(`/mentor/sessions/${id}`, { status }).then(load).catch(() => {})

  const counts = {
    upcoming: sessions.filter(
      (s) => s.status === 'confirmed' && new Date(s.scheduled_at).getTime() >= now,
    ).length,
    requests: sessions.filter((s) => s.status === 'pending').length,
    past: sessions.filter(
      (s) => s.status === 'completed' || s.status === 'cancelled' || s.status === 'no_show',
    ).length,
  }

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          Mentoring <span className="text-primary">Sessions</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bookings from students. Confirm requests within 24 h or they auto-decline.
        </p>
      </header>

      <div className="flex gap-2 border-b border-border pb-3">
        {(['upcoming', 'requests', 'past'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === k
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {k} ({counts[k]})
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
            No {tab} sessions.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((s) => (
            <li key={s.id}>
              <Card>
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {s.student_name} — {s.topic ?? '1:1 Mentoring'}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(s.scheduled_at).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.duration_min} min
                        </span>
                        {typeof s.price === 'number' && (
                          <span>₹{s.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`border-none text-[10px] uppercase ${STATUS[s.status]}`}>
                      {s.status}
                    </Badge>
                    {s.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respond(s.id, 'cancelled')}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => respond(s.id, 'confirmed')}>
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Accept
                        </Button>
                      </>
                    )}
                    {s.status === 'confirmed' && (
                      <Link href={s.meeting_link ?? `/interview/${s.id}`}>
                        <Button size="sm">
                          <Video className="mr-1 h-3.5 w-3.5" />
                          Join
                        </Button>
                      </Link>
                    )}
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
