'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  MessageSquare,
  Plus,
  Loader2,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Ticket {
  id: number
  subject: string
  status: 'open' | 'waiting' | 'resolved' | 'closed'
  category?: string
  created_at: string
  updated_at?: string
}

const FAQ = [
  {
    q: 'How do I reset my password?',
    a: 'Go to /forgot-password, enter your email, and follow the link we send you.',
  },
  {
    q: 'How do certificates work?',
    a: 'Finish a track or hackathon at ≥70% score. Certificates appear on your profile and are verifiable via a shareable URL.',
  },
  {
    q: 'How do refunds work?',
    a: 'See our /refund policy — Pro cancellations refund the unused portion of the current billing period.',
  },
  {
    q: 'Can I switch roles later?',
    a: 'Yes — Settings → Profile → Role. Some features (e.g. corporate posting) require verification.',
  },
]

export default function HelpCenterPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [query, setQuery] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/support/tickets')
      .then((r) => setTickets(r.data?.data ?? r.data ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await api.post('/support/tickets', { subject, body, category })
      setSubject('')
      setBody('')
      load()
    } finally {
      setSubmitting(false)
    }
  }

  const filteredFaq = query
    ? FAQ.filter(
        (f) =>
          f.q.toLowerCase().includes(query.toLowerCase()) ||
          f.a.toLowerCase().includes(query.toLowerCase()),
      )
    : FAQ

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        <header className="text-center">
          <LifeBuoy className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 text-3xl md:text-4xl">Help Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search the FAQ or open a support ticket. We reply within one business day.
          </p>
        </header>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQ…"
            className="h-12 pl-12"
          />
        </div>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">FAQ</h2>
          <div className="space-y-2">
            {filteredFaq.map((f) => (
              <details
                key={f.q}
                className="rounded-lg border border-border bg-card p-4 open:bg-secondary/40"
              >
                <summary className="cursor-pointer text-sm font-semibold text-foreground">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
            {filteredFaq.length === 0 && (
              <p className="text-sm text-muted-foreground">No FAQ matches your search.</p>
            )}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" />
              Open a support ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="content">Content / Lessons</option>
                <option value="hiring">Hiring / Jobs</option>
                <option value="bug">Bug report</option>
              </select>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Describe your issue in detail"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-3 flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
            <span>Your tickets</span>
            <span>{tickets.length}</span>
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open tickets.</p>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      #{t.id} • {t.category ?? 'general'} • Opened{' '}
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={`border-none text-[10px] uppercase ${
                      t.status === 'resolved' || t.status === 'closed'
                        ? 'bg-success-light text-success'
                        : t.status === 'waiting'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Card>
          <CardContent className="flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold text-foreground">Prefer chat?</p>
              <p className="text-xs text-muted-foreground">
                Community forum and Discord for peer support.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/spaces">
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Community
                </Button>
              </Link>
              <a href="https://discord.gg" target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Discord
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
