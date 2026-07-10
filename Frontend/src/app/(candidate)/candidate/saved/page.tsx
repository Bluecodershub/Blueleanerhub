'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Loader2, MapPin, Building2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface SavedJob {
  id: number
  job_id: number
  title: string
  company?: string
  location: string
  saved_at: string
  remote?: boolean
}

export default function CandidateSavedJobsPage() {
  const [items, setItems] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api
      .get('/candidate/saved-jobs')
      .then((r) => setItems(r.data?.data ?? r.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const unsave = (id: number) =>
    api
      .delete(`/candidate/saved-jobs/${id}`)
      .then(() => setItems((prev) => prev.filter((s) => s.id !== id)))
      .catch(() => {})

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          Saved <span className="text-primary">Jobs</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Jobs you bookmarked for later. Nothing here is applied to yet.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No saved jobs yet.</p>
            <Link href="/candidate/jobs" className="mt-3 inline-block">
              <Button size="sm">Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((s) => (
            <li key={s.id}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                      <button
                        onClick={() => unsave(s.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove saved"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {s.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {s.company}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {s.location}
                        {s.remote && ' • Remote'}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Saved {new Date(s.saved_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/candidate/jobs/${s.job_id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        View & Apply
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
