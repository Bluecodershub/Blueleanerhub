'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Users, Trophy, Zap, Star, Loader2, RefreshCw,
  ChevronLeft, ChevronRight, BookmarkPlus, BookmarkCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Candidate {
  _id: string
  fullName: string
  email: string
  totalPoints: number
  level: number
  currentStreak: number
  domain?: string
  collegeName?: string
  skills?: string[]
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [shortlistLoading, setShortlistLoading] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / 20))

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get(`/corporate/candidates?page=${page}&limit=20`)
      setCandidates(r.data.data?.candidates ?? [])
      setTotal(r.data.data?.total ?? 0)
    } catch {
      toast.error('Failed to load candidates')
    } finally {
      setLoading(false)
    }
  }, [page])

  const fetchShortlist = useCallback(async () => {
    try {
      const r = await api.get('/corporate/shortlist')
      const ids = new Set<string>((r.data.data ?? []).map((c: Candidate) => c._id))
      setShortlisted(ids)
    } catch {
      // non-critical — silently ignore
    }
  }, [])

  useEffect(() => {
    fetchCandidates()
    fetchShortlist()
  }, [fetchCandidates, fetchShortlist])

  useEffect(() => { setPage(1) }, [search])

  const toggleShortlist = async (c: Candidate) => {
    setShortlistLoading(c._id)
    try {
      if (shortlisted.has(c._id)) {
        await api.delete(`/corporate/shortlist/${c._id}`)
        setShortlisted(s => { const n = new Set(s); n.delete(c._id); return n })
        toast.success(`${c.fullName} removed from shortlist`)
      } else {
        await api.post(`/corporate/shortlist/${c._id}`, {})
        setShortlisted(s => new Set([...s, c._id]))
        toast.success(`${c.fullName} added to shortlist`)
      }
    } catch {
      toast.error('Failed to update shortlist')
    } finally {
      setShortlistLoading(null)
    }
  }

  const displayed = search
    ? candidates.filter(c =>
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        (c.skills ?? []).some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        c.domain?.toLowerCase().includes(search.toLowerCase())
      )
    : candidates

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Talent Pool</span>
          </div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Participants from your hackathons</p>
        </div>
        <Button onClick={() => { fetchCandidates(); fetchShortlist() }} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono">{total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Candidates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono">{shortlisted.size}</p>
              <p className="text-xs text-muted-foreground">Shortlisted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
              <Zap className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono">
                {candidates.length > 0
                  ? Math.round(candidates.reduce((s, c) => s + c.totalPoints, 0) / candidates.length).toLocaleString()
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Avg. XP</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, skill or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? 'No candidates match your search' : 'No candidates yet — host a hackathon to discover talent'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary flex-shrink-0">
                      {c.fullName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{c.fullName}</h3>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                        <button
                          onClick={() => toggleShortlist(c)}
                          disabled={shortlistLoading === c._id}
                          className={cn(
                            'flex-shrink-0 rounded-lg p-1.5 transition-colors',
                            shortlisted.has(c._id)
                              ? 'text-primary bg-primary/10 hover:bg-primary/20'
                              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                          )}
                          title={shortlisted.has(c._id) ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          {shortlistLoading === c._id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : shortlisted.has(c._id)
                              ? <BookmarkCheck className="h-4 w-4" />
                              : <BookmarkPlus className="h-4 w-4" />
                          }
                        </button>
                      </div>
                      {c.collegeName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.collegeName}</p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {(c.skills ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(c.skills ?? []).slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                      {(c.skills ?? []).length > 4 && (
                        <Badge variant="outline" className="text-xs">+{(c.skills ?? []).length - 4}</Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t pt-3">
                    <div>
                      <p className="text-lg font-bold font-mono text-primary">{c.totalPoints.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold font-mono">{c.level}</p>
                      <p className="text-[10px] text-muted-foreground">Level</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <p className="text-lg font-bold font-mono">{c.currentStreak}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Streak</p>
                    </div>
                  </div>

                  {c.domain && (
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs w-full justify-center">{c.domain}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!search && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-mono text-xs">Page {page} of {totalPages} · {total} candidates</span>
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
