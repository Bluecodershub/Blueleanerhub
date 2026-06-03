'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Video, Plus, Loader2, RefreshCw, Calendar,
  Clock, Link as LinkIcon, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'
import { toast } from 'sonner'

interface ClassBatch {
  _id: string
  name: string
}

interface MentorSession {
  _id: string
  title: string
  scheduledAt: string
  durationMinutes: number
  meetingLink?: string
  status: string
  batchId?: { name?: string } | string
}

interface SessionForm {
  title: string
  classId: string
  scheduledAt: string
  durationMinutes: string
  meetingLink: string
  notes: string
}

export default function MentorSessionsPage() {
  const [classes, setClasses] = useState<ClassBatch[]>([])
  const [sessions, setSessions] = useState<MentorSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<SessionForm>({
    title: '', classId: '', scheduledAt: '', durationMinutes: '60', meetingLink: '', notes: '',
  })

  useEffect(() => {
    Promise.all([
      api.get('/mentor/classes'),
      api.get('/mentor/sessions'),
    ]).then(([classesRes, sessionsRes]) => {
      setClasses(classesRes.data?.data ?? [])
      setSessions(sessionsRes.data?.data ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.classId || !form.scheduledAt) {
      return toast.error('Title, class, and scheduled time are required')
    }
    setCreating(true)
    try {
      const res = await api.post(`/mentor/classes/${form.classId}/sessions`, {
        title: form.title,
        scheduledAt: form.scheduledAt,
        durationMinutes: parseInt(form.durationMinutes) || 60,
        meetingLink: form.meetingLink || undefined,
        notes: form.notes || undefined,
      })
      setSessions(prev => [res.data?.data, ...prev].filter(Boolean))
      setForm({ title: '', classId: '', scheduledAt: '', durationMinutes: '60', meetingLink: '', notes: '' })
      setShowCreate(false)
      toast.success('Session scheduled')
    } catch {
      toast.error('Failed to schedule session')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Sessions</span>
          </div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Schedule live sessions and track attendance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => {
            api.get('/mentor/sessions').then(r => setSessions(r.data?.data ?? []))
            api.get('/mentor/classes').then(r => setClasses(r.data?.data ?? []))
          }} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" /> New Session
          </Button>
        </div>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/20 bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground">Schedule Session</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Session Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 3 — Arrays & Loops" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Class *</label>
              <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Scheduled At *</label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Duration (minutes)</label>
              <Input type="number" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} placeholder="60" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Meeting Link</label>
              <Input value={form.meetingLink} onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))} placeholder="https://meet.google.com/..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Notes</label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Session notes or agenda..." />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
              Schedule Session
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-emerald-500/10 p-5 mb-4">
            <BookOpen className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No classes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a class first before scheduling sessions.</p>
          <Button variant="outline" onClick={() => window.location.href = '/mentor/classes'}>Go to Classes</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 glass">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-foreground">Scheduled Sessions</h2>
            </div>
            {sessions.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No sessions scheduled yet.</div>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session._id} className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.scheduledAt).toLocaleString()} · {session.durationMinutes} min
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {typeof session.batchId === 'object' ? session.batchId?.name : 'Class'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{session.status}</Badge>
                      {session.meetingLink && (
                        <Button asChild size="sm" variant="outline" className="gap-2">
                          <a href={session.meetingLink} target="_blank" rel="noreferrer"><LinkIcon className="h-3.5 w-3.5" /> Join</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 glass">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-foreground">Schedule by Class</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map(cls => (
                <div key={cls._id} className="rounded-xl border border-border bg-secondary/20 p-4">
                  <p className="font-medium text-foreground">{cls.name}</p>
                  <Button size="sm" variant="ghost" className="mt-2 text-xs text-emerald-400 hover:text-emerald-500 px-0"
                    onClick={() => { setForm(f => ({ ...f, classId: cls._id })); setShowCreate(true) }}>
                    + Schedule Session
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
