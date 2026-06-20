'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileCheck2, RefreshCw, ChevronLeft, ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ConsentRow {
  _id: string
  consentType: string
  granted: boolean
  policyVersion: string
  context?: string
  ipAddress?: string
  withdrawnAt?: string
  createdAt: string
  userId: { _id: string; fullName: string; email: string } | null
}

const TYPE_LABELS: Record<string, string> = {
  TERMS: 'Terms',
  PRIVACY: 'Privacy',
  DATA_PROCESSING: 'Data Processing',
  MARKETING_COMMS: 'Marketing',
  AI_REVIEW: 'AI Review',
  PLAGIARISM_CHECK: 'Plagiarism Check',
  LEADERBOARD_DISPLAY: 'Leaderboard',
  HACKATHON_DATA_SHARING: 'Hackathon Sharing',
  GUARDIAN_CONSENT: 'Guardian Consent',
  ORG_VERIFICATION: 'Org Verification',
}

const TYPE_FILTERS = ['', 'TERMS', 'PRIVACY', 'DATA_PROCESSING', 'MARKETING_COMMS', 'AI_REVIEW', 'GUARDIAN_CONSENT']

export default function AdminConsentsPage() {
  const [records, setRecords] = useState<ConsentRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchConsents = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page: String(page), limit: '50' })
      if (typeFilter) q.set('consentType', typeFilter)
      const r = await api.get(`/admin/consents?${q.toString()}`)
      setRecords(r.data.data.records)
      setTotal(r.data.data.total)
      setTotalPages(r.data.data.totalPages)
    } catch {
      toast.error('Failed to load consent records')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  useEffect(() => {
    fetchConsents()
  }, [fetchConsents])

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-rose-500">DPDP Consent Audit</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consent Records</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {total.toLocaleString()} records · append-only audit trail
            </p>
          </div>
          <Button onClick={fetchConsents} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t || 'ALL'}
            onClick={() => {
              setTypeFilter(t)
              setPage(1)
            }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              typeFilter === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {t ? TYPE_LABELS[t] ?? t : 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileCheck2 className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No consent records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {['User', 'Consent', 'Granted', 'Policy', 'Context', 'Recorded'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      {c.userId ? (
                        <>
                          <p className="font-medium text-foreground">{c.userId.fullName || '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{c.userId.email}</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Deleted user</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">{TYPE_LABELS[c.consentType] ?? c.consentType}</td>
                    <td className="px-4 py-3">
                      {c.granted && !c.withdrawnAt ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" /> {c.withdrawnAt ? 'Withdrawn' : 'Declined'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.policyVersion}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.context || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
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
