'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Search, RefreshCw, ChevronLeft, ChevronRight, Loader2, Trash2, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HackathonRow {
  _id: string; name: string; organizerName: string; organizerType: string
  status: string; difficulty: string; startDate: string; endDate: string
  maxParticipants?: number; prizePool?: number
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'bg-muted/50 text-muted-foreground border-border',
  PUBLISHED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

const NEXT_STATUSES: Record<string, string> = {
  DRAFT: 'PUBLISHED', PUBLISHED: 'ACTIVE', ACTIVE: 'COMPLETED', COMPLETED: 'COMPLETED',
}

export default function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchHackathons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const r = await api.get(`/admin/hackathons?${params}`)
      setHackathons(r.data.data.hackathons)
      setTotal(r.data.data.total)
      setTotalPages(r.data.data.totalPages)
    } catch {
      toast.error('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchHackathons() }, [fetchHackathons])
  useEffect(() => { setPage(1) }, [statusFilter])

  const advanceStatus = async (id: string, currentStatus: string) => {
    const next = NEXT_STATUSES[currentStatus]
    if (!next || next === currentStatus) return
    setActionLoading(id + '-status')
    try {
      await api.put(`/admin/hackathons/${id}/status`, { status: next })
      toast.success(`Status → ${next}`)
      fetchHackathons()
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteHackathon = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setActionLoading(id + '-delete')
    try {
      await api.delete(`/admin/hackathons/${id}`)
      toast.success('Hackathon deleted')
      fetchHackathons()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest">Hackathon Moderation</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hackathons</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total.toLocaleString()} total hackathons</p>
          </div>
          <Button onClick={fetchHackathons} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {['DRAFT','PUBLISHED','ACTIVE','COMPLETED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          </div>
        ) : hackathons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No hackathons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {['Hackathon','Organizer','Status','Dates','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hackathons.map((h, i) => (
                  <motion.tr key={h._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }} className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{h.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{h.difficulty}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <p>{h.organizerName}</p>
                      <p className="text-[11px] font-mono">{h.organizerType}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase', STATUS_COLORS[h.status] ?? '')}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      <p>{new Date(h.startDate).toLocaleDateString()}</p>
                      <p>→ {new Date(h.endDate).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {NEXT_STATUSES[h.status] && NEXT_STATUSES[h.status] !== h.status && (
                          <button
                            onClick={() => advanceStatus(h._id, h.status)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 rounded-lg border border-emerald-500/30 px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            {actionLoading === h._id + '-status'
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <CheckCircle className="h-3 w-3" />
                            }
                            {NEXT_STATUSES[h.status]}
                          </button>
                        )}
                        <button
                          onClick={() => deleteHackathon(h._id, h.name)}
                          disabled={!!actionLoading}
                          className="rounded-lg border border-rose-500/30 p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          {actionLoading === h._id + '-delete'
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
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
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
