'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus, Trophy, Users, Loader2, RefreshCw,
  ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Hackathon {
  _id: string
  name: string
  description?: string
  status: string
  theme?: string
  startDate: string
  endDate: string
  prizePool?: number
  maxParticipants?: number
  participantCount: number
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT:     'bg-muted/50 text-muted-foreground border-border',
  PUBLISHED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ACTIVE:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  COMPLETED: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get('/corporate/hackathons')
      setHackathons(r.data.data ?? [])
    } catch {
      toast.error('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const deleteHackathon = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/corporate/hackathons/${id}`)
      toast.success('Hackathon deleted')
      setHackathons(h => h.filter(x => x._id !== id))
    } catch {
      toast.error('Failed to delete hackathon')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = statusFilter === 'all'
    ? hackathons
    : hackathons.filter(h => h.status === statusFilter.toUpperCase())

  const totalParticipants = hackathons.reduce((s, h) => s + h.participantCount, 0)
  const totalPrize = hackathons.reduce((s, h) => s + (h.prizePool ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Hackathon Management</span>
          </div>
          <h1 className="text-2xl font-bold">Hackathons</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your hackathons and track participation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetch} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Link href="/corporate/hackathons/new">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Hackathon</Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono">{hackathons.length}</p>
              <p className="text-xs text-muted-foreground">Total Hackathons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xl font-bold font-mono">{totalParticipants.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Participants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <span className="text-amber-500 font-bold text-sm">$</span>
            </div>
            <div>
              <p className="text-xl font-bold font-mono">${totalPrize.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Prize Pool</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Hackathon Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            {statusFilter === 'all' ? 'No hackathons yet' : `No ${statusFilter} hackathons`}
          </p>
          <Link href="/corporate/hackathons/new" className="mt-3">
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Create one</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h, i) => (
            <motion.div key={h._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-violet-500" />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-1">{h.name}</h3>
                      {h.theme && <p className="text-xs text-muted-foreground mt-0.5">{h.theme}</p>}
                    </div>
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase flex-shrink-0', STATUS_STYLES[h.status] ?? 'text-muted-foreground')}>
                      {h.status}
                    </span>
                  </div>

                  {h.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{h.description}</p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="font-bold font-mono flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {h.participantCount} {h.maxParticipants ? `/ ${h.maxParticipants}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                      <p className="font-bold font-mono text-primary">
                        {h.prizePool ? `$${h.prizePool.toLocaleString()}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start</p>
                      <p className="font-mono text-xs">{new Date(h.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End</p>
                      <p className="font-mono text-xs">{new Date(h.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => deleteHackathon(h._id, h.name)}
                      disabled={deleting === h._id}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      {deleting === h._id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />
                      }
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
