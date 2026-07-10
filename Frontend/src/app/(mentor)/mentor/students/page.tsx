'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, User, Search, MessageCircle, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface StudentRow {
  id: number
  full_name: string
  headline?: string
  sessions_count: number
  last_session_at?: string
  next_session_at?: string
}

export default function MentorStudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    api
      .get('/mentor/students')
      .then((r) => setRows(r.data?.data ?? r.data ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = query
    ? rows.filter(
        (r) =>
          r.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (r.headline ?? '').toLowerCase().includes(query.toLowerCase()),
      )
    : rows

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl md:text-4xl">
            My <span className="text-primary">Students</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone you&apos;ve mentored. Click any student to see full session history.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or headline"
            className="pl-9 md:w-72"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            {rows.length === 0 ? 'No students yet.' : 'No students match your search.'}
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <li key={s.id}>
              <Card>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-foreground">
                        {s.full_name}
                      </h3>
                      {s.headline && (
                        <p className="truncate text-xs text-muted-foreground">{s.headline}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                    <div>
                      <p className="text-lg font-bold text-foreground">{s.sessions_count}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Sessions</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">
                        {s.last_session_at
                          ? new Date(s.last_session_at).toLocaleDateString()
                          : '—'}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">Last</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-primary">
                        {s.next_session_at
                          ? new Date(s.next_session_at).toLocaleDateString()
                          : '—'}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">Next</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/messages?to=${s.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        Message
                      </Button>
                    </Link>
                    <Link href={`/mentor/sessions?student=${s.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                        Sessions
                      </Button>
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
