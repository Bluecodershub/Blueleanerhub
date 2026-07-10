'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search as SearchIcon,
  BookOpen,
  Briefcase,
  Trophy,
  Users,
  Loader2,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

type ResultKind = 'lesson' | 'job' | 'hackathon' | 'mentor'
interface Result {
  id: string | number
  kind: ResultKind
  title: string
  subtitle?: string
  href: string
  tag?: string
}

const KIND_META: Record<ResultKind, { label: string; icon: typeof BookOpen }> = {
  lesson: { label: 'Lesson', icon: BookOpen },
  job: { label: 'Job', icon: Briefcase },
  hackathon: { label: 'Hackathon', icon: Trophy },
  mentor: { label: 'Mentor', icon: Users },
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchPageInner />
    </Suspense>
  )
}

function SearchPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const initialQ = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<ResultKind | 'all'>('all')

  useEffect(() => {
    if (!initialQ) return
    setLoading(true)
    api
      .get('/search', { params: { q: initialQ } })
      .then((r) => setResults(r.data?.data ?? r.data ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [initialQ])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const filtered = filter === 'all' ? results : results.filter((r) => r.kind === filter)
  const counts = useMemo(
    () =>
      results.reduce<Record<string, number>>((acc, r) => {
        acc[r.kind] = (acc[r.kind] ?? 0) + 1
        return acc
      }, {}),
    [results],
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <form onSubmit={submit} className="relative mb-8">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, jobs, hackathons, mentors…"
            className="h-12 pl-12 text-base"
          />
        </form>

        {initialQ && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  filter === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                All ({results.length})
              </button>
              {(Object.keys(KIND_META) as ResultKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    filter === k
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {KIND_META[k].label} ({counts[k] ?? 0})
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
                  No results for “{initialQ}”.
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-2">
                {filtered.map((r) => {
                  const meta = KIND_META[r.kind]
                  const Icon = meta.icon
                  return (
                    <li key={`${r.kind}-${r.id}`}>
                      <Link href={r.href}>
                        <Card className="transition-colors hover:border-primary/40">
                          <CardContent className="flex items-start gap-3 p-4">
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-border text-[10px] uppercase"
                                >
                                  {meta.label}
                                </Badge>
                                {r.tag && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {r.tag}
                                  </span>
                                )}
                              </div>
                              <h3 className="mt-1 text-sm font-semibold text-foreground">
                                {r.title}
                              </h3>
                              {r.subtitle && (
                                <p className="text-xs text-muted-foreground">{r.subtitle}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  )
}
