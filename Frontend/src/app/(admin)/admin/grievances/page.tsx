'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, RefreshCw, ChevronLeft, ChevronRight, Loader2, ChevronDown } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Grievance {
  _id: string
  ticketId: string
  name: string
  email: string
  category: string
  subject: string
  message: string
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'
  resolutionNote?: string
  createdAt: string
}

const STATUSES = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'] as const
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  IN_REVIEW: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
}

export default function AdminGrievancesPage() {
  const [tickets, setTickets] = useState<Grievance[]>([])
  const [total, setTotal] = useState(0)
  const [openCount, setOpenCount] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ status: string; resolutionNote: string }>({ status: 'OPEN', resolutionNote: '' })
  const [saving, setSaving] = useState(false)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) q.set('status', statusFilter)
      const r = await api.get(`/admin/grievances?${q.toString()}`)
      setTickets(r.data.data.tickets)
      setTotal(r.data.data.total)
      setOpenCount(r.data.data.openCount)
      setTotalPages(r.data.data.totalPages)
    } catch {
      toast.error('Failed to load grievances')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const toggleExpand = (t: Grievance) => {
    if (expanded === t._id) {
      setExpanded(null)
    } else {
      setExpanded(t._id)
      setDraft({ status: t.status, resolutionNote: t.resolutionNote ?? '' })
    }
  }

  const save = async (id: string) => {
    setSaving(true)
    try {
      await api.patch(`/admin/grievances/${id}`, draft)
      toast.success('Grievance updated')
      setExpanded(null)
      fetchTickets()
    } catch {
      toast.error('Failed to update grievance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-500">Grievance Redressal</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grievances</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total.toLocaleString()} total · <span className="font-semibold text-amber-400">{openCount} open</span>
            </p>
          </div>
          <Button onClick={fetchTickets} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-1.5">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'ALL'}
            onClick={() => {
              setStatusFilter(s)
              setPage(1)
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldAlert className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No grievances {statusFilter ? `with status ${statusFilter}` : 'filed yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {['Ticket', 'From', 'Category', 'Status', 'Filed', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((t, i) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td colSpan={6} className="p-0">
                      <button onClick={() => toggleExpand(t)} className="flex w-full items-center px-4 py-3 text-left hover:bg-secondary/20">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{t.subject}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{t.ticketId}</p>
                        </div>
                        <div className="hidden flex-1 sm:block">
                          <p className="font-medium text-foreground">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground">{t.email}</p>
                        </div>
                        <div className="hidden w-28 text-xs text-muted-foreground md:block">{t.category}</div>
                        <div className="w-28">
                          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase', STATUS_COLORS[t.status])}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="hidden w-24 font-mono text-xs text-muted-foreground lg:block">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded === t._id && 'rotate-180')} />
                      </button>

                      {expanded === t._id && (
                        <div className="border-t border-border bg-secondary/10 px-4 py-4">
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Message</p>
                          <p className="mb-4 whitespace-pre-wrap text-sm text-foreground">{t.message}</p>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</label>
                              <select
                                value={draft.status}
                                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Resolution note (internal)</label>
                            <textarea
                              value={draft.resolutionNote}
                              onChange={(e) => setDraft((d) => ({ ...d, resolutionNote: e.target.value }))}
                              rows={3}
                              maxLength={5000}
                              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Record the action taken / outcome…"
                            />
                          </div>

                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setExpanded(null)}>Cancel</Button>
                            <Button size="sm" onClick={() => save(t._id)} disabled={saving} className="gap-2">
                              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-mono text-xs">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
