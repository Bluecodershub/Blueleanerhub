'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader2, RefreshCw, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface ErrorEvent {
  id: number
  message: string
  stack?: string
  path?: string
  status_code?: number
  user_id?: number
  environment?: string
  count?: number
  first_seen_at: string
  last_seen_at: string
  resolved: boolean
}

export default function AdminErrorsPage() {
  const [items, setItems] = useState<ErrorEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    api
      .get('/admin/errors', { params: { resolved: showResolved } })
      .then((r) => setItems(r.data?.data ?? r.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [showResolved])

  const resolve = (id: number) =>
    api.patch(`/admin/errors/${id}`, { resolved: true }).then(load).catch(() => {})

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl md:text-4xl">
            Error <span className="text-primary">Monitor</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Server errors captured from the backend Sentry pipeline. Resolve when fixed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showResolved ? 'default' : 'outline'}
            onClick={() => setShowResolved((v) => !v)}
          >
            {showResolved ? 'Showing resolved' : 'Show resolved'}
          </Button>
          <Button variant="outline" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No {showResolved ? 'resolved' : 'open'} errors.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => (
            <li key={e.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-mono text-sm text-foreground">
                          {e.message}
                        </p>
                        {e.status_code && (
                          <Badge variant="outline" className="border-border text-[10px]">
                            {e.status_code}
                          </Badge>
                        )}
                        {e.count && e.count > 1 && (
                          <Badge className="border-none bg-primary/10 text-[10px] text-primary">
                            ×{e.count}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                        {e.path && <span>{e.path}</span>}
                        {e.environment && <span>env: {e.environment}</span>}
                        <span>
                          first {new Date(e.first_seen_at).toLocaleString()}
                        </span>
                        <span>
                          last {new Date(e.last_seen_at).toLocaleString()}
                        </span>
                      </div>
                      {expanded === e.id && e.stack && (
                        <pre className="mt-3 max-h-64 overflow-auto rounded bg-neutral-950 p-3 font-mono text-[11px] text-neutral-200">
                          {e.stack}
                        </pre>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {e.stack && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpanded((x) => (x === e.id ? null : e.id))}
                        >
                          {expanded === e.id ? 'Hide' : 'Stack'}
                        </Button>
                      )}
                      {!e.resolved && (
                        <Button size="sm" variant="outline" onClick={() => resolve(e.id)}>
                          <X className="mr-1 h-3 w-3" />
                          Resolve
                        </Button>
                      )}
                    </div>
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
