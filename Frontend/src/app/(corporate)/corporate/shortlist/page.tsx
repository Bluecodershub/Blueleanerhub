'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BookmarkCheck, Zap, Loader2, RefreshCw, Trash2, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Candidate {
  _id: string
  fullName: string
  email: string
  totalPoints: number
  level: number
  domain?: string
  collegeName?: string
  skills?: string[]
}

export default function ShortlistPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/corporate/shortlist')
      setCandidates(r.data.data ?? [])
    } catch {
      toast.error('Failed to load shortlist')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const remove = async (c: Candidate) => {
    setRemoving(c._id)
    try {
      await api.delete(`/corporate/shortlist/${c._id}`)
      setCandidates(prev => prev.filter(x => x._id !== c._id))
      toast.success(`${c.fullName} removed from shortlist`)
    } catch {
      toast.error('Failed to remove')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookmarkCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Shortlist</span>
          </div>
          <h1 className="text-2xl font-bold">Shortlisted Candidates</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} saved</p>
        </div>
        <Button onClick={fetch} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookmarkCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-medium text-foreground">No candidates shortlisted yet</p>
          <p className="text-sm text-muted-foreground mt-1">Browse candidates and save the ones you&apos;d like to reach out to.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary flex-shrink-0">
                      {c.fullName?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{c.fullName}</h3>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      {c.collegeName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{c.collegeName}</p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {(c.skills ?? []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(c.skills ?? []).slice(0, 4).map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                      {(c.skills ?? []).length > 4 && (
                        <Badge variant="outline" className="text-xs">+{(c.skills ?? []).length - 4}</Badge>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center border-t pt-3">
                    <div>
                      <p className="flex items-center justify-center gap-1 text-base font-bold font-mono text-primary">
                        <Zap className="h-3.5 w-3.5" />
                        {c.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                    <div>
                      <p className="flex items-center justify-center gap-1 text-base font-bold font-mono">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {c.level}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Level</p>
                    </div>
                  </div>

                  {c.domain && (
                    <Badge variant="secondary" className="mt-3 text-xs w-full justify-center">{c.domain}</Badge>
                  )}

                  <button
                    onClick={() => remove(c)}
                    disabled={removing === c._id}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    {removing === c._id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />
                    }
                    Remove
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
