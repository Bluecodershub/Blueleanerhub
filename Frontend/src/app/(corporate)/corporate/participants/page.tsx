'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, Loader2, RefreshCw, Zap,
  TrendingUp, BookmarkPlus, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Candidate {
  _id: string
  fullName: string
  email: string
  totalPoints: number
  level: number
  currentStreak: number
  domain?: string
  collegeName?: string
  skills?: Array<{ name: string; level: number }>
}

export default function CorporateParticipantsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [shortlisting, setShortlisting] = useState<string | null>(null)

  const load = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '20' })
      const res = await api.get(`/corporate/candidates?${params}`)
      const data = res.data.data
      setCandidates(data.candidates ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(Math.ceil((data.total ?? 0) / 20))
    } catch {
      toast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1) }, [load])

  const handleShortlist = async (candidateId: string, name: string) => {
    setShortlisting(candidateId)
    try {
      await api.post(`/corporate/shortlist/${candidateId}`)
      toast.success(`${name} added to shortlist`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to shortlist')
    } finally {
      setShortlisting(null)
    }
  }

  const filtered = search
    ? candidates.filter(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.domain?.toLowerCase().includes(search.toLowerCase())
      )
    : candidates

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">Participants</span>
          </div>
          <h1 className="text-2xl font-bold">All Candidates</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total.toLocaleString()} participants across your hackathons</p>
        </div>
        <Button onClick={() => load(page)} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by name, email, or domain..." className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-amber-500/10 p-5 mb-4">
            <Building2 className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No candidates found</h3>
          <p className="text-sm text-muted-foreground">Host a hackathon to attract participants.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Domain</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">XP</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">College</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((c, i) => (
                  <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 font-bold text-sm shrink-0">
                          {c.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{c.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">{c.domain ?? '—'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
                        <span className="font-mono font-bold text-foreground">Lv.{c.level}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span className="font-mono text-foreground">{(c.totalPoints ?? 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-muted-foreground text-xs">{c.collegeName ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline"
                        className="gap-1.5 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                        disabled={shortlisting === c._id}
                        onClick={() => handleShortlist(c._id, c.fullName)}
                      >
                        {shortlisting === c._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
                        Shortlist
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1) }}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); load(page + 1) }}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
