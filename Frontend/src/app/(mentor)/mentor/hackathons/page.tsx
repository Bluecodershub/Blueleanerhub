'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, Search, Loader2, RefreshCw, Calendar,
  Users, ExternalLink, Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Hackathon {
  _id: string
  title: string
  description?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate?: string
  endDate?: string
  registrationDeadline?: string
  maxParticipants?: number
  participantCount?: number
  prize?: string
  organizer?: string
}

const statusBadge: Record<string, string> = {
  DRAFT:     'bg-muted text-muted-foreground',
  PUBLISHED: 'bg-blue-500/10 text-blue-400',
  ACTIVE:    'bg-emerald-500/10 text-emerald-400',
  COMPLETED: 'bg-secondary text-muted-foreground',
  CANCELLED: 'bg-rose-500/10 text-rose-400',
}

export default function MentorHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/hackathons?limit=50')
      const raw = res.data?.data ?? res.data?.hackathons ?? []
      setHackathons(Array.isArray(raw) ? raw : [])
    } catch {
      toast.error('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = hackathons.filter((h) =>
    !search ||
    h.title?.toLowerCase().includes(search.toLowerCase()) ||
    h.organizer?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const daysLeft = (d?: string) => {
    if (!d) return null
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    return diff > 0 ? diff : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Mentor Portal</span>
          </div>
          <h1 className="text-2xl font-bold">Hackathons</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Recommend relevant hackathons to your students.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total',     value: hackathons.length,                                            color: 'text-emerald-500' },
          { label: 'Active',    value: hackathons.filter(h => h.status === 'ACTIVE').length,         color: 'text-blue-500' },
          { label: 'Open',      value: hackathons.filter(h => h.status === 'PUBLISHED').length,      color: 'text-amber-500' },
          { label: 'Completed', value: hackathons.filter(h => h.status === 'COMPLETED').length,      color: 'text-muted-foreground' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search hackathons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {search ? 'No hackathons match your search.' : 'No hackathons available right now.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((h, i) => {
            const remaining = daysLeft(h.registrationDeadline ?? h.endDate)
            return (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                          <Trophy className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{h.title}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[h.status] ?? statusBadge.DRAFT}`}>
                              {h.status}
                            </span>
                          </div>
                          {h.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{h.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(h.startDate)} — {formatDate(h.endDate)}
                            </span>
                            {h.maxParticipants && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" /> {h.participantCount ?? 0}/{h.maxParticipants}
                              </span>
                            )}
                            {remaining && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <Clock className="h-3 w-3" /> {remaining}d left
                              </span>
                            )}
                            {h.prize && (
                              <span className="text-emerald-400 font-medium">{h.prize}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 self-start whitespace-nowrap"
                        asChild
                      >
                        <a href={`/hackathons/${h._id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
