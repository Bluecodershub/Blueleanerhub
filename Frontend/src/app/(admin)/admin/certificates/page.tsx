'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Award, RefreshCw, ChevronLeft, ChevronRight, Loader2, Trash2, ExternalLink } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CertRow {
  _id: string
  title: string
  type: string
  issuedAt: string
  verificationCode: string
  userId: { _id: string; fullName: string; email: string } | null
}

const TYPE_COLORS: Record<string, string> = {
  COURSE:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  HACKATHON:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MENTORSHIP:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ACHIEVEMENT: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<CertRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCerts = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/certificates?page=${page}&limit=20`)
      setCerts(r.data.data.certificates)
      setTotal(r.data.data.total)
      setTotalPages(r.data.data.totalPages)
    } catch {
      toast.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchCerts() }, [fetchCerts])

  const revoke = async (id: string, title: string) => {
    if (!confirm(`Revoke certificate "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/admin/certificates/${id}`)
      toast.success('Certificate revoked')
      fetchCerts()
    } catch {
      toast.error('Failed to revoke')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest">Certificate Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total.toLocaleString()} certificates issued</p>
          </div>
          <Button onClick={fetchCerts} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          </div>
        ) : certs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Award className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No certificates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {['Certificate','Recipient','Type','Issued','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certs.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }} className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{c.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{c.verificationCode}</p>
                    </td>
                    <td className="px-4 py-3">
                      {c.userId ? (
                        <>
                          <p className="font-medium text-foreground">{c.userId.fullName || '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{c.userId.email}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">Deleted user</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase', TYPE_COLORS[c.type] ?? 'text-muted-foreground')}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {new Date(c.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/certificates/verify/${c.verificationCode}`}
                          target="_blank" rel="noopener noreferrer"
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => revoke(c._id, c.title)}
                          disabled={deleting === c._id}
                          className="rounded-lg border border-rose-500/30 p-1.5 text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          {deleting === c._id
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
